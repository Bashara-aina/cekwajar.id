// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Cancel Subscription
// POST /api/subscription/cancel
// Cancels at period end (access stays active until period expires).
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CancelSchema = z.object({
  reason: z.enum([
    'too_expensive',
    'did_not_use_enough',
    'found_better',
    'privacy_concern',
    'other',
  ]).optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
  }

  let reason: string | null = null
  try {
    const json = await request.json()
    const parsed = CancelSchema.safeParse(json)
    if (parsed.success) reason = parsed.data.reason ?? null
  } catch {
    // reason is optional — ignore parse errors
  }

  // Mark cancel at period end — access stays active until expiry
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_cancel_at_period_end: true,
      subscription_cancel_reason: reason,
      subscription_canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to cancel subscription:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Gagal membatalkan langganan.' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
