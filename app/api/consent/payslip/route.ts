import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip = (req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '').split(',')[0]
    const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_HASH_SALT ?? '')).digest('hex')

    const { error } = await supabaseAdmin.from('user_consents').insert({
      user_id: null,
      anon_session_id: req.headers.get('x-session-id') ?? null,
      consent_version: body.version ?? 'v1.0_2026_05',
      general: body.general === true,
      sensitive: body.sensitive === true,
      ip_hash: ipHash,
      user_agent: req.headers.get('user-agent') ?? '',
      given_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (_err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}