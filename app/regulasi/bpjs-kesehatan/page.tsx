import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BPJS Kesehatan (Perpres 82/2018) — cekwajar.id',
  description: 'Penjelasan BPJS Kesehatan menurut Perpres 82/2018 dan kaitannya dengan audit slip gaji.',
}

export default function BpjsKesehatanPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
          <FileText className="h-5 w-5 text-teal-700" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Perpres 82/2018 — BPJS Kesehatan</h1>
          <p className="text-xs text-slate-500">Iuran BPJS Kesehatan dan kategorinya</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Tarif Iuran BPJS Kesehatan</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          {[
            { segment: 'Pekerja Bukan Penerima Upah (PBPU)', rate: '5% dari Gaji/Upah', cap: 'IDR 12.000.000', note: '1% worker, 4% perusahaan' },
            { segment: 'Penerima Upah (PU)', rate: '5% dari Gaji/Upah', cap: 'IDR 12.000.000', note: '1% worker, 4% perusahaan' },
            { segment: 'Pekerja mandiri (mandiri)', rate: 'Otomatis berdasarkan tier', cap: 'IDR 42.000 - 378.000/bulan', note: 'Tergantung tier yang dipilih' },
          ].map((s) => (
            <div key={s.segment} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-slate-700">{s.segment}</p>
                <p className="text-xs text-slate-400">{s.note}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs text-slate-600">{s.rate}</p>
                <p className="text-xs text-slate-400">Cap: {s.cap}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Apa yang dihitung cekwajar.id?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          cekwajar.id menghitung apakah potongan BPJS Kesehatan di slip kamu sudah sesuai
          dengan 1% dari gaji pokok (capped di IDR 12.000.000). Kalau perusahaan kamu tercatat
          sebagai &quot;Peserta PU&quot; tapi slip menunjukkan potongan berbeda, ada pelanggaran.
        </p>
      </section>

      <Link href="/slip" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
        Audit slip gaji sekarang <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}