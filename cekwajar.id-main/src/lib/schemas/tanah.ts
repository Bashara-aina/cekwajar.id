// cekwajar.id — Tanah / Land Valuation Schema

import { z } from 'zod'

export type PropertyType = 'tanah_kosong' | 'rumah' | 'ruko' | 'apartemen'

export const tanahInputSchema = z.object({
  propertyType: z.enum(['tanah_kosong', 'rumah', 'ruko', 'apartemen']),
  landAreaM2: z.number().positive().describe('Luas tanah (m²)'),
  buildingAreaM2: z.number().nonnegative().optional().describe('Luas bangunan (m²)'),
  askingPrice: z.number().positive().describe('Harga minta (IDR)'),
  buildingAgeYears: z.number().nonnegative().optional().describe('Umur bangunan (tahun)'),
  province: z.string().min(1).describe('Provinsi'),
  city: z.string().min(1).describe('Kota/Kabupaten'),
  district: z.string().min(1).describe('Kecamatan'),
  landNjopPerM2: z.number().positive().describe('NJOP tanah per m² (IDR)'),
  buildingNjopPerM2: z.number().nonnegative().optional().describe('NJOP bangunan per m² (IDR)'),
  riskMultiplier: z.number().min(0.1).max(2.0).optional().default(1.0).describe('Multiplier risiko lokasi'),
  floodRisk: z.boolean().optional().default(false).describe('Rawan banjir'),
  coastalRisk: z.boolean().optional().default(false).describe('Dekat pesisir'),
  tollAccessKm: z.number().nonnegative().optional().describe('Jarak ke toll (km)'),
})

export type TanahInput = z.infer<typeof tanahInputSchema>

export type TanahVerdict = 'WAJAR' | 'KEMAHALAN' | 'MURAH_CURIGA'

export interface LandValuationResult {
  njop_reference: number
  total_njop: number
  market_estimate_low: number
  market_estimate_high: number
  asking_price: number
  asking_vs_market_delta: number
  asking_vs_market_percent: number
  verdict: TanahVerdict
  flags: string[]
}
