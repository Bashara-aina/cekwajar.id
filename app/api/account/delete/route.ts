import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest) {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    await supabaseAdmin
      .from('user_profiles')
      .update({ deletion_requested_at: new Date().toISOString(), subscription_tier: 'free' })
      .eq('id', user.id)

    await supabaseAdmin.auth.admin.deleteUser(user.id)

    return NextResponse.json({
      ok: true,
      message: 'Akun dan data kamu akan dihapus dalam 7 hari.',
    })
  } catch {
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 })
  }
}