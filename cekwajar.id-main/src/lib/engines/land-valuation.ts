// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Land Valuation Engine
// Phase 1: NJOP-based estimation (no auto-lookup — data partnerships not ready)
// ══════════════════════════════════════════════════════════════════════════════

import type { LandValuationResult, PropertyType } from '@/lib/schemas/tanah'

// ─── Market Multipliers ──────────────────────────────────────────────────────
// Applied to NJOP baseline to derive market estimate range.
// Source: Empirical analysis of Jakarta property market (2024)
// tanah_kosong: land only — narrowest multiplier (land appreciates slower)
// rumah: land + building — mid range
// ruko: commercial premium — wider, higher floor
// apartemen: strata title — varies by developer/location

const PROPERTY_MULTIPLIERS: Record<
  PropertyType,
  { low: number; high: number }
> = {
  tanah_kosong: { low: 1.5, high: 2.5 },
  rumah:        { low: 2.0, high: 3.5 },
  ruko:         { low: 2.5, high: 4.0 },
  apartemen:    { low: 2.0, high: 3.0 },
}

// ─── Building Depreciation ───────────────────────────────────────────────────
// Value depreciates 1% per year of age, floor at 50% of new building value
// New building value = land_value × (building_njop / land_njop) × building_area

function depreciateBuildingValue(
  buildingNjopPerM2: number,
  buildingAreaM2: number,
  buildingAgeYears: number
): number {
  const newValue = buildingNjopPerM2 * buildingAreaM2
  const depreciation = Math.min(0.5, 1 - buildingAgeYears * 0.01)
  return Math.round(newValue * depreciation)
}

// ─── Flags Generation ────────────────────────────────────────────────────────

type FlagCode =
  | 'FLOOD_RISK'
  | 'COASTAL_RISK'
  | 'NJOP_BELOW_MARKET'
  | 'ASKING_ABOVE_MARKET_HIGH'
  | 'ASKING_BELOW_MARKET_LOW'
  | 'TOLL_ACCESS_FAR'
  | 'NEWER_CONSTRUCTION'

interface Flag {
  code: FlagCode
  message: string
}

function generateFlags(params: {
  askingPrice: number
  marketEstimateLow: number
  marketEstimateHigh: number
  landNjopPerM2: number
  marketPricePerM2: number
  buildingAgeYears?: number
  floodRisk?: boolean
  coastalRisk?: boolean
  tollAccessKm?: number
  propertyType: PropertyType
}): Flag[] {
  const flags: Flag[] = []

  if (params.floodRisk) {
    flags.push({
      code: 'FLOOD_RISK',
      message: 'Zona banjir tinggi — pastikan kondisi lingkungan dan drainase',
    })
  }

  if (params.coastalRisk) {
    flags.push({
      code: 'COASTAL_RISK',
      message: 'Dekat area pesisir — perhatikan risiko abrasi dan roboh',
    })
  }

  // Flag if NJOP per m² is suspiciously low vs market
  const ratio = params.marketPricePerM2 / params.landNjopPerM2
  if (ratio > 4.0) {
    flags.push({
      code: 'NJOP_BELOW_MARKET',
      message: `NJOP daerah ini signifikan di bawah harga pasar (${ratio.toFixed(1)}× lebih murah)`,
    })
  }

  // Flag if asking > 20% above market high
  if (params.askingPrice > params.marketEstimateHigh * 1.2) {
    flags.push({
      code: 'ASKING_ABOVE_MARKET_HIGH',
      message: 'Harga minta >20% di atas estimasi pasar — ruang negosiasi terbuka',
    })
  }

  // Flag if asking < 70% of market low (suspiciously cheap)
  if (params.askingPrice < params.marketEstimateLow * 0.7) {
    flags.push({
      code: 'ASKING_BELOW_MARKET_LOW',
      message: 'Harga minta jauh di bawah estimasi pasar — perlu investigasi tambahan',
    })
  }

  if (params.tollAccessKm !== undefined && params.tollAccessKm > 5) {
    flags.push({
      code: 'TOLL_ACCESS_FAR',
      message: `Akses toll >${params.tollAccessKm}km — pastikan konektivitas`,
    })
  }

  if (params.buildingAgeYears !== undefined && params.buildingAgeYears < 3 && params.propertyType !== 'tanah_kosong') {
    flags.push({
      code: 'NEWER_CONSTRUCTION',
      message: `Bangunan relatif baru (${params.buildingAgeYears} tahun) — nilai bangunan masih tinggi`,
    })
  }

  return flags
}

// ─── Verdict Determination ────────────────────────────────────────────────────

function determineVerdict(params: {
  askingPrice: number
  marketEstimateLow: number
  marketEstimateHigh: number
}): LandValuationResult['verdict'] {
  if (params.askingPrice < params.marketEstimateLow * 0.7) {
    return 'MURAH_CURIGA'
  }
  if (params.askingPrice > params.marketEstimateHigh * 1.2) {
    return 'KEMAHALAN'
  }
  if (
    params.askingPrice >= params.marketEstimateLow &&
    params.askingPrice <= params.marketEstimateHigh
  ) {
    return 'WAJAR'
  }
  return 'WAJAR' // fallback — within range
}

// ─── Main Engine Function ─────────────────────────────────────────────────────

export interface LandValuationInput {
  // User inputs
  propertyType: PropertyType
  landAreaM2: number
  buildingAreaM2?: number
  askingPrice: number
  buildingAgeYears?: number
  // Location (for future NJOP lookup)
  province: string
  city: string
  district: string
  // NJOP reference values (manual input or from seed)
  landNjopPerM2: number
  buildingNjopPerM2?: number
  // Optional location risk factors
  riskMultiplier?: number
  floodRisk?: boolean
  coastalRisk?: boolean
  tollAccessKm?: number
}

export function calculateLandValuation(
  input: LandValuationInput
): LandValuationResult {
  const {
    propertyType,
    landAreaM2,
    buildingAreaM2,
    askingPrice,
    buildingAgeYears = 0,
    landNjopPerM2,
    buildingNjopPerM2,
    riskMultiplier = 1.0,
  } = input

  const multiplier = PROPERTY_MULTIPLIERS[propertyType]

  // ── Total NJOP calculation ────────────────────────────────────────────────
  const landNjopTotal = landNjopPerM2 * landAreaM2
  let buildingNjopTotal = 0

  if (
    buildingAreaM2 !== undefined &&
    buildingAreaM2 > 0 &&
    buildingNjopPerM2 !== undefined
  ) {
    buildingNjopTotal = depreciateBuildingValue(
      buildingNjopPerM2,
      buildingAreaM2,
      buildingAgeYears
    )
  }

  const totalNjop = landNjopTotal + buildingNjopTotal

  // ── Market estimate (NJOP × multiplier × risk) ─────────────────────
  const marketEstimateLow = Math.round(totalNjop * multiplier.low * riskMultiplier)
  const marketEstimateHigh = Math.round(totalNjop * multiplier.high * riskMultiplier)

  // ── Percentile position within market range ──────────────────────────────
  const askingVsMarketDelta = askingPrice - Math.round((marketEstimateLow + marketEstimateHigh) / 2)
  const askingVsMarketPercent = Math.round(
    ((askingPrice - marketEstimateLow) / (marketEstimateHigh - marketEstimateLow)) * 100
  )

  // ── Verdict ────────────────────────────────────────────────────────────
  const verdict = determineVerdict({
    askingPrice,
    marketEstimateLow,
    marketEstimateHigh,
  })

  // ── Flags ───────────────────────────────────────────────────────────────
  const marketPricePerM2 = Math.round((marketEstimateLow + marketEstimateHigh) / 2 / (landAreaM2 + (buildingAreaM2 ?? 0)))
  const flags = generateFlags({
    askingPrice,
    marketEstimateLow,
    marketEstimateHigh,
    landNjopPerM2,
    marketPricePerM2,
    buildingAgeYears: input.buildingAgeYears,
    floodRisk: input.floodRisk,
    coastalRisk: input.coastalRisk,
    tollAccessKm: input.tollAccessKm,
    propertyType,
  })

  return {
    njop_reference: landNjopPerM2,
    total_njop: totalNjop,
    market_estimate_low: marketEstimateLow,
    market_estimate_high: marketEstimateHigh,
    asking_price: askingPrice,
    asking_vs_market_delta: askingVsMarketDelta,
    asking_vs_market_percent: askingVsMarketPercent,
    verdict,
    flags: flags.map((f) => f.message),
  }
}

// ─── Format helpers (exported for UI) ─────────────────────────────────────

export function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export function formatIDRPerM2(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}/m²`
}