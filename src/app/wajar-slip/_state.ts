export interface ExtractedFields {
  grossSalary: number
  pph21: number
  jht: number
  jp: number
  kesehatan: number
  takeHome: number
  confidence: number
  fieldConfidences: {
    grossSalary: number
    pph21: number
    jht: number
    jp: number
    kesehatan: number
    takeHome: number
  }
}

export interface AuditResult {
  verdict: 'SESUAI' | 'ADA_PELANGGARAN'
  violations: Array<{
    code: string
    name: string
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    reportedValue: number
    calculatedValue: number
    difference: number
  }>
  totalShortfall: number
  upsellMessage?: string
}

export type SlipPhase =
  | { kind: 'IDLE' }
  | { kind: 'UPLOADING'; fileName?: string }
  | { kind: 'OCR_PROCESSING'; engine: 'vision' | 'tesseract'; progress: number }
  | { kind: 'CONFIRM'; extracted: ExtractedFields; filePath: string }
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

export type SlipAction =
  | { type: 'START_UPLOAD'; fileName?: string }
  | { type: 'OCR_PROGRESS'; engine: 'vision' | 'tesseract'; progress: number }
  | { type: 'OCR_DONE'; extracted: ExtractedFields; filePath: string }
  | { type: 'UPDATE_FIELD'; field: keyof ExtractedFields; value: number }
  | { type: 'CONFIRM' }
  | { type: 'CALCULATE'; result: AuditResult }
  | { type: 'ERROR'; code: ErrorCode; message: string }
  | { type: 'RESET' }

export function slipReducer(state: SlipPhase, action: SlipAction): SlipPhase {
  switch (action.type) {
    case 'START_UPLOAD':
      return { kind: 'UPLOADING', fileName: action.fileName }
    case 'OCR_PROGRESS':
      return { kind: 'OCR_PROCESSING', engine: action.engine, progress: action.progress }
    case 'OCR_DONE':
      return { kind: 'CONFIRM', extracted: action.extracted, filePath: action.filePath }
    case 'CONFIRM':
      return { kind: 'CALCULATING' }
    case 'CALCULATE':
      return { kind: 'VERDICT', data: action.result }
    case 'ERROR':
      return { kind: 'ERROR', code: action.code, message: action.message }
    case 'RESET':
      return { kind: 'IDLE' }
    default:
      return state
  }
}
