// lib/engines/salary-benchmark.ts
// Percentile calculation engine for salary benchmarking

import type { BenchmarkInput, BenchmarkResult } from '@/lib/schemas/gaji'

interface SalarySubmission {
  grossSalary: number
  experienceYears: number
  city: string
}

/** Rank salaries ascending and pick the value at percentile p */
function percentileOf(sortedSalaries: number[], p: number): number {
  const n = sortedSalaries.length
  const idx = Math.ceil((p / 100) * n) - 1
  return sortedSalaries[Math.max(0, Math.min(idx, n - 1))]
}

/**
 * Filter submissions by city (case-insensitive).
 * Remove outliers: salaries < P5 or > P95 within segment.
 * If < 5 valid submissions: return INSUFFICIENT_DATA
 * Verdict: below P25 = UNDERPAID, P25-P75 = FAIR, above P75 = ABOVE_MARKET
 */
export function calculatePercentile(
  input: BenchmarkInput,
  submissions: SalarySubmission[]
): BenchmarkResult {
  // Filter by city (case-insensitive)
  const cityFiltered = submissions.filter(
    (s) => s.city.toLowerCase() === input.city.toLowerCase()
  )

  if (cityFiltered.length < 5) {
    return {
      percentile: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p90: 0,
      verdict: 'INSUFFICIENT_DATA',
      deltaPercent: 0,
      comparableCount: cityFiltered.length,
    }
  }

  // Sort salaries ascending
  const sorted = [...cityFiltered].sort((a, b) => a.grossSalary - b.grossSalary)
  const salaries = sorted.map((s) => s.grossSalary)

  const p25 = percentileOf(salaries, 25)
  const p50 = percentileOf(salaries, 50)
  const p75 = percentileOf(salaries, 75)
  const p90 = percentileOf(salaries, 90)

  // Remove outliers: < P5 or > P95
  const p5 = percentileOf(salaries, 5)
  const p95 = percentileOf(salaries, 95)
  const filtered = cityFiltered.filter(
    (s) => s.grossSalary >= p5 && s.grossSalary <= p95
  )

  if (filtered.length < 5) {
    return {
      percentile: 0,
      p25,
      p50,
      p75,
      p90,
      verdict: 'INSUFFICIENT_DATA',
      deltaPercent: 0,
      comparableCount: filtered.length,
    }
  }

  // Recalculate percentiles on filtered set
  const filteredSalaries = [...filtered].sort((a, b) => a.grossSalary - b.grossSalary).map((s) => s.grossSalary)
  const fn = filteredSalaries.length

  const fp25 = percentileOf(filteredSalaries, 25)
  const fp50 = percentileOf(filteredSalaries, 50)
  const fp75 = percentileOf(filteredSalaries, 75)
  const fp90 = percentileOf(filteredSalaries, 90)

  // Calculate user's percentile
  const userSalary = input.grossMonthly
  let percentile = 0

  if (userSalary <= fp25) {
    const userIdx = filtered.findIndex((s) => s.grossSalary >= userSalary)
    percentile = (userIdx / fn) * 100
  } else if (userSalary >= fp75) {
    percentile = 75 + ((userSalary - fp75) / (fp90 - fp75)) * 15
  } else {
    percentile = 25 + ((userSalary - fp25) / (fp75 - fp25)) * 50
  }

  percentile = Math.min(99, Math.max(1, Math.round(percentile)))

  // Determine verdict
  let verdict: BenchmarkResult['verdict']
  if (percentile < 25) {
    verdict = 'UNDERPAID'
  } else if (percentile > 75) {
    verdict = 'ABOVE_MARKET'
  } else {
    verdict = 'FAIR'
  }

  // Delta from median
  const deltaPercent = fp50 > 0
    ? Math.round(((userSalary - fp50) / fp50) * 100)
    : 0

  return {
    percentile,
    p25: fp25,
    p50: fp50,
    p75: fp75,
    p90: fp90,
    verdict,
    deltaPercent,
    comparableCount: filtered.length,
  }
}

export type { BenchmarkInput, BenchmarkResult }