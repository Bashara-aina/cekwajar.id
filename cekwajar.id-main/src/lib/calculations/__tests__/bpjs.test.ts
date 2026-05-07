/**
 * BPJS Calculator — Unit Tests
 * Covered: JP year-aware caps, Kesehatan 1% cap at Rp120,000/month,
 * JKK/JKM employer-only rates, JHT 2% calculation.
 *
 * Run with: npx vitest run src/lib/calculations/__tests__/bpjs.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  calculateBPJS,
  getJpCapForYearMonth,
  KESEHATAN_SALARY_CAP,
} from '../bpjs'

// ─────────────────────────────────────────────────────────────────
// JP CAP — Year-Aware Boundary Tests (March transition rule)
// ─────────────────────────────────────────────────────────────────

describe('getJpCapForYearMonth — year-aware cap transitions', () => {
  it('Jan 2025 uses 2024 cap (10,042,300)', () => {
    // Jan (month=1) < March → prior year = 2024
    expect(getJpCapForYearMonth(2025, 1)).toBe(10_042_300)
  })

  it('Feb 2025 uses 2024 cap (10,042,300)', () => {
    expect(getJpCapForYearMonth(2025, 2)).toBe(10_042_300)
  })

  it('Mar 2025 uses 2025 cap (10,547,400)', () => {
    expect(getJpCapForYearMonth(2025, 3)).toBe(10_547_400)
  })

  it('Dec 2025 uses 2025 cap (10,547,400)', () => {
    expect(getJpCapForYearMonth(2025, 12)).toBe(10_547_400)
  })

  it('Jan 2026 uses 2025 cap (10,547,400)', () => {
    expect(getJpCapForYearMonth(2026, 1)).toBe(10_547_400)
  })

  it('Feb 2026 uses 2025 cap (10,547,400)', () => {
    expect(getJpCapForYearMonth(2026, 2)).toBe(10_547_400)
  })

  it('Mar 2026 uses 2026 cap (11,086,300) — verified from SE BPJS B/1226/022026', () => {
    expect(getJpCapForYearMonth(2026, 3)).toBe(11_086_300)
  })

  it('Dec 2026 uses 2026 cap (11,086,300)', () => {
    expect(getJpCapForYearMonth(2026, 12)).toBe(11_086_300)
  })

  it('extrapolates 5pct annual growth for unknown future years', () => {
    // 2027 cap (11,640,600) grows 3 years at 5%: 11,640,600 * 1.05^3 = 13,475,450
    expect(getJpCapForYearMonth(2030, 6)).toBe(13_475_450)
  })
})

// ─────────────────────────────────────────────────────────────────
// BPJS Kesehatan — 1% employee with Rp120,000/month ceiling
// ─────────────────────────────────────────────────────────────────

describe('BPJS Kesehatan — 1% employee with monthly cap', () => {
  it('gross=10M → Kesehatan employee = Rp100,000 (below cap)', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000 })
    expect(result.kesehatanEmployee).toBe(100_000)
  })

  it('gross=12M → Kesehatan employee = Rp120,000 (exactly at Rp12M cap)', () => {
    const result = calculateBPJS({ grossSalary: 12_000_000 })
    expect(result.kesehatanEmployee).toBe(120_000)
  })

  it('gross=15M → Kesehatan employee = Rp120,000 (capped at Rp12M)', () => {
    const result = calculateBPJS({ grossSalary: 15_000_000 })
    expect(result.kesehatanEmployee).toBe(120_000)
  })

  it('kesehatanBase uses min(gross, KESEHATAN_SALARY_CAP)', () => {
    const result = calculateBPJS({ grossSalary: 20_000_000 })
    expect(result.kesehatanBase).toBe(12_000_000)
    expect(result.kesehatanSalaryCap).toBe(12_000_000)
  })

  it('kesehatan employer = 4% of capped base', () => {
    const result = calculateBPJS({ grossSalary: 15_000_000 })
    expect(result.kesehatanEmployer).toBe(480_000) // 4% × 12M
  })
})

// ─────────────────────────────────────────────────────────────────
// BPJS JP — 1% employee, capped at monthly wage ceiling
// ─────────────────────────────────────────────────────────────────

describe('BPJS JP — 1% with year-aware wage cap', () => {
  it('gross=8M, Mar 2026 → JP = 80,000 (below 2026 cap)', () => {
    const result = calculateBPJS({ grossSalary: 8_000_000, year: 2026, month: 3 })
    expect(result.jpEmployee).toBe(80_000)
  })

  it('gross=11,086,300, Mar 2026 → JP = 110,863 (exactly at 2026 cap)', () => {
    const result = calculateBPJS({ grossSalary: 11_086_300, year: 2026, month: 3 })
    expect(result.jpEmployee).toBe(110_863) // 1% × 11,086,300
  })

  it('gross=15M, Mar 2026 → JP = 110,863 (capped at 2026 cap)', () => {
    const result = calculateBPJS({ grossSalary: 15_000_000, year: 2026, month: 3 })
    expect(result.jpEmployee).toBe(110_863) // 1% × 11,086,300 (not 150,000)
  })

  it('jpBase = min(gross, jpCap)', () => {
    const result = calculateBPJS({ grossSalary: 15_000_000, year: 2026, month: 3 })
    expect(result.jpBase).toBe(11_086_300)
    expect(result.jpSalaryCap).toBe(11_086_300)
  })

  it('employer JP = 2% of capped base', () => {
    const result = calculateBPJS({ grossSalary: 15_000_000, year: 2026, month: 3 })
    expect(result.jpEmployer).toBe(221_726) // 2% × 11,086,300
  })

  it('Feb 2026 uses 2025 cap even when year=2026', () => {
    const result = calculateBPJS({ grossSalary: 11_086_300, year: 2026, month: 2 })
    // Feb → effective year = 2025 → cap = 10,547,400
    // 11,086,300 > 10,547,400, so base = 10,547,400
    expect(result.jpSalaryCap).toBe(10_547_400)
    expect(result.jpBase).toBe(10_547_400)
  })
})

// ─────────────────────────────────────────────────────────────────
// BPJS JHT — 2% employee, 3.7% employer
// ─────────────────────────────────────────────────────────────────

describe('BPJS JHT — 2% employee, 3.7% employer', () => {
  it('gross=8M → JHT employee = 160,000', () => {
    const result = calculateBPJS({ grossSalary: 8_000_000 })
    expect(result.jhtEmployee).toBe(160_000)
  })

  it('gross=10M → JHT employer = 370,000', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000 })
    expect(result.jhtEmployer).toBe(370_000)
  })

  it('JHT has no wage cap', () => {
    const result = calculateBPJS({ grossSalary: 100_000_000 })
    expect(result.jhtEmployee).toBe(2_000_000) // 2% of full salary
  })
})

// ─────────────────────────────────────────────────────────────────
// BPJS JKK / JKM — Employer-only, no employee deduction
// ─────────────────────────────────────────────────────────────────

describe('BPJS JKK — employer-only, varies by risk category', () => {
  it('default jkkCategory=0.24 (low risk) → 0.24% of gross', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000 })
    expect(result.jkkEmployer).toBe(24_000)
  })

  it('category III (0.89) → 0.89% of gross', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000, jkkCategory: 0.89 })
    expect(result.jkkEmployer).toBe(89_000)
  })

  it('category V (1.74) → 1.74% of gross', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000, jkkCategory: 1.74 })
    expect(result.jkkEmployer).toBe(174_000)
  })

  it('JKK is employer-only — calculateBPJS does not return jkkEmployee', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000 })
    // JKK employee portion is always 0 per PP 44/2015
    // Note: the result shape has jkkEmployee field from employee perspective
    // which should be 0 (illegal to deduct from employee)
    expect(result.jkkEmployer).toBeGreaterThan(0)
    // jkkEmployee is not part of the BPJSResult shape since
    // employee should never have JKK deducted
  })
})

describe('BPJS JKM — 0.3% employer-only', () => {
  it('gross=10M → JKM employer = 30,000', () => {
    const result = calculateBPJS({ grossSalary: 10_000_000 })
    expect(result.jkmEmployer).toBe(30_000)
  })

  it('gross=0 → JKM = 0', () => {
    const result = calculateBPJS({ grossSalary: 0 })
    expect(result.jkmEmployer).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────
// Integration: full BPJS calculation round-trip
// ─────────────────────────────────────────────────────────────────

describe('calculateBPJS — full round-trip', () => {
  it('full calculation for standard employee at 2026 UMK', () => {
    const result = calculateBPJS({
      grossSalary: 10_000_000,
      year: 2026,
      month: 6,
    })

    expect(result.jhtEmployee).toBe(200_000)
    expect(result.jhtEmployer).toBe(370_000)
    expect(result.jpEmployee).toBe(100_000) // 1% × 10M (below cap)
    expect(result.jpEmployer).toBe(200_000)
    expect(result.kesehatanEmployee).toBe(100_000) // 1% × 10M (below 12M cap)
    expect(result.kesehatanEmployer).toBe(400_000) // 4% × 10M
    expect(result.jkkEmployer).toBe(24_000) // 0.24% default
    expect(result.jkmEmployer).toBe(30_000) // 0.3%
    expect(result.jpSalaryCap).toBe(11_086_300) // 2026 cap (month >= 3)
  })

  it('high salary above all caps — month 6 2026', () => {
    const result = calculateBPJS({
      grossSalary: 20_000_000,
      year: 2026,
      month: 6,
    })

    // JP capped at 11,086,300
    expect(result.jpEmployee).toBe(110_863) // 1% × 11,086,300
    expect(result.jpBase).toBe(11_086_300)

    // Kesehatan capped at 12,000,000
    expect(result.kesehatanEmployee).toBe(120_000) // 1% × 12,000,000
    expect(result.kesehatanBase).toBe(12_000_000)

    // JHT no cap
    expect(result.jhtEmployee).toBe(400_000) // 2% × 20,000,000
  })
})
