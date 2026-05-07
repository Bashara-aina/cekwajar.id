/**
 * cekwajar.id — Audit Count API
 * Returns the total number of audits in the last 7 days.
 * Cached for 5 minutes.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 300 // cache 5 minutes

export async function GET() {
  try {
    const supabase = await createClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { count, error } = await supabase
      .from('payslip_audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)

    if (error) {
      console.error('[stats/audit-count] error:', error)
      return NextResponse.json({ count: 0, period: '7d' })
    }

    return NextResponse.json({ count: count ?? 0, period: '7d' })
  } catch {
    return NextResponse.json({ count: 0, period: '7d' })
  }
}