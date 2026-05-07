// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Financial Runway Calculator (Wajar Kabur)
// Models liquid assets and monthly burn rate after resignation
// ══════════════════════════════════════════════════════════════════════════════

import { calculateSeverance, type ResignationType } from './severance'

export type Verdict = 'AMAN_KABUR' | 'PIKIR_LAGI' | 'BELUM_WAKTUNYA'

export interface RunwayInput {
  monthlySalary: number
  monthlyExpenses: number
  savings: number
  masaKerjaYears: number
  resignationType: ResignationType
  outstandingDebtsMonthly: number
  dependentsCount: number
  optionalJhtBalance?: number
  optionalInvestmentValue?: number
}

export interface JhtWithdrawalResult {
  eligible: boolean
  reason: string
  amountIDR: number
  waitingMonths: number
}

export interface RunwayBreakdown {
  severanceIDR: number
  severanceBreakdown: ReturnType<typeof calculateSeverance>
  jhtWithdrawal: JhtWithdrawalResult
  totalLiquidAssets: number
  monthlyBurnRate: number
  monthlyExpenses: number
  outstandingDebtsMonthly: number
  bpjsMandiriMonthlyEstimate: number
  runwayMonths: number
  verdict: Verdict
  verdictLabel: string
  verdictColor: 'green' | 'yellow' | 'red'
  monthsUntilJhtAccessible: number
  safeRunwayMonths: number // runway months adjusted for emergency fund
}

/**
 * JHT (Jaminan Hari Tua) withdrawal rules from BPJS employment law:
 *
 * Full withdrawal conditions:
 * 1. Reaching age 56 (normal retirement)
 * 2. PHK (termination) — 1-month processing period
 * 3. Leaving Indonesia permanently (with supporting documents)
 *
 * Partial withdrawal (after 10 years of membership):
 * - 10% for housing/property
 * - 30% for other purposes (education, health, etc.)
 *
 * This engine models partial withdrawal for PHK scenario only (most common).
 * For resign: only accessible at age 56 or leaving Indonesia — we flag as not accessible.
 */
function calcJhtWithdrawal(
  jhtBalance: number | undefined,
  masaKerjaYears: number,
  resignationType: ResignationType
): JhtWithdrawalResult {
  if (!jhtBalance || jhtBalance <= 0) {
    return { eligible: false, reason: 'Tidak ada saldo JHT', amountIDR: 0, waitingMonths: 0 }
  }

  if (resignationType === 'resign') {
    // Voluntary resignation: JHT only accessible at age 56 or leaving Indonesia
    return {
      eligible: false,
      reason: 'JHT hanya bisa dicairkan di usia 56 atau keluar Indonesia',
      amountIDR: 0,
      waitingMonths: 0,
    }
  }

  // PHK or PKWT expire: eligible after 1-month processing period
  if (resignationType === 'phk' || resignationType === 'pkwt_expire') {
    return {
      eligible: true,
      reason: 'PHK: dapat dicairkan 1 bulan setelah pengajuan',
      amountIDR: jhtBalance,
      waitingMonths: 1,
    }
  }

  return { eligible: false, reason: 'Tidak memenuhi syarat pencairan', amountIDR: 0, waitingMonths: 0 }
}

/**
 * BPJS Kesehatan mandiri (self-employed) estimate after resignation.
 * Mandatory health insurance: ~1.5% of last monthly salary, capped at 12M.
 * After leaving employment, employee must pay own BPJS Kesehatan.
 */
function calcBpjsMandiriEstimate(monthlySalary: number): number {
  const grossContribution = monthlySalary * 0.015
  return Math.min(grossContribution, 180_000) // 1.5% cap at ~180K/month (1.5% × 12M cap)
}

/**
 * Derive verdict from runway months.
 *
 * AMAN_KABUR: >= 12 months runway — green
 * PIKIR_LAGI: 6-11 months — yellow
 * BELUM_WAKTUNYA: < 6 months — red
 */
function deriveVerdict(runwayMonths: number): {
  verdict: Verdict
  label: string
  color: 'green' | 'yellow' | 'red'
} {
  if (runwayMonths >= 12) {
    return { verdict: 'AMAN_KABUR', label: 'Aman untuk Kabur', color: 'green' }
  }
  if (runwayMonths >= 6) {
    return { verdict: 'PIKIR_LAGI', label: 'Perlu Dipikir Lebih Matang', color: 'yellow' }
  }
  return { verdict: 'BELUM_WAKTUNYA', label: 'Belum Waktunya', color: 'red' }
}

const VERDICT_LABELS: Record<Verdict, string> = {
  AMAN_KABUR: 'Aman untuk Kabur',
  PIKIR_LAGI: 'Perlu Dipikir Lebih Matang',
  BELUM_WAKTUNYA: 'Belum Waktunya',
}

/**
 * Calculate financial runway after resignation.
 *
 * total_liquid = savings + severance_net + jht_withdrawable + investment_value
 * monthly_burn = monthly_expenses + debt_payments + bpjs_mandiri_estimate
 * runway_months = total_liquid / monthly_burn
 */
export function calculateRunway(input: RunwayInput): RunwayBreakdown {
  const {
    monthlySalary,
    monthlyExpenses,
    savings,
    masaKerjaYears,
    resignationType,
    outstandingDebtsMonthly,
    optionalJhtBalance,
    optionalInvestmentValue,
  } = input

  const severanceResult = calculateSeverance({
    monthlySalary,
    masaKerjaYears,
    resignationType,
  })

  const jhtWithdrawal = calcJhtWithdrawal(optionalJhtBalance, masaKerjaYears, resignationType)

  const investmentValue = optionalInvestmentValue ?? 0

  const totalLiquidAssets =
    savings + severanceResult.netIDR + jhtWithdrawal.amountIDR + investmentValue

  const bpjsMandiriEstimate = calcBpjsMandiriEstimate(monthlySalary)

  const monthlyBurnRate = monthlyExpenses + outstandingDebtsMonthly + bpjsMandiriEstimate

  // Prevent division by zero
  const runwayMonths = monthlyBurnRate > 0
    ? Math.round((totalLiquidAssets / monthlyBurnRate) * 10) / 10
    : 999

  const { verdict, label, color } = deriveVerdict(runwayMonths)

  // "Safe" runway: subtract 2 months buffer for emergency fund
  const safeRunwayMonths = Math.max(0, runwayMonths - 2)

  return {
    severanceIDR: severanceResult.netIDR,
    severanceBreakdown: severanceResult,
    jhtWithdrawal,
    totalLiquidAssets,
    monthlyBurnRate,
    monthlyExpenses,
    outstandingDebtsMonthly,
    bpjsMandiriMonthlyEstimate: bpjsMandiriEstimate,
    runwayMonths,
    verdict,
    verdictLabel: VERDICT_LABELS[verdict],
    verdictColor: color,
    monthsUntilJhtAccessible: jhtWithdrawal.waitingMonths,
    safeRunwayMonths,
  }
}
