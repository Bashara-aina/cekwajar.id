import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { policy_version, privacy_policy_accepted, terms_accepted, marketing_accepted } = body

    const { error } = await supabase.from('user_consents').insert({
      user_id: user.id,
      policy_version: policy_version || '2026-04',
      privacy_policy_accepted: privacy_policy_accepted || false,
      terms_accepted: terms_accepted || false,
      marketing_accepted: marketing_accepted || false,
      accepted_at: new Date().toISOString(),
      ip_hash: 'hashed_on_server',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const policy_version = searchParams.get('policy_version') || '2026-04'

    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id)
      .eq('policy_version', policy_version)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      has_consent: !!data,
      privacy_policy_accepted: data?.privacy_policy_accepted || false,
      terms_accepted: data?.terms_accepted || false,
      marketing_accepted: data?.marketing_accepted || false,
      accepted_at: data?.accepted_at || null,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
