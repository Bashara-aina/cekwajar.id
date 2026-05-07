// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Subscription Info
// GET /api/subscription/info
// Returns current subscription tier, renewal date, and payment method
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionTier } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
  }

  // Fetch profile for tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_id')
    .eq('id', user.id)
    .single()

  const tier = (profile?.subscription_tier as SubscriptionTier) ?? 'free'

  if (tier === 'free') {
    return NextResponse.json({
      success: true,
      data: { tier: 'free' as const, renewsAt: null, paymentMethod: null, planId: null, billingPeriod: null },
    })
  }

  // Fetch latest active transaction for payment details
  const { data: transaction } = await supabase
    .from('transactions')
    .select('plan_type, billing_period, midtrans_order_id, created_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!transaction) {
    return NextResponse.json({
      success: true,
      data: { tier, renewsAt: null, paymentMethod: null, planId: null, billingPeriod: null },
    })
  }

  // Calculate renewal date based on billing period (1 month or 1 year from transaction)
  const baseDate = new Date(transaction.created_at)
  const renewsAt = new Date(baseDate)
  if (transaction.billing_period === 'monthly') {
    renewsAt.setMonth(renewsAt.getMonth() + 1)
  } else {
    renewsAt.setFullYear(renewsAt.getFullYear() + 1)
  }

  // Fetch payment method from transaction metadata if available
  const { data: txWithMeta } = await supabase
    .from('transactions')
    .select('payment_type, card_type, masked_card_number')
    .eq('midtrans_order_id', transaction.midtrans_order_id)
    .single()

  let paymentMethod: string | null = null
  if (txWithMeta?.payment_type) {
    paymentMethod = `${txWithMeta.payment_type} ${txWithMeta.masked_card_number ?? ''}`.trim()
  }

  return NextResponse.json({
    success: true,
    data: {
      tier,
      renewsAt: renewsAt.toISOString(),
      paymentMethod,
      planId: transaction.plan_type,
      billingPeriod: transaction.billing_period,
    },
  })
}
