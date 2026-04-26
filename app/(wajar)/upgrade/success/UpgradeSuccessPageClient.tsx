'use client'

import { useEffect } from 'react'
import { CheckCircle2, FileText, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import confetti from 'canvas-confetti'

export default function UpgradeSuccessPageClient() {
  useEffect(() => {
    const t = setTimeout(() => {
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.4 } })
    }, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Berhasil. Slip kamu sekarang terbuka penuh.
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Selamat menemukan rupiah yang seharusnya jadi milikmu.
        </p>

        <div className="mt-6 grid gap-3">
          <Link href="/slip">
            <Button className="h-12 w-full bg-emerald-600 hover:bg-emerald-700">
              <FileText className="mr-2 h-4 w-4" />
              Lihat audit terakhir saya
            </Button>
          </Link>
          <Link href="/slip?reset=1">
            <Button variant="outline" className="h-12 w-full">
              Audit slip lain
            </Button>
          </Link>
          <Link href="/dashboard?tab=referral" className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-emerald-700 hover:underline">
            <Share2 className="h-3.5 w-3.5" />
            Bagikan ke teman → dapat 1 bulan gratis kalo dia bayar
          </Link>
        </div>
      </div>
    </main>
  )
}