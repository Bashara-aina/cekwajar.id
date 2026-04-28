// src/lib/pph21.ts
import { PTKP_VALUES, TER_CATEGORIES } from './constants'

interface TERRate {
  min_salary: number
  max_salary: number
  monthly_rate_percent: number
}

interface PPh21Input {
  grossSalary: number
  ptkpStatus: keyof typeof PTKP_VALUES
  monthNumber: number // 1-12
  year: number
  hasNPWP: boolean
}

interface PPh21Result {
  monthlyTax: number
  isDecember: boolean
  annualTax: number | null
  decemberTax: number | null
  terRate: number
  ptkpAnnual: number
  biayaJabatan: number
  pkp: number
}

// Determine TER category from PTKP status
export function getTERCategory(ptkpStatus: string): 'A' | 'B' | 'C' {
  if (TER_CATEGORIES.A.includes(ptkpStatus)) return 'A'
  if (TER_CATEGORIES.B.includes(ptkpStatus)) return 'B'
  return 'C'
}

// Get TER rate from table lookup (simplified - actual impl would query DB)
export function getTERRate(grossSalary: number, category: 'A' | 'B' | 'C'): number {
  const rates: Record<string, TERRate[]> = {
    A: [
      { min_salary: 0, max_salary: 5_400_000, monthly_rate_percent: 0 },
      { min_salary: 5_400_000, max_salary: 5_500_000, monthly_rate_percent: 0.25 },
      { min_salary: 5_500_000, max_salary: 6_000_000, monthly_rate_percent: 0.25 },
      { min_salary: 6_000_000, max_salary: 6_500_000, monthly_rate_percent: 0.25 },
      { min_salary: 6_500_000, max_salary: 7_000_000, monthly_rate_percent: 0.25 },
      { min_salary: 7_000_000, max_salary: 8_000_000, monthly_rate_percent: 0.25 },
      { min_salary: 8_000_000, max_salary: 9_000_000, monthly_rate_percent: 0.25 },
      { min_salary: 9_000_000, max_salary: 10_000_000, monthly_rate_percent: 0.35 },
      { min_salary: 10_000_000, max_salary: 15_000_000, monthly_rate_percent: 0.35 },
      { min_salary: 15_000_000, max_salary: 20_000_000, monthly_rate_percent: 0.35 },
      { min_salary: 20_000_000, max_salary: 25_000_000, monthly_rate_percent: 0.35 },
      { min_salary: 25_000_000, max_salary: 30_000_000, monthly_rate_percent: 0.35 },
      { min_salary: 30_000_000, max_salary: 35_000_000, monthly_rate_percent: 0.45 },
      { min_salary: 35_000_000, max_salary: 40_000_000, monthly_rate_percent: 0.45 },
      { min_salary: 40_000_000, max_salary: 45_000_000, monthly_rate_percent: 0.45 },
      { min_salary: 45_000_000, max_salary: 50_000_000, monthly_rate_percent: 0.45 },
      { min_salary: 50_000_000, max_salary: 55_000_000, monthly_rate_percent: 0.45 },
      { min_salary: 55_000_000, max_salary: 999_999_999_999, monthly_rate_percent: 0.5 },
    ],
    B: [
      { min_salary: 0, max_salary: 6_000_000, monthly_rate_percent: 0 },
      // ... more brackets
    ],
    C: [
      { min_salary: 0, max_salary: 6_500_000, monthly_rate_percent: 0 },
      // ... more brackets
    ],
  }

  const categoryRates = rates[category]
  for (const rate of categoryRates) {
    if (grossSalary >= rate.min_salary && grossSalary <= rate.max_salary) {
      return rate.monthly_rate_percent
    }
  }
  return 0.5 // default highest rate
}

// Calculate progressive tax for December (Pasal 17 UU HPP)
export function calculateProgressiveTax(pkp: number): number {
  if (pkp <= 0) return 0

  let tax = 0
  const brackets = [
    { limit: 60_000_000, rate: 0.05 },
    { limit: 250_000_000, rate: 0.15 },
    { limit: 500_000_000, rate: 0.25 },
    { limit: 5_000_000_000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ]

  let remainingPKP = pkp
  let prevLimit = 0

  for (const bracket of brackets) {
    if (remainingPKP <= 0) break
    const taxableInBracket = Math.min(remainingPKP, bracket.limit - prevLimit)
    tax += taxableInBracket * bracket.rate
    remainingPKP -= taxableInBracket
    prevLimit = bracket.limit
  }

  return Math.round(tax)
}

// Main PPh21 calculation function
export function calculatePPh21(input: PPh21Input): PPh21Result {
  const { grossSalary, ptkpStatus, monthNumber, hasNPWP } = input
  const isDecember = monthNumber === 12

  const category = getTERCategory(ptkpStatus)
  const terRate = getTERRate(grossSalary, category)
  const ptkpAnnual = PTKP_VALUES[ptkpStatus]

  // Monthly TER method (months 1-11)
  let monthlyTax = grossSalary * (terRate / 100)

  // Apply NPWP surcharge
  if (!hasNPWP) {
    monthlyTax *= 1.20
  }

  if (!isDecember) {
    return {
      monthlyTax: Math.round(monthlyTax),
      isDecember: false,
      annualTax: null,
      decemberTax: null,
      terRate,
      ptkpAnnual,
      biayaJabatan: 0,
      pkp: 0,
    }
  }

  // December: Annual true-up with progressive rates
  const annualGross = grossSalary * 12
  const biayaJabatan = Math.min(annualGross * 0.05, 6_000_000)
  const pkp = Math.max(0, annualGross - biayaJabatan - ptkpAnnual)

  const annualTax = calculateProgressiveTax(pkp)
  const terMonthsTotal = monthlyTax * 11 // months 1-11 combined
  const decemberTax = Math.max(0, annualTax - terMonthsTotal)

  return {
    monthlyTax: Math.round(monthlyTax),
    isDecember: true,
    annualTax,
    decemberTax: hasNPWP ? decemberTax : decemberTax * 1.20,
    terRate,
    ptkpAnnual,
    biayaJabatan: Math.round(biayaJabatan),
    pkp: Math.round(pkp),
  }
}

export function calculateMonthlyPPh21(grossSalary: number, terRate: number, hasNPWP: boolean): number {
  let tax = grossSalary * (terRate / 100)
  if (!hasNPWP) tax *= 1.20
  return Math.round(tax)
}
