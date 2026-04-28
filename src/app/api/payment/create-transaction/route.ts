import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

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

    return NextResponse.json({
      orderId,
      snapToken: 'stub-token-' + orderId,
      redirectUrl: '/upgrade/success?order=' + orderId,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 })
  }
}
