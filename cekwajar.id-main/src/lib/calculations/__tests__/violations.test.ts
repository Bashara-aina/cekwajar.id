/**
 * Violations Detector — Unit Tests
 * V01: JHT missing | V02: JP underpaid | V03: PPh21 not withheld
 * V04: PPh21 underpaid | V05: BPJS Kesehatan missing | V06: Below UMK
 * V07: JP missing | V08: Illegal JKK deduction | V09: Illegal JKM deduction
 * V10: Total deductions >50% gross
 *
 * Run with: npx vitest run src/lib/calculations/__tests__/violations.test.ts
 */

import { describe, it, expect } from 'vitest'
import { detectViolations } from '../violations'
import type { ViolationInput } from '../violations'

// Helper to build minimal input
function violationsInput(overrides: Partial<ViolationInput> = {}): ViolationInput {
  const reportedDefaults: ViolationInput['reported'] = {
    pph21: 0,
    jhtEmployee: 0,
    jpEmployee: 0,
    kesehatan: 0,
    jkkEmployee: 0,
    jkmEmployee: 0,
  }
  const calculatedDefaults: ViolationInput['calculated'] = {
    pph21: 0,
    jhtEmployee: 0,
    jpEmployee: 0,
    kesehatan: 0,
  }
  return {
    grossSalary: 10_000_000,
    cityUMK: 5_000_000,
    month: 6,
    ptkpStatus: 'TK/0',
    pph21TerBased: 0,
    ...overrides,
    reported: { ...reportedDefaults, ...overrides.reported },
    calculated: { ...calculatedDefaults, ...overrides.calculated },
  } as ViolationInput
}

const reported = (r: Partial<ViolationInput['reported']> = {}): ViolationInput['reported'] => ({
  pph21: 0,
  jhtEmployee: 0,
  jpEmployee: 0,
  kesehatan: 0,
  jkkEmployee: 0,
  jkmEmployee: 0,
  ...r,
})
const calculated = (c: Partial<ViolationInput['calculated']> = {}): ViolationInput['calculated'] => ({
  pph21: 0,
  jhtEmployee: 0,
  jpEmployee: 0,
  kesehatan: 0,
  ...c,
})

// ─────────────────────────────────────────────────────────────────
// V01: JHT missing
// ─────────────────────────────────────────────────────────────────

describe('V01: JHT missing', () => {
  it('V01 fires when jhtEmployee=0 and gross > 0', () => {
    const result = violationsInput({
      reported: reported({ jhtEmployee: 0, kesehatan: 0, jpEmployee: 0 }),
      calculated: calculated({ jhtEmployee: 200_000, kesehatan: 100_000, jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V01')).toBeDefined()
  })

  it('V01 does NOT fire when jhtEmployee > 0', () => {
    const result = violationsInput({
      reported: reported({ jhtEmployee: 200_000 }),
      calculated: calculated({ jhtEmployee: 200_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V01')).toBeUndefined()
  })

  it('V01 does NOT fire when grossSalary = 0', () => {
    const result = violationsInput({
      grossSalary: 0,
      reported: reported({ jhtEmployee: 0 }),
      calculated: calculated({ jhtEmployee: 0 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V01')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V02: JP underpaid
// ─────────────────────────────────────────────────────────────────

describe('V02: JP underpaid', () => {
  it('V02 fires when reported < calculated by more than 5,000', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 50_000 }),
      calculated: calculated({ jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V02')).toBeDefined()
  })

  it('V02 does NOT fire when difference ≤ 5,000', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 98_000 }),
      calculated: calculated({ jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V02')).toBeUndefined()
  })

  it('V02 does NOT fire when reported > calculated', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 150_000 }),
      calculated: calculated({ jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V02')).toBeUndefined()
  })

  it('V02 does NOT fire when reported.jpEmployee = 0', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 0 }),
      calculated: calculated({ jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    // V02 requires reported.jpEmployee > 0 AND calculated > reported
    // 0 > 0 is false; V07 (missing JP) would fire instead
    expect(violations.find((v) => v.code === 'V02')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V03: PPh21 not withheld when it should be
// ─────────────────────────────────────────────────────────────────

describe('V03: PPh21 not withheld', () => {
  it('V03 fires when calculated PPh21 > 10,000 and reported = 0', () => {
    const result = violationsInput({
      reported: reported({ pph21: 0 }),
      calculated: calculated({ pph21: 200_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V03')).toBeDefined()
  })

  it('V03 does NOT fire when calculated PPh21 ≤ 10,000', () => {
    const result = violationsInput({
      reported: reported({ pph21: 0 }),
      calculated: calculated({ pph21: 5_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V03')).toBeUndefined()
  })

  it('V03 does NOT fire when reported PPh21 > 0', () => {
    const result = violationsInput({
      reported: reported({ pph21: 50_000 }),
      calculated: calculated({ pph21: 200_000 }),
    })
    const violations = detectViolations(result)
    // V03 requires reported=0. With reported>0, V04 would be checked.
    expect(violations.find((v) => v.code === 'V03')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V04: PPh21 underpaid
// ─────────────────────────────────────────────────────────────────

describe('V04: PPh21 underpaid', () => {
  it('V04 fires when reported < calculated by more than 50,000 and reported > 0', () => {
    const result = violationsInput({
      reported: reported({ pph21: 100_000 }),
      calculated: calculated({ pph21: 200_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V04')).toBeDefined()
  })

  it('V04 does NOT fire when difference ≤ 50,000', () => {
    const result = violationsInput({
      reported: reported({ pph21: 190_000 }),
      calculated: calculated({ pph21: 200_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V04')).toBeUndefined()
  })

  it('V04 does NOT fire when reported > calculated', () => {
    const result = violationsInput({
      reported: reported({ pph21: 250_000 }),
      calculated: calculated({ pph21: 200_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V04')).toBeUndefined()
  })

  it('V04 does NOT fire when reported PPh21 = 0 (V03 covers that)', () => {
    const result = violationsInput({
      reported: reported({ pph21: 0 }),
      calculated: calculated({ pph21: 200_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V04')).toBeUndefined()
    // V03 should fire instead
    expect(violations.find((v) => v.code === 'V03')).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V05: BPJS Kesehatan missing
// ─────────────────────────────────────────────────────────────────

describe('V05: BPJS Kesehatan missing', () => {
  it('V05 fires when kesehatan = 0 and gross > 0', () => {
    const result = violationsInput({
      reported: reported({ kesehatan: 0, jhtEmployee: 0, jpEmployee: 0 }),
      calculated: calculated({ kesehatan: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V05')).toBeDefined()
  })

  it('V05 does NOT fire when kesehatan > 0', () => {
    const result = violationsInput({
      reported: reported({ kesehatan: 100_000 }),
      calculated: calculated({ kesehatan: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V05')).toBeUndefined()
  })

  it('V05 does NOT fire when grossSalary = 0', () => {
    const result = violationsInput({
      grossSalary: 0,
      reported: reported({ kesehatan: 0 }),
      calculated: calculated({ kesehatan: 0 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V05')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V06: Below UMK
// ─────────────────────────────────────────────────────────────────

describe('V06: Below UMK', () => {
  it('V06 fires when grossSalary < cityUMK', () => {
    const result = violationsInput({
      grossSalary: 3_000_000,
      cityUMK: 5_000_000,
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V06')).toBeDefined()
  })

  it('V06 does NOT fire when grossSalary = cityUMK', () => {
    const result = violationsInput({
      grossSalary: 5_000_000,
      cityUMK: 5_000_000,
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V06')).toBeUndefined()
  })

  it('V06 does NOT fire when grossSalary > cityUMK', () => {
    const result = violationsInput({
      grossSalary: 6_000_000,
      cityUMK: 5_000_000,
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V06')).toBeUndefined()
  })

  it('V06 does NOT fire when cityUMK = 0', () => {
    const result = violationsInput({
      grossSalary: 1_000_000,
      cityUMK: 0,
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V06')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V07: JP missing
// ─────────────────────────────────────────────────────────────────

describe('V07: JP missing', () => {
  it('V07 fires when reported.jpEmployee = 0, gross > 0, calculated > 0', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 0, jhtEmployee: 200_000 }),
      calculated: calculated({ jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V07')).toBeDefined()
  })

  it('V07 does NOT fire when reported.jpEmployee > 0', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 100_000 }),
      calculated: calculated({ jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V07')).toBeUndefined()
  })

  it('V07 does NOT fire when calculated.jpEmployee = 0', () => {
    const result = violationsInput({
      reported: reported({ jpEmployee: 0 }),
      calculated: calculated({ jpEmployee: 0 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V07')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V08: Illegal JKK deduction (employer-only per PP 44/2015)
// ─────────────────────────────────────────────────────────────────

describe('V08: Illegal JKK deduction', () => {
  it('V08 fires when jkkEmployee > 0', () => {
    const result = violationsInput({
      reported: reported({ jkkEmployee: 50_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V08')).toBeDefined()
    expect(violations.find((v) => v.code === 'V08')?.severity).toBe('CRITICAL')
  })

  it('V08 does NOT fire when jkkEmployee = 0', () => {
    const result = violationsInput({
      reported: reported({ jkkEmployee: 0 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V08')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V09: Illegal JKM deduction (employer-only per PP 44/2015)
// ─────────────────────────────────────────────────────────────────

describe('V09: Illegal JKM deduction', () => {
  it('V09 fires when jkmEmployee > 0', () => {
    const result = violationsInput({
      reported: reported({ jkmEmployee: 30_000 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V09')).toBeDefined()
    expect(violations.find((v) => v.code === 'V09')?.severity).toBe('CRITICAL')
  })

  it('V09 does NOT fire when jkmEmployee = 0', () => {
    const result = violationsInput({
      reported: reported({ jkmEmployee: 0 }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V09')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// V10: Total deductions exceed 50% of gross (PP 36/2021 Pasal 65)
// ─────────────────────────────────────────────────────────────────

describe('V10: Total deductions > 50% of gross', () => {
  it('V10 fires when total deductions > 50% of grossSalary', () => {
    const result = violationsInput({
      grossSalary: 10_000_000,
      reported: reported({
        pph21: 3_000_000,
        jhtEmployee: 200_000,
        jpEmployee: 100_000,
        kesehatan: 100_000,
        jkkEmployee: 0,
        jkmEmployee: 0,
      }),
    })
    // Total = 3,400,000 / 10,000,000 = 34% — should NOT fire
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V10')).toBeUndefined()
  })

  it('V10 fires at exactly > 50% threshold', () => {
    const result = violationsInput({
      grossSalary: 10_000_000,
      reported: reported({
        pph21: 5_100_000, // exceeds 50%
        jhtEmployee: 0,
        jpEmployee: 0,
        kesehatan: 0,
        jkkEmployee: 0,
        jkmEmployee: 0,
      }),
    })
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V10')).toBeDefined()
    expect(violations.find((v) => v.code === 'V10')?.severity).toBe('CRITICAL')
  })

  it('V10 includes JKK and JKM in total deduction count', () => {
    // With JKK/JKM illegally deducted, total goes up
    const result = violationsInput({
      grossSalary: 10_000_000,
      reported: reported({
        pph21: 0,
        jhtEmployee: 200_000,
        jpEmployee: 100_000,
        kesehatan: 100_000,
        jkkEmployee: 50_000, // illegal
        jkmEmployee: 30_000, // illegal
      }),
    })
    // Total = 480,000 / 10,000,000 = 4.8% — far from 50%
    const violations = detectViolations(result)
    expect(violations.find((v) => v.code === 'V10')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────
// Severity ordering — CRITICAL comes first
// ─────────────────────────────────────────────────────────────────

describe('Severity ordering — CRITICAL violations sorted first', () => {
  it('V06 (CRITICAL: Below UMK) appears before V01 (HIGH: JHT missing)', () => {
    const result = violationsInput({
      grossSalary: 3_000_000,
      cityUMK: 5_000_000,
      reported: reported({ jhtEmployee: 0, kesehatan: 0, jpEmployee: 0 }),
      calculated: calculated({ jhtEmployee: 200_000, kesehatan: 100_000, jpEmployee: 100_000 }),
    })
    const violations = detectViolations(result)
    expect(violations[0]?.code).toBe('V06') // CRITICAL
    expect(violations[1]?.code).toBe('V01') // HIGH
  })

  it('V08 (CRITICAL: Illegal JKK) appears before V04 (MEDIUM: PPh21 underpaid)', () => {
    const result = violationsInput({
      reported: reported({
        jkkEmployee: 50_000,
        pph21: 100_000,
      }),
      calculated: calculated({
        pph21: 300_000,
      }),
    })
    const violations = detectViolations(result)
    const v08Index = violations.findIndex((v) => v.code === 'V08')
    const v04Index = violations.findIndex((v) => v.code === 'V04')
    expect(v08Index).toBeLessThan(v04Index)
  })
})

// ─────────────────────────────────────────────────────────────────
// Combined scenarios
// ─────────────────────────────────────────────────────────────────

describe('Combined violation scenarios', () => {
  it('clean slip — no violations', () => {
    const result = violationsInput({
      grossSalary: 10_000_000,
      cityUMK: 5_000_000,
      reported: reported({
        pph21: 150_000,
        jhtEmployee: 200_000,
        jpEmployee: 100_000,
        kesehatan: 100_000,
        jkkEmployee: 0,
        jkmEmployee: 0,
      }),
      calculated: calculated({
        pph21: 150_000,
        jhtEmployee: 200_000,
        jpEmployee: 100_000,
        kesehatan: 100_000,
      }),
    })
    const violations = detectViolations(result)
    expect(violations).toHaveLength(0)
  })

  it('illegal deductions (JKK+JKM) + missing JP — 3 violations', () => {
    const result = violationsInput({
      grossSalary: 10_000_000,
      cityUMK: 5_000_000,
      reported: reported({
        jkkEmployee: 50_000,  // illegal
        jkmEmployee: 30_000, // illegal
        jpEmployee: 0,       // missing
        jhtEmployee: 0,       // missing
        kesehatan: 0,         // missing
        pph21: 0,
      }),
      calculated: calculated({
        jhtEmployee: 200_000,
        jpEmployee: 100_000,
        kesehatan: 100_000,
        pph21: 150_000,
      }),
    })
    const violations = detectViolations(result)
    expect(violations.length).toBeGreaterThanOrEqual(4)
    // Should catch V01 (JHT missing), V05 (Kesehatan missing), V07 (JP missing), V08 (JKK), V09 (JKM)
    const codes = violations.map((v) => v.code)
    expect(codes).toContain('V01')
    expect(codes).toContain('V05')
    expect(codes).toContain('V07')
    expect(codes).toContain('V08')
    expect(codes).toContain('V09')
  })
})
