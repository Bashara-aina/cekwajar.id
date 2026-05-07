'use client'

// components/hidup/AdequacyGauge.tsx
// Visual adequacy ratio gauge

import { Card, CardContent } from '@/components/ui/card'

interface AdequacyGaugeProps {
  ratio: number
  labels: { low: string; mid: string; high: string }
}

export function AdequacyGauge({ ratio, labels }: AdequacyGaugeProps) {
  const pct = Math.min(ratio * 100, 100)
  const isHigh = ratio >= 1.5
  const isMid = ratio >= 1.0 && ratio < 1.5
  const color = isHigh ? 'bg-emerald-400' : isMid ? 'bg-amber-400' : 'bg-red-400'
  const label = isHigh ? labels.high : isMid ? labels.mid : labels.low

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Rasio Kecukupan
        </p>

        <div className="relative w-full">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${color}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>100%</span>
            <span>150%+</span>
          </div>
        </div>

        <div className="text-center">
          <p className="font-mono text-3xl font-black text-slate-800">{ratio.toFixed(2)}×</p>
          <p
            className={`mt-0.5 text-sm font-medium ${
              isHigh ? 'text-emerald-600' : isMid ? 'text-amber-600' : 'text-red-600'
            }`}
          >
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
