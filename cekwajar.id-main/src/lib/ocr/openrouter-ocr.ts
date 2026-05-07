// ==============================================================================
// cekwajar.id — OpenRouter OCR (Claude 3.5 Sonnet via OpenAI SDK)
// Alternative OCR path using OpenRouter's OpenAI-compatible API
// Falls back to Google Vision on failure
// ==============================================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { OCRExtractionResult, ExtractedPayslipFields } from './field-extractor'
import {
  extractFieldsFromText,
  calculateFieldConfidences,
  getRoutingDecision,
} from './field-extractor'

// --- OpenRouter Client --------------------------------------------------------

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'

function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }
  return { apiKey }
}

const SYSTEM_PROMPT =
  'You are an expert Indonesian payroll document parser. Extract all salary and deduction data from this slip gaji (payslip) image. Return ONLY valid JSON, no explanation. If a field is unclear or missing, set value to null and confidence to 0. Confidence scale: 0.0-1.0.'

const USER_PROMPT_TEMPLATE = `Return JSON exactly in this structure:
{
  "period": "YYYY-MM",
  "gaji_pokok": number | null,
  "tunjangan_tetap": number | null,
  "tunjangan_tidak_tetap": number | null,
  "tunjangan_makan": number | null,
  "tunjangan_transport": number | null,
  "uang_lembur": number | null,
  "pph21": number | null,
  "bpjs_kesehatan": number | null,
  "bpjs_jht": number | null,
  "bpjs_jp": number | null,
  "bpjs_jkk": number | null,
  "bpjs_jkm": number | null,
  "potongan_lain": number | null,
  "gaji_bersih": number | null,
  "confidence": {
    "gaji_pokok": 0.0-1.0,
    "pph21": 0.0-1.0,
    "bpjs_kesehatan": 0.0-1.0,
    "bpjs_jht": 0.0-1.0,
    "bpjs_jp": 0.0-1.0
  }
}`

// --- Default result for errors/unavailable ------------------------------------

function defaultExtractionResult(): OCRExtractionResult {
  return {
    source: 'openrouter',
    confidence: 0,
    routingDecision: 'MANUAL_REQUIRED',
    extractedFields: {},
    fieldConfidences: {},
    requiresConfirmation: [],
    message: 'OpenRouter OCR failed — defaulting to manual entry',
  }
}

// --- Sanitization -------------------------------------------------------------

interface RawConfidence {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gaji_pokok?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pph21?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bpjs_kesehatan?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bpjs_jht?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bpjs_jp?: any
}

interface RawModelOutput {
  period?: unknown
  gaji_pokok?: unknown
  tunjangan_tetap?: unknown
  tunjangan_tidak_tetap?: unknown
  tunjangan_makan?: unknown
  tunjangan_transport?: unknown
  uang_lembur?: unknown
  pph21?: unknown
  bpjs_kesehatan?: unknown
  bpjs_jht?: unknown
  bpjs_jp?: unknown
  bpjs_jkk?: unknown
  bpjs_jkm?: unknown
  potongan_lain?: unknown
  gaji_bersih?: unknown
  confidence?: RawConfidence
}

function parseNumber(val: unknown): number | null {
  if (typeof val === 'number' && isFinite(val)) return val
  if (typeof val === 'string') {
    const cleaned = val.replace(/\./g, '').replace(/,/g, '').trim()
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

function sanitizeModelOutput(raw: unknown): ExtractedPayslipFields {
  if (!raw || typeof raw !== 'object') return {}
  const data = raw as RawModelOutput

  const extracted: ExtractedPayslipFields = {}

  const period = parseNumber(data.period)
  if (period !== null) extracted.grossSalary = period

  const gajiPokok = parseNumber(data.gaji_pokok)
  if (gajiPokok !== null) extracted.grossSalary = gajiPokok

  const pph21 = parseNumber(data.pph21)
  if (pph21 !== null) extracted.pph21 = pph21

  const jht = parseNumber(data.bpjs_jht)
  if (jht !== null) extracted.jhtEmployee = jht

  const jp = parseNumber(data.bpjs_jp)
  if (jp !== null) extracted.jpEmployee = jp

  const kesehatan = parseNumber(data.bpjs_kesehatan)
  if (kesehatan !== null) extracted.kesehatanEmployee = kesehatan

  const takeHome = parseNumber(data.gaji_bersih)
  if (takeHome !== null) extracted.takeHome = takeHome

  return extracted
}

// --- Main extraction function --------------------------------------------------

export interface OpenRouterOCRInput {
  fileBuffer: ArrayBuffer
  mimeType: string
}

/**
 * Extract payslip fields from a base64-encoded image using OpenRouter
 * (Claude 3.5 Sonnet via OpenAI-compatible API).
 *
 * Falls back to a default result if:
 * - OPENROUTER_API_KEY is not set
 * - The API call fails
 *
 * Does NOT fall back to Google Vision — callers should implement
 * their own fallback chain if needed.
 */
export async function extractSlipDataFromImage(
  input: OpenRouterOCRInput
): Promise<OCRExtractionResult> {
  const { fileBuffer, mimeType } = input

  let apiKey: string
  try {
    apiKey = createOpenRouterClient().apiKey
  } catch {
    return defaultExtractionResult()
  }

  const base64 = Buffer.from(fileBuffer).toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  let rawText: string | null = null

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: USER_PROMPT_TEMPLATE },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error(`[openrouter-ocr] API error ${response.status}: ${errorBody}`)
      return defaultExtractionResult()
    }

    const json = await response.json() as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      choices?: Array<{ message?: { content?: string | null } | null }>
    }

    rawText = json.choices?.[0]?.message?.content ?? null
    if (!rawText) return defaultExtractionResult()

    let parsed: unknown
    try {
      parsed = JSON.parse(rawText)
    } catch {
      return {
        ...defaultExtractionResult(),
        rawText,
        message: 'OpenRouter returned non-JSON response',
      }
    }

    const extractedFields: ExtractedPayslipFields = sanitizeModelOutput(parsed)
    const fieldConfidences = calculateFieldConfidences(extractedFields, rawText)
    const routingDecision = getRoutingDecision(0.85, fieldConfidences, 'google_vision')

    const requiresConfirmation = Object.entries(fieldConfidences)
      .filter(([, conf]) => conf < 0.80)
      .map(([field]) => field)

    return {
      source: 'openrouter',
      confidence: 0.85,
      routingDecision,
      extractedFields,
      fieldConfidences,
      rawText,
      requiresConfirmation,
    }
  } catch (err) {
    console.error('[openrouter-ocr] extraction error:', err)
    return defaultExtractionResult()
  }
}
