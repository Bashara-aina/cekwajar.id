// app/api/hidup/calculate/route.ts
// POST /api/hidup/calculate — KHL adequacy calculation

import { NextRequest, NextResponse } from 'next/server'
import { hidupInputSchema } from '@/lib/schemas/hidup'
import { calculateKhl } from '@/lib/engines/khl'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = hidupInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Validasi gagal' } },
        { status: 400 }
      )
    }

    const { netIncome, cityCode, householdSize, housingStatus, transportMode, actualSpending } = parsed.data

    const result = calculateKhl({
      netIncome,
      cityCode,
      householdSize,
      housingStatus,
      transportMode,
      actualSpending,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    )
  }
}
