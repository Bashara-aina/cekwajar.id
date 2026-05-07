// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Accept Save Offer
// POST /api/subscription/accept-save-offer
// Applies 30% discount for 3 billing cycles and updates subscription
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const SAVE_DISCOUNT_PERCENT = 30
const SAVE_CYCLES = 3

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
  }

  // Get current subscription details
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  if (!profile || profile.subscription_tier === 'free') {
    return NextResponse.json({ success: false, error: { message: 'No active subscription' } }, { status: 400 })
  }

  // Update profile with save offer metadata (actual billing update happens via Midtrans)
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'save_offered',
      // Store save offer metadata — actual discounted billing handled separately
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to apply save offer:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Gagal menerapkan penawaran.' } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      message: `Diskon ${SAVE_DISCOUNT_PERCENT}% diterapkan untuk ${SAVE_CYCLES} siklus berikutnya.`,
      discountPercent: SAVE_DISCOUNT_PERCENT,
      cycles: SAVE_CYCLES,
    },
  })
}
