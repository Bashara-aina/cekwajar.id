import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

interface MidtransNotification {
  order_id: string
  transaction_status: 'settlement' | 'capture' | 'pending' | 'expire' | 'cancel' | 'deny'
  gross_amount: string
  status_code: string
  transaction_id: string
}

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    console.error('[webhook] MIDTRANS_SERVER_KEY not configured')
    return false
  }
  const expected = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex')
  return expected === signatureKey
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signatureKey = req.headers.get('x-midtrans-signature-key') ?? ''

  let notification: MidtransNotification
  try {
    notification = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { order_id, transaction_status, gross_amount, status_code, transaction_id } = notification

  if (!verifySignature(order_id, status_code, gross_amount, signatureKey)) {
    console.warn('[webhook] Invalid signature for order:', order_id)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  console.log('[webhook] Received:', { order_id, transaction_status, gross_amount })

  type PaymentRow = { id: string; status: string | number }
  const existing = await supabaseAdmin
    .from('payments')
    .select('id, status')
    .eq('midtrans_order_id', order_id)
    .maybeSingle() as { data: PaymentRow | null } | null

  const statusVal = existing?.data?.status
  const isPaid = statusVal === 'paid' || statusVal === 1 || statusVal === '1'
  if (isPaid && ['settlement', 'capture'].includes(transaction_status)) {
    return NextResponse.json({ ok: true, note: 'already_processed' })
  }

  const amountIdr = Math.round(Number(gross_amount))

  if (['settlement', 'capture'].includes(transaction_status)) {
    const userId = order_id.replace('CEKWAJAR_', '').split('_')[0]

    if (userId && !order_id.includes('guest')) {
      const rpcCall = await supabaseAdmin.rpc('upgrade_subscription', {
        p_user_id: userId,
        p_tier: 'pro',
      })
      if (rpcCall.error) console.error('[webhook] upgrade_subscription failed:', rpcCall.error)
    }

    if (existing?.data) {
      try {
        const upd = await supabaseAdmin.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', existing.data.id)
        if (upd.error) console.error('[webhook] update payment failed:', upd.error)
      } catch (err) { console.error('[webhook] update payment failed:', err) }
    } else {
      try {
        const ins = await supabaseAdmin.from('payments').insert({
          midtrans_order_id: order_id,
          user_id: userId ?? null,
          amount_idr: amountIdr,
          status: 'paid',
          paid_at: new Date().toISOString(),
          midtrans_transaction_id: transaction_id,
        })
        if (ins.error) console.error('[webhook] insert payment failed:', ins.error)
      } catch (err) { console.error('[webhook] insert payment failed:', err) }
    }
  } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
    if (existing?.data) {
      try {
        const upd = await supabaseAdmin.from('payments').update({ status: transaction_status }).eq('id', existing.data.id)
        if (upd.error) console.error('[webhook] update payment failed:', upd.error)
      } catch (err) { console.error('[webhook] update payment failed:', err) }
    }
  }

  return NextResponse.json({ ok: true })
}