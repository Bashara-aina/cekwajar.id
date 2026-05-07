'use client'

// components/gaji/VerdictCard.tsx
// UNDERPAID (red) / FAIR (green) / ABOVE_MARKET (blue) verdict with negotiation talking points

import { Card, CardContent } from '@/components/ui/card'
import { TrendingDown, CheckCircle2, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react'
import type { BenchmarkResult } from '@/lib/schemas/gaji'

const VERDICT_CONFIG = {
  UNDERPAID: {
    label: 'UNDERPAID',
    Label: 'Gaji di Bawah Wajar',
    Icon: TrendingDown,
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    color: 'red',
  },
  FAIR: {
    label: 'FAIR',
    Label: 'Gaji Wajar',
    Icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    color: 'emerald',
  },
  ABOVE_MARKET: {
    label: 'ABOVE_MARKET',
    Label: 'Di Atas Wajar',
    Icon: TrendingUp,
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    color: 'blue',
  },
  INSUFFICIENT_DATA: {
    label: 'INSUFFICIENT_DATA',
    Label: 'Data Tidak Cukup',
    Icon: Lightbulb,
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-800',
    iconColor: 'text-slate-500',
    color: 'slate',
  },
} as const

const TALKYING_POINTS = {
  UNDERPAID: [
    'Kumpulkan data pasar: screenshot lowongan dengan gaji lebih tinggi',
    'Siapkan pencapaian kuantitatif (target, revenue, proyek)',
    'Gunakan bahasa "Berdasarkan benchmark industri..."',
    'Fokus pada nilai tambah, bukan kebutuhan pribadi',
    'TulisEmail ke HR dengan data terlampir sebagai leverage',
  ],
  FAIR: [
    'Evaluasi apakah ada benefit tambahan yang bisa dinegosiasikan',
    'Tanyakan rencana karir dantimeline promosi',
    'Minta review gaji formal 6 bulan lagi',
    'Perhatikan budaya perusahaan dan stabilitas',
  ],
  ABOVE_MARKET: [
    'Pertimbangkan untuk menaikan ekspektasi Anda juga',
    'Fokus pada pengembangan karir dan learning budget',
    'Jangan terlalu earlyanchor rendah saat negosiasi berikutnya',
    'Pastikan total compensation (bonus, equity) sudah maksimal',
  ],
  INSUFFICIENT_DATA: [
    'Minta HR untuk menjelaskan range gaji untuk posisi ini',
    'Hubungi komunitas profesional di bidang Anda',
    'Cek Glassdoor dan LinkedIn Salary untuk data tambahan',
    'Contribution ke salary survey membantu orang lain juga',
  ],
}

interface VerdictCardProps {
  result: BenchmarkResult
  formatIDR: (n: number) => string
}

export function VerdictCard({ result, formatIDR }: VerdictCardProps) {
  const cfg = VERDICT_CONFIG[result.verdict]
  const talkingPoints = TALKYING_POINTS[result.verdict]

  return (
    <Card className={`border-2 ${cfg.bg}`}>
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <cfg.Icon className={`h-10 w-10 ${cfg.iconColor}`} />
          <div>
            <p className={`text-xl font-bold ${cfg.text}`}>{cfg.Label}</p>
            <p className="text-sm text-slate-500">
              {result.comparableCount} data pembanding
            </p>
          </div>
        </div>

        {/* Percentile explanation */}
        <div className="rounded-lg bg-white/60 p-4">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Persentil Kamu', `${result.percentile}`],
                ['Median (P50)', formatIDR(result.p50)],
                ['Kuartil Bawah (P25)', formatIDR(result.p25)],
                ['Kuartil Atas (P75)', formatIDR(result.p75)],
                ['P90', formatIDR(result.p90)],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-500">{label}</td>
                  <td className="py-2 text-right font-medium text-slate-700">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delta */}
        {result.verdict !== 'INSUFFICIENT_DATA' && (
          <div className="text-center p-3 rounded-lg bg-white/40">
            <p className="text-sm text-slate-500">
              {result.deltaPercent >= 0 ? '+' : ''}{result.deltaPercent}% dari median
            </p>
          </div>
        )}

        {/* Talking points */}
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            Poin Negosiasi
          </p>
          <ul className="space-y-1.5">
            {talkingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}