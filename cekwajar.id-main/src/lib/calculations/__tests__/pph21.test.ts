/**
 * PPh21 Calculator — Unit Tests
 * Covered: TER category mapping (A/B/C), PTKP values, December progressive
 * true-up, progressive brackets (UU HPP Pasal 17).
 *
 * NOTE: calculatePPh21 is async and fetches TER rates from Supabase.
 * Tests use a mock Supabase client that returns deterministic TER rates.
 *
 * TODO after Subagent 3: add biaya jabatan (5%) integration tests
 * once pph21.ts is updated to apply biaya jabatan before PKP calculation.
 *
 * Run with: npx vitest run src/lib/calculations/__tests__/pph21.test.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { calculatePPh21 } from '../pph21'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────────
// Mock Supabase client
//
// getTERRate makes TWO queries:
//  1. Primary: exact bracket match → maybeSingle → returns null if no match
//  2. Fallback: closest lower bracket via .order('max_salary', 'desc').limit(1).maybeSingle()
//
// The mock must handle both query shapes. We store the rate in closure
// so the fallback query (which uses order+limit) also returns it.
// ─────────────────────────────────────────────────────────────────

function createMockSupabase(ratePercent: number): SupabaseClient {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { monthly_rate_percent: ratePercent },
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient
}

// Alias for readability
const fixedTERClient = createMockSupabase

// ─────────────────────────────────────────────────────────────────
// TER Category Mapping
// ─────────────────────────────────────────────────────────────────

describe('TER Category mapping', () => {
  it('TK/0 maps to TER category A', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'TK/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('A')
  })

  it('TK/1 maps to TER category A', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'TK/1', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('A')
  })

  it('K/0 maps to TER category B', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('B')
  })

  it('K/1 maps to TER category B', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/1', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('B')
  })

  it('TK/2 maps to TER category B', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'TK/2', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('B')
  })

  it('TK/3 maps to TER category B', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'TK/3', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('B')
  })

  it('K/2 maps to TER category B', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/2', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('B')
  })

  it('K/3 maps to TER category B', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/3', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('B')
  })

  it('K/I/0 maps to TER category C', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/I/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('C')
  })

  it('K/I/1 maps to TER category C', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/I/1', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('C')
  })

  it('K/I/2 maps to TER category C', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/I/2', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('C')
  })

  it('K/I/3 maps to TER category C', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/I/3', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terCategory).toBe('C')
  })
})

// ─────────────────────────────────────────────────────────────────
// PTKP Annual Values
// ─────────────────────────────────────────────────────────────────

describe('PTKP annual values', () => {
  it('TK/0 → Rp 54,000,000 annual', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'TK/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.details.ptkpAnnual).toBe(54_000_000)
  })

  it('K/0 → Rp 58,500,000 annual', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.details.ptkpAnnual).toBe(58_500_000)
  })

  it('K/I/0 → Rp 112,500,000 annual', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/I/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.details.ptkpAnnual).toBe(112_500_000)
  })

  it('K/3 → Rp 72,000,000 annual', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'K/3', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.details.ptkpAnnual).toBe(72_000_000)
  })
})

// ─────────────────────────────────────────────────────────────────
// TER Method (Months 1–11)
// ─────────────────────────────────────────────────────────────────

describe('TER Method — months 1–11', () => {
  it('TER rate 0% → pph21 = 0', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 5_000_000, ptkpStatus: 'TK/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.pph21Amount).toBe(0)
    expect(result.method).toBe('TER')
  })

  it('TER rate 0.5% with NPWP → correct pph21', async () => {
    const client = fixedTERClient(0.5)
    const result = await calculatePPh21(
      { grossSalary: 7_000_000, ptkpStatus: 'TK/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    // TER = 0.5%, monthly tax = 7,000,000 × 0.5% = 35,000
    expect(result.pph21Amount).toBe(35_000)
    expect(result.method).toBe('TER')
  })

  it('TER rate 0.5% WITHOUT NPWP → pph21 × 1.20 (20% surcharge)', async () => {
    const client = fixedTERClient(0.5)
    const result = await calculatePPh21(
      { grossSalary: 7_000_000, ptkpStatus: 'TK/0', monthNumber: 6, year: 2026, hasNPWP: false },
      client
    )
    // 7,000,000 × 0.5% = 35,000 × 1.20 = 42,000
    expect(result.pph21Amount).toBe(42_000)
  })

  it('TER rate 1.25% for TER Category B at Rp8M gross', async () => {
    const client = fixedTERClient(1.25)
    const result = await calculatePPh21(
      { grossSalary: 8_000_000, ptkpStatus: 'TK/2', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    // TK/2 → Category B, 1.25%, 8M × 1.25% = 100,000
    expect(result.pph21Amount).toBe(100_000)
  })

  it('result includes terRate and terCategory', async () => {
    const client = fixedTERClient(2.0)
    const result = await calculatePPh21(
      { grossSalary: 10_000_000, ptkpStatus: 'TK/0', monthNumber: 6, year: 2026, hasNPWP: true },
      client
    )
    expect(result.terRate).toBe(2.0)
    expect(result.details.terRate).toBe(2.0)
    expect(result.details.terCategory).toBe('A')
  })
})

// ─────────────────────────────────────────────────────────────────
// December Progressive True-Up (Month 12)
// ─────────────────────────────────────────────────────────────────

describe('December progressive true-up (month 12)', () => {
  it('month=12 triggers PROGRESSIVE method, not TER', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 10_000_000, ptkpStatus: 'TK/0', monthNumber: 12, year: 2026, hasNPWP: true },
      client
    )
    expect(result.method).toBe('PROGRESSIVE')
  })

  it('annualGross = cumulativeYtd + current gross (defaults to gross×12 if no cumulativeYtd)', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 10_000_000, ptkpStatus: 'TK/0', monthNumber: 12, year: 2026, hasNPWP: true },
      client
    )
    // cumulativeYtd = grossSalary × 11 = 110,000,000 by default
    // annualGross = 110,000,000 + 10,000,000 = 120,000,000
    expect(result.details.annualizedGross).toBe(120_000_000)
  })

  it('cumulativeYtd is used when provided', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      {
        grossSalary: 10_000_000,
        ptkpStatus: 'TK/0',
        monthNumber: 12,
        year: 2026,
        hasNPWP: true,
        cumulativeYtd: 55_000_000,
      },
      client
    )
    // annualGross = 55,000,000 + 10,000,000 = 65,000,000
    expect(result.details.annualizedGross).toBe(65_000_000)
  })

  it('PKP = max(0, annualGross - PTKP) for TK/0', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 10_000_000, ptkpStatus: 'TK/0', monthNumber: 12, year: 2026, hasNPWP: true },
      client
    )
    // annualGross = 120,000,000, PTKP(TK/0) = 54,000,000
    // PKP = 120M - 54M = 66M
    expect(result.details.pkp).toBe(66_000_000)
  })

  it('PKP never goes negative', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 4_000_000, ptkpStatus: 'TK/0', monthNumber: 12, year: 2026, hasNPWP: true },
      client
    )
    // annualGross = 4M × 12 = 48M, TK/0 PTKP = 54M
    // PKP = max(0, 48M - 54M) = 0
    expect(result.details.pkp).toBe(0)
    expect(result.pph21Amount).toBe(0)
  })

  it('progressive brackets are returned in result', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 10_000_000, ptkpStatus: 'TK/0', monthNumber: 12, year: 2026, hasNPWP: true },
      client
    )
    expect(result.details.progressiveBrackets).toBeDefined()
    expect(Array.isArray(result.details.progressiveBrackets)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
// Progressive Tax Brackets (UU HPP Pasal 17)
// ─────────────────────────────────────────────────────────────────

describe('Progressive tax brackets', () => {
  it('PKP=0 → tax = 0', async () => {
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      { grossSalary: 4_000_000, ptkpStatus: 'TK/0', monthNumber: 12, year: 2026, hasNPWP: true },
      client
    )
    expect(result.pph21Amount).toBe(0)
  })

  it('PKP=60M → 5% = 3,000,000 (single bracket)', async () => {
    // TK/0 PTKP = 54M. annualGross = 114M → PKP = 60M
    // monthly = 114M/12 = 9.5M → cumulativeYtd = 9.5M × 11 = 104,500,000
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      {
        grossSalary: 9_500_000,
        ptkpStatus: 'TK/0',
        monthNumber: 12,
        year: 2026,
        hasNPWP: true,
        cumulativeYtd: 104_500_000,
      },
      client
    )
    // Annual tax = 60,000,000 × 5% = 3,000,000
    expect(result.pph21Amount).toBe(3_000_000)
  })

  it('PKP spans two brackets → correct progressive tax', async () => {
    // TK/0 PTKP = 54M. annualGross = 200M → PKP = 146M
    // First 60M at 5% = 3M
    // Next (146M - 60M) = 86M at 15% = 12.9M
    // Total = 15.9M
    const client = fixedTERClient(0)
    const result = await calculatePPh21(
      {
        grossSalary: 16_700_000,
        ptkpStatus: 'TK/0',
        monthNumber: 12,
        year: 2026,
        hasNPWP: true,
        cumulativeYtd: 183_700_000,
      },
      client
    )
    expect(result.pph21Amount).toBe(15_900_000)
  })
})

// ─────────────────────────────────────────────────────────────────
// Biaya Jabatan (pending integration from Subagent 3)
// ─────────────────────────────────────────────────────────────────

describe('Biaya Jabatan (pending Subagent 3 integration)', () => {
  // NOTE: pph21.ts currently does NOT apply biaya jabatan.
  // The standalone pph21-ter.ts applies: min(gross×5%, 500K×12, 6M)
  // TODO after Subagent 3: uncomment and update these tests

  it.todo('biaya jabatan of 5% annual deducted from gross before PTKP')
  it.todo('biaya jabatan capped at 6,000,000 annual')
  it.todo('PKP uses max(0, gross - biaya jabatan - PTKP) in December')
})

// ─────────────────────────────────────────────────────────────────
// Annual overcharge reference (audit/violations layer)
// ─────────────────────────────────────────────────────────────────

describe('Annual overcharge reference calculations', () => {
  // These are reference benchmarks — the main app computes
  // overcharge in the audit/violations layer, not pph21.ts

  it('monthly overcharge × 12 = annual estimate', () => {
    const monthlyOvercharge = 100_000
    expect(monthlyOvercharge * 12).toBe(1_200_000)
  })

  it('monthly overcharge × 12 × 1.06 = annual with interest', () => {
    const monthlyOvercharge = 100_000
    expect(Math.round(monthlyOvercharge * 12 * 1.06)).toBe(1_272_000)
  })
})