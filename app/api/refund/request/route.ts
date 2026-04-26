import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    await req.json()
    const authHeader = req.headers.get('Authorization')
    
    // Get user from auth header
    let userId: string | null = null
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

    const { data: lastPayment } = await supabaseAdmin
      .from('payments')
      .select('id, midtrans_order_id, amount_idr, paid_at')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('paid_at', sevenDaysAgo)
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!lastPayment) {
      return NextResponse.json({
        ok: false,
        message: 'Tidak ada pembayaran dalam 7 hari terakhir yang memenuhi syarat refund.',
      })
    }

    // Async Midtrans refund trigger (stub — wire to actual Midtrans API)
    // await triggerMidtransRefund(lastPayment.midtrans_order_id, lastPayment.amount_idr)

    await supabaseAdmin
      .from('user_profiles')
      .update({ subscription_tier: 'free' })
      .eq('id', userId)

    await supabaseAdmin.from('refund_requests').insert({
      user_id: userId,
      payment_id: lastPayment.id,
      requested_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      message: 'Refund diproses. Akan masuk dalam 1×24 jam.',
    })
  } catch {
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 })
  }
}
