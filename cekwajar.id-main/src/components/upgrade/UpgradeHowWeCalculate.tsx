import Link from 'next/link'

export function UpgradeHowWeCalculate() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Bagaimana kami menghitung
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Setiap komponen dihitung menggunakan dasar hukum yang bisa kamu verifikasi sendiri.
        </p>
        <div className="mt-6 space-y-3">
          {[
            { label: 'PMK 168/2023 (TER)', sub: 'Lampiran A, B, C untuk metode TER PPh21', href: '/regulasi/pmk-168-2023' },
            { label: '6 komponen BPJS', sub: 'PP 44/2015, PP 45/2015, PP 46/2015, Perpres 82/2018', href: '/regulasi/bpjs' },
            { label: 'UMK 2026 per kota', sub: 'SK Gubernur 34 provinsi', href: '/regulasi/umk' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
              <span className="text-xs font-medium text-emerald-600">Baca dasar hukum →</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Mesin kalkulasi diaudit konsultan pajak bersertifikasi PKP sebelum launch.
        </p>
      </div>
    </section>
  )
}