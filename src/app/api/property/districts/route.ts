import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  province: z.string().min(1),
  city: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams

    const parsed = schema.safeParse({
      province: params.get('province'),
      city: params.get('city'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'province and city are required' }, { status: 400 })
    }

    const { province, city } = parsed.data

    const { data, error } = await supabase
      .from('property_benchmarks')
      .select('district')
      .ilike('province', `%${province}%`)
      .ilike('city', `%${city}%`)
      .not('district', 'is', null)
      .not('district', 'eq', '')
      .order('district')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 })
    }

    const districts = [...new Set((data || []).map(row => row.district).filter(Boolean))]

    return NextResponse.json(
      { districts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Property districts error:', error)
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 })
  }
}