import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VISION_MONTHLY_LIMIT } from '@/lib/constants'

export async function GET() {
  try {
    const supabase = await createClient()
    const monthKey = new Date().toISOString().slice(0, 7)
    
    const { data: quota } = await supabase
      .from('ocr_quota_counter')
      .select('month_count')
      .eq('month_key', monthKey)
      .single()
    
    const currentCount = quota?.month_count || 0
    const available = Math.max(0, VISION_MONTHLY_LIMIT - currentCount)
    
    return NextResponse.json({
      monthKey,
      used: currentCount,
      limit: VISION_MONTHLY_LIMIT,
      available,
      source: available > 0 ? 'vision' : 'tesseract',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get quota' }, { status: 500 })
  }
}