import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LIFESTYLE_MULTIPLIERS } from '@/lib/constants'
import { z } from 'zod'

const colSchema = z.object({
  fromCity: z.string().min(1),
  toCity: z.string().min(1),
  currentSalary: z.number().min(1),
  lifestyleTier: z.enum(['HEMAT', 'STANDAR', 'NYAMAN']),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams
    
    const parsed = colSchema.safeParse({
      fromCity: params.get('fromCity'),
      toCity: params.get('toCity'),
      currentSalary: parseFloat(params.get('currentSalary') || '0'),
      lifestyleTier: params.get('lifestyleTier') || 'STANDAR',
    })
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }
    
    const { fromCity, toCity, currentSalary, lifestyleTier } = parsed.data
    
    // Get COL indices
    const { data: fromIndex } = await supabase
      .from('col_indices')
      .select('col_index')
      .eq('city_name', fromCity)
      .single()
    
    const { data: toIndex } = await supabase
      .from('col_indices')
      .select('col_index')
      .eq('city_name', toCity)
      .single()
    
    if (!fromIndex || !toIndex) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 })
    }
    
    const baselineRatio = toIndex.col_index / fromIndex.col_index
    const multiplier = LIFESTYLE_MULTIPLIERS[lifestyleTier]
    const adjustedRatio = 1 + (baselineRatio - 1) * multiplier
    const requiredSalary = Math.round(currentSalary * adjustedRatio)
    const difference = requiredSalary - currentSalary
    const percentChange = ((adjustedRatio - 1) * 100).toFixed(1)
    
    let verdict: string
    if (adjustedRatio < 0.95) verdict = 'LEBIH_MURAH'
    else if (adjustedRatio > 1.05) verdict = 'LEBIH_MAHAL'
    else verdict = 'SAMA'
    
    return NextResponse.json({
      requiredSalary,
      difference,
      percentChange: parseFloat(percentChange),
      verdict,
      fromIndex: fromIndex.col_index,
      toIndex: toIndex.col_index,
    })
  } catch (error) {
    console.error('COL compare error:', error)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
