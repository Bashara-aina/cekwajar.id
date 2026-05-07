// lib/schemas/hidup.ts
// Zod schemas for Wajar Hidup inputs

import { z } from 'zod'

export const HOUSEHOLD_MAX = 5

export const housingStatusSchema = z.enum(['rent', 'own', 'family'])
export const transportModeSchema = z.enum(['motor', 'public', 'car'])

export const userSpendingSchema = z.object({
  food: z.number().min(0),
  housing: z.number().min(0),
  transport: z.number().min(0),
  education: z.number().min(0),
  health: z.number().min(0),
  recreation: z.number().min(0),
})

export const hidupInputSchema = z.object({
  netIncome: z.number().min(100_000).max(1_000_000_000),
  cityCode: z.string().min(1, 'Pilih kota'),
  householdSize: z.number().int().min(1).max(HOUSEHOLD_MAX),
  housingStatus: housingStatusSchema,
  transportMode: transportModeSchema,
  actualSpending: userSpendingSchema,
})
