'use client'

// app/wajar-gaji/result/[id]/page.tsx
// Result page with chart, meter, verdict card

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BenchmarkChart } from '@/components/gaji/BenchmarkChart'
import { PercentileMeter } from '@/components/gaji/PercentileMeter'
import { VerdictCard } from '@/components/gaji/VerdictCard'
import { BenchmarkResult } from '@/lib/schemas/gaji'
import { ArrowLeft } from 'lucide-react'

interface ResultPageProps {
  params: Promise<{ id: string }>
}

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

// Mock data for demo — in production this comes from DB via the benchmark engine
const MOCK_RESULTS: Record<string, BenchmarkResult & { verdict: 'UNDERPAID' | 'FAIR' | 'ABOVE_MARKET' }> = {
  'demo-1': {
    percentile: 32,
    p25: 8_000_000,
    p50: 12_000_000,
    p75: 18_000_000,
    p90: 25_000_000,
    verdict: 'UNDERPAID',
    deltaPercent: -33,
    comparableCount: 47,
  },
}

export default async function WajarGajiResultPage({ params }: ResultPageProps) {
  const { id } = await params
  const result = MOCK_RESULTS[id] ?? null

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-slate-500 mb-4">Benchmark tidak ditemukan</p>
            <Link href="/wajar-gaji">
              <Button variant="outline">Kembali ke Wajar Gaji</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back */}
        <Link
          href="/wajar-gaji"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Wajar Gaji
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Hasil Benchmark</h1>

        {/* Verdict card */}
        <div className="mb-6">
          <VerdictCard result={result} formatIDR={formatIDR} />
        </div>

        {/* Percentile meter */}
        <div className="mb-6">
          <PercentileMeter
            percentile={result.percentile}
            verdict={result.verdict}
            deltaPercent={result.deltaPercent}
            formatIDR={formatIDR}
            p50={result.p50}
          />
        </div>

        {/* Chart */}
        <BenchmarkChart
          p25={result.p25}
          p50={result.p50}
          p75={result.p75}
          p90={result.p90}
          formatIDR={formatIDR}
        />

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Link href="/wajar-gaji" className="flex-1">
            <Button variant="outline" className="w-full">
              Benchmark Lagi
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}