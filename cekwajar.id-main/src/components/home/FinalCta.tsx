// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — FinalCta Component
// The closer — single emerald section, headline + CTA, no escape routes
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section className="bg-primary-600 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Slip gajimu menunggu kamu cek.
        </h2>
        <p className="mt-2 text-white">30 detik. Gratis. Tanpa daftar.</p>
        <div className="mt-6">
          <Link href="/wajar-slip">
            <Button
              size="lg"
              className="h-12 bg-white px-8 text-base font-semibold text-primary-700 shadow-lg hover:bg-primary-50"
            >
              Cek Slip Gajiku Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-white">
          Hanya ke{' '}
          <Link href="/privacy-policy" className="underline hover:text-white">
            Kebijakan Privasi
          </Link>
          {' '}dan{' '}
          <Link href="/terms" className="underline hover:text-white">
            Syarat Penggunaan
          </Link>
        </p>
      </div>
    </section>
  )
}