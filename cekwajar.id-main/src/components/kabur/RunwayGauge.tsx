'use client'

// components/kabur/RunwayGauge.tsx
// Visual gauge showing runway months with color coding

import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface RunwayGaugeProps {
  runwayMonths: number
  totalLiquidAssets: number
  monthlyBurnRate: number
  currencyFmt: (n: number) => string
}

export function RunwayGauge({ runwayMonths, totalLiquidAssets, monthlyBurnRate, currencyFmt }: RunwayGaugeProps) {
  const cappedPct = Math.min((runwayMonths / 18) * 100, 100)

  const isGreen = runwayMonths >= 12
  const isYellow = runwayMonths >= 6 && runwayMonths < 12
  const isRed = runwayMonths < 6

  const barColor = isGreen ? 'bg-emerald-400' : isYellow ? 'bg-amber-400' : 'bg-red-400'
  const labelText = isGreen ? 'Aman — 12+ bulan' : isYellow ? 'Perlu hati-hati — 6-11 bulan' : 'Belum cukup — <6 bulan'

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <div className="flex items-center gap-1.5">
          <Clock className={`h-4 w-4 ${isGreen ? 'text-emerald-500' : isYellow ? 'text-amber-500' : 'text-red-500'}`} />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Runway Keuangan
          </p>
        </div>

        <div className="relative w-full">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${cappedPct}%` }}
            />
          </div>
          {/* 6-month marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-400/50"
            style={{ left: `${Math.min((6 / 18) * 100, 100)}%` }}
          />
          {/* 12-month marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-400/50"
            style={{ left: `${Math.min((12 / 18) * 100, 100)}%` }}
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0</span>
            <span>6</span>
            <span>12</span>
            <span>18+</span>
          </div>
        </div>

        <div className="text-center">
          <p className="font-mono text-3xl font-black text-slate-800">
            {runwayMonths.toFixed(1)}
            <span className="ml-1 text-base font-normal text-slate-500">bulan</span>
          </p>
          <p className={`mt-0.5 text-sm font-medium ${isGreen ? 'text-emerald-600' : isYellow ? 'text-amber-600' : 'text-red-600'}`}>
            {labelText}
          </p>
        </div>

        <div className="flex w-full justify-between rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div>
            <p className="text-slate-500">Total Aset Liquid</p>
            <p className="font-semibold">{currencyFmt(totalLiquidAssets)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Biaya Bulanan</p>
            <p className="font-semibold">{currencyFmt(monthlyBurnRate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}