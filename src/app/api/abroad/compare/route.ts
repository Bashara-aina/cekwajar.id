import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const abroadSchema = z.object({
  currentIDRSalary: z.number().min(1),
  targetCountry: z.string().min(2),
  offerSalary: z.number().optional(),
  tier: z.enum(['free', 'basic', 'pro']).default('free'),
})

// In-memory exchange rate cache
const exchangeRateCache = new Map<string, { rate: number; timestamp: number }>()
const EXCHANGE_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

async function getExchangeRate(from: string, to: string): Promise<number> {
  const cacheKey = `${from}/${to}`
  const cached = exchangeRateCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < EXCHANGE_CACHE_TTL) {
    return cached.rate
  }
  
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
    const data = await response.json()
    const rate = data.rates[to]
    
    exchangeRateCache.set(cacheKey, { rate, timestamp: Date.now() })
    return rate
  } catch {
    // Return cached fallback
    return cached?.rate || 1
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams
    
    const parsed = abroadSchema.safeParse({
      currentIDRSalary: parseFloat(params.get('currentIDRSalary') || '0'),
      targetCountry: params.get('targetCountry') || '',
      offerSalary: params.get('offerSalary') ? parseFloat(params.get('offerSalary')!) : undefined,
      tier: params.get('tier') || 'free',
    })
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }
    
    const { currentIDRSalary, targetCountry, offerSalary, tier } = parsed.data
    
    // Get PPP factors from DB
    const { data: idPPP } = await supabase
      .from('ppp_reference')
      .select('ppp_factor, currency_code')
      .eq('country_code', 'IDN')
      .single()
    
    const { data: foreignPPP } = await supabase
      .from('ppp_reference')
      .select('ppp_factor, is_free_tier, currency_code')
      .eq('country_code', targetCountry)
      .single()
    
    if (!idPPP || !foreignPPP) {
      return NextResponse.json({ error: 'Country data not found' }, { status: 404 })
    }
    
    // Check tier gating for non-free countries
    if (foreignPPP.is_free_tier === false && tier === 'free') {
      return NextResponse.json({ 
        error: 'Premium feature', 
        upsell: 'Upgrade to Pro to compare with this country' 
      }, { status: 403 })
    }
    
    // Get exchange rate
    const exchangeRate = await getExchangeRate('IDR', foreignPPP.currency_code || 'USD')
    
    // Calculate nominal equivalent
    const nominalEquivalent = currentIDRSalary / exchangeRate
    
    // Calculate PPP equivalent
    const userPurchasingPower = currentIDRSalary / idPPP.ppp_factor
    const foreignPurchasingPower = (offerSalary || nominalEquivalent) / foreignPPP.ppp_factor
    const realRatio = foreignPurchasingPower / userPurchasingPower
    
    return NextResponse.json({
      nominalEquivalent: Math.round(nominalEquivalent),
      purchasingPowerRatio: realRatio.toFixed(2),
      isPPPBetter: realRatio > 1,
      exchangeRate: exchangeRate.toFixed(2),
      currencyCode: foreignPPP.currency_code || 'USD',
    })
  } catch (error) {
    console.error('Abroad compare error:', error)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
