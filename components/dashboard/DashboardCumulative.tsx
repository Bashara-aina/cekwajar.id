'use client'

import Link from 'next/link'
import { Sparkles, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  firstName: string
  cumulativeIdr: number
  auditCount: number
  violationCount: number
  sinceDate: string
}

export function DashboardCumulative({ firstName, cumulativeIdr, auditCount, violationCount, sinceDate }: Props) {
  const isFirstVisit = auditCount === 0

  return (
    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-6 sm:p-8">
      <p className="text-sm text-slate-600">Halo, {firstName}.</p>
      {isFirstVisit ? (
        <>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Selamat datang. Saatnya audit slip pertamamu.
          </h2>
          <p className="mt-1 text-sm text-slate-500">Aktifkan Pro mulai sekarang dengan upload slip terbaru.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/slip">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Audit slip pertama →</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Total selisih ditemukan</p>
          <p className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-emerald-700 sm:text-5xl">
            IDR {cumulativeIdr.toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {auditCount} audit · {violationCount} pelanggaran ditandai sejak{' '}
            {new Date(sinceDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/slip">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Sparkles className="mr-2 h-4 w-4" /> Audit slip terbaru
              </Button>
            </Link>
            <Link href="/dashboard?tab=referral">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Bagikan ke teman
              </Button>
            </Link>
          </div>
        </>
      )}
    </section>
  )
}