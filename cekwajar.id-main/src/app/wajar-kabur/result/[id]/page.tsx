// app/wajar-kabur/result/[id]/page.tsx
// Server-rendered result page for Wajar Kabur

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SeveranceBreakdown } from '@/components/kabur/SeveranceBreakdown'
import { RunwayGauge } from '@/components/kabur/RunwayGauge'
import { VerdictCard } from '@/components/kabur/VerdictCard'
import type { KaburVerdict } from '@/app/wajar-kabur/_state'

interface ResultPageProps {
  params: Promise<{ id: string }>
}

function fmtIDR(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

// NOTE: This is a placeholder loader.
// In production, replace with actual database lookup by audit ID.
async function loadKaburResult(id: string): Promise<KaburVerdict | null> {
  // TODO: Replace with real DB/supabase query:
  // const { data } = await supabase.from('kabur_audits').select('*').eq('id', id).single()
  // if (!data) return null
  // return data.result as KaburVerdict
  void id
  return null
}

export default async function KaburResultPage({ params }: ResultPageProps) {
  const { id } = await params
  const result = await loadKaburResult(id)

  if (!result) {
    notFound()
  }

  const { breakdown } = result

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back nav */}
        <Link
          href="/wajar-kabur"
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Hitung Lagi
        </Link>

        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-slate-900">Hasil Analisis Kabur</h1>
          <p className="mt-1 text-sm text-slate-500">
            Masa kerja {breakdown.severanceBreakdown.masaKerjaYears} tahun
          </p>
        </div>

        <div className="space-y-5">
          {/* Verdict */}
          <VerdictCard verdictData={result} />

          {/* Runway Gauge */}
          <RunwayGauge
            runwayMonths={breakdown.runwayMonths}
            totalLiquidAssets={breakdown.totalLiquidAssets}
            monthlyBurnRate={breakdown.monthlyBurnRate}
            currencyFmt={fmtIDR}
          />

          {/* Severance Breakdown */}
          <SeveranceBreakdown
            severance={breakdown.severanceBreakdown}
            currencyFmt={fmtIDR}
          />

          {/* Monthly burn rate detail */}
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Komponen Biaya Bulanan
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Pengeluaran bulanan</span>
                  <span className="font-medium text-slate-800">{fmtIDR(breakdown.monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cicilan utang</span>
                  <span className="font-medium text-slate-800">{fmtIDR(breakdown.outstandingDebtsMonthly)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">BPJS Kesehatan mandiri (estimasi)</span>
                  <span className="font-medium text-slate-800">{fmtIDR(breakdown.bpjsMandiriMonthlyEstimate)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-1.5">
                  <span className="font-semibold text-slate-800">Total biaya bulanan</span>
                  <span className="font-bold text-emerald-700">{fmtIDR(breakdown.monthlyBurnRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JHT Info */}
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Saldo JHT
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {breakdown.jhtWithdrawal.eligible
                      ? 'Bisa dicairkan sekarang'
                      : 'Belum bisa dicairkan'}
                  </p>
                  <p className="text-xs text-slate-500">{breakdown.jhtWithdrawal.reason}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-slate-800">
                  {fmtIDR(breakdown.jhtWithdrawal.amountIDR)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-700">
              <strong>Disclaimer:</strong> Hasil kalkulasi bersifat indikatif berdasarkan PP 35/2021 dan UU BPJS.
              Pajak pesangon dihitung sendiri oleh pemberi kerja. Konsultasikan dengan akuntan untuk kepastian.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <Link href="/wajar-kabur">
              <Button className="w-full" size="lg">
                Hitung Ulang
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Kembali ke Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}