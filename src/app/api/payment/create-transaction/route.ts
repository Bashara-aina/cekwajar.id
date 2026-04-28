import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Midtrans from 'midtrans-sdk-nodejs'
import { z } from 'zod'

const midtrans = new Midtrans({
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
})

const paymentSchema = z.object({
  planType: z.enum(['pro']),
  billingPeriod: z.enum(['monthly', 'annual']),
})

const PRICING = {
  pro: {
    monthly: { priceIdr: 49_000, sku: 'cekwajar-pro-monthly-49k-v1' },
    annual: { priceIdr: 449_000, sku: 'cekwajar-pro-annual-449k-v1' },
  },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const body = await req.json()
    const parsed = paymentSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    const { planType, billingPeriod } = parsed.data
    const pricing = PRICING[planType][billingPeriod]
    const orderId = `CW-${user.id.slice(0, 8)}-${Date.now()}-${planType}-${billingPeriod}`
    
    // Create transaction
    const transaction = await midtrans.transaction.create({
      transaction_details: {
        order_id: orderId,
        gross_amount: pricing.priceIdr,
      },
      customer_details: {
        email: user.email,
      },
      item_details: [{
        id: pricing.sku,
        price: pricing.priceIdr,
        quantity: 1,
        name: `cekwajar.id ${planType.toUpperCase()} - ${billingPeriod}`,
      }],
      enabled_payments: [
        'gopay', 'shopeepay', 'dana', 'ovo',
        'bca_va', 'bni_va', 'bri_va',
        'mandiri_bill', 'indomaret', 'alfamart',
        'credit_card',
      ],
    })
    
    // Log transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      midtrans_order_id: orderId,
      plan_type: planType,
      billing_period: billingPeriod,
      gross_amount: pricing.priceIdr,
      status: 'pending',
    })
    
    return NextResponse.json({
      orderId,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 })
  }
}
