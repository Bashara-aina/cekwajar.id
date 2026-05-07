// lib/schemas/gaji.ts
// Zod schemas for Wajar Gaji inputs and benchmark engine

import { z } from 'zod'

export const INDUSTRIES = [
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

export const COMPANY_SIZES = ['1-50', '51-200', '201-500', '501-1000', '1000+'] as const

export const EDUCATION_LEVELS = [
  'SMA / SMK',
  'D3 / Diploma',
  'S1 / Sarjana',
  'S2 / Magister',
  'S3 / Doktor',
] as const

export const EXPERIENCE_BUCKETS = ['0-2', '3-5', '6-10', '10+'] as const

export const gajiInputSchema = z.object({
  jobTitle: z.string().min(1, 'Judul pekerjaan diperlukan'),
  yearsExperience: z.number().int().min(1).max(30, 'Maksimal 30 tahun'),
  industry: z.string().optional(),
  city: z.string().min(1, 'Pilih kota'),
  companySize: z.string().optional(),
  grossMonthly: z.number().min(100_000, 'Gaji minimal Rp 100.000'),
  totalCompensation: z.number().optional(),
  educationLevel: z.string().optional(),
})

export type GajiInput = z.infer<typeof gajiInputSchema>

export interface BenchmarkInput {
  jobTitle: string
  yearsExperience: number
  industry: string
  city: string
  grossMonthly: number
}

export interface BenchmarkResult {
  percentile: number // 0-100
  p25: number
  p50: number // median
  p75: number
  p90: number
  verdict: 'UNDERPAID' | 'FAIR' | 'ABOVE_MARKET' | 'INSUFFICIENT_DATA'
  deltaPercent: number // how far above/below median
  comparableCount: number // how many data points in segment
}