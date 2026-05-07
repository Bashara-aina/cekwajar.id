import Image from 'next/image'

export function UpgradeDemo() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Begini tampilan detail yang kamu bayar
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Setiap komponen violations ditunjukkan dengan jumlah rupiah spesifik dan langkah yang harus diambil.
        </p>
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
          <div className="bg-slate-100 p-8 text-center">
            <div className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Verdict</p>
              <p className="mt-2 text-3xl font-extrabold text-red-700">TIDAK WAJAR</p>
              <p className="mt-1 text-sm text-slate-500">3 pelanggaran ditemukan</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between rounded bg-red-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">PPh21 kurang</span>
                  <span className="font-semibold text-red-700">IDR 847.000</span>
                </div>
                <div className="flex justify-between rounded bg-amber-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">JHT tidak sesuai</span>
                  <span className="font-semibold text-amber-700">IDR 234.000</span>
                </div>
                <div className="flex justify-between rounded bg-amber-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">BPJS Kesehatan</span>
                  <span className="font-semibold text-amber-700">IDR 166.000</span>
                </div>
              </div>
              <div className="mt-4 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-xs text-emerald-600">Total yang ditahan</p>
                <p className="text-2xl font-black text-emerald-700">IDR 1.247.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}