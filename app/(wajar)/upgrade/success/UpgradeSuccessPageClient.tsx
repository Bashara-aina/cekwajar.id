'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ConfettiEffect } from '@/components/ConfettiEffect'

export default function UpgradeSuccessPageClient() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'basic'
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 300)
    return () => clearTimeout(t)
  }, [])

  const planLabel = plan === 'pro' ? 'Pro' : 'Basic'
  const planPrice = plan === 'pro' ? 'Rp 79.000' : 'Rp 29.000'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <ConfettiEffect trigger={showConfetti} />

      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Paket {planLabel} Aktif! 🎉
        </h1>

        <p className="text-muted-foreground mb-2">
          {planPrice}/bulan · Bisa dibatalkan kapan saja
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Email konfirmasi sudah dikirim ke alamat email kamu.
        </p>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 mb-8 text-left">
          <p className="font-semibold text-sm mb-3">Yang baru bisa kamu akses:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Selisih IDR per komponen pelanggaran
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Tabel kalkulasi PPh21 TER lengkap
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Rekomendasi tindak lanjut per pelanggaran
            </li>
          </ul>
        </div>

        <Button
          asChild
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 gap-2 mb-3"
        >
          <Link href="/slip">
            <FileText className="w-4 h-4" />
            Audit Slip Gaji Sekarang →
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full h-12 gap-2">
          <Link href="/dashboard">
            Dashboard →
          </Link>
        </Button>
      </div>
    </main>
  )
}