import { REVENUE_ANCHORS } from '@/lib/constants'

export function UpgradePriceJustify() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Kenapa IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}?
        </h2>
        <div className="mt-6 space-y-3">
          {[
            { label: 'Konsultan pajak (PKP) di Jakarta', amount: 'IDR 500.000 – 2.000.000 / sesi', color: 'bg-slate-200' },
            { label: 'Aplikasi audit slip gaji global', amount: '≈ IDR 200.000 / bulan', color: 'bg-slate-200' },
            { label: 'Rata-rata yang ditemukan pengguna kami', amount: `IDR ${REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}`, color: 'bg-emerald-200' },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-3 rounded-lg border border-slate-200 ${item.color} p-4`}>
              <span className="text-sm text-slate-700">{item.label}</span>
              <span className="ml-auto text-sm font-semibold text-slate-900">{item.amount}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">
          IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} = harga 1× nasi padang lengkap.
          <br />Bulan pertama sering kembali modal di hari pertama.
        </p>
      </div>
    </section>
  )
}