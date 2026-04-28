import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: cities } = await supabase
      .from('umk_2026')
      .select('city, province, monthly_minimum_idr')
      .order('province', { ascending: true })
      .order('city', { ascending: true })
    
    return NextResponse.json(
      { cities: cities || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
