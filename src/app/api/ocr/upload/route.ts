import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { VISION_MONTHLY_LIMIT } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = await createServiceClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    const sessionId = formData.get('sessionId') as string || null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }
    
    // Check OCR quota
    const { data: quota } = await supabase
      .from('ocr_quota_counter')
      .select('month_count')
      .eq('month_key', new Date().toISOString().slice(0, 7))
      .single()
    
    const currentCount = quota?.month_count || 0
    
    if (currentCount >= VISION_MONTHLY_LIMIT) {
      // Fallback to Tesseract flag
      return NextResponse.json({
        needsTesseract: true,
        message: 'Vision quota exceeded, use Tesseract fallback'
      })
    }
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId || 'anonymous'}/${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await serviceSupabase
      .storage
      .from('payslips')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      })
    
    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
    
    // Get public URL
    const { data: { publicUrl } } = serviceSupabase
      .storage
      .from('payslips')
      .getPublicUrl(fileName)
    
    // Call Google Vision API
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString('base64')
    
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            imageContext: { languageHints: ['id', 'en'] },
          }],
        }),
      }
    )
    
    const visionData = await visionResponse.json()
    
    // Increment quota counter
    await serviceSupabase.rpc('increment_ocr_counter')
    
    // Extract text
    const text = visionData.responses?.[0]?.textAnnotations?.[0]?.description || ''
    
    // Parse fields from text using regex
    const extracted = parsePayslipText(text)
    
    // Calculate confidence
    const confidence = calculateOCRConfidence(extracted, visionData)
    
    return NextResponse.json({
      filePath: publicUrl,
      extracted,
      confidence,
      routing: getRoutingDecision(confidence),
      ocrSource: 'vision',
    })
  } catch (error) {
    console.error('OCR upload error:', error)
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 })
  }
}

function parsePayslipText(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  // IDR parsing helper
  const parseIDR = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, '')
    return parseInt(cleaned, 10) || 0
  }
  
  // Regex patterns
  const patterns = {
    grossSalary: /gaji\s*(?:bruto|pokok|dasar)/i,
    pph21: /pph\s*21/i,
    jhtEmployee: /jht\s*(?:karyawan|pekerja)/i,
    jpEmployee: /jp\s*(?:karyawan|pekerja)/i,
    kesehatan: /bpjs\s*kes(?:ehatan)?/i,
    takeHome: /take\s*home\s*pay/i,
  }
  
  let grossSalary = 0
  let pph21 = 0
  let jht = 0
  let jp = 0
  let kesehatan = 0
  let takeHome = 0
  
  // Simple extraction - look for numbers after keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()
    
    if (patterns.grossSalary.test(lowerLine)) {
      const match = line.match(/[\d,.]+/)
      if (match) grossSalary = parseIDR(match[0])
    }
    if (patterns.pph21.test(lowerLine)) {
      const match = line.match(/[\d,.]+/)
      if (match) pph21 = parseIDR(match[0])
    }
    if (patterns.jhtEmployee.test(lowerLine)) {
      const match = line.match(/[\d,.]+/)
      if (match) jht = parseIDR(match[0])
    }
    if (patterns.jpEmployee.test(lowerLine)) {
      const match = line.match(/[\d,.]+/)
      if (match) jp = parseIDR(match[0])
    }
    if (patterns.kesehatan.test(lowerLine)) {
      const match = line.match(/[\d,.]+/)
      if (match) kesehatan = parseIDR(match[0])
    }
    if (patterns.takeHome.test(lowerLine)) {
      const match = line.match(/[\d,.]+/)
      if (match) takeHome = parseIDR(match[0])
    }
  }
  
  return { grossSalary, pph21, jht, jp, kesehatan, takeHome }
}

function calculateOCRConfidence(extracted: any, visionData: any): number {
  let score = 0
  let count = 0
  
  if (extracted.grossSalary >= 500_000 && extracted.grossSalary <= 1_000_000_000) {
    score += 0.90
  }
  count++
  
  if (extracted.pph21 >= 0 && extracted.pph21 <= 499_000_000) {
    score += 0.85
  }
  count++
  
  if (extracted.kesehatan >= 0) {
    score += 0.80
  }
  count++
  
  if (extracted.takeHome > 0) {
    score += 0.75
  }
  count++
  
  return count > 0 ? score / count : 0
}

function getRoutingDecision(confidence: number): 'AUTO_ACCEPT' | 'SOFT_CHECK' | 'MANUAL_REQUIRED' {
  if (confidence >= 0.92) return 'AUTO_ACCEPT'
  if (confidence >= 0.80) return 'SOFT_CHECK'
  return 'MANUAL_REQUIRED'
}