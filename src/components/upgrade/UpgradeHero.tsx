import { ShieldCheck } from 'lucide-react'
import { REVENUE_ANCHORS } from '@/lib/constants'

export function UpgradeHero() {
  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 to-white px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">cekwajar.id Pro</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Buka detail rupiah yang slip gajimu sembunyikan.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} / bulan. Bulan pertama biasanya kurang dari uang yang kamu temukan.
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Garansi 7 hari uang kembali — Batalkan kapan saja
        </p>
      </div>
    </section>
  )
}
