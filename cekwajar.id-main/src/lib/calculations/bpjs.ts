// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — BPJS Contribution Calculator
// JHT, JP, JKK, JKM, Kesehatan per Indonesian labor regulations
// ══════════════════════════════════════════════════════════════════════════════

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Year-aware JP salary caps — verified against BPJS SE B/1226/022026 (25 Feb 2026).
 * Source: official BPJS announcement for each year's March 1 effective date.
 * Used as authoritative fallback when DB is unreachable.
 *
 * 2027 is projected at ~5% YoY increase from 2026 (11_086_300 → 11_640_600).
 * If a future year exceeds the last defined entry, resolveJpCap will extrapolate
 * using the same growth rate and emit a console.warn.
 */
const JP_WAGE_CAPS: Record<number, number> = {
  2024: 10_042_300,
  2025: 10_547_400,
  2026: 11_086_300,
  2027: 11_640_600,
}

/**
 * Year-aware KESEHATAN salary caps.
 * KESEHATAN cap changed from 10M → 12M effective 1 Jan 2022 (SE KC/0699/032021).
 * Only update when officially announced; change is rare.
 */
const KESEHATAN_WAGE_CAPS: Record<number, number> = {
  2022: 12_000_000,
  2023: 12_000_000,
  2024: 12_000_000,
  2025: 12_000_000,
  2026: 12_000_000,
}

// ─── In-memory DB-driven cap cache ─────────────────────────────────────────────

/** Cache populated from bpjs_rates DB table on first async call */
let _jpCapCache: Record<number, number> | null = null
let _kesehatanCapCache: number | null = null
let _cacheInitialized = false

/**
 * Fetch year-specific JP cap from bpjs_rates table using the year column.
 * Returns null if no entry found — caller falls back to static map.
 * Respects March boundary: months 1-2 use prior regulatory year.
 */
export async function fetchJpCapFromDB(
  supabase: SupabaseClient,
  year: number
): Promise<number | null> {
  const { data } = await supabase
    .from('bpjs_rates')
    .select('salary_cap_idr')
    .eq('component', 'JP')
    .eq('year', year)
    .limit(1)
    .maybeSingle()

  return (data as { salary_cap_idr: number } | null)?.salary_cap_idr ?? null
}

/**
 * Fetch KESEHATAN cap from bpjs_rates table.
 * Returns null if no entry found.
 */
export async function fetchKesehatanCapFromDB(
  supabase: SupabaseClient
): Promise<number | null> {
  const { data } = await supabase
    .from('bpjs_rates')
    .select('salary_cap_idr')
    .eq('component', 'KESEHATAN')
    .is('year', null)
    .limit(1)
    .maybeSingle()

  return (data as { salary_cap_idr: number } | null)?.salary_cap_idr ?? null
}

/**
 * Pre-load caps from DB into memory cache (browser/client version).
 * Safe to call multiple times — subsequent calls are no-ops.
 * Uses createBrowserClient internally.
 */
export async function refreshBpjsCapsCache(): Promise<void> {
  if (_cacheInitialized) return
  try {
    const { createQueryClient } = await import('@/lib/db/queries')
    const supabase = createQueryClient()
    await loadCapsIntoCache(supabase)
  } catch {
    // Non-fatal: DB unreachable — will use static fallbacks
  }
}

/**
 * Pre-load caps from DB into memory cache (server version).
 * Accepts a Supabase client created with createClient() for server-side use.
 */
export async function refreshBpjsCapsCacheFromServer(
  supabase: SupabaseClient
): Promise<void> {
  if (_cacheInitialized) return
  await loadCapsIntoCache(supabase)
  _cacheInitialized = true
}

async function loadCapsIntoCache(supabase: SupabaseClient): Promise<void> {
  // Load all JP cap years in parallel
  const jpCaps: Record<number, number> = {}
  for (const year of [2024, 2025, 2026, 2027]) {
    const cap = await fetchJpCapFromDB(supabase, year)
    if (cap !== null) jpCaps[year] = cap
  }
  if (Object.keys(jpCaps).length > 0) _jpCapCache = jpCaps

  const kesehatanCap = await fetchKesehatanCapFromDB(supabase)
  if (kesehatanCap !== null) _kesehatanCapCache = kesehatanCap

  _cacheInitialized = true
}

/**
 * Module-level flag to ensure we only attempt one DB refresh per
 * serverless function invocation (prevents redundant DB hits).
 * Starts as undefined (not seen) so the first call always proceeds.
 */
let _seenBpjsCapsCacheInThisRequest = false

/**
 * Ensure the in-memory cap cache is populated.
 * Call this at the start of any route handler that uses bpjs calculations.
 * Safe to call multiple times — subsequent calls are no-ops within the same
 * serverless request lifecycle.
 */
export async function ensureBpjsCapsCache(): Promise<void> {
  if (_cacheInitialized) return
  if (_seenBpjsCapsCacheInThisRequest) return
  _seenBpjsCapsCacheInThisRequest = true
  await refreshBpjsCapsCache()
}

/**
 * Resolve JP salary cap for a given year/month.
 * Uses in-memory DB cache if available, falls back to hardcoded static map.
 * March boundary rule: months 1–2 (Jan/Feb) use PRIOR regulatory year.
 *
 * Auto-update fallback: if effectiveYear exceeds the last defined cap year,
 * extrapolates using (lastCap * 1.05^(year - lastYear)) and emits a warning.
 */
export function resolveJpCap(year: number, month: number): number {
  const effectiveYear = month >= 3 ? year : year - 1

  // Prefer DB-driven cache
  if (_jpCapCache?.[effectiveYear] != null) {
    return _jpCapCache[effectiveYear]
  }

  // Auto-update fallback: project from last defined cap if year is in the future
  const lastDefinedYear = Math.max(...Object.keys(JP_WAGE_CAPS).map(Number))
  const lastDefinedCap = JP_WAGE_CAPS[lastDefinedYear]

  if (effectiveYear > lastDefinedYear) {
    const extrapolated = Math.round(lastDefinedCap * Math.pow(1.05, effectiveYear - lastDefinedYear))
    console.warn(
      `[bpjs] JP cap for ${effectiveYear} not defined — extrapolated to ${extrapolated} ` +
      `(lastKnown=${lastDefinedCap}, 5%/yr projection). Verify against official BPJS announcement.`
    )
    return extrapolated
  }

  // Fallback to hardcoded static map (includes the 2027 entry)
  return JP_WAGE_CAPS[effectiveYear] ?? JP_WAGE_CAPS[2026]
}

/**
 * Resolve KESEHATAN salary cap.
 * Uses in-memory DB cache if available, falls back to hardcoded static map.
 * KESEHATAN cap is year-invariant but year param is accepted for future flexibility.
 */
export function resolveKesehatanCap(year?: number): number {
  if (_kesehatanCapCache != null) return _kesehatanCapCache
  const cap = year ? (KESEHATAN_WAGE_CAPS[year] ?? 12_000_000) : 12_000_000
  return cap
}

/**
 * @deprecated Use resolveJpCap(year, month) — still exported for test compat
 */
export function getJpCapForYearMonth(year: number, month: number): number {
  return resolveJpCap(year, month)
}

/**
 * KESEHATAN salary cap — year-invariant since Jan 2022.
 */
export const KESEHATAN_SALARY_CAP = 12_000_000

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BPJSInput {
  grossSalary: number
  /** JKK risk category: 0.24 (I), 0.54 (II), 0.89 (III), 1.27 (IV), 1.74 (V) */
  jkkCategory?: number
  /** Regulatory year for JP cap lookup (defaults to current year) */
  year?: number
  /** Month for JP cap lookup (1–12). Months 1–2 use prior year cap (March boundary rule). */
  month?: number
}

export interface BPJSResult {
  jhtEmployee: number
  jhtEmployer: number
  jpEmployee: number
  jpEmployer: number
  jkkEmployer: number
  jkmEmployer: number
  kesehatanEmployee: number
  kesehatanEmployer: number
  /** JP salary cap that was applied (reflects year/month/march-boundary rule) */
  jpSalaryCap: number
  jpBase: number
  kesehatanBase: number
  kesehatanSalaryCap: number
}

// ─── Calculator ───────────────────────────────────────────────────────────────

/**
 * Calculate all BPJS contributions for an employee.
 *
 * JKK/JKM: employer-only, no salary cap.
 * JHT: employee 2% + employer 3.7%, uncapped.
 * JP: employee 1% + employer 2%, capped per regulatory year with March boundary rule.
 * KESEHATAN: employee 1% + employer 4%, capped (currently IDR 12M, year-aware).
 *
 * Caps are resolved via resolveJpCap() and resolveKesehatanCap(), which use
 * an in-memory DB cache (populated by refreshBpjsCapsCache) with static fallbacks.
 * The cache is NOT auto-populated on every call — call refreshBpjsCapsCache() in
 * the route/request lifecycle for production use.
 */
export function calculateBPJS(input: BPJSInput): BPJSResult {
  const {
    grossSalary,
    jkkCategory = 0.24,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
  } = input

  const jpSalaryCap = resolveJpCap(year, month)
  const jpBase = Math.min(grossSalary, jpSalaryCap)

  const kesehatanSalaryCap = resolveKesehatanCap(year)
  const kesehatanBase = Math.min(grossSalary, kesehatanSalaryCap)

  return {
    jhtEmployee: Math.round(grossSalary * 0.02),
    jhtEmployer: Math.round(grossSalary * 0.037),
    jpEmployee: Math.round(jpBase * 0.01),
    jpEmployer: Math.round(jpBase * 0.02),
    jkkEmployer: Math.round(grossSalary * (jkkCategory / 100)),
    jkmEmployer: Math.round(grossSalary * 0.003),
    kesehatanEmployee: Math.round(kesehatanBase * 0.01),
    kesehatanEmployer: Math.round(kesehatanBase * 0.04),
    jpSalaryCap,
    jpBase,
    kesehatanBase,
    kesehatanSalaryCap,
  }
}