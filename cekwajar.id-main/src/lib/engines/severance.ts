// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Severance Calculator (PP 35/2021)
// Uang Pesangon, UPMK, and Uang Penggantian Hak computations
// for PHK and voluntary resignation scenarios
// ══════════════════════════════════════════════════════════════════════════════

export type ResignationType = 'resign' | 'phk' | 'pkwt_expire'

export interface SeveranceInput {
  monthlySalary: number
  masaKerjaYears: number
  resignationType: ResignationType
}

export interface SeveranceBreakdown {
  uangPesangon: number
  uangPesangonMultiple: number
  upmk: number
  upmkMonths: number
  uangPenggantianHak: number
  totalGross: number
  taxFreeThreshold: number
  taxableAmount: number
  isTaxable: boolean
}

export interface SeveranceResult extends SeveranceBreakdown {
  netIDR: number
  type: ResignationType
  masaKerjaYears: number
}

/**
 * PP 35/2021 Uang Pesangon scale — PHK only (resign = 0).
 * Multiple is years worked × multiplier, capped at 9 months.
 */
function getPesangonMultiple(
  masaKerjaYears: number,
  type: ResignationType
): number {
  if (type === 'resign') return 0

  if (masaKerjaYears < 1) return 1
  if (masaKerjaYears < 2) return 2
  if (masaKerjaYears < 3) return 3
  if (masaKerjaYears < 4) return 4
  if (masaKerjaYears < 5) return 5
  if (masaKerjaYears < 6) return 6
  if (masaKerjaYears < 7) return 7
  if (masaKerjaYears < 8) return 8
  return 9 // cap
}

/**
 * UPMK (Uang Penghargaan Masa Kerja) scale.
 * Paid for masa kerja ≥ 3 years for PHK.
 * For resign: only if masa kerja > 3 years (not ≥ 3).
 * Months per year of service — capped at 10.
 */
function getUpmkMonths(
  masaKerjaYears: number,
  type: ResignationType
): number {
  if (type === 'phk' && masaKerjaYears < 3) return 0
  if (type === 'pkwt_expire' && masaKerjaYears < 3) return 0
  if (type === 'resign' && masaKerjaYears <= 3) return 0 // strict > 3

  if (masaKerjaYears < 1) return 0
  if (masaKerjaYears < 2) return 1
  if (masaKerjaYears < 3) return 2
  if (masaKerjaYears < 4) return 3
  if (masaKerjaYears < 5) return 4
  if (masaKerjaYears < 6) return 5
  if (masaKerjaYears < 7) return 6
  if (masaKerjaYears < 8) return 7
  if (masaKerjaYears < 10) return 8
  return 10 // cap
}

/**
 * Uang Penggantian Hak = 15% of (uang pesangon + upmk).
 * Applied for both PHK and resign if eligible for UPMK.
 */
function calcUangPenggantianHak(pesangon: number, upmk: number): number {
  return Math.round((pesangon + upmk) * 0.15)
}

/**
 * Tax-free threshold for severance under UU PPh 2011:
 * - Pesangon: 6 months salary (or actual if lower)
 * - UPMK: 3 months salary (or actual if lower)
 * We use the statutory minimum (3× for UPMK, 6× for pesangon) as tax-free floor.
 * Anything above the tax-free threshold is taxable income at progressive rates.
 */
function calcTaxFreeThreshold(
  monthlySalary: number,
  pesangonMonths: number,
  upmkMonthsCalc: number
): number {
  const pesangonFloor = Math.min(pesangonMonths, 6) * monthlySalary
  const upmkFloor = Math.min(upmkMonthsCalc, 3) * monthlySalary
  return pesangonFloor + upmkFloor
}

/**
 * Calculate severance entitlements under PP 35/2021.
 *
 * Key rules:
 * - PHK / PKWT expire: full severance + UPMK (if masa kerja ≥ 3 years)
 * - Voluntary resign: NO uang pesangon; UPMK eligible ONLY if masa kerja > 3 years
 * - Uang Penggantian Hak: 15% of (pesangon + upmk)
 * - Tax treatment: first 3 months UPMK + first 6 months pesangon are tax-free
 */
export function calculateSeverance(input: SeveranceInput): SeveranceResult {
  const { monthlySalary, masaKerjaYears, resignationType: type } = input

  const pesangonMonths = getPesangonMultiple(masaKerjaYears, type)
  const uangPesangon = pesangonMonths * monthlySalary

  const upmkMonthsCalc = getUpmkMonths(masaKerjaYears, type)
  const upmk = upmkMonthsCalc * monthlySalary

  const uangPenggantianHak = calcUangPenggantianHak(uangPesangon, upmk)

  const totalGross = uangPesangon + upmk + uangPenggantianHak

  const taxFreeThreshold = calcTaxFreeThreshold(monthlySalary, pesangonMonths, upmkMonthsCalc)
  const taxableAmount = Math.max(0, totalGross - taxFreeThreshold)
  const isTaxable = taxableAmount > 0

  // Net = gross (no tax withheld here — employer handles tax at payroll)
  // Tax calculation would require progressive PPh21 on taxableAmount, separate from this engine
  const netIDR = totalGross

  return {
    uangPesangon,
    uangPesangonMultiple: pesangonMonths,
    upmk,
    upmkMonths: upmkMonthsCalc,
    uangPenggantianHak,
    totalGross,
    taxFreeThreshold,
    taxableAmount,
    isTaxable,
    netIDR,
    type,
    masaKerjaYears,
  }
}
