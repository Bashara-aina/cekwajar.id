/**
 * GET /api/audit-history/[auditId]
 * Returns full audit detail for the authenticated user.
 * Used by DashboardAuditSection when user clicks an audit card.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ auditId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { user } = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } },
      { status: 401 }
    )
  }

  const { auditId } = await params

  try {
    const supabase = await createClient()

    const { data: audit, error } = await supabase
      .from('payslip_audits')
      .select(
        'id, verdict, city, month_number, year, gross_salary, created_at, is_paid_result, violations, calculated_pph21, calculated_jht, calculated_jp, calculated_kesehatan, city_umk'
      )
      .eq('id', auditId)
      .eq('user_id', user.id)
      .single()

    if (error || !audit) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Audit tidak ditemukan.' } },
        { status: 404 }
      )
    }

    const raw = audit as unknown as {
      violations?: unknown[]
      calculated_pph21?: number | null
      calculated_jht?: number | null
      calculated_jp?: number | null
      calculated_kesehatan?: number | null
      city_umk?: number | null
    }
    const violations = Array.isArray(raw.violations) ? raw.violations : []

    return NextResponse.json({
      success: true,
      data: {
        id: audit.id,
        verdict: audit.verdict,
        city: audit.city,
        monthNumber: audit.month_number,
        year: audit.year,
        grossSalary: audit.gross_salary,
        createdAt: audit.created_at,
        isPaidResult: audit.is_paid_result,
        violations: violations as Array<{
          code: string
          severity: string
          titleID: string
          descriptionID: string
          differenceIDR: number
          actionID: string
        }>,
        calculatedPph21: raw.calculated_pph21 ?? null,
        calculatedJht: raw.calculated_jht ?? null,
        calculatedJp: raw.calculated_jp ?? null,
        calculatedKesehatan: raw.calculated_kesehatan ?? null,
        cityUmk: raw.city_umk ?? null,
      },
    })
  } catch (err) {
    console.error('[audit-history/[id]] error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server.' } },
      { status: 500 }
    )
  }
}