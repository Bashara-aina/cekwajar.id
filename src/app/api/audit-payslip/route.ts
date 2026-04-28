import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePPh21 } from '@/lib/pph21'
import { calculateBPJS } from '@/lib/bpjs'
import { detectViolations } from '@/lib/violations'
import { z } from 'zod'

const auditSchema = z.object({
  grossSalary: z.number().min(500_000).max(1_000_000_000),
  ptkpStatus: z.string(),
  city: z.string().min(1),
  monthNumber: z.number().min(1).max(12),
  year: z.number().min(2020),
  hasNPWP: z.boolean(),
  reportedDeductions: z.object({
    pph21: z.number().min(0),
    jht: z.number().min(0),
    jp: z.number().min(0),
    jkk: z.number().min(0),
    jkm: z.number().min(0),
    kesehatan: z.number().min(0),
    takeHome: z.number().min(0),
  }),
  sessionId: z.string().optional(),
  ocrSource: z.enum(['vision', 'tesseract', 'manual']).default('manual'),
})

// In-memory rate limiting
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now - record > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, now)
    return true
  }
  
  return false
}

async function getUMK(city: string, supabase: any): Promise<number> {
  const { data } = await supabase
    .from('umk_2026')
    .select('monthly_minimum_idr')
    .ilike('city', `%${city}%`)
    .single()
  
  return data?.monthly_minimum_idr || 0
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 1 hour.' },
        { status: 429 }
      )
    }
    
    const body = await req.json()
    const parsed = auditSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 })
    }
    
    const input = parsed.data
    const supabase = await createClient()
    
    // Get current user for subscription tier
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null
    
    const { data: profile } = userId 
      ? await supabase.from('user_profiles').select('subscription_tier').eq('id', userId).single()
      : { data: null }
    
    const tier = profile?.subscription_tier || 'free'
    const isFreeTier = tier === 'free'
    
    // Get UMK for the city
    const cityUMK = await getUMK(input.city, supabase)
    
    // Calculate PPh21
    const pph21Result = calculatePPh21({
      grossSalary: input.grossSalary,
      ptkpStatus: input.ptkpStatus as any,
      monthNumber: input.monthNumber,
      year: input.year,
      hasNPWP: input.hasNPWP,
    })
    
    const calculatedPPh21 = pph21Result.isDecember 
      ? (pph21Result.decemberTax || 0)
      : pph21Result.monthlyTax
    
    // Calculate BPJS
    const bpjsResult = calculateBPJS({
      grossSalary: input.grossSalary,
      year: input.year,
      monthNumber: input.monthNumber,
    })
    
    // Detect violations
    const violationResult = detectViolations({
      grossSalary: input.grossSalary,
      reportedPPh21: input.reportedDeductions.pph21,
      calculatedPPh21,
      reportedJHT: input.reportedDeductions.jht,
      calculatedJHT: bpjsResult.employee.jht,
      reportedJP: input.reportedDeductions.jp,
      calculatedJP: bpjsResult.employee.jp,
      reportedKesehatan: input.reportedDeductions.kesehatan,
      calculatedKesehatan: bpjsResult.employee.kesehatan,
      reportedJKK: input.reportedDeductions.jkk,
      reportedJKM: input.reportedDeductions.jkm,
      cityUMK,
      takeHome: input.reportedDeductions.takeHome,
      monthNumber: input.monthNumber,
    })
    
    // Log to payslip_audits
    if (userId) {
      await supabase.from('payslip_audits').insert({
        user_id: userId,
        session_id: input.sessionId || null,
        gross_salary: input.grossSalary,
        ptkp_status: input.ptkpStatus,
        city: input.city,
        month_number: input.monthNumber,
        year: input.year,
        has_npwp: input.hasNPWP,
        reported_pph21: input.reportedDeductions.pph21,
        reported_jht: input.reportedDeductions.jht,
        reported_jp: input.reportedDeductions.jp,
        reported_jkk: input.reportedDeductions.jkk,
        reported_jkm: input.reportedDeductions.jkm,
        reported_kesehatan: input.reportedDeductions.kesehatan,
        reported_take_home: input.reportedDeductions.takeHome,
        calculated_pph21: calculatedPPh21,
        calculated_jht: bpjsResult.employee.jht,
        calculated_jp: bpjsResult.employee.jp,
        calculated_kesehatan: bpjsResult.employee.kesehatan,
        violations: violationResult.violations,
        verdict: violationResult.verdict,
        subscription_tier_at_time: tier,
      })
    }
    
    // Build response based on tier
    const response: any = {
      verdict: violationResult.verdict,
      violations: violationResult.violations.map(v => ({
        code: v.code,
        name: v.name,
        severity: v.severity,
        difference: isFreeTier ? null : v.difference,
        recommendedAction: v.recommendedAction,
      })),
      hasCritical: violationResult.hasCritical,
      hasHigh: violationResult.hasHigh,
    }
    
    // Show IDR details only for paid tiers
    if (!isFreeTier) {
      response.calculated = {
        pph21: calculatedPPh21,
        jht: bpjsResult.employee.jht,
        jp: bpjsResult.employee.jp,
        kesehatan: bpjsResult.employee.kesehatan,
        jkk: bpjsResult.employer.jkk,
        jkm: bpjsResult.employer.jkm,
      }
      response.totalShortfall = violationResult.totalShortfall
    }
    
    // Freemium upsell message for free tier
    if (isFreeTier && violationResult.violations.length > 0) {
      response.upsellMessage = `Temukan selisih IDR ${violationResult.totalShortfall.toLocaleString('id-ID')}? Buka detail lengkap dengan upgrade ke Pro — hanya IDR 49.000/bulan.`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Audit error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}
