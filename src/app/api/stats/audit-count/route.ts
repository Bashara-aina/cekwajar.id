import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const serviceSupabase = await createServiceClient()

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { count, error } = await serviceSupabase
      .from('payslip_audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    return NextResponse.json(
      {
        auditCount7Days: count ?? 0,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Stats audit-count error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}