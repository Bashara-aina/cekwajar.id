// lib/data/regional-prices.ts
// Regional price multipliers for 10 major Indonesian cities
// Jakarta = 1.0 baseline

export interface CityData {
  cityCode: string
  cityName: string
  province: string
  /** Multiplier relative to Jakarta baseline (1.0) */
  priceMultiplier: number
  /** Approximate monthly KHL per capita (IDR) */
  monthlyKhlPerCapita: number
}

export const CITIES: CityData[] = [
  { cityCode: 'JKT', cityName: 'Jakarta',       province: 'DKI Jakarta',      priceMultiplier: 1.00, monthlyKhlPerCapita: 5_200_000 },
  { cityCode: 'SBY', cityName: 'Surabaya',      province: 'Jawa Timur',       priceMultiplier: 0.85, monthlyKhlPerCapita: 4_420_000 },
  { cityCode: 'BDG', cityName: 'Bandung',       province: 'Jawa Barat',       priceMultiplier: 0.88, monthlyKhlPerCapita: 4_576_000 },
  { cityCode: 'SMG', cityName: 'Semarang',      province: 'Jawa Tengah',      priceMultiplier: 0.80, monthlyKhlPerCapita: 4_160_000 },
  { cityCode: 'MKS', cityName: 'Makassar',      province: 'Sulawesi Selatan',  priceMultiplier: 0.82, monthlyKhlPerCapita: 4_264_000 },
  { cityCode: 'MDN', cityName: 'Medan',        province: 'Sumatera Utara',   priceMultiplier: 0.78, monthlyKhlPerCapita: 4_056_000 },
  { cityCode: 'PLB', cityName: 'Palembang',     province: 'Sumatera Selatan', priceMultiplier: 0.75, monthlyKhlPerCapita: 3_900_000 },
  { cityCode: 'MLG', cityName: 'Malang',        province: 'Jawa Timur',       priceMultiplier: 0.77, monthlyKhlPerCapita: 4_004_000 },
  { cityCode: 'JOG', cityName: 'Yogyakarta',    province: 'DI Yogyakarta',   priceMultiplier: 0.79, monthlyKhlPerCapita: 4_108_000 },
  { cityCode: 'DPS', cityName: 'Denpasar',     province: 'Bali',            priceMultiplier: 0.90, monthlyKhlPerCapita: 4_680_000 },
]

export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.cityCode, c])) as Record<string, CityData>

export function getCityByCode(code: string): CityData | undefined {
  return CITY_MAP[code]
}
