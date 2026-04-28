export const SUBSCRIPTION_TIERS = {
  free: { name: 'Gratis', priceIdr: 0, midtransSku: null },
  pro:  { name: 'Pro',    priceIdr: 49_000, midtransSku: 'cekwajar-pro-monthly-49k-v1' },
} as const

export const REVENUE_ANCHORS = {
  AVG_SHORTFALL_IDR: 847_000,
  PRO_PRICE_IDR: 49_000,
  AUDIT_TIME_SECONDS: 30,
  AUDITS_COMPLETED: 0,
  BREAK_EVEN_MONTHS: 0,
} as const

export const JP_SALARY_CAPS = {
  2024: 10_042_300,
  2025: 10_547_400,
  2026: 11_086_300,
} as const

export const KESEHATAN_SALARY_CAP = 12_000_000

export const VISION_MONTHLY_LIMIT = 950

export const LIFESTYLE_MULTIPLIERS = {
  HEMAT: 0.70,
  STANDAR: 1.00,
  NYAMAN: 1.30,
} as const

export const PTKP_VALUES = {
  'TK/0': 54_000_000,
  'TK/1': 58_500_000,
  'TK/2': 63_000_000,
  'TK/3': 67_500_000,
  'K/0': 58_500_000,
  'K/1': 63_000_000,
  'K/2': 67_500_000,
  'K/3': 72_000_000,
  'K/I/0': 112_500_000,
  'K/I/1': 117_000_000,
  'K/I/2': 121_500_000,
  'K/I/3': 126_000_000,
} as const

export const TER_CATEGORIES = {
  A: ['TK/0', 'TK/1'],
  B: ['TK/2', 'TK/3', 'K/1', 'K/2'],
  C: ['K/3', 'K/I/0', 'K/I/1', 'K/I/2', 'K/I/3'],
} as const

export const VPNCP_VALUES = {
  0: 0,
  60_000_000: 0.05,
  250_000_000: 0.15,
  500_000_000: 0.25,
  5_000_000_000: 0.30,
} as const
