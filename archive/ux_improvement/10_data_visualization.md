# 10 — Data Visualization & Emotional Impact
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: Salary bar is a plain div with colored background sections. Property comparison is text with numbers. COL difference is a percentage. All data communicates correctly but creates zero emotional impact. No Recharts charts implemented yet despite the dependency being available.

## Objective
Build 5 purpose-built visualization components: animated percentile bar (Wajar Gaji), zone-colored property bar (Wajar Tanah), stacked COL bar chart (Wajar Hidup), purchasing power basket (Wajar Kabur), and payslip audit diagram (Wajar Slip). Recharts is already installed.

---

## Task 1: Animated Percentile Bar — Wajar Gaji

Create file: `src/components/wajar-gaji/PercentileBar.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PercentileBarProps {
  p25: number
  p50: number
  p75: number
  userSalary: number
  label?: string
  currency?: string
}

function formatIDR(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`
  return `Rp ${value.toLocaleString('id-ID')}`
}

function calcUserPosition(salary: number, p25: number, p75: number): number {
  // Returns 0–100 position on the bar
  const rangeMin = p25 * 0.7  // extend bar 30% below P25
  const rangeMax = p75 * 1.3  // extend bar 30% above P75
  const clamped = Math.min(Math.max(salary, rangeMin), rangeMax)
  return ((clamped - rangeMin) / (rangeMax - rangeMin)) * 100
}

function calcPercentile(salary: number, p25: number, p50: number, p75: number): number {
  if (salary <= p25) return Math.round(25 * (salary / p25))
  if (salary <= p50) return Math.round(25 + 25 * ((salary - p25) / (p50 - p25)))
  if (salary <= p75) return Math.round(50 + 25 * ((salary - p50) / (p75 - p50)))
  return Math.round(75 + 25 * Math.min((salary - p75) / (p75 * 0.5), 1))
}

export function PercentileBar({ p25, p50, p75, userSalary, label = 'Gajimu' }: PercentileBarProps) {
  const [animated, setAnimated] = useState(false)
  const userPosition = calcUserPosition(userSalary, p25, p75)
  const percentile = calcPercentile(userSalary, p25, p50, p75)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const zone =
    userSalary < p25 ? 'below'
    : userSalary <= p75 ? 'fair'
    : 'above'

  const zoneColor = zone === 'below' ? 'text-red-600 dark:text-red-400'
    : zone === 'above' ? 'text-blue-600 dark:text-blue-400'
    : 'text-emerald-600 dark:text-emerald-400'

  const zoneBg = zone === 'below' ? 'bg-red-500'
    : zone === 'above' ? 'bg-blue-500'
    : 'bg-emerald-500'

  const zoneLabel = zone === 'below' ? 'Di bawah rata-rata'
    : zone === 'above' ? 'Di atas rata-rata'
    : 'Dalam rentang wajar'

  return (
    <div className="space-y-4">
      {/* Percentile headline */}
      <div className="text-center">
        <p className="text-4xl font-bold text-foreground">
          P<span className={zoneColor}>{percentile}</span>
        </p>
        <p className={cn('text-sm font-semibold mt-1', zoneColor)}>{zoneLabel}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Gajimu lebih tinggi dari {percentile}% karyawan dengan posisi & kota yang sama
        </p>
      </div>

      {/* Bar visualization */}
      <div className="relative pt-8 pb-12">
        {/* Bar track */}
        <div className="relative h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {/* Red zone: below P25 */}
          <div className="absolute inset-y-0 left-0 w-[25%] bg-red-200 dark:bg-red-900/40" />
          {/* Green zone: P25–P75 */}
          <div className="absolute inset-y-0 left-[25%] right-[25%] bg-emerald-200 dark:bg-emerald-900/40" />
          {/* Blue zone: above P75 */}
          <div className="absolute inset-y-0 right-0 w-[25%] bg-blue-200 dark:bg-blue-900/40" />
        </div>

        {/* P markers */}
        {[
          { pct: 25, label: 'P25', value: p25 },
          { pct: 50, label: 'P50', value: p50 },
          { pct: 75, label: 'P75', value: p75 },
        ].map(marker => {
          const barPos = calcUserPosition(marker.value, p25, p75)
          return (
            <div
              key={marker.label}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${barPos}%` }}
            >
              <span className="text-xs text-muted-foreground font-medium">{marker.label}</span>
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600 mt-1" />
              <span className="text-xs text-muted-foreground mt-9 -translate-x-1/2 whitespace-nowrap">
                {formatIDR(marker.value)}
              </span>
            </div>
          )
        })}

        {/* User marker — animated */}
        <div
          className={cn(
            'absolute top-2 -translate-x-1/2 transition-all duration-1000 ease-out',
            animated ? '' : 'opacity-0'
          )}
          style={{ left: animated ? `${userPosition}%` : '0%' }}
        >
          <div className={cn('w-4 h-4 rounded-full border-2 border-white shadow-lg', zoneBg)} />
          <div className="flex flex-col items-center mt-1">
            <div className="w-0.5 h-4 bg-slate-400" />
            <div className={cn(
              'text-xs font-bold whitespace-nowrap px-2 py-1 rounded-full text-white mt-0.5',
              zoneBg
            )}>
              {label}: {formatIDR(userSalary)}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-300 dark:bg-red-700" />
          <span className="text-muted-foreground">Di bawah pasar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-300 dark:bg-emerald-700" />
          <span className="text-muted-foreground">Rentang wajar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-300 dark:bg-blue-700" />
          <span className="text-muted-foreground">Di atas pasar</span>
        </div>
      </div>
    </div>
  )
}
```

**Apply in Wajar Gaji result:**

```tsx
import { PercentileBar } from '@/components/wajar-gaji/PercentileBar'

// Replace the existing plain salary bar with:
<PercentileBar
  p25={result.p25}
  p50={result.p50}
  p75={result.p75}
  userSalary={userSalary}
  label="Gajimu"
/>
```

---

## Task 2: Property Price Zone Bar — Wajar Tanah

Create file: `src/components/wajar-tanah/PropertyPriceBar.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Verdict = 'MURAH' | 'WAJAR' | 'MAHAL' | 'SANGAT_MAHAL'

interface PropertyPriceBarProps {
  p25: number
  p50: number
  p75: number
  upperFence: number  // P75 + 1.5 * IQR
  userPrice: number
  verdict: Verdict
  pricePerM2?: number
}

function formatIDR(v: number): string {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}jt`
  return `Rp ${v.toLocaleString('id-ID')}`
}

const VERDICT_CONFIG: Record<Verdict, { label: string; color: string; bg: string; textColor: string }> = {
  MURAH: {
    label: '🟢 MURAH',
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  WAJAR: {
    label: '🔵 WAJAR',
    color: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  MAHAL: {
    label: '🟡 MAHAL',
    color: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  SANGAT_MAHAL: {
    label: '🔴 SANGAT MAHAL',
    color: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-400',
  },
}

export function PropertyPriceBar({ p25, p50, p75, upperFence, userPrice, verdict, pricePerM2 }: PropertyPriceBarProps) {
  const [animated, setAnimated] = useState(false)
  const config = VERDICT_CONFIG[verdict]

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const min = p25 * 0.6
  const max = Math.max(upperFence * 1.2, userPrice * 1.1)
  const range = max - min

  const toPos = (v: number) => Math.min(100, Math.max(0, ((v - min) / range) * 100))

  const zones = [
    { from: toPos(min), to: toPos(p25), color: 'bg-emerald-200 dark:bg-emerald-900/40', label: 'Murah' },
    { from: toPos(p25), to: toPos(p75), color: 'bg-blue-200 dark:bg-blue-900/40', label: 'Wajar' },
    { from: toPos(p75), to: toPos(upperFence), color: 'bg-amber-200 dark:bg-amber-900/40', label: 'Mahal' },
    { from: toPos(upperFence), to: 100, color: 'bg-red-200 dark:bg-red-900/40', label: 'Sangat Mahal' },
  ]

  return (
    <div className="space-y-4">
      {/* Verdict badge */}
      <div className={cn('rounded-xl border-2 p-5 text-center animate-scale-in', config.bg)}>
        <p className={cn('text-3xl font-black mb-1', config.textColor)}>{config.label}</p>
        <p className="text-2xl font-bold text-foreground">{formatIDR(userPrice)}</p>
        {pricePerM2 && (
          <p className="text-sm text-muted-foreground mt-1">{formatIDR(pricePerM2)}/m²</p>
        )}
      </div>

      {/* Bar */}
      <div className="relative h-8 rounded-full overflow-hidden">
        {zones.map((zone, i) => (
          <div
            key={i}
            className={cn('absolute inset-y-0', zone.color)}
            style={{ left: `${zone.from}%`, width: `${zone.to - zone.from}%` }}
          />
        ))}

        {/* User price marker */}
        <div
          className={cn(
            'absolute inset-y-0 w-1 -translate-x-0.5 transition-all duration-1000 ease-out',
            config.color,
            animated ? '' : 'opacity-0'
          )}
          style={{ left: animated ? `${toPos(userPrice)}%` : '0%' }}
        />
      </div>

      {/* Labels */}
      <div className="relative h-6">
        {[
          { value: p25, label: 'P25' },
          { value: p50, label: 'Median' },
          { value: p75, label: 'P75' },
        ].map(m => (
          <div
            key={m.label}
            className="absolute -translate-x-1/2 text-center"
            style={{ left: `${toPos(m.value)}%` }}
          >
            <p className="text-xs text-muted-foreground whitespace-nowrap">{m.label}</p>
            <p className="text-xs font-mono text-muted-foreground">{formatIDR(m.value)}</p>
          </div>
        ))}
      </div>

      {/* Market context */}
      <div className="grid grid-cols-2 gap-3 text-center text-xs">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground">Median area ini</p>
          <p className="font-bold text-sm mt-0.5">{formatIDR(p50)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground">Harga kamu</p>
          <p className={cn('font-bold text-sm mt-0.5', config.textColor)}>{formatIDR(userPrice)}</p>
        </div>
      </div>
    </div>
  )
}
```

**Apply in Wajar Tanah result:**

```tsx
import { PropertyPriceBar } from '@/components/wajar-tanah/PropertyPriceBar'

<PropertyPriceBar
  p25={result.p25}
  p50={result.p50}
  p75={result.p75}
  upperFence={result.upperFence}
  userPrice={inputPrice}
  verdict={result.verdict}
  pricePerM2={result.pricePerM2}
/>
```

---

## Task 3: COL Stacked Bar Chart — Wajar Hidup

Create file: `src/components/wajar-hidup/COLComparisonChart.tsx`

```tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

interface COLCategory {
  name: string
  nameShort: string
  fromCity: number
  toCity: number
  color: string
}

interface COLComparisonChartProps {
  fromCity: string
  toCity: string
  categories: COLCategory[]
  totalFrom: number
  totalTo: number
}

function formatIDR(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
  return v.toString()
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="font-mono font-semibold">Rp {formatIDR(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function COLComparisonChart({
  fromCity,
  toCity,
  categories,
  totalFrom,
  totalTo,
}: COLComparisonChartProps) {
  const chartData = categories.map(cat => ({
    name: cat.nameShort,
    [fromCity]: cat.fromCity,
    [toCity]: cat.toCity,
  }))

  const diff = totalTo - totalFrom
  const diffPct = ((diff / totalFrom) * 100).toFixed(0)
  const isMoreExpensive = diff > 0

  return (
    <div className="space-y-6">
      {/* Summary headline */}
      <div className={cn(
        'rounded-xl border-2 p-5 text-center',
        isMoreExpensive
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
          : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
      )}>
        <p className={cn(
          'text-2xl font-bold',
          isMoreExpensive ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
        )}>
          {isMoreExpensive ? `${toCity} ${diffPct}% lebih mahal` : `${toCity} ${Math.abs(Number(diffPct))}% lebih murah`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Selisih biaya hidup: Rp {formatIDR(Math.abs(diff))}/bulan
        </p>
      </div>

      {/* Recharts bar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `${formatIDR(v)}`}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
            <Bar dataKey={fromCity} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey={toCity} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown table */}
      <div className="space-y-2">
        {categories.map(cat => {
          const catDiff = cat.toCity - cat.fromCity
          const isUp = catDiff > 0
          return (
            <div key={cat.name} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
              <span className="text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </span>
              <div className="text-right">
                <span className={cn('text-xs font-semibold', isUp ? 'text-red-600' : 'text-emerald-600')}>
                  {isUp ? '+' : '-'}Rp {formatIDR(Math.abs(catDiff))}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Apply in Wajar Hidup result section:**

```tsx
import { COLComparisonChart } from '@/components/wajar-hidup/COLComparisonChart'

<COLComparisonChart
  fromCity={fromCity}
  toCity={toCity}
  totalFrom={result.totalFrom}
  totalTo={result.totalTo}
  categories={[
    { name: 'Sewa/KPR', nameShort: 'Sewa', fromCity: result.fromBreakdown.rent, toCity: result.toBreakdown.rent, color: '#6366f1' },
    { name: 'Makanan', nameShort: 'Makan', fromCity: result.fromBreakdown.food, toCity: result.toBreakdown.food, color: '#f59e0b' },
    { name: 'Transport', nameShort: 'Transport', fromCity: result.fromBreakdown.transport, toCity: result.toBreakdown.transport, color: '#10b981' },
    { name: 'Utilitas', nameShort: 'Utilitas', fromCity: result.fromBreakdown.utilities, toCity: result.toBreakdown.utilities, color: '#3b82f6' },
    { name: 'Hiburan', nameShort: 'Hiburan', fromCity: result.fromBreakdown.entertainment, toCity: result.toBreakdown.entertainment, color: '#ec4899' },
  ]}
/>
```

---

## Task 4: Purchasing Power Basket — Wajar Kabur

Create file: `src/components/wajar-kabur/PPPBasketComparison.tsx`

```tsx
interface BasketItem {
  label: string
  fromValue: string  // e.g., "3.2 bulan sewa"
  toValue: string    // e.g., "1.4 bulan sewa"
  fromBetter: boolean
}

interface PPPBasketComparisonProps {
  fromCity: string
  toCity: string
  fromSalaryFormatted: string
  toSalaryFormatted: string
  pppRatio: number
  basketItems: BasketItem[]
}

export function PPPBasketComparison({
  fromCity,
  toCity,
  fromSalaryFormatted,
  toSalaryFormatted,
  pppRatio,
  basketItems,
}: PPPBasketComparisonProps) {
  const ratio = pppRatio
  const ratioDisplay = (ratio * 100 - 100).toFixed(0)
  const isBetter = ratio > 1

  return (
    <div className="space-y-5">
      {/* PPP Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{fromCity}</p>
          <p className="text-xl font-bold">{fromSalaryFormatted}</p>
          <p className="text-xs text-muted-foreground mt-1">Daya beli lokal</p>
        </div>
        <div className={cn(
          'rounded-xl p-4 text-center border-2',
          isBetter
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200'
            : 'bg-red-50 dark:bg-red-950/30 border-red-200'
        )}>
          <p className="text-xs text-muted-foreground mb-1">{toCity} (PPP)</p>
          <p className={cn('text-xl font-bold', isBetter ? 'text-emerald-700' : 'text-red-700')}>
            {toSalaryFormatted}
          </p>
          <p className={cn('text-xs font-semibold mt-1', isBetter ? 'text-emerald-600' : 'text-red-600')}>
            {isBetter ? `+${ratioDisplay}%` : `${ratioDisplay}%`} daya beli
          </p>
        </div>
      </div>

      {/* Basket comparison */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">Dengan gaji tersebut, kamu bisa beli:</p>
        <div className="space-y-2">
          {basketItems.map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs">
                    🇮🇩 <strong>{item.fromValue}</strong>
                  </span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className={cn('text-xs font-semibold', item.fromBetter ? 'text-red-600' : 'text-emerald-600')}>
                    🌏 <strong>{item.toValue}</strong>
                  </span>
                </div>
              </div>
              <span className="text-lg">{item.fromBetter ? '📉' : '📈'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Apply in Wajar Kabur result.** Pass basket items computed from the PPP result. Example basket items for Indonesia vs Singapore:

```ts
const basketItems = [
  {
    label: 'Sewa apartemen 1BR (per bulan)',
    fromValue: `${(result.fromSalaryIDR / result.avgRentJakarta).toFixed(1)} bulan`,
    toValue: `${(result.toSalaryLocal / result.avgRentDest).toFixed(1)} bulan`,
    fromBetter: result.fromSalaryIDR / result.avgRentJakarta > result.toSalaryLocal / result.avgRentDest,
  },
  // ... add more basket items
]
```

---

## Task 5: Payslip Audit Diagram — Wajar Slip

Create file: `src/components/wajar-slip/PayslipDiagram.tsx`

```tsx
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LineItem {
  label: string
  amount: number
  violationCode?: string  // if set, this line has a violation
  type: 'income' | 'deduction'
}

interface PayslipDiagramProps {
  lines: LineItem[]
  violations: string[]  // list of violation codes found
}

function formatIDR(v: number): string {
  return `Rp ${v.toLocaleString('id-ID')}`
}

export function PayslipDiagram({ lines, violations }: PayslipDiagramProps) {
  const income = lines.filter(l => l.type === 'income')
  const deductions = lines.filter(l => l.type === 'deduction')

  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
      {/* Slip header */}
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-300 dark:border-slate-600">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Slip Gaji (Diagram Audit)
        </p>
      </div>

      {/* Income section */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-muted-foreground mb-2">PENDAPATAN</p>
        {income.map(line => (
          <div key={line.label} className="flex items-center justify-between py-1.5">
            <span className="text-sm">{line.label}</span>
            <span className="font-mono text-sm">{formatIDR(line.amount)}</span>
          </div>
        ))}
      </div>

      {/* Deductions section */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">POTONGAN</p>
        {deductions.map(line => {
          const hasViolation = line.violationCode && violations.includes(line.violationCode)
          return (
            <div
              key={line.label}
              className={cn(
                'flex items-center justify-between py-1.5 px-2 rounded-lg -mx-2 transition-colors',
                hasViolation && 'bg-red-50 dark:bg-red-950/30'
              )}
            >
              <div className="flex items-center gap-2">
                {hasViolation ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                )}
                <span className={cn('text-sm', hasViolation && 'text-red-700 dark:text-red-400 font-medium')}>
                  {line.label}
                </span>
                {hasViolation && (
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-mono">
                    {line.violationCode}
                  </span>
                )}
              </div>
              <span className={cn('font-mono text-sm', hasViolation && 'text-red-700 dark:text-red-400')}>
                {formatIDR(line.amount)}
              </span>
            </div>
          )
        })}
      </div>

      {violations.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 px-4 py-2 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">
            ⚠️ Baris berwarna merah = komponen yang bermasalah
          </p>
        </div>
      )}
    </div>
  )
}
```

**Apply in Wajar Slip result section** — show this ABOVE the ViolationSummaryBanner:

```tsx
import { PayslipDiagram } from '@/components/wajar-slip/PayslipDiagram'

<PayslipDiagram
  violations={violations.map(v => v.code)}
  lines={[
    { label: 'Gaji Pokok', amount: formData.gapok, type: 'income' },
    { label: 'Tunjangan', amount: formData.tunjangan, type: 'income' },
    { label: 'PPh21', amount: formData.pph21Dipotong, type: 'deduction', violationCode: violations.find(v => v.code.startsWith('V0') && v.component === 'pph21')?.code },
    { label: 'JHT Karyawan', amount: formData.jhtKaryawan, type: 'deduction', violationCode: 'V05' },
    { label: 'JP Karyawan', amount: formData.jpKaryawan, type: 'deduction', violationCode: 'V04' },
    { label: 'BPJS Kesehatan', amount: formData.bpjsKes, type: 'deduction', violationCode: 'V07' },
  ]}
/>
```

---

## Task 6: Add Accessibility to All Charts

For each chart component, ensure:

1. Wrap charts in a `<figure>` with `<figcaption>`:
```tsx
<figure role="img" aria-label={`Persentil gaji untuk ${jobTitle} di ${city}`}>
  <PercentileBar ... />
  <figcaption className="sr-only">
    Gajimu berada di persentil {percentile} dari total data. P25: {formatIDR(p25)}, Median: {formatIDR(p50)}, P75: {formatIDR(p75)}.
  </figcaption>
</figure>
```

2. All color zones have text/icon alternatives — check that color is never the ONLY indicator.

3. Add `prefers-reduced-motion` guard to all animated components:
```tsx
useEffect(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const t = setTimeout(() => setAnimated(true), prefersReduced ? 0 : 200)
  return () => clearTimeout(t)
}, [])
```

---

## Acceptance Criteria

- [ ] Wajar Gaji result shows `PercentileBar` with animated user marker sliding to position
- [ ] PercentileBar shows red/green/blue zones with P25, P50, P75 labels and IDR amounts
- [ ] Wajar Tanah result shows `PropertyPriceBar` with zone-colored bar and animated price marker
- [ ] Wajar Hidup result shows `COLComparisonChart` with Recharts grouped bar chart
- [ ] Wajar Kabur result shows `PPPBasketComparison` with concrete basket items
- [ ] Wajar Slip result shows `PayslipDiagram` with red-highlighted violation rows
- [ ] All charts have `<figcaption>` with screen reader text
- [ ] All animations check `prefers-reduced-motion` and skip if enabled
- [ ] `npm run build` passes with zero errors
