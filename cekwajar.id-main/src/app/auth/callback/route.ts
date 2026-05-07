// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Supabase Auth Callback
// Handles OAuth redirect from Supabase + migrates anon session data
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnonSession, clearAnonSession } from '@/lib/anon-session'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Migrate any existing anon session data to the authenticated user
      const anonSessionId = await getAnonSession()
      if (anonSessionId) {
        try {
          // Call the migrate_anon_data RPC if it exists
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.rpc('migrate_anon_data', {
              p_anon_session_id: anonSessionId,
              p_user_id: user.id,
            })
            clearAnonSession()
          }
        } catch {
          // RPC call failed silently — anon data will not migrate but auth succeeds
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
