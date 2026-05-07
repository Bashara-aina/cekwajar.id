// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Rate Limiting using @vercel/kv
// Per-anon-session or per-user rate limiting
// ══════════════════════════════════════════════════════════════════════════════

import { kv } from '@vercel/kv'

export type RateLimitKey = {
  type: 'anon' | 'user'
  id: string
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number // Unix timestamp
  limit: number
}

/**
 * Check and increment a rate limit counter.
 * Uses Vercel KV (Redis-compatible) for distributed rate limiting.
 *
 * @param key - The rate limit key (anon session or user ID)
 * @param limit - Max requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimit(
  key: RateLimitKey,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const kvKey = `ratelimit:${key.type}:${key.id}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  try {
    // Increment counter
    const count = await kv.incr(kvKey)

    // Set TTL on first request
    if (count === 1) {
      await kv.expire(kvKey, windowSeconds)
    }

    const resetAt = now + windowMs
    const remaining = Math.max(0, limit - count)
    const allowed = count <= limit

    return { allowed, remaining, resetAt, limit }
  } catch {
    // If KV is unavailable, allow the request (fail open)
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowMs,
      limit,
    }
  }
}

/**
 * Get current rate limit status without incrementing.
 */
export async function getRateLimitStatus(
  key: RateLimitKey
): Promise<{ count: number; ttl: number } | null> {
  const kvKey = `ratelimit:${key.type}:${key.id}`

  try {
    const results = await kv.mget(kvKey, `${kvKey}:ttl`) as [count: number | undefined, ttl: number | undefined]
    const count = results[0]
    const ttl = results[1]
    if (count === undefined) return null
    return { count, ttl: ttl ?? 0 }
  } catch {
    return null
  }
}

/**
 * Reset rate limit for a key (for testing or admin use).
 */
/**
 * Wrapper for anonymous rate limit checks.
 * Overload: if called with 1 arg, uses default limit/window from RATE_LIMITS.auditSubmission
 */
export async function checkRateLimitAnon(
  id: string,
  limit?: number,
  windowSeconds?: number
): Promise<RateLimitResult> {
  const l = limit ?? RATE_LIMITS.auditSubmission.limit
  const w = windowSeconds ?? RATE_LIMITS.auditSubmission.window
  return checkRateLimit({ type: 'anon', id }, l, w)
}

/**
 * Wrapper for authenticated user rate limit checks.
 * Overload: if called with 1 arg, uses default limit/window from RATE_LIMITS.auditSubmission
 */
export async function checkRateLimitAuth(
  id: string,
  limit?: number,
  windowSeconds?: number
): Promise<RateLimitResult> {
  const l = limit ?? RATE_LIMITS.auditSubmission.limit
  const w = windowSeconds ?? RATE_LIMITS.auditSubmission.window
  return checkRateLimit({ type: 'user', id }, l, w)
}

/**
 * Check and consume (increment) anonymous rate limit.
 * Overload: if called with 1 arg, uses default limit/window from RATE_LIMITS.auditSubmission
 */
export async function consumeRateLimitAnon(
  id: string,
  limit?: number,
  windowSeconds?: number
): Promise<RateLimitResult> {
  const l = limit ?? RATE_LIMITS.auditSubmission.limit
  const w = windowSeconds ?? RATE_LIMITS.auditSubmission.window
  return checkRateLimit({ type: 'anon', id }, l, w)
}

/**
 * Check and consume (increment) authenticated user rate limit.
 * Overload: if called with 1 arg, uses default limit/window from RATE_LIMITS.auditSubmission
 */
export async function consumeRateLimitAuth(
  id: string,
  limit?: number,
  windowSeconds?: number
): Promise<RateLimitResult> {
  const l = limit ?? RATE_LIMITS.auditSubmission.limit
  const w = windowSeconds ?? RATE_LIMITS.auditSubmission.window
  return checkRateLimit({ type: 'user', id }, l, w)
}

export async function resetRateLimit(key: RateLimitKey): Promise<void> {
  const kvKey = `ratelimit:${key.type}:${key.id}`
  try {
    await kv.del(kvKey)
  } catch {
    // Ignore errors
  }
}

/**
 * Standard rate limit configurations for different endpoints.
 */
export const RATE_LIMITS = {
  // Auth endpoints
  magicLink: { limit: 3, window: 60 * 60 } as const, // 3 per hour
  googleOAuth: { limit: 10, window: 60 * 60 } as const, // 10 per hour

  // Audit endpoints
  auditSubmission: { limit: 10, window: 60 * 60 } as const, // 10 per hour (free tier)
  ocrUpload: { limit: 5, window: 60 * 60 } as const, // 5 per hour

  // Payment endpoints
  createTransaction: { limit: 5, window: 60 * 60 } as const, // 5 per hour

  // API general limit
  apiGeneral: { limit: 100, window: 60 } as const, // 100 per minute
} as const
