// ==============================================================================
// cekwajar.id — Payment Flow Test Script
// Tests end-to-end: create-transaction → Snap popup → webhook settlement
// Usage:
//   Sandbox:  npx ts-node scripts/test-payment-flow.ts
//   With URL: npx ts-node scripts/test-payment-flow.ts --url https://your-staging-url.com
// ==============================================================================

import crypto from 'crypto'

// ---- Config ----------------------------------------------------------------

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? 'SB-Mid-server-key-placeholder'
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN ?? '' // Supabase JWT for auth

// Test plans
const TEST_PLANS = [
  { plan: 'basic', billingPeriod: 'monthly', expectedAmount: 29000 },
  { plan: 'basic', billingPeriod: 'annual',  expectedAmount: 278400 },
  { plan: 'pro',   billingPeriod: 'monthly', expectedAmount: 79000 },
  { plan: 'pro',   billingPeriod: 'annual',  expectedAmount: 758400 },
] as const

// ---- Helpers ----------------------------------------------------------------

function log(label: string, msg: string) {
  console.log(`  [${label}] ${msg}`)
}

function error(label: string, msg: string) {
  console.error(`  [${label}] ❌ ${msg}`)
}

function ok(label: string, msg: string) {
  console.log(`  [${label}] ✅ ${msg}`)
}

function section(name: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(` ${name}`)
  console.log('='.repeat(60))
}

// Generate test order ID
function makeOrderId(userId: string, plan: string, period: string): string {
  return `CW-${userId.slice(0, 8)}-${Date.now()}-${plan}-${period}`
}

// Generate HMAC-SHA512 signature for webhook
function signWebhook(orderId: string, statusCode: string, grossAmount: string): string {
  return crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)
    .digest('hex')
}

// Call create-transaction API
async function createTransaction(plan: string, billingPeriod: string): Promise<{
  orderId: string
  snapToken: string
  status: number
}> {
  const res = await fetch(`${APP_URL}/api/payment/create-transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(TEST_USER_TOKEN ? { Authorization: `Bearer ${TEST_USER_TOKEN}` } : {}),
    },
    body: JSON.stringify({ plan, billingPeriod }),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(`create-transaction failed (${res.status}): ${JSON.stringify(json.error ?? json)}`)
  }

  return {
    orderId: json.data.orderId,
    snapToken: json.data.snapToken,
    status: res.status,
  }
}

// Call webhook directly (simulate Midtrans calling back)
async function sendWebhook(payload: Record<string, unknown>): Promise<{
  ok: boolean
  status: number
  body: unknown
}> {
  const res = await fetch(`${APP_URL}/api/webhooks/midtrans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => ({ raw: 'non-json' }))
  return { ok: res.ok, status: res.status, body }
}

// ---- Test Suites -----------------------------------------------------------

async function testCreateTransaction() {
  section('TEST 1: create-transaction')

  for (const { plan, billingPeriod, expectedAmount } of TEST_PLANS) {
    try {
      log(plan, `Attempting ${plan}/${billingPeriod} (${expectedAmount})...`)
      const result = await createTransaction(plan, billingPeriod)

      if (!result.snapToken) {
        error(plan, `No snapToken returned`)
        continue
      }

      // Validate order ID format
      const orderIdParts = result.orderId.split('-')
      if (orderIdParts.length < 4) {
        error(plan, `Invalid order ID format: ${result.orderId}`)
      } else {
        ok(plan, `order_id=${result.orderId}`)
      }

      // Validate snapToken looks like base64
      if (result.snapToken.length < 20) {
        error(plan, `snapToken too short: ${result.snapToken.slice(0, 20)}...`)
      } else {
        ok(plan, `snapToken received (${result.snapToken.length} chars)`)
      }

      log(plan, `✅ ${plan}/${billingPeriod} → order_id=${result.orderId}`)
    } catch (err) {
      error(plan, `Failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

async function testWebhookSignature() {
  section('TEST 2: webhook signature verification')

  const orderId = makeOrderId('test-user-1234', 'basic', 'monthly')
  const grossAmount = '29000'
  const statusCode = '200'
  const signature = signWebhook(orderId, statusCode, grossAmount)

  // Valid signature
  const validPayload = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signature,
    transaction_status: 'settlement',
    fraud_status: 'accept',
    payment_type: 'gopay',
  }

  log('signature', 'Sending settlement webhook with valid signature...')
  const validResult = await sendWebhook(validPayload)

  if (validResult.status === 200) {
    ok('webhook', `Settlement processed successfully`)
  } else if (validResult.status === 401) {
    error('webhook', 'Signature verification failed — check MIDTRANS_SERVER_KEY')
  } else {
    log('webhook', `Status ${validResult.status}: ${JSON.stringify(validResult.body)}`)
  }

  // Invalid signature
  log('signature', 'Sending settlement webhook with INVALID signature...')
  const invalidPayload = {
    ...validPayload,
    signature_key: 'invalid_signature_here_0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  }
  const invalidResult = await sendWebhook(invalidPayload)

  if (invalidResult.status === 401) {
    ok('signature', 'Invalid signature correctly rejected (401)')
  } else {
    error('signature', `Expected 401, got ${invalidResult.status}`)
  }
}

async function testIdempotency() {
  section('TEST 3: webhook idempotency')

  const orderId = makeOrderId('test-user-1234', 'basic', 'monthly')
  const signature = signWebhook(orderId, '200', '29000')

  const settlementPayload = {
    order_id: orderId,
    status_code: '200',
    gross_amount: '29000',
    signature_key: signature,
    transaction_status: 'settlement',
    fraud_status: 'accept',
    payment_type: 'gopay',
  }

  log('idempotency', 'First settlement...')
  const first = await sendWebhook(settlementPayload)
  ok('idempotency', `First call: ${first.status}`)

  log('idempotency', 'Second settlement (should be idempotent)...')
  const second = await sendWebhook(settlementPayload)
  log('idempotency', `Second call: ${second.status}`)
  if (second.status === 200) {
    const body = second.body as Record<string, unknown>
    if (body.status === 'already_processed') {
      ok('idempotency', 'Correctly returned already_processed')
    } else {
      log('idempotency', `Response: ${JSON.stringify(body)}`)
    }
  }
}

async function testPendingExpiration() {
  section('TEST 4: pending + expire flow')

  const orderId = makeOrderId('test-user-1234', 'pro', 'monthly')
  const signature = signWebhook(orderId, '200', '79000')

  // Pending
  const pendingPayload = {
    order_id: orderId,
    status_code: '200',
    gross_amount: '79000',
    signature_key: signature,
    transaction_status: 'pending',
    payment_type: 'bca_va',
  }
  const pending = await sendWebhook(pendingPayload)
  log('pending', `Status: ${pending.status}`)

  // Expire
  const expirePayload = {
    order_id: orderId,
    status_code: '202',
    gross_amount: '79000',
    signature_key: signWebhook(orderId, '202', '79000'),
    transaction_status: 'expire',
  }
  const expire = await sendWebhook(expirePayload)
  log('expire', `Status: ${expire.status}`)
}

// ---- Main -----------------------------------------------------------------

async function main() {
  console.log('\n🚀 cekwajar.id — Payment Flow Test Suite')
  console.log(`   Target: ${APP_URL}`)
  console.log(`   Production mode: ${process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'YES' : 'NO (sandbox)'}`)
  console.log(`   Server key: ${MIDTRANS_SERVER_KEY.slice(0, 8)}...${MIDTRANS_SERVER_KEY.slice(-4)}`)

  // Check critical env vars
  if (!process.env.MIDTRANS_SERVER_KEY) {
    error('env', 'MIDTRANS_SERVER_KEY is not set — webhook signature verification will fail')
    console.log('   Set it with: export MIDTRANS_SERVER_KEY="your-key"')
  }
  if (!TEST_USER_TOKEN) {
    log('auth', 'TEST_USER_TOKEN not set — create-transaction will fail with 401')
    console.log('   Set it with: export TEST_USER_TOKEN="your-jwt-token"')
  }

  await testCreateTransaction()
  await testWebhookSignature()
  await testIdempotency()
  await testPendingExpiration()

  section('DONE')
  console.log('  Review results above. Key failure modes:')
  console.log('  • 401 on webhook → MIDTRANS_SERVER_KEY mismatch')
  console.log('  • 401 on create-transaction → TEST_USER_TOKEN expired or missing')
  console.log('  • 502 on create-transaction → Midtrans API unreachable or bad server key')
  console.log('\n  For sandbox testing, ensure MIDTRANS_IS_PRODUCTION=false')
}

main().catch(err => {
  error('main', err instanceof Error ? err.message : String(err))
  process.exit(1)
})