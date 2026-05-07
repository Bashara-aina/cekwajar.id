'use client'

// app/wajar-hidup/page.tsx
// Wajar Hidup — Cost of Living Adequacy (KHL Calculator)
// Phase 1: Static KHL calculator with manual spending input

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Calculator, ChevronRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { CITIES } from '@/lib/data/regional-prices'
import { calculateKhl, type HousingStatus, type TransportMode, type KhlResult } from '@/lib/engines/khl'
import { VerdictCard } from '@/components/hidup/VerdictCard'
import { KhlBreakdown } from '@/components/hidup/KhlBreakdown'
import { AdequacyGauge } from '@/components/hidup/AdequacyGauge'

type PageState = 'INPUT' | 'CALCULATING' | 'RESULT' | 'ERROR'

function fmtIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function parseIDR(v: string) {
  return parseInt(v.replace(/\D/g, '') || '0', 10)
}

// ── Step 1: Income + Household ───────────────────────────────────────────────

interface Step1Values {
  netIncome: string
  cityCode: string
  householdSize: string
  housingStatus: HousingStatus
  transportMode: TransportMode
}

// ── Step 2: Actual spending by category ───────────────────────────────────────

interface SpendingValues {
  food: string
  housing: string
  transport: string
  education: string
  health: string
  recreation: string
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function WajarHidupPage() {
  const [pageState, setPageState] = useState<PageState>('INPUT')
  const [step, setStep] = useState<1 | 2>(1)
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<KhlResult | null>(null)

  const [s1, setS1] = useState<Step1Values>({
    netIncome: '',
    cityCode: '',
    householdSize: '1',
    housingStatus: 'rent',
    transportMode: 'motor',
  })

  const [s2, setS2] = useState<SpendingValues>({
    food: '',
    housing: '',
    transport: '',
    education: '',
    health: '',
    recreation: '',
  })

  const canGoToStep2 =
    !!s1.netIncome &&
    parseIDR(s1.netIncome) >= 100_000 &&
    !!s1.cityCode &&
    !!s1.householdSize

  function goToStep2() {
    if (!canGoToStep2) return
    setStep(2)
  }

  async function handleSubmit() {
    const income = parseIDR(s1.netIncome)
    const spending = {
      food: parseIDR(s2.food),
      housing: parseIDR(s2.housing),
      transport: parseIDR(s2.transport),
      education: parseIDR(s2.education),
      health: parseIDR(s2.health),
      recreation: parseIDR(s2.recreation),
    }

    if (Object.values(spending).every((v) => v === 0)) {
      setErrorMsg('Isi minimal satu kategori pengeluaran.')
      return
    }

    setPageState('CALCULATING')
    setErrorMsg('')

    // Client-side only for Phase 1
    await new Promise((r) => setTimeout(r, 800))

    try {
      const calcResult = calculateKhl({
        netIncome: income,
        cityCode: s1.cityCode,
        householdSize: parseInt(s1.householdSize, 10),
        housingStatus: s1.housingStatus,
        transportMode: s1.transportMode,
        actualSpending: spending,
      })
      setResult(calcResult)
      setPageState('RESULT')
    } catch (err) {
      setPageState('ERROR')
      setErrorMsg(err instanceof Error ? err.message : 'Kalkulasi gagal.')
    }
  }

  function reset() {
    setPageState('INPUT')
    setStep(1)
    setResult(null)
    setErrorMsg('')
  }

  // ── INPUT STEP 1 ─────────────────────────────────────────────────────────────
  if (pageState === 'INPUT' && step === 1) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-10">
          <div className="mb-6 text-center">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Cek Kebutuhan Hidup Layak</h1>
            <p className="mt-1 text-sm text-slate-500">
              Berdasarkan KHL Permenaker 18/2022 — 64 komponen kebutuhan
            </p>
          </div>

          <Card>
            <CardContent className="space-y-5 p-6">
              {/* Net Income */}
              <div>
                <Label htmlFor="netIncome">Gaji Take-Home /bulan *</Label>
                <Input
                  id="netIncome"
                  placeholder="5.000.000"
                  inputMode="numeric"
                  className="mt-1"
                  value={s1.netIncome}
                  onChange={(e) => setS1((p) => ({ ...p, netIncome: e.target.value }))}
                />
              </div>

              {/* City */}
              <div>
                <Label>Kota *</Label>
                <Select
                  onValueChange={(v) => setS1((p) => ({ ...p, cityCode: v }))}
                  value={s1.cityCode}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih kota..." /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c.cityCode} value={c.cityCode}>
                        {c.cityName} ({c.province})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Household size */}
              <div>
                <Label htmlFor="householdSize">JumlahART (Anggota Rumah Tangga)</Label>
                <Select
                  onValueChange={(v) => setS1((p) => ({ ...p, householdSize: v }))}
                  value={s1.householdSize}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} orang{n > 1 ? ' (multiplier ×)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Housing */}
              <div>
                <Label>Status Kepemilikan Rumah</Label>
                <Select
                  onValueChange={(v) => setS1((p) => ({ ...p, housingStatus: v as HousingStatus }))}
                  value={s1.housingStatus}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Menyewa / kontrakan</SelectItem>
                    <SelectItem value="own">Milik sendiri</SelectItem>
                    <SelectItem value="family">Numpham di keluarga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transport */}
              <div>
                <Label>Moda Transportasi Utama</Label>
                <Select
                  onValueChange={(v) => setS1((p) => ({ ...p, transportMode: v as TransportMode }))}
                  value={s1.transportMode}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motor">Motor pribadi</SelectItem>
                    <SelectItem value="public">Transportasi umum</SelectItem>
                    <SelectItem value="car">Mobil pribadi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <Button
                onClick={goToStep2}
                disabled={!canGoToStep2}
                className="w-full"
              >
                Lanjut ke Pengeluaran <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-slate-400">
            Data tidak disimpan — semua kalkulasi di browser kamu
          </p>
        </div>
      </div>
    )
  }

  // ── INPUT STEP 2 ─────────────────────────────────────────────────────────────
  if (pageState === 'INPUT' && step === 2) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-10">
          <button
            onClick={() => setStep(1)}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>

          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Pengeluaran Bulanan</h1>
            <p className="text-sm text-slate-500">
              Masukkan pengeluaran aktual kamu per kategori
            </p>
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              {(
                [
                  { key: 'food', label: 'Makanan & Minuman' },
                  { key: 'housing', label: 'Perumahan (sewa/listrik/air)' },
                  { key: 'transport', label: 'Transportasi (bensin/ojol/tol)' },
                  { key: 'education', label: 'Pendidikan & Buku' },
                  { key: 'health', label: 'Kesehatan' },
                  { key: 'recreation', label: 'Rekreasi & Lainnya' },
                ] as { key: keyof SpendingValues; label: string }[]
              ).map(({ key, label }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    placeholder="0"
                    inputMode="numeric"
                    className="mt-1"
                    value={s2[key]}
                    onChange={(e) => setS2((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}

              <Separator />

              <Button onClick={handleSubmit} className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Cek Kecukupan Hidup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (pageState === 'CALCULATING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="mx-4 max-w-sm w-full">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="font-medium text-slate-700">Menghitung KHL...</p>
              <p className="mt-1 text-sm text-slate-500">Benchmark 64 komponen Permenaker 18/2022</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── ERROR ───────────────────────────────────────────────────────────────────
  if (pageState === 'ERROR') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="mx-4 max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="font-semibold text-red-800">Terjadi Kesalahan</p>
            <p className="text-sm text-red-600">{errorMsg}</p>
            <Button onClick={reset} variant="outline" className="mt-2">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (pageState === 'RESULT' && result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <button
            onClick={reset}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Hitung Lagi
          </button>

          <div className="space-y-5">
            <VerdictCard result={result} currencyFmt={fmtIDR} />

            <AdequacyGauge
              ratio={result.adequacyRatio}
              labels={{ low: 'Di bawah KHL', mid: 'Pas-pasan', high: 'Layak & Sostenible' }}
            />

            <KhlBreakdown
              breakdown={result.breakdown}
              cityName={result.cityName}
              currencyFmt={fmtIDR}
            />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <strong>Disclaimer:</strong> Hasil kalkulasi bersifat indikatif berdasarkan KHL Permenaker 18/2022.
              Preferensi gaya hidup, lokasi spesifik, dan kondisi keluarga mempengaruhi kebutuhan sebenarnya.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
