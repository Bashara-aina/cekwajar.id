'use client'

// components/kabur/VerdictCard.tsx
// Color-coded verdict card for kabur with checklist

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, XCircle, ListChecks, Plane } from 'lucide-react'
import type { Verdict } from '@/lib/engines/runway'
import type { PreparationItem } from '@/app/wajar-kabur/_state'

interface KaburVerdictData {
  runwayMonths: number
  verdict: Verdict
  verdictLabel: string
  verdictColor: 'green' | 'yellow' | 'red'
  checklist: PreparationItem[]
}

const VERDICT_CONFIG: Record<
  Verdict,
  {
    label: string
    Icon: typeof CheckCircle2
    bg: string
    border: string
    text: string
    iconColor: string
  }
> = {
  AMAN_KABUR: {
    label: 'Aman untuk Kabur',
    Icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
  },
  PIKIR_LAGI: {
    label: 'Perlu Dipikir Lebih Matang',
    Icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
  },
  BELUM_WAKTUNYA: {
    label: 'Belum Waktunya',
    Icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
  },
}

interface VerdictCardProps {
  verdictData: KaburVerdictData
}

export function VerdictCard({ verdictData }: VerdictCardProps) {
  const cfg = VERDICT_CONFIG[verdictData.verdict]

  return (
    <Card className={`border-2 ${cfg.bg} ${cfg.border}`}>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        {/* Icon */}
        <div className={`rounded-full p-3 ${cfg.bg}`}>
          <cfg.Icon className={`h-10 w-10 ${cfg.iconColor}`} />
        </div>

        {/* Runway prominently displayed */}
        <div>
          <p className="font-mono text-5xl font-black text-slate-800">
            {verdictData.runwayMonths.toFixed(1)}
            <span className="ml-1 text-xl font-normal text-slate-500">bulan</span>
          </p>
          <p className={`mt-1 text-lg font-bold ${cfg.text}`}>{cfg.label}</p>
        </div>

        {/* Checklist */}
        {verdictData.checklist.length > 0 && (
          <div className="w-full rounded-lg bg-white/70 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ListChecks className="h-3.5 w-3.5 text-slate-400" />
              Persiapan Sebelum Resign
            </p>
            <ul className="space-y-2">
              {verdictData.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-left">
                  <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                    item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}>
                    {item.done && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info note */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Plane className="h-3.5 w-3.5" />
          <span>Berdasarkan PP 35/2021 + UU BPJS Ketenagakerjaan</span>
        </div>
      </CardContent>
    </Card>
  )
}