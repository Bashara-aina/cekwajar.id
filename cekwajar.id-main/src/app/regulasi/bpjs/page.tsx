import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BPJS Ketenagakerjaan — cekwajar.id',
  description: 'Penjelasan BPJS Ketenagakerjaan (PP 44, 45, 46/2015) dan bagaimana cekwajar.id menghitung iuran BPJS dengan benar.',
}

export default function BpjsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" /> Regulasi
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            BPJS Ketenagakerjaan
          </h1>
          <p className="mt-2 text-sm text-slate-500">PP No. 44, 45, 46 Tahun 2015</p>
        </div>

        <div className="space-y-8 text-sm text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6 Komponen BPJS Ketenagakerjaan</h2>
            <div className="space-y-3">
              {[
                {
                  name: 'JHT (Jaminan Hari Tua)',
                  rate: '2% (dari pekerja) + 3.7% (dari pemberi kerja)',
                  desc: 'Dapat dicairkan saat pekerja sudah tidak bekerja (resign, pensiun, atau meninggal).',
                  capped: 'Iuran di atas PTKP (gaji di atas Rp 5 juta) dikenakan batas maksimum iuran.',
                },
                {
                  name: 'JP (Jaminan Pensiun)',
                  rate: '1% (dari pekerja) + 2% (dari pemberi kerja)',
                  desc: 'Memberikan manfaat pensiun bulanan setelah memasuki usia pensiun.',
                  capped: 'Batas maksimum iuran adalah 3x UMK wilayah setempat.',
                },
                {
                  name: 'JKK (Jaminan Kecelakaan Kerja)',
                  rate: '0.24% – 1.74% (100% dari pemberi kerja)',
                  desc: 'Berbeda tiap sektor/risiko kerja. Semakin berbahaya, semakin tinggi.',
                  capped: 'Tidak ada batas maksimum.',
                },
                {
                  name: 'JKM (Jaminan Kematian)',
                  rate: '0.30% (100% dari pemberi kerja)',
                  desc: 'Memberikan santunan kepada ahli waris jika pekerja meninggal dunia.',
                  capped: 'Tidak ada batas maksimum.',
                },
                {
                  name: 'JPK (Jaminan Pemeliharaan Kesehatan)',
                  rate: '4% (100% dari pemberi kerja, sekarang bergabung dengan BPJS Kesehatan)',
                  desc: 'Sekarang diatur dalam sistem terpisah (BPJS Kesehatan).',
                  capped: '',
                },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{item.rate}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                  {item.capped && (
                    <p className="mt-1 text-xs text-amber-600">⚠️ {item.capped}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Batas Maksimum Iuran (Cap)</h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>JHT:</strong> Untuk gaji di atas Rp 9,559,600/bulan, iuran JHT tetap dihitung dari Rp 9,559,600. Artinya, semakin tinggi gaji, proporsi JHT semakin kecil.
              </p>
              <p className="mt-2 text-sm text-amber-800">
                <strong>JP:</strong> Untuk gaji di atas 3x UMK, iuran JP tetap dihitung dari 3x UMK.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Hubungan dengan cekwajar.id</h2>
            <p className="text-slate-600">
              Mesin kalkulasi BPJS di cekwajar.id menghitung komponen-komponen di atas secara otomatis berdasarkan slip gaji yang kamu upload. Kami menggunakan tarif resmi yang berlaku per tahun berjalan dan menerapkan batas maksimum yang ditetapkan pemerintah.
            </p>
            <p className="mt-2 text-slate-600">
              Hasil kalkulasi kami sudah diaudit oleh kantor konsultan pajak teregistrasi. <Link href="/regulasi/audit-letter" className="text-emerald-600 hover:underline">Lihat surat audit</Link>.
            </p>
          </section>

          <AuthorityStrip />

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-800">Hitung BPJS kamu</p>
              <p className="text-xs text-slate-500">Cek apakah pemberi kerja kamu sudah menghitung dengan benar.</p>
            </div>
            <Link href="/wajar-slip" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Wajar Slip
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <Link href="/regulasi/pmk-168-2023" className="hover:text-emerald-600">PMK 168/2023</Link>
            <Link href="/regulasi/bpjs-kesehatan" className="hover:text-emerald-600">BPJS Kesehatan</Link>
            <Link href="/regulasi/umk-2026" className="hover:text-emerald-600">UMK 2026</Link>
            <Link href="/regulasi/audit-letter" className="hover:text-emerald-600">Surat Audit PKP</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
