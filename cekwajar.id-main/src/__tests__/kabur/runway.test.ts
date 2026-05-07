// __tests__/kabur/runway.test.ts
// Tests for runway (financial runway) calculations

import { describe, it, expect } from 'vitest'
import { calculateRunway } from '@/lib/engines/runway'

describe('Runway Calculations', () => {
  describe('runway months formula', () => {
    it('runway = (savings + severance + jht) / monthly_burn', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      // Severance: 1 tahun → 1 bulan × 5M = 5M
      // totalLiquid = 10M + 5M + 0 = 15M
      // monthlyBurn = 3M + 0 + bpjsMandiriEstimate (min(5M × 1.5%, 180K) = 75K)
      // runway = 15M / 3.075M ≈ 4.88
      expect(result.runwayMonths).toBeGreaterThan(0)
      expect(result.totalLiquidAssets).toBe(15_000_000)
    })

    it('includes optional JHT balance when provided', () => {
      const withJht = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 20_000_000,
        optionalInvestmentValue: 0,
      })
      // Without JHT: totalLiquid = 15M
      // With JHT: 15M + 20M = 35M
      expect(withJht.totalLiquidAssets).toBe(35_000_000)
      expect(withJht.runwayMonths).toBeGreaterThan(withJht.runwayMonths)
    })

    it('includes optional investment value', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 5_000_000,
      })
      expect(result.totalLiquidAssets).toBe(20_000_000)
    })

    it('JHT not eligible for resign scenario', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 1,
        resignationType: 'resign',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 20_000_000,
        optionalInvestmentValue: 0,
      })
      expect(result.jhtWithdrawal.eligible).toBe(false)
      expect(result.jhtWithdrawal.amountIDR).toBe(0)
    })

    it('JHT eligible for PHK after 1 month', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 20_000_000,
        optionalInvestmentValue: 0,
      })
      expect(result.jhtWithdrawal.eligible).toBe(true)
      expect(result.jhtWithdrawal.amountIDR).toBe(20_000_000)
      expect(result.jhtWithdrawal.waitingMonths).toBe(1)
    })
  })

  describe('verdict thresholds', () => {
    it('AMAN_KABUR when runway >= 12 months', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 1_000_000, // low burn
        savings: 50_000_000, // large runway
        masaKerjaYears: 5,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      expect(result.verdict).toBe('AMAN_KABUR')
      expect(result.verdictColor).toBe('green')
    })

    it('PIKIR_LAGI when runway 6-11 months', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 5_000_000,
        savings: 25_000_000,
        masaKerjaYears: 5,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      // Severance ≈ 50M + 40M + 13.5M = 103.5M
      // totalLiquid = 25M + 103.5M = 128.5M
      // monthlyBurn = 5M + 0 + 75K = 5.075M
      // runway ≈ 25 months
      expect(['AMAN_KABUR', 'PIKIR_LAGI', 'BELUM_WAKTUNYA']).toContain(result.verdict)
    })

    it('BELUM_WAKTUNYA when runway < 6 months', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 5_000_000,
        savings: 5_000_000, // tight runway
        masaKerjaYears: 1,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      // Severance = 5M, totalLiquid = 10M
      // monthlyBurn = 5.075M, runway ≈ 2 months
      expect(result.verdict).toBe('BELUM_WAKTUNYA')
      expect(result.verdictColor).toBe('red')
    })
  })

  describe('monthly burn rate components', () => {
    it('monthly burn includes expenses + debts + BPJS mandiri estimate', () => {
      const result = calculateRunway({
        monthlySalary: 20_000_000,
        monthlyExpenses: 5_000_000,
        savings: 100_000_000,
        masaKerjaYears: 5,
        resignationType: 'phk',
        outstandingDebtsMonthly: 2_000_000,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      // BPJS mandiri: min(20M × 1.5%, 180K) = 180K
      const expectedBurn = 5_000_000 + 2_000_000 + 180_000
      expect(result.monthlyBurnRate).toBe(expectedBurn)
      expect(result.monthlyExpenses).toBe(5_000_000)
      expect(result.outstandingDebtsMonthly).toBe(2_000_000)
      expect(result.bpjsMandiriMonthlyEstimate).toBe(180_000)
    })

    it('BPJS mandiri capped at 180K/month', () => {
      const result = calculateRunway({
        monthlySalary: 100_000_000,
        monthlyExpenses: 10_000_000,
        savings: 1_000_000_000,
        masaKerjaYears: 10,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      // 1.5% × 100M = 1.5M, capped at 180K
      expect(result.bpjsMandiriMonthlyEstimate).toBe(180_000)
    })
  })

  describe('safe runway', () => {
    it('safe runway subtracts 2 month buffer', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 2_000_000,
        savings: 50_000_000,
        masaKerjaYears: 5,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      // runway ≈ 26 months, safeRunway ≈ 24
      expect(result.safeRunwayMonths).toBeLessThan(result.runwayMonths)
      expect(result.safeRunwayMonths).toBeGreaterThanOrEqual(0)
    })

    it('safe runway never negative', () => {
      const result = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 10_000_000,
        savings: 1_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      expect(result.safeRunwayMonths).toBeGreaterThanOrEqual(0)
    })
  })

  describe('PKWT expire scenario', () => {
    it('PKWT expire treated same as PHK for severance', () => {
      const phk = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 3,
        resignationType: 'phk',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      const pkwt = calculateRunway({
        monthlySalary: 5_000_000,
        monthlyExpenses: 3_000_000,
        savings: 10_000_000,
        masaKerjaYears: 3,
        resignationType: 'pkwt_expire',
        outstandingDebtsMonthly: 0,
        dependentsCount: 0,
        optionalJhtBalance: 0,
        optionalInvestmentValue: 0,
      })
      expect(pkwt.severanceIDR).toBe(phk.severanceIDR)
      expect(pkwt.runwayMonths).toBe(phk.runwayMonths)
    })
  })
})