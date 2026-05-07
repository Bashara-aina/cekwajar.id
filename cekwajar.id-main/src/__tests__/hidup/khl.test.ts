// __tests__/hidup/khl.test.ts
// Tests for KHL engine

import { describe, it, expect } from 'vitest'
import {
  getJakartaMonthlyKhl,
  KHL_ITEM_COUNT,
} from '@/lib/data/khl-basket'
import { CITIES } from '@/lib/data/regional-prices'
import {
  calculateCityKhl,
  getHouseholdMultiplier,
  getVerdict,
  calculateKhl,
  HOUSEHOLD_MULTIPLIER,
  HOUSEHOLD_MAX,
} from '@/lib/engines/khl'

// ── KHL Basket ────────────────────────────────────────────────────────────────

describe('KHL Basket', () => {
  it('should have exactly 64 items', () => {
    expect(KHL_ITEM_COUNT).toBe(64)
  })

  it('should calculate Jakarta monthly KHL correctly', () => {
    const jakarta = getJakartaMonthlyKhl()
    // Jakarta per capita KHL should be around 4-6 million IDR
    expect(jakarta).toBeGreaterThan(4_000_000)
    expect(jakarta).toBeLessThan(6_000_000)
  })

  it('should have 7 categories', () => {
    const categories = new Set([
      'food',
      'clothing',
      'housing',
      'education',
      'health',
      'transportation',
      'recreation',
    ])
    expect(categories.size).toBe(7)
  })
})

// ── Regional Prices ────────────────────────────────────────────────────────

describe('Regional Prices', () => {
  it('should have 10 cities', () => {
    expect(CITIES).toHaveLength(10)
  })

  it('Jakarta should have multiplier 1.0', () => {
    const jakarta = CITIES.find((c) => c.cityCode === 'JKT')
    expect(jakarta?.priceMultiplier).toBe(1.0)
  })

  it('all cities should have multipliers', () => {
    for (const city of CITIES) {
      expect(city.priceMultiplier).toBeGreaterThan(0)
      expect(city.priceMultiplier).toBeLessThanOrEqual(1.5)
    }
  })

  it('calculateCityKhl should return different values for different cities', () => {
    const jakarta = calculateCityKhl('JKT')
    const surabaya = calculateCityKhl('SBY')
    expect(surabaya).toBeLessThan(jakarta) // Surabaya cheaper than Jakarta
  })

  it('calculateCityKhl should return 0 for unknown city', () => {
    expect(calculateCityKhl('UNKNOWN')).toBe(0)
  })
})

// ── Household Multiplier ──────────────────────────────────────────────────

describe('Household Multiplier', () => {
  it('should have correct multipliers', () => {
    expect(getHouseholdMultiplier(1)).toBe(1.0)
    expect(getHouseholdMultiplier(2)).toBe(1.8)
    expect(getHouseholdMultiplier(3)).toBe(2.5)
    expect(getHouseholdMultiplier(4)).toBe(3.0)
    expect(getHouseholdMultiplier(5)).toBe(3.3)
  })

  it('should cap at HOUSEHOLD_MAX', () => {
    expect(getHouseholdMultiplier(6)).toBe(HOUSEHOLD_MULTIPLIER[HOUSEHOLD_MAX])
    expect(getHouseholdMultiplier(100)).toBe(HOUSEHOLD_MULTIPLIER[HOUSEHOLD_MAX])
  })
})

// ── Verdict Thresholds ───────────────────────────────────────────────────

describe('Verdict Thresholds', () => {
  it('should return KURANG for ratio < 1.0', () => {
    expect(getVerdict(0.5)).toBe('KURANG')
    expect(getVerdict(0.99)).toBe('KURANG')
  })

  it('should return PAS_PASAN for ratio >= 1.0 and < 1.5', () => {
    expect(getVerdict(1.0)).toBe('PAS_PASAN')
    expect(getVerdict(1.3)).toBe('PAS_PASAN')
    expect(getVerdict(1.49)).toBe('PAS_PASAN')
  })

  it('should return LAYAK for ratio >= 1.5', () => {
    expect(getVerdict(1.5)).toBe('LAYAK')
    expect(getVerdict(2.0)).toBe('LAYAK')
    expect(getVerdict(5.0)).toBe('LAYAK')
  })
})

// ── Full KHL Calculation ─────────────────────────────────────────────────

describe('calculateKhl', () => {
  const baseParams = {
    cityCode: 'JKT' as const,
    householdSize: 1 as const,
    housingStatus: 'rent' as const,
    transportMode: 'motor' as const,
  }

  it('should throw for invalid city', () => {
    expect(() =>
      calculateKhl({ ...baseParams, netIncome: 5_000_000, cityCode: 'INVALID', actualSpending: { food: 2_000_000, housing: 1_500_000, transport: 500_000, education: 200_000, health: 200_000, recreation: 300_000 } })
    ).toThrow()
  })

  it('should return correct verdict for adequate income', () => {
    const result = calculateKhl({
      ...baseParams,
      netIncome: 10_000_000,
      actualSpending: { food: 3_000_000, housing: 2_500_000, transport: 1_000_000, education: 500_000, health: 500_000, recreation: 1_000_000 },
    })
    expect(['LAYAK', 'PAS_PASAN', 'KURANG']).toContain(result.verdict)
    expect(result.id).toBeDefined()
    expect(result.cityName).toBe('Jakarta')
    expect(result.khlMonthly).toBeGreaterThan(0)
  })

  it('should return LAYAK for income 2x KHL', () => {
    const khl = calculateCityKhl('JKT')
    const result = calculateKhl({
      ...baseParams,
      netIncome: Math.round(khl * 2),
      actualSpending: { food: 2_000_000, housing: 1_500_000, transport: 500_000, education: 200_000, health: 200_000, recreation: 300_000 },
    })
    expect(result.verdict).toBe('LAYAK')
    expect(result.adequacyRatio).toBeCloseTo(2.0, 1)
  })

  it('should apply household multiplier for 4-person household', () => {
    const result = calculateKhl({
      ...baseParams,
      householdSize: 4,
      netIncome: 15_000_000,
      actualSpending: { food: 5_000_000, housing: 4_000_000, transport: 2_000_000, education: 1_000_000, health: 1_000_000, recreation: 1_000_000 },
    })
    expect(result.householdMultiplier).toBe(3.0)
    expect(result.khlMonthly).toBeGreaterThan(result.khlPerCapita)
  })

  it('should produce suggestions when spending over KHL', () => {
    const result = calculateKhl({
      ...baseParams,
      netIncome: 5_000_000,
      actualSpending: { food: 5_000_000, housing: 3_000_000, transport: 2_000_000, education: 1_000_000, health: 500_000, recreation: 500_000 },
    })
    expect(result.suggestions.length).toBeGreaterThan(0)
  })
})
