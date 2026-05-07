// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — API Route Rate Limit Helpers
// Redis-backed rate limiting for all API routes
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimitAnon,
  checkRateLimitAuth,
  consumeRateLimitAnon,
  consumeRateLimitAuth,
  RATE_LIMITS,
} from '@/lib/rate-limit'

export { RATE_LIMITS }

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

/**
 * Extract client IP from request headers.
 * Works with proxies, CDN, and direct connections.
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.split(',')[0].trim()
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

/**
 * Rate limit result with computed retry-after seconds.
 */
export interface RateLimitCheck {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSec: number
}

/**
 * Check rate limit for a request — picks anon or auth based on userId.
 * Call this after resolving the user (so you pass the actual userId).
 *
 * @param req - Incoming request
 * @param userId - Authenticated user ID, or null for anonymous
 * @param config - Optional custom limit config (defaults to RATE_LIMITS.auditSubmission)
 */
export async function checkApiRateLimit(
  req: NextRequest,
  userId: string | null,
  config?: RateLimitConfig
): Promise<RateLimitCheck> {
  const ip = getClientIp(req)
  const limit = config?.maxRequests ?? RATE_LIMITS.auditSubmission.limit
  const windowSec = config?.windowMs
    ? Math.ceil(config.windowMs / 1000)
    : RATE_LIMITS.auditSubmission.window

  const id = userId ?? ip

  const result = userId
    ? await checkRateLimitAuth(id, limit, windowSec)
    : await checkRateLimitAnon(id, limit, windowSec)

  const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: result.resetAt,
    retryAfterSec,
  }
}

/**
 * Consume a rate limit slot after successful request processing.
 * Safe to fire-and-forget — non-critical.
 */
export async function consumeApiRateLimit(
  req: NextRequest,
  userId: string | null
): Promise<void> {
  const ip = getClientIp(req)
  const id = userId ?? ip

  if (userId) {
    void consumeRateLimitAuth(id).catch(() => {/* non-critical */})
  } else {
    void consumeRateLimitAnon(ip).catch(() => {/* non-critical */})
  }
}

/**
 * Build standard rate-limit exceeded response.
 */
export function rateLimitResponse(check: RateLimitCheck): NextResponse {
  return NextResponse.json(
    {
      success: false,
      code: 'RATE_LIMITED',
      error: 'Terlalu banyak permintaan. Coba lagi nanti.',
      retryAfter: check.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(check.retryAfterSec),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(check.resetAt),
      },
    }
  )
}

/**
 * Apply rate limit check and return 429 response if exceeded.
 * Use in route handlers after resolving the user.
 *
 * @example
 * const { user } = await getCurrentUser()
 * const ip = getClientIp(request)
 * const rateLimit = await applyRateLimit(request, user?.id ?? ip)
 * if (rateLimit) return rateLimit
 */
export async function applyRateLimit(
  req: NextRequest,
  identifier: string | null,
  config?: RateLimitConfig
): Promise<NextResponse | null> {
  const check = await checkApiRateLimit(req, identifier, config)
  if (!check.allowed) {
    return rateLimitResponse(check)
  }
  return null
}