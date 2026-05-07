// ==============================================================================
// cekwajar.id — Payment transaction creation
// POST /api/payment/create-transaction
// Pricing sourced from REVENUE_ANCHORS (single pro tier at IDR 49K).
// Supports authenticated users and guest checkout (anon session).
// Idempotency via Idempotency-Key header prevents double-charge on retry.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ensureAnonSession } from '@/lib/anon-session'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { REVENUE_ANCHORS } from '@/lib/constants'
import * as Sentry from '@sentry/nextjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// --- Zod Schema ---------------------------------------------------------------

const BodySchema = z.object({
  plan: z.enum(['pro']).default('pro'),
  billingPeriod: z.enum(['monthly', 'annual']).default('monthly'),
  source: z.enum(['verdict', 'upgrade', 'cta', 'inline']).default('upgrade'),
})

type Plan = 'pro'
type Period = 'monthly' | 'annual'
type Source = 'verdict' | 'upgrade' | 'cta' | 'inline'

const PRICING: Record<Period, number> = {
  monthly: REVENUE_ANCHORS.PRO_PRICE_IDR,
  annual: 449_000, // IDR 449K for annual — SKU: cekwajar-pro-annual-449k-v1
}

const SKU_MAP: Record<Period, string> = {
  monthly: 'cekwajar-pro-monthly-49k-v1',
  annual: 'cekwajar-pro-annual-449k-v1',
}

// --- Handler ----------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Idempotency — return existing result if same key replayed within window
  const idempotencyKey = request.headers.get('Idempotency-Key')
  if (idempotencyKey) {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('transactions')
      .select('id, midtrans_order_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({
        success: true,
        data: { orderId: existing.midtrans_order_id, cached: true },
      })
    }
  }

  // Rate limit check
  const anonSessionId = await ensureAnonSession()
  const rateLimitKey = { type: 'anon' as const, id: anonSessionId }
  const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.createTransaction.limit, RATE_LIMITS.createTransaction.window)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan. Coba lagi nanti.' } },
      { status: 429 }
    )
  }

  // Auth — guest checkout supported
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'JSON tidak valid.' } }, { status: 400 })
  }

  const bodyWithSession = body as { plan?: string; billingPeriod?: string; sessionId?: string; source?: string }
  const guestSessionId = bodyWithSession.sessionId ?? anonSessionId

  const parsed = BodySchema.safeParse({
    plan: bodyWithSession.plan,
    billingPeriod: bodyWithSession.billingPeriod,
    source: bodyWithSession.source,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: parsed.error.issues[0].message } },
      { status: 400 }
    )
  }

  const { billingPeriod, source } = parsed.data
  const plan: Plan = 'pro' // Enforced — only pro is sold
  const grossAmount = PRICING[billingPeriod]

  // Order ID
  const idPrefix = user ? user.id.slice(0, 8) : `anon-${guestSessionId.slice(0, 8)}`
  const orderId = `CW-${idPrefix}-${Date.now()}-${plan}`

  // Insert transaction with idempotency_key and source for funnel analytics
  const { error: insertError } = await supabase.from('transactions').insert(
    user
      ? {
          user_id: user.id,
          midtrans_order_id: orderId,
          plan_type: plan,
          billing_period: billingPeriod,
          gross_amount: grossAmount,
          status: 'pending',
          source: source as string,
          idempotency_key: idempotencyKey,
        }
      : {
          anon_session_id: guestSessionId,
          midtrans_order_id: orderId,
          plan_type: plan,
          billing_period: billingPeriod,
          gross_amount: grossAmount,
          status: 'pending',
          source: source as string,
          idempotency_key: idempotencyKey,
        }
  )

  if (insertError) {
    console.error('Failed to insert transaction:', insertError)
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal menyimpan transaksi.' } },
      { status: 500 }
    )
  }

  // Midtrans Snap API
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  const snapBaseUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const authString = Buffer.from(`${serverKey}:`).toString('base64')
  const billingLabel = billingPeriod === 'monthly' ? '1 bulan' : '12 bulan'
  const sku = SKU_MAP[billingPeriod]

  let snapToken: string
  try {
    const snapResponse = await fetch(snapBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'Idempotency-Key': idempotencyKey ?? orderId,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        item_details: [{
          id: sku,
          price: grossAmount,
          quantity: 1,
          name: `cekwajar.id Pro — ${billingLabel}`,
        }],
        customer_details: {
          email: user?.email ?? `guest-${guestSessionId}@cekwajar.id`,
        },
        enabled_payments: [
          'gopay', 'shopeepay', 'dana', 'ovo',
          'bca_va', 'bni_va', 'bri_va', 'mandiri_bill',
          'indomaret', 'alfamart',
          'credit_card',
        ],
        expiry: { duration: 24, unit: 'hour' },
      }),
    })

    const snapData = await snapResponse.json()

    if (!snapResponse.ok || !snapData.token) {
      const err = new Error(snapData.error_message ?? 'Midtrans API error')
      Sentry.captureException(err, { extra: { plan, source, billingPeriod, orderId } })
      return NextResponse.json(
        { error: { code: 'MIDTRANS_ERROR', message: snapData.error_message ?? 'Gagal membuat transaksi.' } },
        { status: 502 }
      )
    }

    snapToken = snapData.token
  } catch (err) {
    Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
      extra: { plan, source, billingPeriod },
    })
    return NextResponse.json(
      { error: { code: 'MIDTRANS_ERROR', message: 'Tidak dapat terhubung ke Midtrans.' } },
      { status: 502 }
    )
  }

  return NextResponse.json({
    success: true,
    data: { snapToken, orderId },
  })
}