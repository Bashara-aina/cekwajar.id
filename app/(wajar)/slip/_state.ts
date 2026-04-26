// app/(wajar)/slip/_state.ts
// Canonical 6-state machine for Wajar Slip

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

export interface ExtractedFields {
  grossMonthly: number
  ptkpStatus: string
  npwp: boolean
  periodMonth: number
  periodYear: number
  city: string
  reportedPph21?: number
}

export interface AuditResult {
  monthly_pph21: number
  annual_gross: number
  ppk: number
  shortfall_idr: number
  city?: string
  violations: Array<{
    code: string
    severity: 'CRITICAL' | 'WARNING' | 'INFO'
    message: string
    shortfall_idr: number
  }>
  violation_count: number
}

export type SlipPhase =
  | { kind: 'IDLE' }
  | { kind: 'UPLOADING'; fileName: string; progress: number }
  | { kind: 'OCR_PROCESSING'; engine: 'vision' | 'tesseract'; progress: number; filePath?: string }
  | { kind: 'CONFIRM'; extracted: ExtractedFields; filePath: string; ocrConfidence: number }
  | { kind: 'CALCULATING' }
  | { kind: 'VERDICT'; data: AuditResult }
  | { kind: 'ERROR'; code: ErrorCode; message: string }

export type SlipAction =
  | { type: 'SELECT_FILE'; fileName: string }
  | { type: 'UPLOAD_PROGRESS'; pct: number }
  | { type: 'UPLOAD_COMPLETE'; filePath: string }
  | { type: 'OCR_START'; engine: 'vision' | 'tesseract' }
  | { type: 'OCR_PROGRESS'; pct: number }
  | { type: 'OCR_COMPLETE'; confidence: number; extracted: ExtractedFields }
  | { type: 'CONFIRM_OVERRIDE'; overrides: Partial<ExtractedFields> }
  | { type: 'CONFIRM_ACCEPT' }
  | { type: 'CANCEL' }
  | { type: 'CALCULATE_START' }
  | { type: 'CALCULATE_COMPLETE'; data: AuditResult }
  | { type: 'ERROR'; code: ErrorCode; message: string }

export function slipReducer(state: SlipPhase, action: SlipAction): SlipPhase {
  switch (state.kind) {
    case 'IDLE':
      switch (action.type) {
        case 'SELECT_FILE':
          return { kind: 'UPLOADING', fileName: action.fileName, progress: 0 }
        default:
          return state
      }

    case 'UPLOADING':
      switch (action.type) {
        case 'UPLOAD_PROGRESS':
          return { kind: 'UPLOADING', fileName: state.fileName, progress: action.pct }
        case 'UPLOAD_COMPLETE':
          return { kind: 'OCR_PROCESSING', engine: 'vision', progress: 0, filePath: action.filePath }
        case 'ERROR':
          return { kind: 'ERROR', code: action.code, message: action.message }
        case 'CANCEL':
          return { kind: 'IDLE' }
        default:
          return state
      }

    case 'OCR_PROCESSING':
      switch (action.type) {
        case 'OCR_START':
          return { kind: 'OCR_PROCESSING', engine: action.engine, progress: 0 }
        case 'OCR_PROGRESS':
          return { kind: 'OCR_PROCESSING', engine: state.engine, progress: action.pct }
        case 'OCR_COMPLETE':
          return {
            kind: 'CONFIRM',
            extracted: action.extracted,
            filePath: state.filePath ?? '',
            ocrConfidence: action.confidence,
          }
        case 'ERROR':
          return { kind: 'ERROR', code: action.code, message: action.message }
        case 'CANCEL':
          return { kind: 'IDLE' }
        default:
          return state
      }

    case 'CONFIRM':
      switch (action.type) {
        case 'CONFIRM_ACCEPT':
          return { kind: 'CALCULATING' }
        case 'CANCEL':
          return { kind: 'IDLE' }
        default:
          return state
      }

    case 'CALCULATING':
      switch (action.type) {
        case 'CALCULATE_COMPLETE':
          return { kind: 'VERDICT', data: action.data }
        case 'ERROR':
          return { kind: 'ERROR', code: action.code, message: action.message }
        case 'CANCEL':
          return { kind: 'IDLE' }
        default:
          return state
      }

    case 'VERDICT':
      switch (action.type) {
        case 'CANCEL':
          return { kind: 'IDLE' }
        default:
          return state
      }

    case 'ERROR':
      switch (action.type) {
        case 'CANCEL':
        case 'SELECT_FILE':
          return { kind: 'IDLE' }
        default:
          return state
      }

    default:
      return state
  }
}

export function bucketShortfall(idr: number): string {
  if (idr < 100_000) return '<100K'
  if (idr < 500_000) return '100K-500K'
  if (idr < 1_000_000) return '500K-1M'
  if (idr < 3_000_000) return '1M-3M'
  return '3M+'
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  // PostHog stub — wire to PostHog JS SDK in production
  if (typeof window !== 'undefined' && (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog) {
    (window as unknown as { posthog: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog.capture(event, properties)
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`[telemetry] ${event}`, properties)
  }
}