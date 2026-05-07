'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { Sparkles, ArrowRight, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UpgradeSuccessClient() {
  useEffect(() => {
    confetti({ particleCount: 30, spread: 70, origin: { y: 0.4 } })
  }, [])
  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white px-4 py-20 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Sparkles className="h-7 w-7 text-emerald-700" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Berhasil. Slip kamu sekarang terbuka penuh.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Selamat menemukan rupiah yang seharusnya jadi milikmu.
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/dashboard?upgraded=true">
            <Button className="h-12 w-full bg-emerald-600 hover:bg-emerald-700">
              Lihat audit terakhir saya
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/wajar-slip">
            <Button variant="outline" className="h-12 w-full">
              Audit slip lain
            </Button>
          </Link>
          <Link href="/dashboard?tab=referral" className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-emerald-700 hover:underline">
            <Share2 className="h-3.5 w-3.5" /> Bagikan ke teman → dapat 1 bulan gratis kalo dia bayar
          </Link>
        </div>
      </div>
    </section>
  )
}