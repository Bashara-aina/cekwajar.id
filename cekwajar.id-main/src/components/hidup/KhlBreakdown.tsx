'use client'

// components/hidup/KhlBreakdown.tsx
// Per-category comparison table: actual vs KHL benchmark

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryBreakdown } from '@/lib/engines/khl'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KhlBreakdownProps {
  breakdown: CategoryBreakdown[]
  cityName: string
  currencyFmt: (n: number) => string
}

export function KhlBreakdown({ breakdown, cityName, currencyFmt }: KhlBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Benchmark vs Realita — {cityName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {breakdown.map((row) => (
            <div key={row.category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{row.categoryLabel}</span>
                <div className="flex items-center gap-1.5">
                  {row.surplus ? (
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span className={row.surplus ? 'text-emerald-600' : 'text-red-500'}>
                    {row.surplus ? '+' : ''}{currencyFmt(row.difference)}
                  </span>
                </div>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
                    row.surplus ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(row.difference) / (row.khlBenchmark || 1) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Realita: {currencyFmt(row.actualSpending)}</span>
                <span>KHL: {currencyFmt(row.khlBenchmark)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
