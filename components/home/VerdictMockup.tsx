'use client'

import { AlertTriangle, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { REVENUE_ANCHORS } from '@/lib/constants'
import Link from 'next/link'

interface ViolationRow {
  label: string
  amount: string
  blurred?: boolean
}

const VIOLATIONS: ViolationRow[] = [
  { label: 'PPh21 dipotong berlebih (TK/0)', amount: '+ IDR 332.000' },
  { label: 'BPJS JHT 2% kurang disetor', amount: '+ IDR 160.000' },
  { label: 'BPJS Kesehatan selisih ████████', amount: '+ IDR ███.███', blurred: true },
]

export function VerdictMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto max-w-md ${className}`}>
      {/* Result card */}
      <div className="rounded-2xl border-2 border-red-200 bg-white shadow-xl shadow-red-500/10 overflow-hidden">
        {/* Header bar */}
        <div className="bg-red-600 px-5 py-3 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-white shrink-0" />
          <p className="text-sm font-bold text-white">
            3 Pelanggaran Terdeteksi
          </p>
          <Badge className="ml-auto bg-white/20 text-white text-[10px] font-semibold border-0">
            FEBRUARI 2026
          </Badge>
        </div>

        <div className="p-5 sm:p-6">
          {/* Identity */}
          <p className="text-xs text-slate-400 mb-3">
            Audit: <span className="font-medium text-slate-600">Andi P.</span> · Bekasi · Rp 8.500.000/bln
          </p>

          {/* Hero number */}
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-4">
            <p className="text-xs uppercase tracking-wider text-red-500 font-semibold mb-1">
              Total selisih yang ditemukan
            </p>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              = {Math.round(REVENUE_ANCHORS.AVG_SHORTFALL_IDR / 12).toLocaleString('id-ID')} IDR / bulan selama 12 bulan
            </p>
          </div>

          {/* Violation rows */}
          <ul className="space-y-2 mb-4">
            {VIOLATIONS.map((v) => (
              <li
                key={v.label}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                  v.blurred
                    ? 'bg-slate-50 border border-slate-100'
                    : 'bg-red-50/70 border border-red-100'
                }`}
              >
                <span
                  className={
                    v.blurred
                      ? 'flex items-center gap-1.5 text-slate-400 select-none blur-[2px]'
                      : 'text-slate-700'
                  }
                >
                  {v.blurred && <Lock className="h-3 w-3" />}
                  {v.label}
                </span>
                <span
                  className={`font-mono font-semibold ${
                    v.blurred
                      ? 'text-slate-400 select-none blur-[2px]'
                      : 'text-red-700'
                  }`}
                >
                  {v.amount}
                </span>
              </li>
            ))}
          </ul>

          {/* Locked detail teaser */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-4 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-800">
                + Skrip ke HRD dengan referensi pasal hukum
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Terbuka untuk pengguna Pro — apa yang harus dikatakan, bagaimana cara memintanya.
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link href="/upgrade">
            <div className="flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 cursor-pointer hover:bg-emerald-700 transition-colors">
              <div>
                <p className="text-sm font-bold text-white">Buka Detail Lengkap</p>
                <p className="text-[10px] text-emerald-200">
                  IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} · Garansi 7 hari
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>
      </div>

      {/* "Slip sesuai" alternative */}
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-center gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-800">
          <strong>Slip sesuai:</strong> Kamu juga bisa dapat verdict "tidak ada pelanggaran" — bukan cuma yang buruk yang kita tunjukkan.
        </p>
      </div>
    </div>
  )
}
