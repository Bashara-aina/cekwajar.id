/**
 * cekwajar.id — Audit History API
 * Returns paginated list of past audits for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import type { PayslipVerdict } from '@/types/database.types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/audit-history
 * Query params: page (default 1), limit (default 10), verdict (SESUAI | ADA_PELANGGARAN | undefined)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { user } = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
  const verdictParam = searchParams.get('verdict') as PayslipVerdict | null
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('payslip_audits')
      .select(
        'id, verdict, city, month_number, year, gross_salary, created_at, is_paid_result, violations',
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (verdictParam === 'SESUAI' || verdictParam === 'ADA_PELANGGARAN') {
      query = query.eq('verdict', verdictParam)
    }

    const { data: audits, count, error } = await query

    if (error) {
      console.error('[audit-history] query error:', error)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Gagal mengambil riwayat audit.' } },
        { status: 500 }
      )
    }

    // Get violation count from violations array for each audit
    const formattedAudits = (audits ?? []).map((audit) => {
      const raw = audit as unknown as { violations?: unknown[]; violation_count?: number }
      const violations = Array.isArray(raw.violations) ? raw.violations : []
      const violationCount = violations.length
      const topViolation = violations[0] as { titleID?: string } | undefined
      return {
        id: audit.id,
        verdict: audit.verdict,
        city: audit.city,
        monthNumber: audit.month_number,
        year: audit.year,
        grossSalary: audit.gross_salary,
        createdAt: audit.created_at,
        isPaidResult: audit.is_paid_result,
        violationCount,
        violations: violations as Array<{
          code: string
          severity: string
          titleID: string
          descriptionID: string
          differenceIDR: number
          actionID: string
        }>,
        topViolation: topViolation?.titleID ?? null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        audits: formattedAudits,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      },
    })
  } catch (err) {
    console.error('[audit-history] error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server.' } },
      { status: 500 }
    )
  }
}