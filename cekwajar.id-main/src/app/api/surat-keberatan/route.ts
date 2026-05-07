// cekwajar.id — POST /api/surat-keberatan
// Premium Pro feature: generates formal objection letter + WA templates

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { generateSuratKeberatan, generateWaTemplates } from '@/lib/agents/surat-keberatan'
import { checkRateLimitAuth } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const SuratKeberatanRequestSchema = z.object({
  auditId: z.string().uuid(),
})

type SuratKeberatanRequest = z.infer<typeof SuratKeberatanRequestSchema>

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  let body: SuratKeberatanRequest
  try {
    const json = await request.json()
    body = SuratKeberatanRequestSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.issues[0]?.message ?? 'Invalid input',
          },
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { user, tier } = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } },
      { status: 401 }
    )
  }

  // Pro-only check
  if (tier !== 'pro') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'Surat Keberatan hanya tersedia untuk paket Pro. Upgrade untuk mengakses fitur ini.',
        },
      },
      { status: 403 }
    )
  }

  // Rate limit
  const authCheck = await checkRateLimitAuth(user.id)
  if (!authCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Terlalu banyak request. Coba lagi dalam ${Math.ceil((authCheck.resetAt - Date.now()) / 60000)} menit.`,
        },
      },
      { status: 429 }
    )
  }

  // Fetch audit record
  const { data: audit, error: auditError } = await supabase
    .from('payslip_audits')
    .select(
      `id, verdict, month_number, year, city, gross_salary,
       reported_pph21, reported_jht_employee, reported_jp_employee,
       reported_kesehatan_employee, reported_jkk, reported_jkm,
       calculated_pph21, calculated_jht, calculated_jp, calculated_kesehatan,
       violations, is_paid_result, subscription_tier_at_time`
    )
    .eq('id', body.auditId)
    .eq('user_id', user.id)
    .single()

  if (auditError || !audit) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Audit tidak ditemukan.' } },
      { status: 404 }
    )
  }

  // Build audit data for Groq agent
  const violations = (audit as Record<string, unknown>).violations as Array<{
    code: string
    titleID: string
    differenceIDR: number | null
  }> | null

  const violationBreakdown = (
    violations?.filter((v) => v.differenceIDR !== null && v.differenceIDR > 0) ?? []
  ).map((v) => ({
    komponen: v.titleID,
    dipotong: 0, // not stored per-component in payslip_audits
    seharusnya: 0,
    selisih: v.differenceIDR ?? 0,
    dasarHukum: 'PMK 168/2023, PP 44/2015, PP 36/2021',
  }))

  // Calculate total discrepancy from violations
  const discrepancyRp =
    violations?.reduce((sum, v) => sum + (v.differenceIDR ?? 0), 0) ?? 0

  const auditData = {
    verdict: (audit as Record<string, unknown>).verdict as string,
    month: (audit as Record<string, unknown>).month_number as number,
    year: (audit as Record<string, unknown>).year as number,
    isDecember: (audit as Record<string, unknown>).month_number === 12,
    discrepancyRp,
    breakdown: violationBreakdown,
    violations: (violations ?? []).map((v) => ({
      code: v.code,
      titleID: v.titleID,
      differenceIDR: v.differenceIDR,
    })),
  }

  // Generate both in parallel
  const [suratResult, waResult] = await Promise.all([
    generateSuratKeberatan(auditData),
    generateWaTemplates(auditData),
  ])

  // Store in DB — upsert into surat_replies table
  const { error: insertError } = await supabase.from('surat_replies').upsert(
    {
      audit_id: body.auditId,
      user_id: user.id,
      letter_text: suratResult.data,
      letter_source: suratResult.source,
      wa_template_1: waResult.data[0],
      wa_template_2: waResult.data[1],
      wa_template_3: waResult.data[2],
      wa_source: waResult.source,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: 'audit_id',
    }
  )

  if (insertError) {
    console.error('[surat-keberatan] upsert error:', insertError)
    // non-fatal — still return generated content
  }

  return NextResponse.json({
    success: true,
    data: {
      letter: suratResult.data,
      letterSource: suratResult.source,
      letterConfidence: suratResult.confidence,
      whatsappTemplates: waResult.data,
      whatsappSource: waResult.source,
      whatsappConfidence: waResult.confidence,
    },
  })
}