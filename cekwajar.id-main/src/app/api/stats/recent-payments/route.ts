// ==============================================================================
// cekwajar.id — Recent Payments Stats
// GET /api/stats/recent-payments
// Returns count of paid payments in the last 1 hour.
// Cached 60s in memory (module-level) to avoid Vercel KV dependency at launch.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory cache: { count: number, timestamp: number }
let cache: { count: number; timestamp: number } | null = null
const CACHE_TTL_MS = 60_000 // 60 seconds

export async function GET(_req: NextRequest) {
  const now = Date.now()

  // Return cached value if fresh
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      { count: cache.count, cached: true, age_seconds: Math.floor((now - cache.timestamp) / 1000) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          'X-Cache': 'HIT',
        },
      }
    )
  }

  const supabase = await createClient()

  const oneHourAgo = new Date(now - 3600_000).toISOString()

  const { count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('paid_at', oneHourAgo)

  if (error) {
    console.error('[stats/recent-payments] query error:', error)
    // Fallback: serve cached even if stale on error
    if (cache) {
      return NextResponse.json(
        { count: cache.count, cached: true, stale: true, age_seconds: Math.floor((now - cache.timestamp) / 1000) },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    return NextResponse.json({ count: 0, cached: false }, { status: 500 })
  }

  cache = { count: count ?? 0, timestamp: now }

  return NextResponse.json(
    { count: cache.count, cached: false },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        'X-Cache': 'MISS',
      },
    }
  )
}