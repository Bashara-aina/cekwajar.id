interface RateLimitEntry {
  count: number
  resetAt: number
}

const inMemoryStore = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 5

export function rateLimit(identifier: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = inMemoryStore.get(identifier)

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: now + WINDOW_MS,
    }
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  }
}

export function getRateLimitResetTime(identifier: string): number {
  const entry = inMemoryStore.get(identifier)
  return entry?.resetAt || Date.now()
}
