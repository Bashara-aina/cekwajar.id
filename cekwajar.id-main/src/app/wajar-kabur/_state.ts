// ==============================================================================
// cekwajar.id — Wajar Kabur State Machine
// Two-step form: IDLE → CALCULATING → VERDICT | ERROR
// ==============================================================================

import type { RunwayBreakdown, Verdict } from '@/lib/engines'
import type { KaburFormValues } from '@/lib/schemas/kabur'
import { track } from '@/lib/analytics'

// ─── Core Types ─────────────────────────────────────────────────────────────

export type KaburPhase =
  | { kind: 'IDLE' }
  | { kind: 'STEP1' }
  | { kind: 'STEP2'; step1: KaburFormValues }
  | { kind: 'CALCULATING'; step1: KaburFormValues; step2: KaburFormValues }
  | { kind: 'VERDICT'; data: KaburVerdict }
  | { kind: 'ERROR'; code: KaburErrorCode; message: string }

export type KaburErrorCode =
  | 'VALIDATION_ERROR'
  | 'NETWORK'
  | 'RATE_LIMITED'
  | 'CALC_FAILED'
  | 'UNKNOWN'

export interface KaburVerdict {
  runwayMonths: number
  verdict: Verdict
  verdictLabel: string
  verdictColor: 'green' | 'yellow' | 'red'
  breakdown: RunwayBreakdown
  checklist: PreparationItem[]
}

export interface PreparationItem {
  text: string
  done: boolean
}

// ─── Actions ───────────────────────────────────────────────────────────────

export type KaburAction =
  | { type: 'GO_TO_STEP1' }
  | { type: 'GO_TO_STEP2'; step1: KaburFormValues }
  | { type: 'BACK_TO_STEP1'; step1: KaburFormValues }
  | { type: 'CALCULATE'; step1: KaburFormValues; step2: KaburFormValues }
  | { type: 'SUCCESS'; data: KaburVerdict }
  | { type: 'ERROR'; code: KaburErrorCode; message: string }
  | { type: 'RESET' }

// ─── Build preparation checklist ───────────────────────────────────────────

function buildChecklist(breakdown: RunwayBreakdown, monthlySalary: number): PreparationItem[] {
  const items: PreparationItem[] = []

  if (breakdown.runwayMonths < 6) {
    items.push(
      { text: 'Tambah dana darurat — target 6 bulan pengeluaran', done: false },
      { text: 'Cicilan utang selesai sebelum resign', done: false },
    )
  } else if (breakdown.runwayMonths < 12) {
    items.push(
      { text: 'Punya 3 bulan biaya hidup sebagai emergency fund', done: false },
      { text: 'Siapkan rencana pencarian kerja 30-60 hari', done: false },
    )
  } else {
    items.push({ text: 'Dana darurat sudah memadai', done: false })
  }

  if (!breakdown.jhtWithdrawal.eligible && breakdown.jhtWithdrawal.amountIDR > 0) {
    items.push({
      text: `JHT Rp ${breakdown.jhtWithdrawal.amountIDR.toLocaleString('id-ID')} baru bisa dicairkan di usia 56`,
      done: false,
    })
  }

  if (breakdown.severanceIDR > 0) {
    items.push({
      text: `Pesangon + UPH Rp ${breakdown.severanceIDR.toLocaleString('id-ID')} sebagai modal transisi`,
      done: false,
    })
  }

  items.push(
    { text: 'Kartu BPJS Kesehatan aktif (mandiri / keluarga)', done: false },
    { text: 'Status NPWP sudah update untuk pajak pesangon', done: false },
  )

  return items
}

// ─── Reducer ─────────────────────────────────────────────────────────────

export function kaburReducer(state: KaburPhase, action: KaburAction): KaburPhase {
  switch (action.type) {
    case 'GO_TO_STEP1':
      return { kind: 'STEP1' }

    case 'GO_TO_STEP2':
      return { kind: 'STEP2', step1: action.step1 }

    case 'BACK_TO_STEP1':
      if (state.kind === 'STEP2') {
        return { kind: 'STEP1' }
      }
      return state

    case 'CALCULATE':
      track('kabur_calculate_start', {
        resignation_type: action.step1.resignationType,
        masa_kerja: action.step1.masaKerjaYears,
      })
      return { kind: 'CALCULATING', step1: action.step1, step2: action.step2 }

    case 'SUCCESS': {
      track('kabur_verdict', {
        verdict: action.data.verdict,
        runway_months: action.data.runwayMonths,
      })
      return { kind: 'VERDICT', data: action.data }
    }

    case 'ERROR':
      track('kabur_error', { code: action.code })
      return { kind: 'ERROR', code: action.code, message: action.message }

    case 'RESET':
      return { kind: 'IDLE' }

    default:
      return state
  }
}

// ─── Error Messages ───────────────────────────────────────────────────────

export const KABUR_ERROR_MESSAGES: Record<
  KaburErrorCode,
  { primary: string; secondary?: string }
> = {
  VALIDATION_ERROR: {
    primary: 'Data tidak valid. Periksa kembali input.',
    secondary: 'Coba lagi',
  },
  NETWORK: {
    primary: 'Koneksi terputus. Coba lagi?',
    secondary: 'Coba lagi',
  },
  RATE_LIMITED: {
    primary: 'Terlalu banyak request. Coba lagi dalam beberapa menit.',
    secondary: 'Tunggu sebentar',
  },
  CALC_FAILED: {
    primary: 'Kalkulasi gagal. Coba lagi.',
    secondary: 'Coba lagi',
  },
  UNKNOWN: {
    primary: 'Terjadi kesalahan tak terduga. Coba lagi.',
    secondary: 'Coba lagi',
  },
}

// ─── Export for use by page component ───────────────────────────────────────

export type { RunwayBreakdown }
export { buildChecklist }
