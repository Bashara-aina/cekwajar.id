import Link from 'next/link'

export function UpgradeHowWeCalculate() {
  return (
    <section className="border-t border-slate-100 bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Cara kami menghitung
        </h2>
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
            <div className="h-6 w-6 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">1</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">PMK 168/2023 (TER)</p>
              <p className="text-xs text-slate-500">
                Metode perpajakan PPh21 bulanan.{' '}
                <Link href="/regulasi/pmk-168-2023" className="text-emerald-600 hover:underline">
                  Lihat Lampiran A, B, C →
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
            <div className="h-6 w-6 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">2</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">6 Komponen BPJS</p>
              <p className="text-xs text-slate-500">
                JHT, JP, JKK, JKM, BPJS Kesehatan.{' '}
                <Link href="/regulasi/bpjs" className="text-emerald-600 hover:underline">
                  Lihat PP 44/2015, PP 45/2015, PP 46/2015, Perpres 82/2018 →
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
            <div className="h-6 w-6 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">3</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">UMK 2026 per Kota</p>
              <p className="text-xs text-slate-500">
                Upah minimum berdasarkan SK Gubernur 34 provinsi.{' '}
                <Link href="/regulasi/umk-2026" className="text-emerald-600 hover:underline">
                  Lihat UMK terbaru →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
