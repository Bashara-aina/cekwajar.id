// ==============================================================================
// cekwajar.id — Refund Request Endpoint
// POST /api/refund/request
// 7-day money-back guarantee: user must have paid within last 7 days
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Trigger Midtrans refund for a given order.
 * Falls back to no-op in non-production / missing credentials.
 */
async function triggerMidtransRefund(
  orderId: string,
  amountIdr: number,
): Promise<void> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    console.warn('[refund] MIDTRANS_SERVER_KEY not set — skipping Midtrans call')
    return
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  const baseUrl = isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com'

  const authString = Buffer.from(`${serverKey}:`).toString('base64')

  try {
    const res = await fetch(`${baseUrl}/v1/refund/online/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        refund_amount: amountIdr,
        reason: '7-day money-back guarantee — user requested via dashboard',
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error('[refund] Midtrans refund failed:', res.status, body)
    } else {
      console.log('[refund] Midtrans refund processed for order:', orderId)
    }
  } catch (err) {
    console.error('[refund] Midtrans fetch error:', err)
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const { user, supabase } = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { ok: false, message: 'Login diperlukan.' },
      { status: 401 }
    )
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

  // Find most recent paid payment within 7-day window
  const { data: lastPayment, error: paymentError } = await supabase
    .from('payments')
    .select('id, midtrans_order_id, amount_idr, paid_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .gte('paid_at', sevenDaysAgo)
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (paymentError) {
    console.error('[refund] DB query error:', paymentError)
    return NextResponse.json(
      { ok: false, message: 'Gagal mencari data pembayaran.' },
      { status: 500 }
    )
  }

  if (!lastPayment) {
    return NextResponse.json({
      ok: false,
      message: 'Tidak ada pembayaran dalam 7 hari terakhir yang memenuhi syarat refund.',
    })
  }

  // Async: trigger Midtrans refund + downgrade tier
  await triggerMidtransRefund(lastPayment.midtrans_order_id, lastPayment.amount_idr)
  await supabase
    .from('user_profiles')
    .update({ subscription_tier: 'free' })
    .eq('id', user.id)

  await supabase.from('refund_requests').insert({
    user_id: user.id,
    payment_id: lastPayment.id,
    requested_at: new Date().toISOString(),
  })

  return NextResponse.json({
    ok: true,
    message: 'Refund diproses. Akan masuk dalam 1×24 jam.',
  })
}