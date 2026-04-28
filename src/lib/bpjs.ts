// src/lib/bpjs.ts
import { JP_SALARY_CAPS, KESEHATAN_SALARY_CAP } from './constants'

interface BPJSInput {
  grossSalary: number
  year: number
  monthNumber: number // for March boundary rule
  riskRate?: number // JKK rate varies by industry (0.24%-1.74%)
}

interface BPJSResult {
  employee: {
    jht: number
    jp: number
    kesehatan: number
    total: number
  }
  employer: {
    jht: number
    jp: number
    kesehatan: number
    jkk: number
    jkm: number
    total: number
  }
}

// Get JP salary cap based on year and month (March boundary rule)
// Months 1-2 use previous year's cap
export function getJPSalaryCap(year: number, monthNumber: number): number {
  if (monthNumber <= 2) {
    return JP_SALARY_CAPS[(year - 1) as keyof typeof JP_SALARY_CAPS] || JP_SALARY_CAPS[2026]
  }
  return JP_SALARY_CAPS[year as keyof typeof JP_SALARY_CAPS] || JP_SALARY_CAPS[2026]
}

export function calculateBPJS(input: BPJSInput): BPJSResult {
  const { grossSalary, year, monthNumber, riskRate = 0.24 } = input

  const jpCap = getJPSalaryCap(year, monthNumber)
  const kesehatanCap = KESEHATAN_SALARY_CAP

  // Employee contributions
  const jhtEmployee = Math.round(grossSalary * 0.02)
  const jpEmployee = Math.round(Math.min(grossSalary, jpCap) * 0.01)
  const kesehatanEmployee = Math.round(Math.min(grossSalary, kesehatanCap) * 0.01)

  // Employer contributions
  const jhtEmployer = Math.round(grossSalary * 0.037)
  const jpEmployer = Math.round(Math.min(grossSalary, jpCap) * 0.02)
  const kesehatanEmployer = Math.round(Math.min(grossSalary, kesehatanCap) * 0.04)
  const jkkEmployer = Math.round(grossSalary * (riskRate / 100))
  const jkmEmployer = Math.round(grossSalary * 0.003)

  return {
    employee: {
      jht: jhtEmployee,
      jp: jpEmployee,
      kesehatan: kesehatanEmployee,
      total: jhtEmployee + jpEmployee + kesehatanEmployee,
    },
    employer: {
      jht: jhtEmployer,
      jp: jpEmployer,
      kesehatan: kesehatanEmployer,
      jkk: jkkEmployer,
      jkm: jkmEmployer,
      total: jhtEmployer + jpEmployer + kesehatanEmployer + jkkEmployer + jkmEmployer,
    },
  }
}

// Check if JKK or JKM is illegally deducted from employee
export function isIllegalDeduction(
  reportedJkk: number,
  reportedJkm: number
): boolean {
  // JKK and JKM are employer-only contributions
  // Any amount deducted from employee is illegal
  return reportedJkk > 0 || reportedJkm > 0
}

// Check if total deductions exceed 50% of gross (PP 36/2021 Pasal 65)
export function isTotalDeductionExcessive(
  totalDeductions: number,
  grossSalary: number
): boolean {
  return totalDeductions > grossSalary * 0.5
}
