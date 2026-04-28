import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams
    const province = params.get('province')
    const city = params.get('city')

    let query = supabase
      .from('col_indices')
      .select('city_name, province, col_index, data_year, data_quarter')
      .order('col_index', { ascending: false })

    if (province) {
      query = query.ilike('province', `%${province}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }

    const cities = (data || []).map(row => ({
      cityName: row.city_name,
      province: row.province,
      colIndex: row.col_index,
      dataYear: row.data_year,
      dataQuarter: row.data_quarter,
    }))

    return NextResponse.json(
      { cities },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('COL cities error:', error)
    return NextResponse.json({ error: 'Failed to fetch COL cities' }, { status: 500 })
  }
}