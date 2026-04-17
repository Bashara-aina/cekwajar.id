// Shared in-memory rate limiter for API routes
// Replace with Vercel KV / Upstash Redis for multi-instance deployments

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  limit: number
  windowMs: number
}

export function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1 }
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: config.limit - entry.count }
}

export const RATE_LIMITS = {
  calculation: { limit: 20, windowMs: 60 * 60 * 1000 },  // 20/hour
  ocr: { limit: 5, windowMs: 60 * 60 * 1000 },           // 5/hour
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },         // 10/15min
} as const
