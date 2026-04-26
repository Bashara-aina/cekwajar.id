'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, Users } from 'lucide-react'
import { REVENUE_ANCHORS } from '@/lib/constants'

function LiveUserCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/audit-counter')
      .then((r) => r.json())
      .then((d) => setCount(d.total ?? null))
      .catch(() => {})
  }, [])
  if (!count || count < 1000) return null
  return (
    <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-200">
      <Users className="h-3.5 w-3.5" />
      {count.toLocaleString('id-ID')}+ slip sudah diaudit di platform ini
    </p>
  )
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-4 py-16 sm:py-20 text-center">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Gratis untuk semua · Tanpa daftar · Hasil 30 detik
        </p>

        <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl leading-tight">
          Slip gaji bulan ini menunggu<br className="hidden sm:block" /> untuk dicek.
        </h2>
        <p className="mt-3 text-emerald-100 max-w-md mx-auto">
          Rata-rata pengguna menemukan{' '}
          <strong className="text-white">
            IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
          </strong>{' '}
          yang seharusnya jadi miliknya. Kamu berikutnya?
        </p>

        <LiveUserCount />

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/slip">
            <Button
              size="lg"
              className="h-14 min-w-[220px] bg-white text-emerald-700 font-bold text-base shadow-xl hover:bg-emerald-50"
            >
              Cek Slip Gajiku Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/upgrade">
            <Button
              size="lg"
              variant="outline"
              className="h-14 min-w-[180px] border-white/40 text-white font-semibold hover:bg-white/10"
            >
              Lihat Harga Pro →
            </Button>
          </Link>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Gratis selamanya untuk audit dasar · Pro: Rp {(REVENUE_ANCHORS.PRO_PRICE_IDR / 1000).toFixed(0)}K/bulan · Garansi 7 hari uang kembali
        </p>
      </div>
    </section>
  )
}
