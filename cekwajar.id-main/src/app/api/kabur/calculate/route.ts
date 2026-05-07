// cekwajar.id — POST /api/kabur/calculate

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { checkRateLimitAnon, checkRateLimitAuth } from '@/lib/rate-limit'
import { calculateRunway } from '@/lib/engines'
import { kaburApiSchema } from '@/lib/schemas/kabur'

export const runtime = 'nodejs'

type KaburErrorCode =
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'NETWORK'
  | 'RATE_LIMITED'
  | 'CALC_FAILED'
  | 'UNKNOWN'

type PreparationItem = { text: string; done: boolean }

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.split(',')[0].trim()
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

function buildChecklist(breakdown: ReturnType<typeof calculateRunway>, monthlySalary: number): PreparationItem[] {
  const items: PreparationItem[] = []

  if (breakdown.runwayMonths < 6) {
    items.push(
      { text: 'Tambah dana darurat — target 6 bulan pengeluaran', done: false },
      { text: 'Cicilan utang selesai sebelum resign', done: false },
    )
  } else if (breakdown.runwayMonths < 12) {
    items.push(
      { text: 'Punya 3 bulan biaya hidup sebagai emergency fund', done: false },
      { text: 'Siapkan rencana pencarian kerja 30-60 hari', done: false },
    )
  } else {
    items.push({ text: 'Dana darurat sudah memadai', done: false })
  }

  if (!breakdown.jhtWithdrawal.eligible && breakdown.jhtWithdrawal.amountIDR > 0) {
    items.push({
      text: `JHT Rp ${breakdown.jhtWithdrawal.amountIDR.toLocaleString('id-ID')} baru bisa dicairkan di usia 56`,
      done: false,
    })
  }

  if (breakdown.severanceIDR > 0) {
    items.push({
      text: `Pesangon + UPH Rp ${breakdown.severanceIDR.toLocaleString('id-ID')} sebagai modal transisi`,
      done: false,
    })
  }

  items.push(
    { text: 'Kartu BPJS Kesehatan aktif (mandiri / keluarga)', done: false },
    { text: 'Status NPWP sudah update untuk pajak pesangon', done: false },
  )

  return items
}

export async function POST(request: NextRequest) {
  let body: z.infer<typeof kaburApiSchema>
  try {
    const json = await request.json()
    body = kaburApiSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR' satisfies KaburErrorCode, message: err.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { code: 'INVALID_JSON' satisfies KaburErrorCode, message: 'Malformed JSON body' },
      { status: 400 }
    )
  }

  const ip = getClientIp(request)
  const { user } = await getCurrentUser()

  // Rate limiting
  if (user) {
    const authCheck = await checkRateLimitAuth(user.id)
    if (!authCheck.allowed) {
      return NextResponse.json(
        {
          code: 'RATE_LIMITED' satisfies KaburErrorCode,
          message: `Terlalu banyak request. Coba lagi dalam ${Math.ceil((authCheck.resetAt - Date.now()) / 60000)} menit.`,
        },
        { status: 429 }
      )
    }
  } else {
    const anonCheck = await checkRateLimitAnon(ip)
    if (!anonCheck.allowed) {
      return NextResponse.json(
        {
          code: 'RATE_LIMITED' satisfies KaburErrorCode,
          message: `Terlalu banyak request. Coba lagi dalam ${Math.ceil((anonCheck.resetAt - Date.now()) / 60000)} menit.`,
        },
        { status: 429 }
      )
    }
  }

  try {
    const breakdown = calculateRunway({
      monthlySalary: body.monthlySalary,
      monthlyExpenses: body.monthlyExpenses,
      savings: body.savings,
      masaKerjaYears: body.masaKerjaYears,
      resignationType: body.resignationType,
      outstandingDebtsMonthly: body.outstandingDebtsMonthly ?? 0,
      dependentsCount: body.dependentsCount ?? 0,
      optionalJhtBalance: body.optionalJhtBalance,
      optionalInvestmentValue: body.optionalInvestmentValue,
    })

    const checklist = buildChecklist(breakdown, body.monthlySalary)

    return NextResponse.json({
      success: true,
      data: {
        runwayMonths: breakdown.runwayMonths,
        verdict: breakdown.verdict,
        verdictLabel: breakdown.verdictLabel,
        verdictColor: breakdown.verdictColor,
        breakdown,
        checklist,
      },
    })
  } catch {
    return NextResponse.json(
      { code: 'CALC_FAILED' satisfies KaburErrorCode, message: 'Kalkulasi gagal. Coba lagi.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
