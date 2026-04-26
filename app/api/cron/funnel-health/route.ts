import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { alertFunnelDrop } from '@/lib/alerts'
import { subHours } from 'date-fns'

export const runtime = 'nodejs'

const THRESHOLDS = {
  auditCompletion: 0.55,
  gateHit: 0.70,
  ctaClick: 0.12,
  paidFromCta: 0.25,
}

export async function GET() {
  try {
    const since = subHours(new Date(), 24).toISOString()

    const { data: auditData } = await supabaseAdmin
      .from('payslip_audits')
      .select('id, created_at')
      .gte('created_at', since)

    const { data: gateData } = await supabaseAdmin
      .from('payslip_audits')
      .select('id')
      .gte('created_at', since)
      .not('shortfall_idr', 'eq', 0)

    const { data: paymentData } = await supabaseAdmin
      .from('payments')
      .select('id')
      .gte('paid_at', since)
      .eq('status', 'paid')

    const totalAudits = auditData?.length ?? 0
    const gatedAudits = gateData?.length ?? 0
    const paidCount = paymentData?.length ?? 0

    const auditCompletion = totalAudits > 0 ? 1.0 : 0
    const gateHit = totalAudits > 0 ? gatedAudits / totalAudits : 0

    const alerts: string[] = []
    if (auditCompletion < THRESHOLDS.auditCompletion) {
      alerts.push(`Audit completion rate below threshold`)
    }
    if (gateHit < THRESHOLDS.gateHit) {
      alerts.push(`Gate hit rate: ${(gateHit * 100).toFixed(1)}% (threshold: ${THRESHOLDS.gateHit * 100}%)`)
    }
    if (paidCount === 0 && totalAudits > 10) {
      alerts.push(`No payments in 24h despite ${totalAudits} audits`)
    }

    if (alerts.length) {
      await alertFunnelDrop(alerts)
    }

    return NextResponse.json({
      ok: true,
      totalAudits,
      gatedAudits,
      paidCount,
      alerts: alerts.length,
    })
  } catch (err) {
    console.error('[cron/funnel-health] Error:', err)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}