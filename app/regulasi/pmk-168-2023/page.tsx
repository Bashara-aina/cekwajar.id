import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'PMK 168/2023 (TER) — cekwajar.id',
  description: 'Penjelasan PMK 168/2023 tentang Tarif Efektif Tahunan (TER) dan relevansinya dengan audit slip gaji.',
}

export default function Pmk168Page() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <FileText className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">PMK 168/2023 (TER)</h1>
          <p className="text-xs text-slate-500">Peraturan Menteri Keuangan — Tarif Efektif Tahunan</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Apa itu TER?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          TER (Tarif Efektif Tahunan) adalah mekanisme pemotongan PPh21 yang disederhanakan
          berdasarkan UU HPP No. 7/2021. Pada intinya, kalau PTKP kamu di bawah threshold, tarif
          PPh21 dihitung dari penghasilan neto kemudian dibagi 12 untuk 12 bulan.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Kenapa ini penting di slip gaji?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Banyak HRD yang salah hitung TER karena tidak memahami PTKP terbaru atau tidak menerapkan
          tarif progresif yang benar. cekwajar.id mendeteksi selisih ini dan memberi tahu kamu beberapa rupiah
          yang seharusnya jadi milik kamu.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Hubungan dengan cekwajar.id</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Kalkulasi PPh21 di cekwajar.id menggunakan tarif TER sesuai PMK 168/2023.
          Setiap hasil audit menampilkan <strong>selisih antara apa yang dipotong di slip kamu
          dan apa yang seharusnya</strong> sesuai ketentuan.
        </p>
      </section>

      <Link
        href="/slip"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
      >
        Audit slip gaji sekarang <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        PDF asli PMK 168/2023 tersedia di situs resmi DJP (direktoratjep.go.id). Link akan ditambahkan
        setelah dokumen tersedia di Supabase Storage.
      </div>
    </div>
  )
}