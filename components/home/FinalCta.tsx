import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="bg-emerald-600 px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">
        Slip gajimu menunggu kamu cek.
      </h2>
      <p className="mt-2 text-emerald-100">
        30 detik. Gratis. Tanpa daftar.
      </p>
      <div className="mt-6">
        <Link href="/wajar-slip">
          <Button
            size="lg"
            className="h-12 bg-white text-emerald-700 font-semibold hover:bg-emerald-50 shadow-lg"
          >
            Cek Slip Gajiku Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
