import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Revenue — cekwajar.id',
  robots: 'noindex',
}

const FOUNDERS = process.env.FOUNDER_UUIDS?.split(',').map((s) => s.trim()) ?? []

function getSevenDaysAgo() {
  return new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
}

export default async function AdminRevenuePage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (!user || !FOUNDERS.includes(user.id)) {
    redirect('/')
  }

  const sevenDaysAgo = getSevenDaysAgo()
  const [
    { count: paidCount },
    { count: refundCount },
    { count: auditCount },
  ] = await Promise.all([
    sb.from('user_profiles').select('id', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
    sb.from('refund_requests').select('id', { count: 'exact', head: true }).gte('requested_at', sevenDaysAgo),
    sb.from('payslip_audits').select('id', { count: 'exact', head: true }),
  ])

  const { data: recentPayments } = await sb
    .from('payments')
    .select('id, amount_idr, paid_at, status')
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(20)

  const mrr = (paidCount ?? 0) * 49_000
  const refundRate = auditCount && auditCount > 0 ? ((refundCount ?? 0) / auditCount * 100).toFixed(1) : '0.0'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin — Revenue & Funnel</h1>
        <p className="text-sm text-slate-500">Gated to founder UUIDs only</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paid subscribers</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">{paidCount ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">MRR</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            IDR {mrr.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Refund rate 7d</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">{refundRate}%</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-base font-bold text-slate-900">Recent payments</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2">Date</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(recentPayments ?? []).map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2 text-slate-600">{new Date(p.paid_at).toLocaleDateString('id-ID')}</td>
                <td className="py-2 font-mono text-slate-900">IDR {p.amount_idr?.toLocaleString('id-ID')}</td>
                <td className="py-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{p.status}</span>
                </td>
              </tr>
            ))}
            {(!recentPayments || recentPayments.length === 0) && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-400">No payments yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}