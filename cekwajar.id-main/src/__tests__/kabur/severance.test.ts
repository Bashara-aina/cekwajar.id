// __tests__/kabur/severance.test.ts
// Tests for PP 35/2021 severance calculations

import { describe, it, expect } from 'vitest'
import { calculateSeverance } from '@/lib/engines/severance'

describe('PP 35/2021 Severance Calculations', () => {
  describe('PHK (Termination)', () => {
    it('masa kerja 1 tahun → 1 bulan pesangon', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
      })
      expect(result.uangPesangonMultiple).toBe(1)
      expect(result.uangPesangon).toBe(5_000_000)
      expect(result.upmkMonths).toBe(0) // < 3 tahun
      expect(result.upmk).toBe(0)
    })

    it('masa kerja 3 tahun → 3 bulan pesangon + 2 bulan UPMK', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 3,
        resignationType: 'phk',
      })
      expect(result.uangPesangonMultiple).toBe(3)
      expect(result.uangPesangon).toBe(15_000_000)
      expect(result.upmkMonths).toBe(2)
      expect(result.upmk).toBe(10_000_000)
    })

    it('masa kerja 5 tahun → 5 bulan pesangon + 4 bulan UPMK', () => {
      const result = calculateSeverance({
        monthlySalary: 10_000_000,
        masaKerjaYears: 5,
        resignationType: 'phk',
      })
      expect(result.uangPesangonMultiple).toBe(5)
      expect(result.uangPesangon).toBe(50_000_000)
      expect(result.upmkMonths).toBe(4)
      expect(result.upmk).toBe(40_000_000)
    })

    it('masa kerja 8+ tahun → pesangon capped at 9 bulan, UPMK capped at 10', () => {
      const result = calculateSeverance({
        monthlySalary: 8_000_000,
        masaKerjaYears: 15,
        resignationType: 'phk',
      })
      expect(result.uangPesangonMultiple).toBe(9) // capped
      expect(result.upmkMonths).toBe(10) // capped
    })
  })

  describe('Resign (Voluntary)', () => {
    it('resign 1 tahun → 0 pesangon, 0 UPMK', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 1,
        resignationType: 'resign',
      })
      expect(result.uangPesangon).toBe(0)
      expect(result.upmk).toBe(0)
    })

    it('resign 3 tahun → 0 pesangon, 0 UPMK (strict &gt; 3 tahun)', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 3,
        resignationType: 'resign',
      })
      expect(result.uangPesangon).toBe(0)
      expect(result.upmk).toBe(0) // masa kerja = 3, not &gt; 3
    })

    it('resign 4 tahun → 0 pesangon, 2 bulan UPMK', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 4,
        resignationType: 'resign',
      })
      expect(result.uangPesangon).toBe(0)
      expect(result.upmkMonths).toBe(2)
      expect(result.upmk).toBe(10_000_000)
    })

    it('resign 5 tahun → UPMK only, no pesangon', () => {
      const result = calculateSeverance({
        monthlySalary: 10_000_000,
        masaKerjaYears: 5,
        resignationType: 'resign',
      })
      expect(result.uangPesangon).toBe(0)
      expect(result.upmkMonths).toBe(4)
      expect(result.upmk).toBe(40_000_000)
    })
  })

  describe('Uang Penggantian Hak', () => {
    it('PHK with 5 bulan → 15% of (pesangon + UPMK)', () => {
      const result = calculateSeverance({
        monthlySalary: 10_000_000,
        masaKerjaYears: 5,
        resignationType: 'phk',
      })
      // Pesangon = 5 × 10M = 50M, UPMK = 4 × 10M = 40M
      // UPH = 15% × (50M + 40M) = 13.5M
      expect(result.uangPenggantianHak).toBe(Math.round(0.15 * (50_000_000 + 40_000_000)))
    })

    it('resign with 5 tahun → UPH calculated on UPMK only', () => {
      const result = calculateSeverance({
        monthlySalary: 10_000_000,
        masaKerjaYears: 5,
        resignationType: 'resign',
      })
      // Pesangon = 0, UPMK = 4 × 10M = 40M
      // UPH = 15% × 40M = 6M
      expect(result.uangPenggantianHak).toBe(Math.round(0.15 * 40_000_000))
    })
  })

  describe('Tax-free threshold', () => {
    it('tax-free threshold covers first 6 months pesangon + 3 months UPMK', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 5,
        resignationType: 'phk',
      })
      // Pesangon = 5 × 5M = 25M → first 6M tax-free
      // UPMK = 4 × 5M = 20M → first 15M tax-free
      // Tax-free floor = 6M + 15M = 21M
      expect(result.taxFreeThreshold).toBe(21_000_000)
      // Total gross = 25M + 20M + 6.75M = 51.75M
      expect(result.totalGross).toBe(51_750_000)
      expect(result.taxableAmount).toBe(51_750_000 - 21_000_000)
      expect(result.taxableAmount).toBeGreaterThan(0)
      expect(result.isTaxable).toBe(true)
    })

    it('small severance stays below tax-free threshold', () => {
      const result = calculateSeverance({
        monthlySalary: 1_000_000,
        masaKerjaYears: 1,
        resignationType: 'phk',
      })
      // Pesangon = 1M, UPMK = 0
      // Tax-free = min(1, 6) × 1M + 0 = 1M
      expect(result.taxableAmount).toBe(0)
      expect(result.isTaxable).toBe(false)
    })
  })

  describe('Gross total', () => {
    it('gross total = pesangon + UPMK + UPH', () => {
      const result = calculateSeverance({
        monthlySalary: 5_000_000,
        masaKerjaYears: 3,
        resignationType: 'phk',
      })
      const expected = result.uangPesangon + result.upmk + result.uangPenggantianHak
      expect(result.totalGross).toBe(expected)
    })
  })
})