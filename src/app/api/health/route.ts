import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: false,
    vision: false,
    midtrans: false,
  }
  
  try {
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('user_profiles').select('id').limit(1)
    checks.db = !dbError
  } catch {
    checks.db = false
  }
  
  checks.vision = !!process.env.GOOGLE_VISION_API_KEY
  checks.midtrans = !!process.env.MIDTRANS_SERVER_KEY
  
  const allHealthy = Object.entries(checks).every(([k, v]) => k === 'status' || k === 'timestamp' || v === true)
  
  return NextResponse.json(checks, { status: allHealthy ? 200 : 503 })
}
