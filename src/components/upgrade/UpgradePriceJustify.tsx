import { REVENUE_ANCHORS } from '@/lib/constants'

export function UpgradePriceJustify() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Kenapa IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}?
        </h2>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-2xl font-bold text-slate-400 w-32 shrink-0">
              IDR {(500_000).toLocaleString('id-ID')} — {(2_000_000).toLocaleString('id-ID')}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Konsultan pajak (PKP)</p>
              <p className="text-xs text-slate-500">per sesi di Jakarta</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-2xl font-bold text-slate-400 w-32 shrink-0">
              ~IDR 200.000
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Aplikasi audit global</p>
              <p className="text-xs text-slate-500">USD 12/bulan</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-2xl font-bold text-emerald-700 w-32 shrink-0">
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Rata-rata yang ditemukan</p>
              <p className="text-xs text-emerald-600">oleh pengguna CekWajar</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">
          IDR 49.000 = harga 1× nasi padang lengkap. Bulan pertama sering kembali modal di hari pertama.
        </p>
      </div>
    </section>
  )
}
