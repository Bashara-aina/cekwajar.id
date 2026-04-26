import Link from 'next/link'
import { CheckCircle2, X, ArrowRight, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'

const FREE_FEATURES = [
  'Cek ada/tidaknya pelanggaran',
  'Jumlah pelanggaran yang ditemukan',
  'Tanpa daftar, langsung pakai',
  'Berlaku selamanya',
]

const FREE_LOCKED = [
  'Detail rupiah selisih per komponen',
  'Skrip langkah ke HRD + referensi pasal',
  'Riwayat audit & ekspor PDF',
  'Benchmark gaji pasar (P25–P90)',
  'Update otomatis PMK & UMK',
]

const PRO_FEATURES = [
  'Semua fitur Gratis, selamanya',
  'Detail rupiah selisih: PPh21, JHT, JP, JKK, JKM, BPJS Kes',
  'Skrip ke HRD — apa yang harus kamu katakan, dengan pasal hukumnya',
  'Riwayat audit tidak terbatas + ekspor PDF profesional',
  'Benchmark gaji pasar P25 / P50 / P75 / P90 per kota',
  'Wajar Kabur: perbandingan daya beli 20+ negara',
  'Update otomatis setiap PMK / UMK berubah — tidak ketinggalan',
  'Support prioritas langsung ke founder (balas <24 jam)',
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wider mb-4">
            <Zap className="h-3 w-3" />
            Harga Early Bird — Berlaku sampai Q3 2026
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Mulai gratis. Bayar hanya kalo mau tahu{' '}
            <span className="text-emerald-600">berapa persisnya.</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Audit dasar tidak pernah berbayar. Upgrade ke Pro untuk tahu angka pastinya
            dan tahu cara meminta kembali uang yang seharusnya jadi milikmu.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
          {/* Free */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Gratis</p>
            <p className="text-4xl font-extrabold text-slate-900">Rp 0</p>
            <p className="text-sm text-slate-400 mt-0.5">selamanya</p>

            <Link href="/slip" className="mt-5 block">
              <Button variant="outline" className="w-full h-11 font-semibold">
                Mulai Gratis →
              </Button>
            </Link>

            <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Yang kamu dapat</p>
            <ul className="mt-2 space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Terkunci di Free</p>
            <ul className="mt-2 space-y-2">
              {FREE_LOCKED.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <X className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-xl shadow-emerald-500/15 sm:p-7">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider shadow-md">
                Paling Populer
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Pro</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-slate-900">
                Rp {(REVENUE_ANCHORS.PRO_PRICE_IDR / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-slate-500">/ bulan</p>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">
              ↳ Kurang dari 1/17 rata-rata selisih yang ditemukan (Rp {Math.round(REVENUE_ANCHORS.AVG_SHORTFALL_IDR / 1000)}K)
            </p>

            <Link href="/upgrade" className="mt-5 block">
              <Button className="h-12 w-full bg-emerald-600 font-bold text-base shadow-lg shadow-emerald-500/30 hover:bg-emerald-700">
                Mulai Pro Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Garansi 7 hari uang kembali · Batalkan kapan saja dari dashboard
            </p>

            <p className="mt-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Yang kamu dapat</p>
            <ul className="mt-2 space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROI math strip */}
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Math sederhana: Rp {Math.round(REVENUE_ANCHORS.AVG_SHORTFALL_IDR / 1000)}K rata-rata ditemukan ÷ Rp {REVENUE_ANCHORS.PRO_PRICE_IDR / 1000}K biaya Pro = <span className="text-emerald-600">17× ROI bulan pertama.</span>
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Kalau audit kamu tidak menemukan pelanggaran apa pun? Email kami dalam 7 hari — refund penuh, tanpa pertanyaan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
