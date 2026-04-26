// lib/constants.ts — Revenue anchors and subscription tiers
// Single source of truth for all pricing and marketing copy
// Update AVG_SHORTFALL_IDR here, flows everywhere automatically

export const REVENUE_ANCHORS = {
  /** Median 12-month under-deduction for IDR 8M earners (BPJS JHT 1% × 12 months) */
  AVG_SHORTFALL_IDR: 847_000,
  /** Single launch tier — see master_analysis §7.2 */
  PRO_PRICE_IDR: 49_000,
  /** Time-to-verdict in seconds */
  AUDIT_TIME_SECONDS: 30,
  /** Replace with live count from supabase rpc('total_audits') after Day 7 */
  AUDITS_COMPLETED: 0,
  /** 49K / typical recovery = effectively first month break-even */
  BREAK_EVEN_MONTHS: 0,
} as const

export const SUBSCRIPTION_TIERS = {
  free: { name: "Gratis", priceIdr: 0, midtransSku: null },
  pro: {
    name: "Pro",
    priceIdr: 49_000,
    midtransSku: "cekwajar-pro-monthly-49k-v1",
  },
} as const

/** @deprecated Use REVENUE_ANCHORS.PRO_PRICE_IDR directly */
export const PRICING = {
  PRO_PRICE_IDR: REVENUE_ANCHORS.PRO_PRICE_IDR,
} as const
