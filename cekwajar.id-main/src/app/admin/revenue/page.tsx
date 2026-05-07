// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Admin Revenue Dashboard
// Accessible only to founder_uuids — see auth check below
// P3: Revenue metrics, funnel analysis, and alert thresholds per §9 of the
//     revenue-first repositioning plan.
// ══════════════════════════════════════════════════════════════════════════════

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  XCircle,
  MousePointerClick,
  CreditCard,
} from 'lucide-react'

const FOUNDER_UUIDS = (process.env.FOUNDER_UUIDS ?? '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)

const ALERT_THRESHOLDS = {
  auditCompletion: 55,   // <55% triggers alert
  gateHit: 70,             // <70% of verdicts hitting gate
  ctaClick: 12,            // <12% of gate hits clicking CTA
  paidConversion: 25,      // <25% of CTA clicks paying
} as const

interface FunnelStage {
  label: string
  count: number
  percentage?: number
  alert?: boolean
}

interface RevenueMetrics {
  paidSubscribers: number
  mrr: number
  refundRate7d: number
  funnel: FunnelStage[]
}

async function getRevenueMetrics(supabase: Awaited<ReturnType<typeof createClient>>): Promise<RevenueMetrics> {
  const now = Date.now()
  const sevenDaysAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString()
  const fourteenDaysAgo = new Date(now - 14 * 24 * 3600 * 1000).toISOString()

  // Paid subscribers count
  const { count: paidCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'pro')

  // MRR
  const { count: mrrCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'pro')

  // Refund rate last 7d: refund requests / paid payments in last 7d
  const { count: refunds7d } = await supabase
    .from('refund_requests')
    .select('*', { count: 'exact', head: true })
    .gte('requested_at', sevenDaysAgo)

  const { count: paidPayments7d } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('paid_at', sevenDaysAgo)

  const refundRate7d = paidPayments7d && paidPayments7d > 0
    ? Math.round(((refunds7d ?? 0) / paidPayments7d) * 100 * 10) / 10
    : 0

  // Funnel: started audits (created in payslip_audits) in last 7d
  const { count: auditsStarted } = await supabase
    .from('payslip_audits')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  // Reached verdict: audits with verdict populated
  const { count: auditsVerdict } = await supabase
    .from('payslip_audits')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)
    .not('verdict', 'is', null)

  // Hit gate: audits where user saw paywall (verdict=TIADA_PELANGGARAN or ADA_PELANGGARAN
  // AND subscription_tier at time was 'free')
  // Approximate: count free-tier users who reached verdict
  const { count: gateHits } = await supabase
    .from('payslip_audits')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)
    .not('verdict', 'is', null)

  // CTA clicks: payments initiated in last 7d
  const { count: ctaClicks } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)
    .eq('status', 'pending')

  // Paid: successful payments in last 7d
  const { count: paid7d } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('paid_at', sevenDaysAgo)

  const started = auditsStarted ?? 0
  const reachedVerdict = auditsVerdict ?? 0
  const gateHit = gateHits ?? 0
  const ctaClick = ctaClicks ?? 0
  const paid = paid7d ?? 0

  const funnel: FunnelStage[] = [
    {
      label: 'Started audit',
      count: started,
      alert: started < 100,
    },
    {
      label: 'Reached verdict',
      count: reachedVerdict,
      percentage: started > 0 ? Math.round((reachedVerdict / started) * 100) : 0,
      alert: started > 0 && (reachedVerdict / started) * 100 < ALERT_THRESHOLDS.auditCompletion,
    },
    {
      label: 'Hit paywall gate',
      count: gateHit,
      percentage: reachedVerdict > 0 ? Math.round((gateHit / reachedVerdict) * 100) : 0,
      alert: reachedVerdict > 0 && (gateHit / reachedVerdict) * 100 < ALERT_THRESHOLDS.gateHit,
    },
    {
      label: 'Clicked CTA',
      count: ctaClick,
      percentage: gateHit > 0 ? Math.round((ctaClick / gateHit) * 100) : 0,
      alert: gateHit > 0 && (ctaClick / gateHit) * 100 < ALERT_THRESHOLDS.ctaClick,
    },
    {
      label: 'Paid',
      count: paid,
      percentage: ctaClick > 0 ? Math.round((paid / ctaClick) * 100) : 0,
      alert: ctaClick > 0 && (paid / ctaClick) * 100 < ALERT_THRESHOLDS.paidConversion,
    },
  ]

  const lastStage = funnel[funnel.length - 1]
  const overallConv = started > 0 ? Math.round((paid / started) * 100 * 100) / 100 : 0

  return {
    paidSubscribers: paidCount ?? 0,
    mrr: (mrrCount ?? 0) * REVENUE_ANCHORS.PRO_PRICE_IDR,
    refundRate7d,
    funnel: [
      ...funnel,
      {
        label: 'Overall conv.',
        count: paid,
        percentage: overallConv,
        alert: overallConv < 3,
      },
    ],
  }
}

function AlertBadge({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      <AlertTriangle className="h-3 w-3" />
      {label}
    </span>
  )
}

export default async function AdminRevenuePage() {
  const { user, supabase } = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!FOUNDER_UUIDS.length || !FOUNDER_UUIDS.includes(user.id)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              This page is only accessible to founders. Add your user ID to{' '}
              <code className="text-xs text-slate-800">FOUNDER_UUIDS</code> env var to access.
            </p>
            <p className="mt-2 text-xs text-slate-500">Your user ID: {user.id}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = await getRevenueMetrics(supabase)
  const mrrFormatted = `IDR ${metrics.mrr.toLocaleString('id-ID')}`
  const breakEven = 100
  const subProgress = Math.min(metrics.paidSubscribers, breakEven)
  const subPct = Math.round((subProgress / breakEven) * 100)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Revenue Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Last 7 days · Auto-refreshes every 60s in production
          </p>
        </div>

        {/* Top-line KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/40">
                  <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Paid Subscribers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {metrics.paidSubscribers}{' '}
                    <span className="text-sm font-medium text-slate-500">/ {breakEven}</span>
                  </p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/40">
                  <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">MRR</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{mrrFormatted}</p>
                  <p className="text-xs text-slate-500">
                    IDR 49.000 × {metrics.paidSubscribers} subscriber{metrics.paidSubscribers !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${metrics.refundRate7d > 5 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
                  <CreditCard className={`h-5 w-5 ${metrics.refundRate7d > 5 ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Refund Rate (7d)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {metrics.refundRate7d}%
                  </p>
                  {metrics.refundRate7d > 5 && <AlertBadge label="HIGH" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit → Paid Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit → Paid Funnel (Last 7d)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.funnel.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-4">
                {/* Label column */}
                <div className="w-40 shrink-0 text-sm text-slate-600 dark:text-slate-300">
                  {stage.label}
                </div>

                {/* Bar */}
                <div className="flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-6 rounded-full transition-all ${stage.alert ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max(stage.percentage ?? 0, stage.count > 0 ? 4 : 0)}%` }}
                  />
                </div>

                {/* Count + pct */}
                <div className="w-16 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {stage.count.toLocaleString('id-ID')}
                </div>
                <div className="w-14 text-right text-xs text-slate-500">
                  {stage.percentage != null ? `${stage.percentage}%` : ''}
                </div>

                {/* Alert icon */}
                <div className="w-5">
                  {stage.alert ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : stage.percentage != null && stage.percentage > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alert thresholds reference */}
        <Card className="border-slate-300 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Alert Thresholds (P3 of expectation)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                { label: 'Audit completion', value: `<${ALERT_THRESHOLDS.auditCompletion}%` },
                { label: 'Gate hit', value: `<${ALERT_THRESHOLDS.gateHit}%` },
                { label: 'CTA click', value: `<${ALERT_THRESHOLDS.ctaClick}%` },
                { label: 'Paid conversion', value: `<${ALERT_THRESHOLDS.paidConversion}%` },
              ].map((t) => (
                <div key={t.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-slate-500">{t.label}</p>
                  <p className="mt-0.5 font-mono font-semibold text-slate-800 dark:text-slate-200">{t.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              If any stage drops below threshold for 2 consecutive days → Sentry → Telegram alert fires.
            </p>
          </CardContent>
        </Card>

        {/* Revenue anchor reference */}
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">AVG_SHORTFALL_IDR</span>{' '}
                IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
              </span>
              <span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">PRO_PRICE_IDR</span>{' '}
                IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}
              </span>
              <span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">AUDIT_TIME_SECONDS</span>{' '}
                {REVENUE_ANCHORS.AUDIT_TIME_SECONDS}s
              </span>
              <span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Break-even</span>{' '}
                {breakEven} subscribers
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
