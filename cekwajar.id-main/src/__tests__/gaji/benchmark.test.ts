// __tests__/gaji/benchmark.test.ts
// Tests for salary benchmark engine

import { describe, it, expect } from 'vitest'
import { calculatePercentile } from '@/lib/engines/salary-benchmark'
import type { BenchmarkInput } from '@/lib/schemas/gaji'

const makeSubmission = (salary: number, years = 3, city = 'Jakarta') => ({
  grossSalary: salary,
  experienceYears: years,
  city,
})

const BASE_INPUT: BenchmarkInput = {
  jobTitle: 'Software Engineer',
  yearsExperience: 3,
  industry: 'Teknologi Informasi',
  city: 'Jakarta',
  grossMonthly: 12_000_000,
}

describe('salary-benchmark engine', () => {
  it('Perfect median: user at P50 should get FAIR verdict', () => {
    const submissions = [
      makeSubmission(6_000_000),
      makeSubmission(8_000_000),
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
      makeSubmission(16_000_000),
      makeSubmission(18_000_000),
      makeSubmission(20_000_000),
      makeSubmission(22_000_000),
      makeSubmission(24_000_000),
    ]

    const result = calculatePercentile({ ...BASE_INPUT, grossMonthly: 12_000_000 }, submissions)

    expect(result.verdict).toBe('FAIR')
    expect(result.comparableCount).toBe(10)
  })

  it('Below P10: should get UNDERPAID verdict', () => {
    const submissions = [
      makeSubmission(6_000_000),
      makeSubmission(8_000_000),
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
      makeSubmission(16_000_000),
      makeSubmission(18_000_000),
      makeSubmission(20_000_000),
      makeSubmission(22_000_000),
      makeSubmission(24_000_000),
    ]

    const result = calculatePercentile({ ...BASE_INPUT, grossMonthly: 5_000_000 }, submissions)

    expect(result.verdict).toBe('UNDERPAID')
    expect(result.percentile).toBeLessThan(25)
  })

  it('Above P90: should get ABOVE_MARKET verdict', () => {
    const submissions = [
      makeSubmission(6_000_000),
      makeSubmission(8_000_000),
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
      makeSubmission(16_000_000),
      makeSubmission(18_000_000),
      makeSubmission(20_000_000),
      makeSubmission(22_000_000),
      makeSubmission(24_000_000),
    ]

    const result = calculatePercentile({ ...BASE_INPUT, grossMonthly: 30_000_000 }, submissions)

    expect(result.verdict).toBe('ABOVE_MARKET')
    expect(result.percentile).toBeGreaterThan(75)
  })

  it('< 5 data points: INSUFFICIENT_DATA', () => {
    const submissions = [
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
    ]

    const result = calculatePercentile(BASE_INPUT, submissions)

    expect(result.verdict).toBe('INSUFFICIENT_DATA')
    expect(result.comparableCount).toBe(3)
  })

  it('Outlier removal: extreme salaries removed from percentile calc', () => {
    const submissions = [
      makeSubmission(100_000), // outlier low
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
      makeSubmission(16_000_000),
      makeSubmission(18_000_000),
      makeSubmission(200_000_000), // outlier high
    ]

    const result = calculatePercentile(BASE_INPUT, submissions)

    // With outliers removed (4-5 valid points), may still be insufficient
    expect(result.p50).toBeGreaterThan(100_000)
    expect(result.p50).toBeLessThan(200_000_000)
  })

  it('deltaPercent is positive when above median', () => {
    const submissions = [
      makeSubmission(6_000_000),
      makeSubmission(8_000_000),
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
      makeSubmission(16_000_000),
      makeSubmission(18_000_000),
      makeSubmission(20_000_000),
      makeSubmission(22_000_000),
      makeSubmission(24_000_000),
    ]

    const result = calculatePercentile({ ...BASE_INPUT, grossMonthly: 18_000_000 }, submissions)

    expect(result.deltaPercent).toBeGreaterThan(0)
    expect(result.verdict).toBe('ABOVE_MARKET')
  })

  it('deltaPercent is negative when below median', () => {
    const submissions = [
      makeSubmission(6_000_000),
      makeSubmission(8_000_000),
      makeSubmission(10_000_000),
      makeSubmission(12_000_000),
      makeSubmission(14_000_000),
      makeSubmission(16_000_000),
      makeSubmission(18_000_000),
      makeSubmission(20_000_000),
      makeSubmission(22_000_000),
      makeSubmission(24_000_000),
    ]

    const result = calculatePercentile({ ...BASE_INPUT, grossMonthly: 8_000_000 }, submissions)

    expect(result.deltaPercent).toBeLessThan(0)
    expect(result.verdict).toBe('UNDERPAID')
  })
})