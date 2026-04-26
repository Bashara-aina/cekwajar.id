import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gt('paid_at', new Date(Date.now() - 3600 * 1000).toISOString())
    return NextResponse.json({ lastHour: count ?? 0 })
  } catch {
    return NextResponse.json({ lastHour: 0 })
  }
}
