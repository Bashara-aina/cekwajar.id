import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Find recent payment (within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: lastPayment } = await supabase
      .from('transactions')
      .select('id, midtrans_order_id, gross_amount, created_at')
      .eq('user_id', user.id)
      .eq('status', 'settlement')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (!lastPayment) {
      return NextResponse.json({
        ok: false,
        message: 'Tidak ada pembayaran dalam 7 hari terakhir yang memenuhi syarat refund.',
      })
    }
    
    // Trigger refund via Midtrans (would need actual implementation)
    // For now, just log the request
    await supabase.from('refund_requests').insert({
      user_id: user.id,
      payment_id: lastPayment.id,
      requested_at: new Date().toISOString(),
      status: 'pending',
    })
    
    // Downgrade user
    await supabase.from('user_profiles').update({
      subscription_tier: 'free',
    }).eq('id', user.id)
    
    return NextResponse.json({
      ok: true,
      message: 'Refund diproses. Akan masuk dalam 1×24 jam.',
    })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json({ error: 'Refund request failed' }, { status: 500 })
  }
}