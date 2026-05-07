import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'
import { ShieldCheck, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'UMK 2026 — cekwajar.id',
  description: 'Upah Minimum Kabupaten/Kota (UMK) 2026 seluruh Indonesia dan hubungannya dengan kalkulasi cekwajar.id.',
}

const UMK_2026 = [
  { kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', umk: 5350000 },
  { kota: 'Jakarta Barat', provinsi: 'DKI Jakarta', umk: 5350000 },
  { kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', umk: 5350000 },
  { kota: 'Jakarta Timur', provinsi: 'DKI Jakarta', umk: 5350000 },
  { kota: 'Jakarta Utara', provinsi: 'DKI Jakarta', umk: 5350000 },
  { kota: 'Kota Bandung', provinsi: 'Jawa Barat', umk: 4792000 },
  { kota: 'Kota Bekasi', provinsi: 'Jawa Barat', umk: 5176000 },
  { kota: 'Kota Depok', provinsi: 'Jawa Barat', umk: 4805000 },
  { kota: 'Kota Surabaya', provinsi: 'Jawa Timur', umk: 4695000 },
  { kota: 'Kota Medan', provinsi: 'Sumatera Utara', umk: 2750000 },
  { kota: 'Kota Semarang', provinsi: 'Jawa Tengah', umk: 3130000 },
  { kota: 'Kota Makassar', provinsi: 'Sulawesi Selatan', umk: 3475000 },
  { kota: 'Kota Palembang', provinsi: 'Sumatera Selatan', umk: 3310000 },
  { kota: 'Kota Denpasar', provinsi: 'Bali', umk: 3010000 },
  { kota: 'Kota Yogyakarta', provinsi: 'DI Yogyakarta', umk: 3000000 },
]

export default function Umk2026Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" /> Regulasi
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Upah Minimum Kabupaten/Kota (UMK) 2026
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Daftar UMK terbaru seluruh Indonesia. Data diambil dari Keputusan Gubernur masing-masing provinsi.
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Kenapa UMK Penting?</h2>
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
              <p>
                UMK adalah <strong>batas minimum</strong> upah yang harus dibayar pemberi kerja kepada pekerja per bulan. Jika slip gaji kamu menunjukkan upah di bawah UMK kota kamu, itu berarti perusahaan melanggar hukum.
              </p>
              <p className="mt-2">
                Di cekwajar.id, kami mendeteksi otomatis apakah gaji kamu <strong>di bawah UMK</strong> dan menghitung berapa kekurangan yang harus dibayar oleh pemberi kerja.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Daftar UMK 2026 (Seleksi)</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Kota</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Provinsi</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">UMK/Bulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {UMK_2026.map((row) => (
                    <tr key={row.kota}>
                      <td className="py-2 px-3 font-medium">{row.kota}</td>
                      <td className="py-2 px-3 text-slate-600">{row.provinsi}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-800">
                        Rp {row.umk.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              * Data UMK di atas adalah contoh. UMK aktual silakan cek di situs resmi DISNAKER masing-masing provinsi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Cara cekwajar.id Menggunakan UMK</h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                Mendeteksi apakah upah yang tercantum di slip gaji kamu di bawah UMK kota kamu.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                Menghitung estimasi kekurangan upah yang harus dibayar pemberi kerja.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                Memberikan rekomendasi langkah yang bisa kamu tempuh.
              </li>
            </ul>
          </section>

          <AuthorityStrip />

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-800">Cek apakah Upah kamu sudah Wajar</p>
              <p className="text-xs text-slate-500">Upload slip gaji dan cek apakah sudah di atas UMK.</p>
            </div>
            <Link href="/wajar-slip" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Wajar Slip
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <Link href="/regulasi/pmk-168-2023" className="hover:text-emerald-600">PMK 168/2023</Link>
            <Link href="/regulasi/bpjs" className="hover:text-emerald-600">BPJS Ketenagakerjaan</Link>
            <Link href="/regulasi/bpjs-kesehatan" className="hover:text-emerald-600">BPJS Kesehatan</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
