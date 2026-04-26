import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (code) {
    const sb = await createClient()
    const { data: { user }, error } = await sb.auth.exchangeCodeForSession(code)

    if (!error && user) {
      const anonId = req.cookies.get('cekwajar_anon_id')?.value
      if (anonId) {
        try {
          await sb.rpc('migrate_anon_data', { _anon_id: anonId, _user_id: user.id })
        } catch {
          // migration is best-effort
        }
      }
    }

    const next = req.nextUrl.searchParams.get('next') ?? '/dashboard'
    return NextResponse.redirect(new URL(next, req.url))
  }

  return NextResponse.redirect('/auth/login')
}