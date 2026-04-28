import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const benchmarkSchema = z.object({
  jobTitle: z.string().min(1),
  city: z.string().optional(),
  province: z.string().optional(),
  experienceBucket: z.enum(['0-2', '3-5', '6-10', '10+']),
  userSalary: z.number().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams
    
    const parsed = benchmarkSchema.safeParse({
      jobTitle: params.get('jobTitle'),
      city: params.get('city') || undefined,
      province: params.get('province') || undefined,
      experienceBucket: params.get('experienceBucket') || '0-2',
      userSalary: params.get('userSalary') ? parseInt(params.get('userSalary')!) : undefined,
    })
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }
    
    const { jobTitle, city, province, experienceBucket, userSalary } = parsed.data
    
    // Fuzzy search for job category
    const { data: categories } = await supabase.rpc('search_job_categories_fuzzy', {
      search_term: jobTitle,
      threshold: 0.3,
    })
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No matching job title found' }, { status: 404 })
    }
    
    const matchedCategory = categories[0]
    
    // Query salary benchmarks
    let query = supabase
      .from('salary_benchmarks')
      .select('*')
      .eq('job_category_id', matchedCategory.id)
      .eq('experience_bucket', experienceBucket)
    
    if (city) {
      const { data: cityData } = await query.eq('city', city).single()
      if (cityData) {
        const sampleCount = cityData.sample_count || 0
        const K = 15
        const weight = sampleCount / (sampleCount + K)
        const bpsPriorP50 = cityData.p50 || cityData.p50
        
        return NextResponse.json({
          matchedTitle: matchedCategory.title,
          dataTier: sampleCount >= 30 ? 'CITY_LEVEL' : 'CITY_LEVEL_LIMITED',
          p25: cityData.p25,
          p50: cityData.p50,
          p75: cityData.p75,
          sampleCount,
          blendWeight: weight,
          userPosition: userSalary ? getPercentile(userSalary, cityData.p25, cityData.p50, cityData.p75) : null,
        })
      }
    }
    
    // Fallback to province level
    if (province) {
      const { data: provinceData } = await query.eq('province', province).single()
      if (provinceData) {
        return NextResponse.json({
          matchedTitle: matchedCategory.title,
          dataTier: 'PROVINCE_LEVEL',
          p25: provinceData.p25,
          p50: provinceData.p50,
          p75: provinceData.p75,
          sampleCount: provinceData.sample_count,
        })
      }
    }
    
    return NextResponse.json({ error: 'No benchmark data available' }, { status: 404 })
  } catch (error) {
    console.error('Benchmark error:', error)
    return NextResponse.json({ error: 'Benchmark lookup failed' }, { status: 500 })
  }
}

function getPercentile(value: number, p25: number, p50: number, p75: number): string {
  if (value < p25) return 'below_p25'
  if (value > p75) return 'above_p75'
  return 'within_range'
}
