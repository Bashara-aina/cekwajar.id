import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section className="bg-emerald-600 px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Slip gajimu menunggu kamu cek.
        </h2>
        <p className="mt-3 text-base text-emerald-100">
          30 detik. Gratis. Tanpa daftar.
        </p>
        <div className="mt-8">
          <Link href="/wajar-slip">
            <Button
              size="lg"
              className="h-12 bg-white px-8 text-base font-semibold text-emerald-700 shadow-lg hover:bg-emerald-50"
            >
              Cek Slip Gajiku Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-emerald-200">
          Slip dihapus 30 hari sesuai UU PDP · Garansi 7 hari uang kembali
        </p>
      </div>
    </section>
  )
}
