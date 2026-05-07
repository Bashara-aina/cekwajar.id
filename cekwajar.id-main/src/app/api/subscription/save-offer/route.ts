// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Save Offer
// POST /api/subscription/save-offer
// Returns a 30% discount offer for users trying to cancel
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Save offer constants — 30% off for 3 cycles
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
    .select('subscription_tier, subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.subscription_id || profile.subscription_tier === 'free') {
    return NextResponse.json({ success: false, error: { message: 'No active subscription' } }, { status: 400 })
  }

  // Get current price to calculate discounted price
  const planId = `${profile.subscription_tier}_monthly`
  const { data: plan } = await supabase
    .from('pricing_plans')
    .select('price_idr')
    .eq('id', planId)
    .eq('is_active', true)
    .maybeSingle()

  const basePrice = plan?.price_idr ?? (profile.subscription_tier === 'pro' ? 49_000 : 29_000)
  const discountedPrice = Math.round(basePrice * (1 - SAVE_DISCOUNT_PERCENT / 100))
  const billingPeriod = 'monthly' // Save offer is always monthly

  return NextResponse.json({
    success: true,
    data: {
      discountedPrice,
      billingPeriod,
      savingsPercent: SAVE_DISCOUNT_PERCENT,
      cycles: SAVE_CYCLES,
    },
  })
}
