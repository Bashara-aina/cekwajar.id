// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Cumulative Shortfall Stats
// GET /api/stats/cumulative-shortfall
// Returns total IDR found across all paid audits for the user
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
  }

  // Use the user_cumulative_shortfall RPC if it exists
  const { data, error } = await supabase.rpc('user_cumulative_shortfall', {
    p_user_id: user.id,
  })

  if (error) {
    // Fallback: manually aggregate from audit_results
    const { data: audits } = await supabase
      .from('audit_results')
      .select('violations, created_at')
      .eq('user_id', user.id)
      .eq('is_paid_result', true)

    if (!audits) {
      return NextResponse.json({
        success: true,
        data: { totalIdrFound: 0, auditCount: 0, lastAuditDate: null },
      })
    }

    let totalIdrFound = 0
    for (const audit of audits) {
      const violations = audit.violations as Array<{ differenceIDR: number | null }> | null
      if (violations) {
        totalIdrFound += violations.reduce((sum, v) => sum + (v.differenceIDR ?? 0), 0)
      }
    }

    const sorted = [...audits].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      data: {
        totalIdrFound,
        auditCount: audits.length,
        lastAuditDate: sorted[0]?.created_at ?? null,
      },
    })
  }

  return NextResponse.json({ success: true, data })
}
