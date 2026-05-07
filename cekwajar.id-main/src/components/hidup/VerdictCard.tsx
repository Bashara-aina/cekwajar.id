'use client'

// components/hidup/VerdictCard.tsx
// Verdict + color + suggestions

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from 'lucide-react'
import type { KhlResult, HidupVerdict } from '@/lib/engines/khl'

const VERDICT_CONFIG: Record<HidupVerdict, {
  label: string
  Icon: typeof CheckCircle2
  bg: string
  text: string
  iconColor: string
  description: (r: KhlResult) => string
}> = {
  LAYAK: {
    label: 'Gaya Hidup Layak',
    Icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    description: (r) =>
      `Pendapatan kamu ${r.adequacyRatio}x dari KHL ${r.cityName}. Kebutuhan dasar terpenuhi dengan baik.`,
  },
  PAS_PASAN: {
    label: 'Pas-pasan',
    Icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    description: (r) =>
      `Pendapatan kamu ${r.adequacyRatio}x dari KHL — cukup untuk kebutuhan dasar tapi tanpa cadangan.`,
  },
  KURANG: {
    label: 'Kebutuhan Dasar Tidak Tercukupi',
    Icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    description: (r) =>
      `Pendapatan kamu hanya ${r.adequacyRatio}x dari KHL ${r.cityName}. Ada deficit ${Math.abs(r.surplus).toLocaleString('id-ID')}/bulan.`,
  },
}

interface VerdictCardProps {
  result: KhlResult
  currencyFmt: (n: number) => string
}

export function VerdictCard({ result, currencyFmt }: VerdictCardProps) {
  const cfg = VERDICT_CONFIG[result.verdict]

  return (
    <Card className={`border-2 ${cfg.bg}`}>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <cfg.Icon className={`h-12 w-12 ${cfg.iconColor}`} />

        <div>
          <p className={`text-xl font-bold ${cfg.text}`}>{cfg.label}</p>
          <p className="mt-1 text-sm text-slate-600">{cfg.description(result)}</p>
        </div>

        <div className="w-full rounded-lg bg-white/70 p-4">
          <p className="text-xs text-slate-500">KHL {result.cityName} (rumah tangga {result.householdSize} orang)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-800">
            {currencyFmt(result.khlMonthly)}
            <span className="ml-1 text-sm font-normal text-slate-500">/bulan</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Per capita: {currencyFmt(result.khlPerCapita)} × {result.householdMultiplier}
          </p>
        </div>

        {result.suggestions.length > 0 && (
          <div className="w-full space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Saran Optimasi
            </p>
            {result.suggestions.map((s, i) => (
              <p key={i} className="text-left text-xs text-slate-600">
                • {s}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
