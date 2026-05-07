// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Constants & Feature Flags
// ══════════════════════════════════════════════════════════════════════════════

import type { Tool } from '@/types'
import {
  FileText,
  TrendingUp,
  Home,
  Plane,
  Building2
} from 'lucide-react'

export const TOOLS: Tool[] = [
  { id: 'wajar-slip', name: 'Wajar Slip', href: '/wajar-slip', Icon: FileText, description: 'Cek ketidakwajaran slip gaji' },
  { id: 'wajar-gaji', name: 'Wajar Gaji', href: '/wajar-gaji', Icon: TrendingUp, description: 'Benchmark gaji berdasarkan UMK' },
  { id: 'wajar-tanah', name: 'Wajar Tanah', href: '/wajar-tanah', Icon: Home, description: 'Analisis harga properti' },
  { id: 'wajar-kabur', name: 'Wajar Kabur', href: '/wajar-kabur', Icon: Plane, description: 'Cost of living 20 negara' },
  { id: 'wajar-hidup', name: 'Wajar Hidup', href: '/wajar-hidup', Icon: Building2, description: 'PPP dan kelayakan hidup' },
]

export const SUBSCRIPTION_TIERS = {
  free: { name: 'Gratis', priceIdr: 0, midtransSku: null },
  pro:  { name: 'Pro',    priceIdr: 49_000, midtransSku: 'cekwajar-pro-monthly-49k-v1' },
} as const

export const REVENUE_ANCHORS = {
  AVG_SHORTFALL_IDR: 847_000,     // Median 12-month under-deduction for IDR 8M earners
  PRO_PRICE_IDR: 49_000,         // Single launch tier — see master_analysis §7.2
  AUDIT_TIME_SECONDS: 30,
  AUDITS_COMPLETED: 0,           // Replace with live count from supabase rpc('total_audits') after Day 7
  BREAK_EVEN_MONTHS: 0,          // 49K / typical recovery = effectively first month
} as const

export const FREE_TOOLS_LIMIT = {
  auditPerDay: 3,
  historyMonths: 0,
} as const

export const APP_NAME = 'cekwajar.id'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
