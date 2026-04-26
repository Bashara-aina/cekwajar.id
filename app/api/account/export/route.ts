import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { data: audits } = await sb
      .from('payslip_audits')
      .select('id, created_at, verdict, violation_count, shortfall_idr, period_month, period_year, city')
      .eq('user_id', user.id)

    const { data: profile } = await sb
      .from('user_profiles')
      .select('email, full_name, subscription_tier, created_at')
      .eq('id', user.id)
      .maybeSingle()

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        email: profile?.email,
        name: profile?.full_name,
        tier: profile?.subscription_tier,
        member_since: profile?.created_at,
      },
      audits: audits ?? [],
      total_audits: audits?.length ?? 0,
      total_shortfall_idr: audits?.reduce((s: number, a: {shortfall_idr?: number}) => s + (a.shortfall_idr ?? 0), 0) ?? 0,
    }

    return NextResponse.json({
      ok: true,
      data: exportData,
      message: 'Export akan dikirim ke email kamu dalam 1x24 jam.',
    })
  } catch {
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 })
  }
}