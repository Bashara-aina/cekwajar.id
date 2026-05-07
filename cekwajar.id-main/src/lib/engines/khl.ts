// lib/engines/khl.ts
// KHL (Cost of Living Adequacy) calculation engine
// Phase 1: Static calculator — no live BPS data

import { KHL_ITEMS, KHL_CATEGORIES, type KhlCategory } from '@/lib/data/khl-basket'
import { getCityByCode } from '@/lib/data/regional-prices'

export type HidupVerdict = 'LAYAK' | 'PAS_PASAN' | 'KURANG'
export type HousingStatus = 'rent' | 'own' | 'family'
export type TransportMode = 'motor' | 'public' | 'car'

// Household size → non-linear multiplier for KHL total
export const HOUSEHOLD_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 1.8,
  3: 2.5,
  4: 3.0,
  5: 3.3,
}
export const HOUSEHOLD_MAX = 5

export function getHouseholdMultiplier(size: number): number {
  if (size <= 1) return HOUSEHOLD_MULTIPLIER[1]
  if (size >= HOUSEHOLD_MAX) return HOUSEHOLD_MULTIPLIER[HOUSEHOLD_MAX]
  return HOUSEHOLD_MULTIPLIER[size] ?? HOUSEHOLD_MULTIPLIER[HOUSEHOLD_MAX]
}

// Verdict thresholds
export function getVerdict(adequacyRatio: number): HidupVerdict {
  if (adequacyRatio >= 1.5) return 'LAYAK'
  if (adequacyRatio >= 1.0) return 'PAS_PASAN'
  return 'KURANG'
}

export interface UserSpending {
  food: number
  housing: number
  transport: number
  education: number
  health: number
  recreation: number
}

export interface CategoryBreakdown {
  category: KhlCategory
  categoryLabel: string
  actualSpending: number
  khlBenchmark: number
  difference: number
  surplus: boolean
}

export interface KhlResult {
  id: string
  cityCode: string
  cityName: string
  netIncome: number
  householdSize: number
  householdMultiplier: number
  khlMonthly: number
  khlPerCapita: number
  adequacyRatio: number
  verdict: HidupVerdict
  surplus: number
  breakdown: CategoryBreakdown[]
  suggestions: string[]
}

// Mapping KHL item categories to user spending categories
const SPENDING_CATEGORY_MAP: Record<KhlCategory, keyof UserSpending> = {
  food:          'food',
  clothing:       'food',
  housing:        'housing',
  education:      'education',
  health:         'health',
  transportation: 'transport',
  recreation:     'recreation',
}

// Calculate KHL per capita for a given city.
export function calculateCityKhl(cityCode: string): number {
  const city = getCityByCode(cityCode)
  if (!city) return 0
  return KHL_ITEMS.reduce(
    (sum, item) => sum + item.monthlyQty * item.jakartaPrice * city.priceMultiplier,
    0
  )
}

// Get per-category KHL benchmarks for a city.
export function getCategoryBenchmarks(
  cityCode: string
): Record<KhlCategory, number> {
  const city = getCityByCode(cityCode)
  if (!city) {
    return Object.fromEntries(
      (Object.keys(KHL_CATEGORIES) as KhlCategory[]).map((k) => [k, 0])
    ) as Record<KhlCategory, number>
  }

  const result: Partial<Record<KhlCategory, number>> = {}
  for (const cat of Object.keys(KHL_CATEGORIES) as KhlCategory[]) {
    result[cat] = KHL_ITEMS
      .filter((item) => item.category === cat)
      .reduce(
        (sum, item) => sum + item.monthlyQty * item.jakartaPrice * city.priceMultiplier,
        0
      )
  }
  return result as Record<KhlCategory, number>
}

// Core KHL calculation — Phase 1 static calculator.
export function calculateKhl(params: {
  netIncome: number
  cityCode: string
  householdSize: number
  housingStatus: HousingStatus
  transportMode: TransportMode
  actualSpending: UserSpending
}): KhlResult {
  const { netIncome, cityCode, householdSize, housingStatus, transportMode, actualSpending } = params

  const city = getCityByCode(cityCode)
  if (!city) {
    throw new Error('INVALID_CITY')
  }

  const householdMultiplier = getHouseholdMultiplier(householdSize)
  const khlPerCapita = calculateCityKhl(cityCode)
  const khlMonthly = Math.round(khlPerCapita * householdMultiplier)

  const surplus = netIncome - khlMonthly
  const adequacyRatio = khlMonthly > 0 ? netIncome / khlMonthly : 0
  const verdict = getVerdict(adequacyRatio)

  // Per-category breakdown
  const catBenchmarks = getCategoryBenchmarks(cityCode)
  const breakdown: CategoryBreakdown[] = (
    Object.keys(KHL_CATEGORIES) as KhlCategory[]
  ).map((cat) => {
    const actual = actualSpending[SPENDING_CATEGORY_MAP[cat]]
    const khlBenchmark = catBenchmarks[cat]
    const diff = actual - khlBenchmark
    return {
      category: cat,
      categoryLabel: KHL_CATEGORIES[cat],
      actualSpending: actual,
      khlBenchmark,
      difference: diff,
      surplus: diff >= 0,
    }
  })

  // Optimization suggestions
  const suggestions: string[] = []
  for (const row of breakdown) {
    if (!row.surplus) {
      const pctOver = Math.abs(
        Math.round((row.difference / (row.khlBenchmark || 1)) * 100)
      )
      if (pctOver > 20) {
        suggestions.push(
          `Pengeluaran ${row.categoryLabel} kamu ${pctOver}% di bawah KHL untuk ${city.cityName} — pertimbangkan optimasi.`
        )
      }
    } else if (row.surplus) {
      const pctOver = Math.abs(
        Math.round((row.difference / (row.khlBenchmark || 1)) * 100)
      )
      if (pctOver > 30) {
        suggestions.push(
          `Pengeluaran ${row.categoryLabel} kamu ${pctOver}% di atas KHL — peluang hemat Rp ${row.difference.toLocaleString('id-ID')}/bulan.`
        )
      }
    }
  }

  // Housing status
  if (housingStatus === 'family') {
    suggestions.push('Numpang di keluarga: perumahan tidak masuk perhitungan KHL kamu.')
  } else if (housingStatus === 'rent' && actualSpending.housing < khlPerCapita * 0.3) {
    suggestions.push('Cost sharing dengan keluarga/partner bisa turunkan kebutuhan KHL bulanan.')
  }

  // Transport
  if (transportMode === 'public' && actualSpending.transport > khlPerCapita * 0.15) {
    suggestions.push('Transportasi umum lebih hemat — KHL transportasi Indonesia ~10-15% dari total.')
  } else if (transportMode === 'motor' && actualSpending.transport > khlPerCapita * 0.2) {
    suggestions.push('Bensin + servis motor makan ~15-20% dari KHL — coba optimasi rute.')
  }

  return {
    id: crypto.randomUUID(),
    cityCode,
    cityName: city.cityName,
    netIncome,
    householdSize,
    householdMultiplier,
    khlMonthly,
    khlPerCapita,
    adequacyRatio: Math.round(adequacyRatio * 100) / 100,
    verdict,
    surplus,
    breakdown,
    suggestions,
  }
}
