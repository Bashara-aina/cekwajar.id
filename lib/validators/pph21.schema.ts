import { z } from "zod";

export const PayslipInputSchema = z.object({
  gross_monthly: z.number().int().positive(),
  ptkp_status: z.enum(["TK0", "K0", "K1", "K2", "K3"]),
  npwp: z.boolean(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030),
  city: z.string().min(1),
  reported_pph21: z.number().int().nonnegative().optional(),
});

export type PayslipInput = z.infer<typeof PayslipInputSchema>;

export const PropertyInputSchema = z.object({
  city: z.string().min(1),
  property_type: z.enum(["rumah", "tanah", "apartemen", "ruko"]),
  price: z.number().int().positive(),
  area_m2: z.number().positive(),
});

export type PropertyInput = z.infer<typeof PropertyInputSchema>;

export const SalaryBenchmarkInputSchema = z.object({
  job_title: z.string().min(1),
  city: z.string().min(1),
  province: z.string().optional(),
  industry: z.string().optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
  p50_idr: z.number().int().positive(),
  sample_count: z.number().int().min(0).optional(),
});

export type SalaryBenchmarkInput = z.infer<typeof SalaryBenchmarkInputSchema>;

export const BPJSInputSchema = z.object({
  grossMonthly: z.number().positive(),
  city: z.string().min(1),
});

export type BPJSInput = z.infer<typeof BPJSInputSchema>;

export const COLInputSchema = z.object({
  currentCity: z.string().min(1),
  targetCity: z.string().min(1),
});

export type COLInput = z.infer<typeof COLInputSchema>;
