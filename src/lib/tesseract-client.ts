import Tesseract from 'tesseract.js'

interface TesseractResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(
  imageBuffer: Buffer,
  onProgress?: (progress: number) => void
): Promise<TesseractResult> {
  const worker = await Tesseract.createWorker('ind', onProgress)
  
  try {
    const result = await worker.recognize(imageBuffer)
    return {
      text: result.data.text,
      confidence: result.data.confidence / 100,
    }
  } finally {
    await worker.terminate()
  }
}

export function calculateTesseractConfidence(result: TesseractResult): number {
  // Tesseract gives 0-100 confidence
  // Map to our 0-1 scale with adjusted thresholds
  if (result.confidence >= 0.80) return 0.90
  if (result.confidence >= 0.70) return 0.80
  if (result.confidence >= 0.60) return 0.70
  return 0.50
}

export function shouldUseTesseractFallback(ocrQuota: number): boolean {
  return ocrQuota <= 0
}