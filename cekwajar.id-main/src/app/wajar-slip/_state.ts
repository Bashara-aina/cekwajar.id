// ==============================================================================
// cekwajar.id — Wajar Slip State Machine
// Canonical 6-phase state machine extracted from page.tsx
// ==============================================================================

import type { ExtractedPayslipFields } from '@/lib/ocr/field-extractor'
import type { Violation } from '@/types'
import { track } from '@/lib/analytics'

// ─── Core Types ───────────────────────────────────────────────────────────────

export type SlipPhase =
  | { kind: 'IDLE' }
  | { kind: 'UPLOADING'; fileName: string }
  | { kind: 'OCR_PROCESSING'; engine: 'vision' | 'tesseract'; progress: number }
  | { kind: 'CONFIRM'; extracted: ExtractedPayslipFields; filePath: string; ocrConfidence: number; fieldConfidences: Record<string, number> }
  | { kind: 'CALCULATING' }
  | { kind: 'VERDICT'; data: AuditResult }
  | { kind: 'ERROR'; code: ErrorCode; message: string }

export type ErrorCode =
  | 'FILE_TOO_LARGE'
  | 'FILE_TYPE_INVALID'
  | 'OCR_FAILED'
  | 'OCR_LOW_CONFIDENCE'
  | 'NETWORK'
  | 'RATE_LIMITED'
  | 'INVALID_CITY'
  | 'CALC_FAILED'
  | 'AUTH_REQUIRED'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN'

// ─── Audit Result ───────────────────────────────────────────────────────────

export interface AuditResult {
  auditId: string | null
  verdict: 'SESUAI' | 'ADA_PELANGGARAN'
  violationCount: number
  violationCodes: string[]
  violations: GatedViolation[]
  calculations?: {
    correctPph21: number
    correctJht: number
    correctJp: number
    correctKesehatan: number
    cityUMK: number
  }
  isGated: boolean
  gateMessage?: string
  subscriptionRequired?: 'basic' | 'pro'
  cityUMK: number
  city: string
  grossSalary: number
  monthNumber: number
  year: number
  shortfallIdr?: number
}

export interface GatedViolation extends Omit<Violation, 'differenceIDR'> {
  differenceIDR: number | null
}

// ─── Actions ────────────────────────────────────────────────────────────────

export type SlipAction =
  | { type: 'START_UPLOAD'; fileName: string }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'OCR_START'; engine: 'vision' | 'tesseract' }
  | { type: 'OCR_PROGRESS'; progress: number }
  | { type: 'OCR_COMPLETE'; extracted: ExtractedPayslipFields; filePath: string; ocrConfidence: number; fieldConfidences: Record<string, number> }
  | { type: 'OCR_FAILED'; code: ErrorCode; message: string }
  | { type: 'CONFIRM_OVERRIDE'; overrides: ExtractedPayslipFields }
  | { type: 'CONFIRM_CANCEL' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS'; data: AuditResult }
  | { type: 'ERROR'; code: ErrorCode; message: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }

// ─── State entry timestamps (for telemetry) ──────────────────────────────────

const stateEnteredAt: Partial<Record<SlipPhase['kind'], number>> = {}

function now(): number {
  return Date.now()
}

// ─── Reducer ───────────────────────────────────────────────────────────────

export function slipReducer(state: SlipPhase, action: SlipAction): SlipPhase {
  switch (action.type) {
    case 'START_UPLOAD':
      stateEnteredAt['IDLE'] = now()
      return { kind: 'UPLOADING', fileName: action.fileName }

    case 'UPLOAD_PROGRESS':
      return state // Progress events handled by UI directly

    case 'OCR_START':
      stateEnteredAt['UPLOADING'] = now()
      return { kind: 'OCR_PROCESSING', engine: action.engine, progress: 0 }

    case 'OCR_PROGRESS':
      if (state.kind === 'OCR_PROCESSING') {
        return { ...state, progress: action.progress }
      }
      return state

    case 'OCR_COMPLETE':
      stateEnteredAt['OCR_PROCESSING'] = now()
      track('slip_ocr_engine', { engine: action.ocrConfidence > 0.8 ? 'vision' : 'tesseract', confidence: action.ocrConfidence })
      return {
        kind: 'CONFIRM',
        extracted: action.extracted,
        filePath: action.filePath,
        ocrConfidence: action.ocrConfidence,
        fieldConfidences: action.fieldConfidences,
      }

    case 'OCR_FAILED':
      stateEnteredAt['OCR_PROCESSING'] = now()
      return { kind: 'ERROR', code: action.code, message: action.message }

    case 'CONFIRM_OVERRIDE':
      stateEnteredAt['CONFIRM'] = now()
      return { kind: 'CALCULATING' }

    case 'CONFIRM_CANCEL':
      return { kind: 'IDLE' }

    case 'SUBMIT':
      stateEnteredAt['CALCULATING'] = now()
      return { kind: 'CALCULATING' }

    case 'SUCCESS':
      stateEnteredAt['CALCULATING'] = now()
      const bucket: ShortfallBucket = action.data.shortfallIdr
        ? bucketShortfall(action.data.shortfallIdr)
        : '<100K'
      track('slip_calc_complete', {
        verdict: action.data.verdict,
        n_violations: action.data.violationCount,
        shortfall_idr_bucket: bucket,
      })
      if (action.data.isGated) {
        track('slip_gate_view', { shortfall_idr_bucket: bucket, n_violations: action.data.violationCount })
      }
      return { kind: 'VERDICT', data: action.data }

    case 'ERROR':
      stateEnteredAt['ERROR'] = now()
      track('slip_error', { code: action.code, retry: false, time_in_state_ms: 0 })
      return { kind: 'ERROR', code: action.code, message: action.message }

    case 'RETRY':
      track('slip_error', { code: 'UNKNOWN', retry: true, time_in_state_ms: 0 })
      return { kind: 'IDLE' }

    case 'RESET':
      return { kind: 'IDLE' }

    default:
      return state
  }
}

// ─── Error Message Map ─────────────────────────────────────────────────────

export const ERROR_MESSAGES: Record<ErrorCode, { primary: string; secondary?: string }> = {
  FILE_TOO_LARGE: {
    primary: 'File lebih dari 5MB. Coba kompres dulu di Adobe Scan / Apple Notes.',
    secondary: 'Pilih file lain',
  },
  FILE_TYPE_INVALID: {
    primary: 'Hanya PDF/JPG/PNG. File kamu tidak didukung.',
    secondary: 'Pilih file lain',
  },
  OCR_FAILED: {
    primary: 'OCR gagal baca slip. Yuk isi manual — 30 detik selesai.',
    secondary: 'Isi manual sekarang',
  },
  OCR_LOW_CONFIDENCE: {
    primary: 'OCR tidak yakin dengan hasilnya. Periksa ulang angka-angkanya.',
    secondary: 'Isi manual',
  },
  NETWORK: {
    primary: 'Koneksi terputus. Coba lagi?',
    secondary: 'Coba lagi',
  },
  RATE_LIMITED: {
    primary: 'Sudah 5 audit dalam 1 jam. Tunggu 47 menit lagi atau upgrade.',
    secondary: 'Upgrade IDR 49K',
  },
  INVALID_CITY: {
    primary: 'Kota tidak ditemukan dalam database UMK kami.',
    secondary: 'Pilih kota',
  },
  CALC_FAILED: {
    primary: 'Kalkulasi gagal. Coba lagi.',
    secondary: 'Coba lagi',
  },
  AUTH_REQUIRED: {
    primary: 'Untuk simpan riwayat, masuk dulu. Atau lanjut tanpa simpan.',
    secondary: 'Masuk',
  },
  VALIDATION_ERROR: {
    primary: 'Data tidak valid. Periksa kembali input.',
    secondary: 'Coba lagi',
  },
  UNKNOWN: {
    primary: 'Terjadi kesalahan tak terduga. Coba lagi.',
    secondary: 'Coba lagi',
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export type ShortfallBucket = '<100K' | '100K-500K' | '500K-1M' | '1M-3M' | '3M+'

export function bucketShortfall(idr: number): ShortfallBucket {
  if (idr < 100_000) return '<100K'
  if (idr < 500_000) return '100K-500K'
  if (idr < 1_000_000) return '500K-1M'
  if (idr < 3_000_000) return '1M-3M'
  return '3M+'
}
