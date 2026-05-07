// cekwajar.id — POST /api/audit-payslip

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { calculateBPJS, refreshBpjsCapsCacheFromServer } from '@/lib/calculations/bpjs'
import { calculatePPh21 } from '@/lib/calculations/pph21'
import { detectViolations } from '@/lib/calculations/violations'
import {
  handleApiError,
  parseJsonBody,
  ValidationError,
  PaymentRequiredError,
} from '@/lib/errors'
import {
  applyRateLimit,
  consumeApiRateLimit,
  getClientIp,
} from '@/lib/middleware/api-rate-limit'

export const runtime = 'nodejs'

const AuditPayslipSchema = z.object({
  grossSalary: z.number().min(500_000).max(1_000_000_000),
  ptkpStatus: z.enum([
    'TK/0', 'TK/1', 'TK/2', 'TK/3',
    'K/0', 'K/1', 'K/2', 'K/3',
    'K/I/0', 'K/I/1', 'K/I/2', 'K/I/3',
  ]),
  city: z.string().min(1).max(100),
  monthNumber: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2030).optional(),
  hasNPWP: z.boolean(),
  reportedDeductions: z.object({
    pph21: z.number().min(0),
    jhtEmployee: z.number().min(0),
    jpEmployee: z.number().min(0),
    jkkEmployee: z.number().min(0),
    jkmEmployee: z.number().min(0),
    kesehatanEmployee: z.number().min(0),
    takeHome: z.number().min(0),
  }),
  sessionId: z.string().uuid().optional(),
  ocrSource: z.enum(['google_vision', 'tesseract', 'manual']).optional(),
  payslipFilePath: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
})

type AuditPayslipInput = z.infer<typeof AuditPayslipSchema>

async function getCachedResult(key: string): Promise<Record<string, unknown> | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<Record<string, unknown>>(`idem:${key}`)
  } catch {
    return null
  }
}

async function cacheResult(key: string, result: Record<string, unknown>): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(`idem:${key}`, result, { ex: 3600 })
  } catch {
    // non-fatal
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await parseJsonBody(request, AuditPayslipSchema)

    // Idempotency
    if (body.idempotencyKey) {
      const cached = await getCachedResult(body.idempotencyKey)
      if (cached) {
        return NextResponse.json({ success: true, data: cached, cached: true })
      }
    }

    const { user, tier, profile } = await getCurrentUser()
    const ip = getClientIp(request)

    // Rate limiting — identifier is user ID for auth, IP for anon
    const rateLimitResponse = await applyRateLimit(request, user?.id ?? null)
    if (rateLimitResponse) return rateLimitResponse

    // DB queries
    const supabase = await createClient()
    await refreshBpjsCapsCacheFromServer(supabase)

    const { data: umkRow } = await supabase
      .from('umk_2026')
      .select('monthly_minimum_idr')
      .eq('city_canonical', body.city.toLowerCase().replace(/\s+/g, '-'))
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const cityUMK = (umkRow as { monthly_minimum_idr: number } | null)?.monthly_minimum_idr ?? null

    if (cityUMK === null) {
      throw new ValidationError(`Kota "${body.city}" tidak ditemukan dalam database UMK kami.`)
    }

    // Calculations
    const year = body.year ?? new Date().getFullYear()

    const pph21Result = await calculatePPh21(
      {
        grossSalary: body.grossSalary,
        ptkpStatus: body.ptkpStatus,
        monthNumber: body.monthNumber,
        year,
        hasNPWP: body.hasNPWP,
      },
      supabase
    )

    // December TER check: see if employer incorrectly applied TER to December
    const pph21TerBased =
      body.monthNumber === 12
        ? (
            await calculatePPh21(
              {
                grossSalary: body.grossSalary,
                ptkpStatus: body.ptkpStatus,
                monthNumber: 1,
                year,
                hasNPWP: body.hasNPWP,
              },
              supabase
            )
          ).pph21Amount
        : 0

    const bpjsResult = calculateBPJS({
      grossSalary: body.grossSalary,
      year,
      month: body.monthNumber,
    })

    const violations = detectViolations({
      grossSalary: body.grossSalary,
      cityUMK,
      month: body.monthNumber,
      ptkpStatus: body.ptkpStatus,
      reported: {
        pph21: body.reportedDeductions.pph21,
        jhtEmployee: body.reportedDeductions.jhtEmployee,
        jpEmployee: body.reportedDeductions.jpEmployee,
        kesehatan: body.reportedDeductions.kesehatanEmployee,
        jkkEmployee: body.reportedDeductions.jkkEmployee,
        jkmEmployee: body.reportedDeductions.jkmEmployee,
      },
      calculated: {
        pph21: pph21Result.pph21Amount,
        jhtEmployee: bpjsResult.jhtEmployee,
        jpEmployee: bpjsResult.jpEmployee,
        kesehatan: bpjsResult.kesehatanEmployee,
      },
      pph21TerBased,
    })

    const isPaidResult = tier !== 'free'
    const gatedViolations = violations.map((v) => ({
      ...v,
      differenceIDR: isPaidResult ? v.differenceIDR : null,
    }))

    const verdict = violations.length > 0 ? 'ADA_PELANGGARAN' : 'SESUAI'
    const shortfallIdr = violations.reduce((sum, v) => sum + (v.differenceIDR ?? 0), 0)

    // Persist to DB
    const { data: insertedRow, error: insertError } = await supabase
      .from('payslip_audits')
      .insert({
        user_id: user?.id ?? null,
        session_id: body.sessionId ?? null,
        gross_salary: body.grossSalary,
        ptkp_status: body.ptkpStatus,
        city: body.city,
        month_number: body.monthNumber,
        year,
        has_npwp: body.hasNPWP,
        reported_pph21: body.reportedDeductions.pph21,
        reported_jht_employee: body.reportedDeductions.jhtEmployee,
        reported_jp_employee: body.reportedDeductions.jpEmployee,
        reported_jkk: body.reportedDeductions.jkkEmployee,
        reported_jkm: body.reportedDeductions.jkmEmployee,
        reported_kesehatan_employee: body.reportedDeductions.kesehatanEmployee,
        reported_take_home: body.reportedDeductions.takeHome,
        ocr_source: body.ocrSource ?? 'manual',
        payslip_file_path: body.payslipFilePath ?? null,
        calculated_pph21: pph21Result.pph21Amount,
        calculated_jht: bpjsResult.jhtEmployee,
        calculated_jp: bpjsResult.jpEmployee,
        calculated_kesehatan: bpjsResult.kesehatanEmployee,
        city_umk: cityUMK,
        violations: violations,
        verdict,
        is_paid_result: isPaidResult,
        subscription_tier_at_time: tier ?? 'free',
        shortfall_idr: shortfallIdr,
        violation_count: violations.length,
        masked_first_name: profile?.full_name
          ? profile.full_name.split(' ')[0].slice(0, 2) + '***'
          : null,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[audit-payslip] insert error:', insertError)
    }

    const auditId = (insertedRow as { id: string } | null)?.id ?? null

    const result = {
      auditId,
      verdict,
      violationCount: violations.length,
      violationCodes: violations.map((v) => v.code),
      violations: gatedViolations,
      calculations: isPaidResult
        ? {
            correctPph21: pph21Result.pph21Amount,
            correctJht: bpjsResult.jhtEmployee,
            correctJp: bpjsResult.jpEmployee,
            correctKesehatan: bpjsResult.kesehatanEmployee,
            cityUMK,
          }
        : undefined,
      isGated: !isPaidResult && violations.length > 0,
      subscriptionRequired: !isPaidResult ? 'basic' : null,
      gateMessage:
        !isPaidResult && violations.length > 0
          ? 'Upgrade ke Basic untuk melihat selisih IDR dan detail tindakan'
          : undefined,
    }

    // Cache with idempotency key
    if (body.idempotencyKey) {
      await cacheResult(body.idempotencyKey, result)
    }

    // Consume rate limit slot
    await consumeApiRateLimit(request, user?.id ?? null)

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return handleApiError(err)
  }
}