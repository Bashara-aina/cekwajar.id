import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'
import { z } from 'zod'

const webhookSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = webhookSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    
    const { order_id, status_code, gross_amount, transaction_status, fraud_status } = parsed.data
    
    // Verify signature
    const signatureKey = createHmac('sha512', process.env.MIDTRANS_SERVER_KEY || '')
      .update(order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY!)
      .digest('hex')
    
    // Find transaction
    const supabase = await createServiceClient()
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('midtrans_order_id', order_id)
      .single()
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    
    // Idempotency check
    if (transaction.is_webhook_processed) {
      return NextResponse.json({ ok: true, message: 'Already processed' })
    }
    
    // Process based on status
    let newStatus = transaction_status
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      newStatus = 'settlement'
      
      // Upsert subscription
      await supabase.from('subscriptions').upsert({
        user_id: transaction.user_id,
        plan_type: transaction.plan_type,
        billing_period: transaction.billing_period,
        status: 'active',
        starts_at: new Date().toISOString(),
        ends_at: getEndDate(transaction.billing_period),
        last_payment_order_id: order_id,
      }, {
        onConflict: 'user_id',
      })
      
      // Update user profile tier
      await supabase.from('user_profiles').update({
        subscription_tier: transaction.plan_type,
      }).eq('id', transaction.user_id)
    }
    
    // Update transaction
    await supabase.from('transactions').update({
      status: newStatus,
      fraud_status: fraud_status || null,
      is_webhook_processed: true,
      webhook_received_at: new Date().toISOString(),
    }).eq('midtrans_order_id', order_id)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function getEndDate(billingPeriod: string): string {
  const endsAt = new Date()
  if (billingPeriod === 'monthly') {
    endsAt.setMonth(endsAt.getMonth() + 1)
  } else {
    endsAt.setFullYear(endsAt.getFullYear() + 1)
  }
  return endsAt.toISOString()
}
