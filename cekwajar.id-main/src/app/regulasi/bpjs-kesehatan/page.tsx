import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'
import { ShieldCheck, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BPJS Kesehatan (Perpres 82/2018) — cekwajar.id',
  description: 'Penjelasan BPJS Kesehatan berdasarkan Perpres 82/2018 dan bagaimana cekwajar.id menghitung iuran dengan benar.',
}

export default function BpjsKesehatanPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" /> Regulasi
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            BPJS Kesehatan
          </h1>
          <p className="mt-2 text-sm text-slate-500">Peraturan Presiden No. 82 Tahun 2018</p>
        </div>

        <div className="space-y-8 text-sm text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Cara Iuran BPJS Kesehatan Dihitung</h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-800">Pekerja (bukan penerima upah)</p>
                <p className="mt-1 text-xs text-slate-600">
                  Iuran sebesar <strong>1%</strong> dari upah per bulan, dibayar seluruhnya oleh pekerja.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-800">Penerima upah (karyawan perusahaan)</p>
                <p className="mt-1 text-xs text-slate-600">
                  Iuran sebesar <strong>4%</strong> dari upah per bulan — <strong>3% dibayar pemberi kerja</strong>, <strong>1% dibayar pekerja</strong>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Batas Maksimum Iuran</h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Perhatian:</strong> Untuk gaji di atas <strong>Rp 12.000.000/bulan</strong>, iuran BPJS Kesehatan tetap dihitung dari gaji maksimum Rp 12.000.000.
              </p>
              <p className="mt-2 text-xs text-amber-700">
                Artinya: pekerja dengan gaji Rp 20 juta tetap membayar iuran sama dengan pekerja gaji Rp 12 juta (1% dari Rp 12 juta = Rp 120.000).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Kelas BPJS Kesehatan</h2>
            <p className="text-slate-600">
              Sejak 2021, sistem kelas BPJS Kesehatan berubah menjadi <strong>beragam (multi-class)</strong> namun untuk iuran standard tetap dihitung sama untuk semua. Manfaat yang diterima berdasarkan kelas yang dipilih saat mendaftar.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
              <li>Kelas 1: Iuran lebih tinggi, fasilitas lebih luas</li>
              <li>Kelas 2: Iuran menengah</li>
              <li>Kelas 3: Iuran paling rendah (subsidi pemerintah)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Benefit yang Didapat</h2>
            <ul className="space-y-1 text-slate-600 list-disc list-inside text-xs">
              <li>Pelayanan kesehatan dasar (BPJS Kesehatan primer)</li>
              <li>Rawat jalan dan inap di faskes pertama</li>
              <li>Rawat jalan dan inap di faskes rujukan (dengan rujukan)</li>
              <li>Persalinan</li>
              <li>Pelayanan obat-obatan</li>
              <li>MRI, CT-Scan, dan pemeriksaan canggih (sesuai indikasi)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Hubungan dengan cekwajar.id</h2>
            <p className="text-slate-600">
              Di cekwajar.id, kami menghitung kontribusi BPJS Kesehatan kamu secara terpisah dari BPJS Ketenagakerjaan. Hasil kalkulasi menunjukkan apakah pemberi kerja sudah memotong iuran dengan tarif yang benar dan apakah gaji yang dilaporkan sudah sesuai dengan yang seharusnya.
            </p>
          </section>

          <AuthorityStrip />

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-800">Hitung BPJS Kesehatan kamu</p>
              <p className="text-xs text-slate-500">Pastikan pemotongan dari pemberi kerja sudah benar.</p>
            </div>
            <Link href="/wajar-slip" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Wajar Slip
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <Link href="/regulasi/pmk-168-2023" className="hover:text-emerald-600">PMK 168/2023</Link>
            <Link href="/regulasi/bpjs" className="hover:text-emerald-600">BPJS Ketenagakerjaan</Link>
            <Link href="/regulasi/umk-2026" className="hover:text-emerald-600">UMK 2026</Link>
            <Link href="/regulasi/audit-letter" className="hover:text-emerald-600">Surat Audit PKP</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
