// lib/engines/client-salary-engine.ts
// Client-side salary benchmarking engine with seeded 2026 Indonesian market data
// Privacy-first: all calculation happens in-browser, no server call needed

import type { GajiInput } from '@/lib/schemas/gaji'

// ─── Regional Multipliers ───────────────────────────────────────────────────────
// Jakarta = 1.0 baseline; other cities scaled by cost of living / market density
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  jakarta: 1.0,
  'dki jakarta': 1.0,
  'jakarta pusat': 1.0,
  'jakarta utara': 1.0,
  'jakarta selatan': 1.0,
  'jakarta timur': 1.0,
  'jakarta barat': 1.0,
  surabaya: 0.85,
  bandung: 0.80,
  semarang: 0.78,
  yogyakarta: 0.75,
  malang: 0.73,
  tangerang: 0.82,
  'tangerang selatan': 0.82,
  bekasi: 0.83,
  depok: 0.81,
  bogor: 0.79,
  medan: 0.75,
  palembang: 0.73,
  makassar: 0.74,
  denpasar: 0.76,
  manado: 0.72,
  balikpapan: 0.78,
  samarinda: 0.73,
  pontianak: 0.72,
  serang: 0.74,
  sidoarjo: 0.80,
  // Tier 2/3 cities
  'jawa timur': 0.70,
  'jawa tengah': 0.70,
  'jawa barat': 0.72,
  sumatera: 0.68,
  sulawesi: 0.69,
  kalimantan: 0.71,
  default: 0.70,
}

// ─── Experience Scaling ────────────────────────────────────────────────────────
// Applied as multiplier to P50 to get role-specific range
const EXPERIENCE_SCALING: Record<string, number> = {
  '0-2': 0.70,
  '0': 0.70,
  '1': 0.70,
  '2': 0.72,
  '3-5': 1.0,
  '3': 0.95,
  '4': 1.0,
  '5': 1.08,
  '6-10': 1.30,
  '6': 1.18,
  '7': 1.24,
  '8': 1.27,
  '9': 1.29,
  '10': 1.32,
  '10+': 1.60,
  '11': 1.42,
  '12': 1.48,
  '15': 1.55,
  '20': 1.65,
}

// ─── Seeded 2026 Indonesian Market Data (P50 monthly gross in IDR) ──────────────
// Covers tech, finance, healthcare, operations, marketing, engineering
// Base P50 for Jakarta; other regions use regional multipliers
interface RoleData {
  title: string
  industry: string
  jakartaP50: number // Monthly gross P50 for Jakarta
}

const SEEDED_SALARY_DATA: RoleData[] = [
  // Technology
  { title: 'Software Engineer', industry: 'Teknologi Informasi', jakartaP50: 14_000_000 },
  { title: 'Backend Developer', industry: 'Teknologi Informasi', jakartaP50: 13_000_000 },
  { title: 'Frontend Developer', industry: 'Teknologi Informasi', jakartaP50: 12_000_000 },
  { title: 'Full Stack Developer', industry: 'Teknologi Informasi', jakartaP50: 15_000_000 },
  { title: 'Data Analyst', industry: 'Teknologi Informasi', jakartaP50: 10_000_000 },
  { title: 'Data Scientist', industry: 'Teknologi Informasi', jakartaP50: 18_000_000 },
  { title: 'DevOps Engineer', industry: 'Teknologi Informasi', jakartaP50: 16_000_000 },
  { title: 'Mobile Developer', industry: 'Teknologi Informasi', jakartaP50: 14_000_000 },
  { title: 'QA Engineer', industry: 'Teknologi Informasi', jakartaP50: 9_000_000 },
  { title: 'IT Support', industry: 'Teknologi Informasi', jakartaP50: 6_500_000 },
  { title: 'System Administrator', industry: 'Teknologi Informasi', jakartaP50: 10_000_000 },
  { title: 'Cybersecurity Analyst', industry: 'Teknologi Informasi', jakartaP50: 15_000_000 },
  { title: 'Machine Learning Engineer', industry: 'Teknologi Informasi', jakartaP50: 22_000_000 },
  { title: 'Cloud Engineer', industry: 'Teknologi Informasi', jakartaP50: 17_000_000 },
  // Finance & Accounting
  { title: 'Accounting Staff', industry: 'Perbankan & Keuangan', jakartaP50: 7_500_000 },
  { title: 'Finance Staff', industry: 'Perbankan & Keuangan', jakartaP50: 8_000_000 },
  { title: 'Financial Analyst', industry: 'Perbankan & Keuangan', jakartaP50: 12_000_000 },
  { title: 'Tax Consultant', industry: 'Perbankan & Keuangan', jakartaP50: 15_000_000 },
  { title: 'Auditor', industry: 'Perbankan & Keuangan', jakartaP50: 13_000_000 },
  { title: 'Credit Analyst', industry: 'Perbankan & Keuangan', jakartaP50: 10_000_000 },
  { title: 'Actuary', industry: 'Perbankan & Keuangan', jakartaP50: 20_000_000 },
  // Healthcare
  { title: 'Nurse', industry: 'Kesehatan & Farmasi', jakartaP50: 7_000_000 },
  { title: 'Pharmacist', industry: 'Kesehatan & Farmasi', jakartaP50: 8_500_000 },
  { title: 'Medical Staff', industry: 'Kesehatan & Farmasi', jakartaP50: 10_000_000 },
  { title: 'Hospital Administrator', industry: 'Kesehatan & Farmasi', jakartaP50: 14_000_000 },
  { title: 'Physical Therapist', industry: 'Kesehatan & Farmasi', jakartaP50: 7_500_000 },
  // Marketing & Sales
  { title: 'Marketing Staff', industry: 'Retail & E-commerce', jakartaP50: 7_000_000 },
  { title: 'Digital Marketing', industry: 'Retail & E-commerce', jakartaP50: 8_500_000 },
  { title: 'Sales Executive', industry: 'Retail & E-commerce', jakartaP50: 7_000_000 },
  { title: 'Business Development', industry: 'Konsultan & Profesional', jakartaP50: 12_000_000 },
  { title: 'Content Creator', industry: 'Media & Entertainment', jakartaP50: 7_500_000 },
  { title: 'SEO Specialist', industry: 'Retail & E-commerce', jakartaP50: 8_000_000 },
  // Operations & HR
  { title: 'HRD Officer', industry: 'Konsultan & Profesional', jakartaP50: 8_000_000 },
  { title: 'HR Manager', industry: 'Konsultan & Profesional', jakartaP50: 14_000_000 },
  { title: 'Recruitment Specialist', industry: 'Konsultan & Profesional', jakartaP50: 7_000_000 },
  { title: 'Operations Manager', industry: 'Transportasi & Logistik', jakartaP50: 13_000_000 },
  { title: 'Supply Chain Staff', industry: 'Transportasi & Logistik', jakartaP50: 7_500_000 },
  { title: 'Logistics Coordinator', industry: 'Transportasi & Logistik', jakartaP50: 6_500_000 },
  { title: 'Procurement Staff', industry: 'Transportasi & Logistik', jakartaP50: 7_000_000 },
  // Engineering
  { title: 'Civil Engineer', industry: 'Properti & Real Estate', jakartaP50: 10_000_000 },
  { title: 'Mechanical Engineer', industry: 'Manufaktur', jakartaP50: 9_500_000 },
  { title: 'Electrical Engineer', industry: 'Manufaktur', jakartaP50: 10_000_000 },
  { title: 'Project Engineer', industry: 'Properti & Real Estate', jakartaP50: 12_000_000 },
  // Design
  { title: 'UI/UX Designer', industry: 'Teknologi Informasi', jakartaP50: 12_000_000 },
  { title: 'Graphic Designer', industry: 'Media & Entertainment', jakartaP50: 7_000_000 },
  { title: 'Product Designer', industry: 'Teknologi Informasi', jakartaP50: 13_000_000 },
  // Education & Government
  { title: 'Teacher', industry: 'Pendidikan', jakartaP50: 5_500_000 },
  { title: 'Lecturer', industry: 'Pendidikan', jakartaP50: 10_000_000 },
  { title: 'Civil Servant (PNS)', industry: 'Pemerintahan', jakartaP50: 8_000_000 },
  // General
  { title: 'General Affairs', industry: 'Lainnya', jakartaP50: 6_500_000 },
  { title: 'Office Manager', industry: 'Lainnya', jakartaP50: 9_000_000 },
  { title: 'Customer Service', industry: 'Lainnya', jakartaP50: 5_500_000 },
  { title: 'Admin Staff', industry: 'Lainnya', jakartaP50: 5_000_000 },
  { title: 'Legal Officer', industry: 'Konsultan & Profesional', jakartaP50: 11_000_000 },
  { title: 'Compliance Officer', industry: 'Perbankan & Keuangan', jakartaP50: 12_000_000 },
]

// ─── Lookup Helpers ────────────────────────────────────────────────────────────

function getRegionalMultiplier(city: string): number {
  const normalized = city.toLowerCase().trim()
  return REGIONAL_MULTIPLIERS[normalized] ?? REGIONAL_MULTIPLIERS.default
}

function getExperienceMultiplier(yearsExp: number): number {
  if (yearsExp <= 2) return EXPERIENCE_SCALING['0-2']
  if (yearsExp <= 5) return EXPERIENCE_SCALING['3-5']
  if (yearsExp <= 10) return EXPERIENCE_SCALING['6-10']
  return EXPERIENCE_SCALING['10+']
}

function findRoleData(jobTitle: string): RoleData | null {
  const normalized = jobTitle.toLowerCase().trim()
  return (
    SEEDED_SALARY_DATA.find(r => r.title.toLowerCase() === normalized) ?? null
  )
}

// Fuzzy match: returns roles where title contains all words from input
function fuzzyFindRoles(input: string): RoleData[] {
  const words = input.toLowerCase().trim().split(/\s+/)
  if (words.length === 0) return []
  return SEEDED_SALARY_DATA.filter(r => {
    const titleLower = r.title.toLowerCase()
    return words.every(w => titleLower.includes(w))
  }).slice(0, 5)
}

// ─── Percentile Helpers ────────────────────────────────────────────────────────

// Interpolate percentile position (0-100) of a value within a range
function interpolatePercentile(
  value: number,
  p25: number,
  p75: number
): number {
  if (value <= p25) return 25 * (value / p25)
  if (value >= p75) return 75 + 25 * Math.min(1, (value - p75) / p75)
  // Between P25 and P75 → 25-75 range
  return 25 + 50 * ((value - p25) / (p75 - p25))
}

// ─── Main Benchmark Function ───────────────────────────────────────────────────

export interface ClientBenchmarkResult {
  percentile: number // 0-100
  p25: number
  p50: number
  p75: number
  p90: number
  verdict: 'UNDERPAID' | 'FAIR' | 'ABOVE_MARKET'
  deltaPercent: number // percentage difference from P50
  roleData: RoleData
  regionalMultiplier: number
  experienceMultiplier: number
  adjustedP50: number
  marketRange: { min: number; max: number }
}

export function calculateClientBenchmark(input: GajiInput): ClientBenchmarkResult {
  const { jobTitle, yearsExperience, city, grossMonthly } = input

  // Find role data
  let roleData = findRoleData(jobTitle)
  if (!roleData) {
    // Fall back to first fuzzy match or generic fallback
    const fuzzy = fuzzyFindRoles(jobTitle)
    roleData = fuzzy[0] ?? {
      title: jobTitle,
      industry: input.industry ?? 'Lainnya',
      jakartaP50: 8_000_000,
    }
  }

  // Calculate adjusted P50 for user's location and experience
  const regionalMult = getRegionalMultiplier(city)
  const expMult = getExperienceMultiplier(yearsExperience)

  const jakartaP50 = roleData.jakartaP50
  const regionalP50 = jakartaP50 * regionalMult
  const adjustedP50 = Math.round(regionalP50 * expMult)

  // Build P25/P75/P90 from P50
  const p25 = Math.round(adjustedP50 * 0.78)
  const p75 = Math.round(adjustedP50 * 1.28)
  const p90 = Math.round(adjustedP50 * 1.60)

  // Calculate percentile position
  let percentile = Math.round(interpolatePercentile(grossMonthly, p25, p75))
  percentile = Math.min(99, Math.max(1, percentile))

  // Determine verdict
  let verdict: ClientBenchmarkResult['verdict']
  if (percentile < 25) {
    verdict = 'UNDERPAID'
  } else if (percentile > 75) {
    verdict = 'ABOVE_MARKET'
  } else {
    verdict = 'FAIR'
  }

  // Delta from P50
  const deltaPercent = Math.round(((grossMonthly - adjustedP50) / adjustedP50) * 100)

  return {
    percentile,
    p25,
    p50: adjustedP50,
    p75,
    p90,
    verdict,
    deltaPercent,
    roleData,
    regionalMultiplier: regionalMult,
    experienceMultiplier: expMult,
    adjustedP50,
    marketRange: { min: p25, max: p90 },
  }
}

// ─── Comparable Roles ────────────────────────────────────────────────────────

export interface ComparableRole {
  title: string
  industry: string
  p50: number
  jakartaP50: number
}

export function getComparableRoles(
  jobTitle: string,
  city: string,
  yearsExperience: number,
  limit = 4
): ComparableRole[] {
  const primaryRole = findRoleData(jobTitle)
  const normalizedCity = city.toLowerCase().trim()
  const regionalMult = REGIONAL_MULTIPLIERS[normalizedCity] ?? REGIONAL_MULTIPLIERS.default
  const expMult = getExperienceMultiplier(yearsExperience)

  // Find roles in same industry, excluding the primary role
  const sameIndustry = SEEDED_SALARY_DATA.filter(
    r => r.industry === primaryRole?.industry && r.title !== primaryRole?.title
  )

  // Sort by P50 closeness to primary role
  const primaryP50 = primaryRole?.jakartaP50 ?? 10_000_000
  sameIndustry.sort((a, b) => {
    const diffA = Math.abs(a.jakartaP50 - primaryP50)
    const diffB = Math.abs(b.jakartaP50 - primaryP50)
    return diffA - diffB
  })

  return sameIndustry.slice(0, limit).map(r => ({
    title: r.title,
    industry: r.industry,
    p50: Math.round(r.jakartaP50 * regionalMult * expMult),
    jakartaP50: r.jakartaP50,
  }))
}

// ─── All Roles List ──────────────────────────────────────────────────────────

export function getAllRoles(): { title: string; industry: string }[] {
  return SEEDED_SALARY_DATA.map(r => ({ title: r.title, industry: r.industry }))
}

// ─── Industry List ─────────────────────────────────────────────────────────────

export const INDUSTRIES_CLIENT = [
  'Teknologi Informasi',
  'Perbankan & Keuangan',
  'Manufaktur',
  'Retail & E-commerce',
  'Kesehatan & Farmasi',
  'Energi & Mining',
  'Properti & Real Estate',
  'Pendidikan',
  'Hospitality & Pariwisata',
  'Transportasi & Logistik',
  'Media & Entertainment',
  'Konsultan & Profesional',
  'Pemerintahan',
  'Lainnya',
] as const

export type IndustryClient = (typeof INDUSTRIES_CLIENT)[number]
