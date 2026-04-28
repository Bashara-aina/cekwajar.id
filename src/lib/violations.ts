// src/lib/violations.ts
import { formatIDR } from './utils'

interface ViolationInput {
  grossSalary: number
  reportedPPh21: number
  calculatedPPh21: number
  reportedJHT: number
  calculatedJHT: number
  reportedJP: number
  calculatedJP: number
  reportedKesehatan: number
  calculatedKesehatan: number
  reportedJKK: number // should be 0 (employer only)
  reportedJKM: number // should be 0 (employer only)
  cityUMK: number
  takeHome: number
  monthNumber: number
}

interface Violation {
  code: string
  name: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  legalBasis: string
  reportedValue: number
  calculatedValue: number
  difference: number
  recommendedAction: string
}

type ViolationResult = {
  violations: Violation[]
  hasCritical: boolean
  hasHigh: boolean
  hasMedium: boolean
  totalShortfall: number
  verdict: 'SESUAI' | 'ADA_PELANGGARAN'
}

// V01: Missing JHT
function checkV01(reported: number, calculated: number): Violation | null {
  if (calculated > 0 && reported === 0) {
    return {
      code: 'V01',
      name: 'Missing JHT',
      severity: 'HIGH',
      legalBasis: 'PP 46/2015',
      reportedValue: 0,
      calculatedValue: calculated,
      difference: calculated,
      recommendedAction: 'Register to BPJS Ketenagakerjaan immediately.',
    }
  }
  return null
}

// V02: JP Underpaid
function checkV02(reported: number, calculated: number): Violation | null {
  const diff = calculated - reported
  if (diff > 5_000) {
    return {
      code: 'V02',
      name: 'JP Underpaid',
      severity: 'MEDIUM',
      legalBasis: 'PP 45/2015',
      reportedValue: reported,
      calculatedValue: calculated,
      difference: diff,
      recommendedAction: 'Correct JP deduction with payroll department.',
    }
  }
  return null
}

// V03: Missing PPh21
function checkV03(reported: number, calculated: number): Violation | null {
  if (calculated > 10_000 && reported === 0) {
    return {
      code: 'V03',
      name: 'Missing PPh21',
      severity: 'HIGH',
      legalBasis: 'PMK 168/2023',
      reportedValue: 0,
      calculatedValue: calculated,
      difference: calculated,
      recommendedAction: 'Consult tax advisor to review your tax deductions.',
    }
  }
  return null
}

// V04: PPh21 Overpaid
function checkV04(reported: number, calculated: number): Violation | null {
  const diff = reported - calculated
  if (diff > 50_000) {
    return {
      code: 'V04',
      name: 'PPh21 Overpaid',
      severity: 'MEDIUM',
      legalBasis: 'PMK 168/2023',
      reportedValue: reported,
      calculatedValue: calculated,
      difference: diff,
      recommendedAction: 'Review with HR — may indicate incorrect PTKP status.',
    }
  }
  return null
}

// V05: Missing BPJS Kesehatan
function checkV05(reported: number, calculated: number): Violation | null {
  if (calculated > 0 && reported === 0) {
    return {
      code: 'V05',
      name: 'Missing BPJS Kesehatan',
      severity: 'HIGH',
      legalBasis: 'Perpres 82/2018',
      reportedValue: 0,
      calculatedValue: calculated,
      difference: calculated,
      recommendedAction: 'Register to BPJS Kesehatan immediately.',
    }
  }
  return null
}

// V06: Below UMK
function checkV06(grossSalary: number, umk: number): Violation | null {
  if (grossSalary < umk) {
    return {
      code: 'V06',
      name: 'Below UMK',
      severity: 'CRITICAL',
      legalBasis: 'PP 36/2021 Pasal 23',
      reportedValue: grossSalary,
      calculatedValue: umk,
      difference: umk - grossSalary,
      recommendedAction: 'REPORT TO DISNAKER — This is ILLEGAL.',
    }
  }
  return null
}

// V07: Missing JP
function checkV07(reported: number, calculated: number): Violation | null {
  if (calculated > 0 && reported === 0) {
    return {
      code: 'V07',
      name: 'Missing JP',
      severity: 'MEDIUM',
      legalBasis: 'PP 45/2015',
      reportedValue: 0,
      calculatedValue: calculated,
      difference: calculated,
      recommendedAction: 'Register to JP program immediately.',
    }
  }
  return null
}

// V08: Illegal JKK deduction (JKK is employer-only, cannot be deducted from employee)
function checkV08(reported: number): Violation | null {
  if (reported > 0) {
    return {
      code: 'V08',
      name: 'Illegal JKK Deduction',
      severity: 'CRITICAL',
      legalBasis: 'PP 46/2015 + PP 82/2019',
      reportedValue: reported,
      calculatedValue: 0,
      difference: reported,
      recommendedAction: 'REPORT TO DISNAKER — JKK is employer-only. This is ILLEGAL.',
    }
  }
  return null
}

// V09: Illegal JKM deduction (JKM is employer-only, cannot be deducted from employee)
function checkV09(reported: number): Violation | null {
  if (reported > 0) {
    return {
      code: 'V09',
      name: 'Illegal JKM Deduction',
      severity: 'CRITICAL',
      legalBasis: 'PP 46/2015 + PP 82/2019',
      reportedValue: reported,
      calculatedValue: 0,
      difference: reported,
      recommendedAction: 'REPORT TO DISNAKER — JKM is employer-only. This is ILLEGAL.',
    }
  }
  return null
}

// V10: Total deductions exceed 50% of gross (PP 36/2021 Pasal 65)
function checkV10(
  totalDeductions: number,
  grossSalary: number,
  calculatedPPh21: number,
  calculatedJHT: number,
  calculatedJP: number,
  calculatedKesehatan: number
): Violation | null {
  const legalMax = grossSalary * 0.5
  if (totalDeductions > legalMax) {
    return {
      code: 'V10',
      name: 'Total Deductions > 50%',
      severity: 'CRITICAL',
      legalBasis: 'PP 36/2021 Pasal 65',
      reportedValue: totalDeductions,
      calculatedValue: legalMax,
      difference: totalDeductions - legalMax,
      recommendedAction: 'Total deductions cannot exceed 50% of gross salary. Report to Disnaker.',
    }
  }
  return null
}

export function detectViolations(input: ViolationInput): ViolationResult {
  const violations: Violation[] = []

  // V01-V10 checks
  const v01 = checkV01(input.reportedJHT, input.calculatedJHT)
  if (v01) violations.push(v01)

  const v02 = checkV02(input.reportedJP, input.calculatedJP)
  if (v02) violations.push(v02)

  const v03 = checkV03(input.reportedPPh21, input.calculatedPPh21)
  if (v03) violations.push(v03)

  const v04 = checkV04(input.reportedPPh21, input.calculatedPPh21)
  if (v04) violations.push(v04)

  const v05 = checkV05(input.reportedKesehatan, input.calculatedKesehatan)
  if (v05) violations.push(v05)

  const v06 = checkV06(input.grossSalary, input.cityUMK)
  if (v06) violations.push(v06)

  const v07 = checkV07(input.reportedJP, input.calculatedJP)
  if (v07) violations.push(v07)

  const v08 = checkV08(input.reportedJKK)
  if (v08) violations.push(v08)

  const v09 = checkV09(input.reportedJKM)
  if (v09) violations.push(v09)

  const legalTotalDeductions =
    input.calculatedPPh21 +
    input.calculatedJHT +
    input.calculatedJP +
    input.calculatedKesehatan
  const v10 = checkV10(
    input.reportedPPh21 + input.reportedJHT + input.reportedJP + input.reportedKesehatan,
    input.grossSalary,
    input.calculatedPPh21,
    input.calculatedJHT,
    input.calculatedJP,
    input.calculatedKesehatan
  )
  if (v10) violations.push(v10)

  const totalShortfall = violations.reduce((sum, v) => sum + v.difference, 0)

  return {
    violations,
    hasCritical: violations.some(v => v.severity === 'CRITICAL'),
    hasHigh: violations.some(v => v.severity === 'HIGH'),
    hasMedium: violations.some(v => v.severity === 'MEDIUM'),
    totalShortfall,
    verdict: violations.length > 0 ? 'ADA_PELANGGARAN' : 'SESUAI',
  }
}

export function formatViolationForDisplay(v: Violation): string {
  return `[${v.code}] ${v.name}: ${formatIDR(v.difference)} (${v.severity})`
}
