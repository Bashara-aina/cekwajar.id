import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServiceClient()

    const { count } = await supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gt('paid_at', new Date(Date.now() - 3600_000).toISOString())

    const lastHour = count ?? 0

    return NextResponse.json({ lastHour })
  } catch (error) {
    console.error('Recent payments error:', error)
    return NextResponse.json({ lastHour: 0 })
  }
}
