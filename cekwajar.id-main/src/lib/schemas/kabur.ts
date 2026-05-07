// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Kabur Schema (Zod)
// Validates all inputs for Wajar Kabur (resignation feasibility)
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

export const RESIGNATION_TYPE_OPTIONS = ['resign', 'phk', 'pkwt_expire'] as const
export type ResignationType = (typeof RESIGNATION_TYPE_OPTIONS)[number]

export const RESIGNATION_TYPE_LABELS: Record<ResignationType, string> = {
  resign: 'Mundur (Quit voluntary)',
  phk: 'PHK (Termination)',
  pkwt_expire: 'PKWT Habis (Contract ended)',
}

// ─── Form schema (strings from form inputs) ───────────────────────────────────

export const kaburFormSchema = z.object({
  // Step 1 — required
  monthlySalary: z.string().min(1, 'Wajib diisi'),
  monthlyExpenses: z.string().min(1, 'Wajib diisi'),
  savings: z.string().min(1, 'Wajib diisi'),
  masaKerjaYears: z.coerce.number().int().min(0).max(50),
  resignationType: z.enum(RESIGNATION_TYPE_OPTIONS),
  outstandingDebtsMonthly: z.string().default('0'),
  dependentsCount: z.coerce.number().int().min(0).max(10).default(0),
  // Step 2 — optional
  optionalJhtBalance: z.string().optional(),
  optionalInvestmentValue: z.string().optional(),
})

export type KaburFormValues = z.infer<typeof kaburFormSchema>

// ─── API payload schema (numbers) ───────────────────────────────────────────

export const kaburApiSchema = z.object({
  monthlySalary: z.number().min(100_000).max(1_000_000_000),
  monthlyExpenses: z.number().min(0).max(1_000_000_000),
  savings: z.number().min(0).max(1_000_000_000_000),
  masaKerjaYears: z.number().int().min(0).max(50),
  resignationType: z.enum(RESIGNATION_TYPE_OPTIONS),
  outstandingDebtsMonthly: z.number().min(0).max(1_000_000_000).default(0),
  dependentsCount: z.number().int().min(0).max(10).default(0),
  optionalJhtBalance: z.number().min(0).max(1_000_000_000_000).optional(),
  optionalInvestmentValue: z.number().min(0).max(1_000_000_000_000).optional(),
})

export type KaburApiPayload = z.infer<typeof kaburApiSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parseIDR(v: string): number {
  return parseInt(v.replace(/\D/g, '') || '0', 10)
}

export function formToApiPayload(values: KaburFormValues): KaburApiPayload {
  return {
    monthlySalary: parseIDR(values.monthlySalary),
    monthlyExpenses: parseIDR(values.monthlyExpenses),
    savings: parseIDR(values.savings),
    masaKerjaYears: Number(values.masaKerjaYears),
    resignationType: values.resignationType,
    outstandingDebtsMonthly: parseIDR(values.outstandingDebtsMonthly || '0'),
    dependentsCount: Number(values.dependentsCount),
    optionalJhtBalance:
      values.optionalJhtBalance ? parseIDR(values.optionalJhtBalance) : undefined,
    optionalInvestmentValue:
      values.optionalInvestmentValue
        ? parseIDR(values.optionalInvestmentValue)
        : undefined,
  }
}
