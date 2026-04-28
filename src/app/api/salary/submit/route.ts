import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { z } from 'zod'

const submitSchema = z.object({
  jobTitle: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  grossSalary: z.number().min(0),
  experienceBucket: z.enum(['0-2', '3-5', '6-10', '10+']),
  industry: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const parsed = submitSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    
    const { jobTitle, city, province, grossSalary, experienceBucket, industry } = parsed.data
    
    // Get IP for fingerprinting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const salaryBucket = getSalaryBucket(grossSalary)
    
    // Create fingerprint
    const fingerprint = createHash('sha256')
      .update(`${ip}:${jobTitle}:${city}:${salaryBucket}`)
      .digest('hex')
      .slice(0, 16)
    
    // Check for duplicate in last 24 hours
    const { data: recent } = await supabase
      .from('salary_submissions')
      .select('id')
      .eq('submission_fingerprint', fingerprint)
      .gte('submission_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single()
    
    if (recent) {
      return NextResponse.json({ error: 'Duplicate submission' }, { status: 409 })
    }
    
    // Get UMK for outlier check
    const { data: umk } = await supabase
      .from('umk_2026')
      .select('monthly_minimum_idr')
      .ilike('city', `%${city}%`)
      .single()
    
    const umkValue = umk?.monthly_minimum_idr || 0
    if (umkValue > 0 && (grossSalary < umkValue * 0.5 || grossSalary > umkValue * 30)) {
      return NextResponse.json({ error: 'Salary outlier detected' }, { status: 400 })
    }
    
    // Insert submission
    const { error } = await supabase.from('salary_submissions').insert({
      job_title_raw: jobTitle,
      city,
      province,
      gross_salary: grossSalary,
      experience_bucket: experienceBucket,
      industry,
      submission_fingerprint: fingerprint,
      submission_date: new Date().toISOString(),
      is_validated: false,
      is_outlier: false,
    })
    
    if (error) {
      return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true, message: 'Submission received' })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

function getSalaryBucket(salary: number): string {
  if (salary < 5_000_000) return '0-5M'
  if (salary < 10_000_000) return '5-10M'
  if (salary < 15_000_000) return '10-15M'
  if (salary < 20_000_000) return '15-20M'
  if (salary < 30_000_000) return '20-30M'
  if (salary < 50_000_000) return '30-50M'
  return '50M+'
}
