import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardCumulative } from '@/components/dashboard/DashboardCumulative'
import { DashboardHistory } from '@/components/dashboard/DashboardHistory'
import { DashboardSubscription } from '@/components/dashboard/DashboardSubscription'
import Link from 'next/link'
import { Plane, Banknote, Landmark, BarChart3, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const TOOL_META: Record<string, { label: string; icon: React.ElementType; href: string; color: string }> = {
  slip: { label: 'Wajar Slip', icon: FileText, href: '/slip', color: 'text-amber-600 bg-amber-50' },
  gaji: { label: 'Wajar Gaji', icon: Banknote, href: '/gaji', color: 'text-blue-600 bg-blue-50' },
  tanah: { label: 'Wajar Tanah', icon: Landmark, href: '/tanah', color: 'text-stone-600 bg-stone-50' },
  kabur: { label: 'Wajar Kabur', icon: Plane, href: '/kabur', color: 'text-indigo-600 bg-indigo-50' },
  hidup: { label: 'Wajar Hidup', icon: BarChart3, href: '/hidup', color: 'text-teal-600 bg-teal-50' },
}

async function getUserData() {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return null

    const { data: profile } = await sb
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const sinceDate = profile?.subscription_paid_first_at ?? user.created_at

    const { data: audits } = await sb
      .from('payslip_audits')
      .select('id, created_at, verdict, violation_count, shortfall_idr, period_month, period_year, city')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const totalShortfall = audits?.reduce((s, a) => s + (a.shortfall_idr ?? 0), 0) ?? 0
    const totalViolations = audits?.reduce((s, a) => s + (a.violation_count ?? 0), 0) ?? 0

    return {
      user,
      profile,
      audits: audits ?? [],
      cumulativeIdr: totalShortfall,
      auditCount: audits?.length ?? 0,
      violationCount: totalViolations,
      tier: (profile?.subscription_tier ?? 'free') as 'free' | 'pro',
      sinceDate,
    }
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const data = await getUserData()

  if (!data) {
    redirect('/auth/login?next=/dashboard')
  }

  const firstName = data.profile?.full_name?.split(' ')[0] ?? data.user.email?.split('@')[0] ?? 'Anggota'

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <DashboardCumulative
        firstName={firstName}
        cumulativeIdr={data.cumulativeIdr}
        auditCount={data.auditCount}
        violationCount={data.violationCount}
        sinceDate={data.sinceDate}
      />

      {data.audits.length > 0 && (
        <DashboardHistory audits={data.audits} tier={data.tier} />
      )}

      <DashboardSubscription user={data.user} profile={data.profile} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Tool lain</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(TOOL_META).map(([key, meta]) => {
            const Icon = meta.icon
            return (
              <Link
                key={key}
                href={meta.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:shadow-sm',
                  meta.color,
                  'border-transparent hover:border-current/20'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{meta.label}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}