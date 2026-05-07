// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Supabase Session Refresh Middleware
// Runs on every request to refresh auth sessions + rate limiting
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { checkRateLimitAnon, consumeRateLimitAnon } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ─── Rate Limiting for API routes ─────────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1'

    try {
      const { allowed, remaining, resetAt } = await checkRateLimitAnon(clientIp)

      // Add rate limit headers to response
      supabaseResponse.headers.set('X-RateLimit-Remaining', String(remaining))
      supabaseResponse.headers.set('X-RateLimit-Reset', String(resetAt))

      if (!allowed) {
        const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
        return NextResponse.json(
          {
            success: false,
            error: 'Terlalu banyak permintaan. Coba lagi nanti.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(resetAt),
            },
          }
        )
      }

      // Consume the rate limit slot (fire-and-forget)
      consumeRateLimitAnon(clientIp).catch(() => {/* non-critical */})
    } catch {
      // Rate limiting is non-critical — allow request to proceed
    }
  }

  // Refresh session if expired — this runs on every request
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard — redirect unauthenticated users to login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
