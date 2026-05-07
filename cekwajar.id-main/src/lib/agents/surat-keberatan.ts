// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Groq-Powered Surat Keberatan & WA Templates Agent
// Generates formal objection letters and HR follow-up WhatsApp templates
// ══════════════════════════════════════════════════════════════════════════════

import Groq from 'groq-sdk'
import { z } from 'zod'
import type { Violation } from '@/types'

function getGroq(): Groq {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY ?? '',
  })
}

// --- Input Schema -----------------------------------------------------------

export const ViolationBreakdownSchema = z.object({
  komponen: z.string(),
  dipotong: z.number(),
  seharusnya: z.number(),
  selisih: z.number(),
  dasarHukum: z.string(),
})
export type ViolationBreakdown = z.infer<typeof ViolationBreakdownSchema>

export const AuditDataSchema = z.object({
  verdict: z.enum(['ADA_PELANGGARAN', 'SESUAI']),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2030),
  isDecember: z.boolean().optional().default(false),
  discrepancyRp: z.number().int().min(0),
  breakdown: z.array(ViolationBreakdownSchema),
  estimated12Month: z.number().int().min(0).optional(),
  violations: z.array(
    z.object({
      code: z.string(),
      titleID: z.string(),
      differenceIDR: z.number().nullable(),
    })
  ),
})
export type AuditData = z.infer<typeof AuditDataSchema>

// --- Result interfaces ------------------------------------------------------

export interface SuratResult {
  data: string
  source: 'groq' | 'fallback'
  confidence: number
}

export interface WaTemplatesResult {
  data: [string, string, string]
  source: 'groq' | 'fallback'
  confidence: number
}

// --- System prompts --------------------------------------------------------

// Indonesian legal references cited in surat:
//   - PMK 168/2023  → TER methodology for monthly PPh 21
//   - PP 44/2015    → JKK & JKM employer-only contributions
//   - PP 36/2021    → general wage deduction rules, 50% cap
//   - PP 45/2015    → JHT program rules
//   - Perpres 82/2018 → BPJS Kesehatan mandatory enrollment
const SURAT_SYSTEM = `Kamu adalah asisten yang menulis surat keberatan resmi dalam Bahasa Indonesia untuk karyawan yang mengajukan keberatan atas potongan gaji yang tidak sesuai regulasi.
Tulis surat yang singkat, sopan, dan mengacu pada dasar hukum yang relevan (PMK 168/2023, PP 44/2015, PP 36/2021, PP 45/2015, Perpres 82/2018).
Format: paragraf biasa, tidak perlu kop surat. Awali dengan "Yth. Bapak/Ibu [HR/Divisi SDM]," dan akhiri dengan permintaan review serta pengembalian selisih potongan. Maksimal 4 paragraf.`

// WA templates spec:
//   T1: Initial follow-up — formal, references the objection letter
//   T2: Escalation notice — mentions Disnaker /劳工局
//   T3: Settlement offer — if company wants to settle out of court
const WA_SYSTEM = `Kamu menghasilkan 3 kalimat singkat dalam Bahasa Indonesia yang bisa dipakai sebagai template chat WhatsApp ke HR untuk menindaklanjuti keberatan potongan gaji.
Setiap kalimat: sopan, singkat (max 1 baris, max 200 karakter), dan mengarah ke permintaan review/koreksi. Berikan hanya 3 baris teks, setiap baris satu template, tanpa numbering atau penjelasan tambahan.`;

// --- Helpers ---------------------------------------------------------------

function buildSuratUserPrompt(ctx: AuditData): string {
  const rp = new Intl.NumberFormat('id-ID').format(ctx.discrepancyRp)
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(
    new Date(ctx.year, ctx.month - 1)
  )
  const taxNote = ctx.isDecember
    ? 'Catatan: ini masa pajak Desember — PPh 21 menggunakan rekonsiliasi tahunan Pasal 17, bukan TER. Surat sebaiknya hanya mempermasalahkan komponen BPJS.'
    : 'Ini adalah potongan TER bulanan (PMK 168/2023).'

  const hasViolations = ctx.violations.length > 0
  const violationList = ctx.breakdown
    .filter((b) => b.selisih > 0)
    .map(
      (b) =>
        `- ${b.komponen}: dipotong Rp ${new Intl.NumberFormat('id-ID').format(b.dipotong)}, seharusnya Rp ${new Intl.NumberFormat('id-ID').format(b.seharusnya)} (selisih Rp ${new Intl.NumberFormat('id-ID').format(b.selisih)}, ${b.dasarHukum})`
    )
    .join('\n')

  const annualEstimate = ctx.estimated12Month != null
    ? `\nEstimasi 12 bulan: Rp ${new Intl.NumberFormat('id-ID').format(ctx.estimated12Month)}.`
    : ''

  return `Slip bulan ${monthLabel} ${ctx.year}. ${taxNote}
Verdict: ${ctx.verdict}. Total selisih kelebihan potongan: Rp ${rp}.${hasViolations ? `\nPelanggaran ditemukan: ${ctx.violations.map((v) => v.code).join(', ')}` : ''}

Rincian:
${violationList || 'Tidak ada rincian.'}
${annualEstimate}

Tulis surat keberatan berdasarkan data di atas.`
}

function buildWaUserPrompt(ctx: AuditData): string {
  const rp = new Intl.NumberFormat('id-ID').format(ctx.discrepancyRp)
  return `Karyawan punya selisih potongan Rp ${rp} (verdict: ${ctx.verdict}). Buat 3 template WA singkat untuk kirim ke HR, masing-masing max 200 karakter.`
}

// --- Fallback templates -----------------------------------------------------

const FALLBACK_SURAT = `Yth. Bapak/Ibu HR/Divisi SDM,

Dengan hormat,
Saya mengajukan keberatan atas potongan gaji yang tidak sesuai dengan regulasi yang berlaku. Berdasarkan hasil audit slip gaji, terdapat selisih potongan yang perlu dikoreksi.

Mohon dilakukan review dan pengembalian selisih potongan sesuai PMK 168/2023 dan PP 44/2015.

Terima kasih atas perhatian dan tindak lanjut Bapak/Ibu.`

const FALLBACK_WA_TEMPLATES: [string, string, string] = [
  'Halo HR, saya cek ada selisih potongan di slip gaji. Boleh dibantu di-review?',
  'Mau konfirmasi potongan gaji bulan ini, sepertinya ada perhitungan yang perlu dicek ulang.',
  'Saya kirim hasil audit slip, mohon follow-up untuk koreksi potongan ya.',
]

// --- Public API ------------------------------------------------------------

/**
 * Generate a formal Indonesian objection letter (surat keberatan) using Groq.
 * Falls back to a hardcoded template if GROQ_API_KEY is missing or the call fails.
 * Max 4 paragraphs citing specific violations, discrepancy amounts, and legal references.
 * PMK 168/2023, PP 44/2015, PP 36/2021, PP 45/2015, Perpres 82/2018 are cited
 * depending on which violation codes (V01–V11) are present.
 */
export async function generateSuratKeberatan(
  auditData: unknown
): Promise<SuratResult> {
  const parsed = AuditDataSchema.safeParse(auditData)
  if (!parsed.success) {
    return { data: FALLBACK_SURAT, source: 'fallback', confidence: 0.3 }
  }
  const ctx = parsed.data

  if (!process.env.GROQ_API_KEY) {
    return { data: FALLBACK_SURAT, source: 'fallback', confidence: 0.3 }
  }

  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 600,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SURAT_SYSTEM },
        { role: 'user', content: buildSuratUserPrompt(ctx) },
      ],
    })
    const text = completion.choices?.[0]?.message?.content?.trim()
    if (text && text.length > 50) {
      return { data: text, source: 'groq', confidence: 1.0 }
    }
    return { data: FALLBACK_SURAT, source: 'fallback', confidence: 0.3 }
  } catch {
    return { data: FALLBACK_SURAT, source: 'fallback', confidence: 0.3 }
  }
}

/**
 * Generate 3 WhatsApp message templates for HR follow-up using Groq.
 * Each template is max 200 characters.
 * Falls back to hardcoded templates if GROQ_API_KEY is unavailable.
 * Returns [template1, template2, template3].
 *
 * Template 1: Initial follow-up (formal, references objection letter)
 * Template 2: Escalation notice (mentions Disnaker /劳工局)
 * Template 3: Settlement offer (if company wants to settle out of court)
 */
export async function generateWaTemplates(
  auditData: unknown
): Promise<WaTemplatesResult> {
  const parsed = AuditDataSchema.safeParse(auditData)
  if (!parsed.success) {
    return { data: FALLBACK_WA_TEMPLATES, source: 'fallback', confidence: 0.3 }
  }
  const ctx = parsed.data

  if (!process.env.GROQ_API_KEY) {
    return { data: FALLBACK_WA_TEMPLATES, source: 'fallback', confidence: 0.3 }
  }

  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      temperature: 0.4,
      messages: [
        { role: 'system', content: WA_SYSTEM },
        { role: 'user', content: buildWaUserPrompt(ctx) },
      ],
    })
    const text = completion.choices?.[0]?.message?.content?.trim()
    if (!text) {
      return { data: FALLBACK_WA_TEMPLATES, source: 'fallback', confidence: 0.3 }
    }
    const lines = text
      .split(/\n/)
      .map((s) => s.replace(/^[\d.)\-\*]+\s*/, '').trim())
      .filter((s) => s.length > 10 && s.length <= 200)

    if (lines.length >= 3) {
      return {
        data: [lines[0]!, lines[1]!, lines[2]!],
        source: 'groq',
        confidence: 1.0,
      }
    }
    return { data: FALLBACK_WA_TEMPLATES, source: 'fallback', confidence: 0.3 }
  } catch {
    return { data: FALLBACK_WA_TEMPLATES, source: 'fallback', confidence: 0.3 }
  }
}