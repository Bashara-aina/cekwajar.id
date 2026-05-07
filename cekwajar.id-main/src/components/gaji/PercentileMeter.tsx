'use client'

// components/gaji/PercentileMeter.tsx
// Visual percentile display (0-100 scale) with color zones

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PercentileMeterProps {
  percentile: number
  verdict: 'UNDERPAID' | 'FAIR' | 'ABOVE_MARKET'
  deltaPercent: number
  formatIDR: (n: number) => string
  p50: number
}

const ZONES = [
  { label: 'Kurang', max: 25, color: 'bg-red-500' },
  { label: 'Wajar', max: 75, color: 'bg-emerald-500' },
  { label: 'Di Atas', max: 100, color: 'bg-blue-500' },
]

export function PercentileMeter({ percentile, verdict, deltaPercent, formatIDR, p50 }: PercentileMeterProps) {
  const getZoneColor = (p: number) => {
    if (p < 25) return 'bg-red-500'
    if (p < 75) return 'bg-emerald-500'
    return 'bg-blue-500'
  }

  const getVerdictIcon = () => {
    if (verdict === 'UNDERPAID') return <TrendingDown className="h-5 w-5 text-red-500" />
    if (verdict === 'ABOVE_MARKET') return <TrendingUp className="h-5 w-5 text-blue-500" />
    return <Minus className="h-5 w-5 text-emerald-500" />
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left: meter */}
          <div className="flex-1">
            <div className="flex items-end gap-1 mb-2">
              <span className="text-4xl font-bold text-slate-800">{percentile}</span>
              <span className="text-lg text-slate-400 mb-1">/100</span>
            </div>

            {/* Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className={`h-full ${getZoneColor(percentile)} transition-all duration-500`} style={{ width: `${percentile}%` }} />
            </div>

            {/* Zone labels */}
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* Right: verdict */}
          <div className="ml-6 text-right">
            <div className="flex items-center gap-2 mb-1">
              {getVerdictIcon()}
              <span className="text-lg font-bold text-slate-700">{verdict === 'UNDERPAID' ? 'Kurang' : verdict === 'ABOVE_MARKET' ? 'Di Atas' : 'Wajar'}</span>
            </div>
            <p className="text-sm text-slate-500">
              {deltaPercent >= 0 ? '+' : ''}{deltaPercent}% dari median
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Median: {formatIDR(p50)}
            </p>
          </div>
        </div>

        {/* Percentile bar breakdown */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold text-slate-700">P25</div>
              <div className="text-slate-400">Bawah</div>
            </div>
            <div>
              <div className="font-semibold text-emerald-600">P50</div>
              <div className="text-slate-400">Median</div>
            </div>
            <div>
              <div className="font-semibold text-slate-700">P75</div>
              <div className="text-slate-400">Atas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}