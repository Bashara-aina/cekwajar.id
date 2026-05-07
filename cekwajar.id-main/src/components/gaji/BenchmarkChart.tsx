'use client'

// components/gaji/BenchmarkChart.tsx
// SVG bar chart showing P25/P50/P75/P90 distribution with user position

import { Card, CardContent } from '@/components/ui/card'

interface BenchmarkChartProps {
  p25: number
  p50: number
  p75: number
  p90: number
  userSalary?: number
  formatIDR: (n: number) => string
}

export function BenchmarkChart({ p25, p50, p75, p90, userSalary, formatIDR }: BenchmarkChartProps) {
  const max = p90 * 1.3
  const min = 0

  const toX = (v: number) => ((v - min) / (max - min)) * 100

  const p25X = toX(p25)
  const p50X = toX(p50)
  const p75X = toX(p75)
  const p90X = toX(p90)
  const userX = userSalary ? toX(userSalary) : null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative">
            <svg viewBox="0 0 100 60" className="w-full" preserveAspectRatio="none">
              {/* Background gradient zones */}
              <rect x={toX(min)} y={0} width={p25X - toX(min)} height={60} fill="#fee2e2" opacity={0.4} />
              <rect x={p25X} y={0} width={p75X - p25X} height={60} fill="#d1fae5" opacity={0.4} />
              <rect x={p75X} y={0} width={p90X - p75X} height={60} fill="#fee2e2" opacity={0.4} />
              <rect x={p90X} y={0} width={toX(max) - p90X} height={60} fill="#f3f4f6" opacity={0.4} />

              {/* P25 line */}
              <line x1={p25X} y1={10} x2={p25X} y2={50} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="2,2" />
              {/* P50 line (median) */}
              <line x1={p50X} y1={5} x2={p50X} y2={55} stroke="#10b981" strokeWidth={1.5} />
              {/* P75 line */}
              <line x1={p75X} y1={10} x2={p75X} y2={50} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="2,2" />

              {/* User marker */}
              {userX !== null && (
                <g>
                  <line x1={userX} y1={0} x2={userX} y2={60} stroke="#3b82f6" strokeWidth={2} />
                  <circle cx={userX} cy={30} r={2.5} fill="#3b82f6" />
                </g>
              )}
            </svg>

            {/* Labels */}
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{formatIDR(min)}</span>
              <span>P25</span>
              <span className="font-medium text-slate-700">Median</span>
              <span>P75</span>
              <span>{formatIDR(p90)}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-100" />
              <span>Rendah (&lt;P25)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-100" />
              <span>Normal (P25-P75)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-100" />
              <span>Tinggi (&gt;P75)</span>
            </div>
            {userSalary && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded bg-blue-500" />
                <span>Posisi kamu</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}