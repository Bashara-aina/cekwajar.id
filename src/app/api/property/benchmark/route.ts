import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const propertySchema = z.object({
  province: z.string().min(1),
  city: z.string().min(1),
  district: z.string().optional(),
  propertyType: z.enum(['RUMAH', 'TANAH', 'APARTEMEN', 'RUKO']),
  landAreaSqm: z.number().min(1),
  askingPriceTotal: z.number().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams
    
    const parsed = propertySchema.safeParse({
      province: params.get('province'),
      city: params.get('city'),
      district: params.get('district') || undefined,
      propertyType: params.get('propertyType'),
      landAreaSqm: parseFloat(params.get('landAreaSqm') || '0'),
      askingPriceTotal: parseFloat(params.get('askingPriceTotal') || '0'),
    })
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }
    
    const { province, city, district, propertyType, landAreaSqm, askingPriceTotal } = parsed.data
    
    // Determine size band
    let sizeBand = 'KECIL'
    if (landAreaSqm > 200) sizeBand = 'SANGAT_BESAR'
    else if (landAreaSqm > 100) sizeBand = 'BESAR'
    else if (landAreaSqm > 50) sizeBand = 'SEDANG'
    
    const pricePerSqm = askingPriceTotal / landAreaSqm
    
    // Query benchmark stats via RPC
    const { data: stats } = await supabase.rpc('get_property_benchmark_stats', {
      p_province: province,
      p_city: city,
      p_district: district || null,
      p_property_type: propertyType,
      p_size_band: sizeBand,
    })
    
    let cityStats = null
    if (!stats || stats.sample_count < 5) {
      const { data } = await supabase
        .from('property_benchmarks')
        .select('p25, p50, p75, sample_count')
        .eq('province', province)
        .eq('city', city)
        .eq('property_type', propertyType)
        .single()
      cityStats = data

      if (!cityStats || cityStats.sample_count < 5) {
        return NextResponse.json({ error: 'Insufficient data' }, { status: 404 })
      }
    }

    const p25 = stats?.p25 || cityStats?.p25 || 0
    const p50 = stats?.p50 || cityStats?.p50 || 0
    const p75 = stats?.p75 || cityStats?.p75 || 0
    const sampleCount = stats?.sample_count || cityStats?.sample_count || 0
    
    // IQR verdict calculation
    const iqr = p75 - p25
    let verdict: string
    if (pricePerSqm < p25 - 0.5 * iqr) verdict = 'MURAH'
    else if (pricePerSqm > p75 + 1.5 * iqr) verdict = 'SANGAT_MAHAL'
    else if (pricePerSqm > p75) verdict = 'MAHAL'
    else verdict = 'WAJAR'
    
    // Percentile estimation
    const percentile = getPercentile(pricePerSqm, p25, p50, p75)
    
    return NextResponse.json({
      verdict,
      percentile,
      pricePerSqm: Math.round(pricePerSqm),
      p25: Math.round(p25),
      p50: Math.round(p50),
      p75: Math.round(p75),
      sampleCount,
      disclaimer: 'Bukan pengganti KJPP. Hasil ini bersifat indikatif.',
    })
  } catch (error) {
    console.error('Property benchmark error:', error)
    return NextResponse.json({ error: 'Benchmark lookup failed' }, { status: 500 })
  }
}

function getPercentile(price: number, p25: number, p50: number, p75: number): number {
  if (price <= p25) return Math.max(5, Math.round((price / p25) * 25))
  if (price >= p75) return Math.min(99, 75 + Math.round(((price - p75) / (p75 * 0.5)) * 24))
  return 50
}
