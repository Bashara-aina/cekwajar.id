import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const reason = body.reason ?? 'not_specified'

    const { data: profile } = await sb
      .from('user_profiles')
      .select('subscription_renew_at, cancel_save_offered_at')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.subscription_renew_at) {
      return NextResponse.json({ ok: false, message: 'No active subscription' }, { status: 400 })
    }

    await supabaseAdmin
      .from('user_profiles')
      .update({
        subscription_tier: 'free',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({
      ok: true,
      message: 'Langganan dibatalkan.Kamu masih bisa akses sampai ${new Date(profile.subscription_renew_at).toLocaleDateString("id-ID")}.',
    })
  } catch {
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 })
  }
}