import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  tier: z.enum(['free', 'basic', 'pro']).default('free'),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams

    const parsed = schema.safeParse({
      tier: params.get('tier') || 'free',
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const { tier } = parsed.data

    const { data, error } = await supabase
      .from('ppp_reference')
      .select('country_code, country_name, currency_code, currency_symbol, flag_emoji, ppp_factor, is_free_tier')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
    }

    const countries = (data || []).map(row => ({
      countryCode: row.country_code,
      countryName: row.country_name,
      currencyCode: row.currency_code,
      currencySymbol: row.currency_symbol,
      flagEmoji: row.flag_emoji,
      pppFactor: row.ppp_factor,
      isFreeTier: row.is_free_tier ?? false,
      isAccessible: tier !== 'free' || row.is_free_tier === true,
    }))

    return NextResponse.json(
      { countries },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Abroad countries error:', error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}