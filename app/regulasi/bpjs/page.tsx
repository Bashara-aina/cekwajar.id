import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BPJS Ketenagakerjaan — cekwajar.id',
  description: 'Penjelasan 6 komponen BPJS Ketenagakerjaan: JHT, JP, JKK, JKM, dan relevansinya dengan audit slip gaji.',
}

export default function BpjsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <FileText className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">PP 44, 45, 46/2015 — BPJS</h1>
          <p className="text-xs text-slate-500">6 komponen iuran BPJS Ketenagakerjaan</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">6 Komponen BPJS</h2>
        {[
          { name: 'JHT (Jaminan Hari Tua)', rate: '2% dari gaji pokok (worker)', cap: 'IDR 9.559.600/bulan (2026)', note: 'Diisi oleh perusahaan 3.7%' },
          { name: 'JP (Jaminan Pensiun)', rate: '1% dari gaji pokok (worker)', cap: 'IDR 9.559.600/bulan (2026)', note: 'Diisi oleh perusahaan 2%' },
          { name: 'JKK (Jaminan Kecelakaan Kerja)', rate: '0.24%-1.74% dari gaji', cap: 'Depends on risk class', note: '100% ditanggung perusahaan' },
          { name: 'JKM (Jaminan Kematian)', rate: '0.30% dari gaji', cap: 'Berdasarkan UP', note: '100% ditanggung perusahaan' },
          { name: 'BPJS Kesehatan', rate: '1% dari gaji (worker)', cap: 'IDR 12.000.000/bulan', note: 'Ditanggung 4% oleh perusahaan' },
        ].map((b) => (
          <div key={b.name} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{b.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{b.note}</p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-mono text-blue-700">{b.rate}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Cap: {b.cap}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Kenapa ada selisih di slip?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Banyak perusahaan tidak memotong bagian worker untuk JHT dan JP, atau salah menghitung
          cap UMK. cekwajar.id mendeteksi setiap komponen dan menghitung selisihnya dalam rupiah.
        </p>
      </section>

      <Link href="/slip" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
        Audit slip gaji sekarang <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}