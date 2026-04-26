'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Paywall } from '@/components/Paywall'

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

interface Audit {
  id: string
  created_at: string
  verdict: 'SESUAI' | 'ADA_PELANGGARAN'
  violation_count: number
  shortfall_idr: number
  period_month: number
  period_year: number
  city: string
}

export function DashboardHistory({ audits, tier }: { audits: Audit[]; tier: 'free' | 'pro' }) {
  if (!audits.length) return null

  const visibleCount = tier === 'pro' ? audits.length : 1

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900">Riwayat audit</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {audits.map((a, i) => {
          const isLocked = i >= visibleCount
          const dateStr = new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
          return (
            <li key={a.id} className="py-3">
              {isLocked ? (
                <Paywall compact feature={`Audit slip ${MONTHS[a.period_month]} ${a.period_year}`} />
              ) : (
                <Link
                  href={`/slip/audit/${a.id}`}
                  className="group flex items-start justify-between gap-3 rounded-md p-2 -mx-2 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="text-xs text-slate-400">{dateStr}</span>
                      {' · '}
                      Slip {MONTHS[a.period_month]} {a.period_year} · {a.city}
                    </p>
                    <p className="mt-1 text-xs">
                      {a.verdict === 'SESUAI' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Sesuai regulasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          {a.violation_count} pelanggaran · IDR {a.shortfall_idr.toLocaleString('id-ID')} selisih
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}