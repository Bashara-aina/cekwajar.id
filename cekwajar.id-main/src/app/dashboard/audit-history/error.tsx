'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-red-100 p-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Gagal memuat riwayat audit
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-500">
        {error.digest ?? 'Terjadi kesalahan yang tidak terduga.'}
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Kembali</Link>
        </Button>
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </div>
  )
}