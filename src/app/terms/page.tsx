import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan — cekwajar.id',
  description: 'Syarat dan ketentuan penggunaan layanan cekwajar.id.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Syarat & Ketentuan</h1>
        <p className="mt-1 text-sm text-slate-500">Terakhir diperbarui: April 2026</p>

        <div className="mt-8 space-y-6 text-sm text-slate-600">
          <section>
            <h2 className="text-base font-semibold text-slate-900">1. Layanan</h2>
            <p className="mt-2">
              cekwajar.id menyediakan layanan audit slip gaji otomatis berdasarkan PMK 168/2023 dan
              peraturan BPJS yang berlaku. Hasil audit bersifat indikatif dan tidak pengganti konsultasi
              pajak resmi.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">2. Langganan</h2>
            <p className="mt-2">
              Langganan Pro dibebaskan pada IDR 49.000/bulan. Pembatalan dapat dilakukan kapan saja
              dari dashboard. Akses Pro tetap aktif sampai akhir periode billing yang sudah dibayar.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">3. Garansi Uang Kembali</h2>
            <p className="mt-2">
              Pengajuan refund dapat dilakukan dalam 7 hari pertama setelah pembayaran. Refund diproses
              otomatis via Midtrans dalam 1×24 jam tanpa pertanyaan.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">4. Batasan Tanggung Jawab</h2>
            <p className="mt-2">
              Hasil audit cekwajar.id bersifat indikatif. Kami tidak bertanggung jawab atas kerugian
              yang timbul dari penggunaan layanan ini. Untuk keputusan pajak yang mengikat, silakan
              konsultasikan dengan konsultan pajak bersertifikasi PKP.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">5. Perubahan Syarat</h2>
            <p className="mt-2">
              Kami dapat mengubah syarat ini sewaktu-waktu. Perubahan akan diinformasikan melalui
              email atau notice di situs.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">6. Hukum yang Berlaku</h2>
            <p className="mt-2">
              Syarat ini diatur oleh hukum Republik Indonesia. Seluruh sengketa yang timbul dari
              penggunaan layanan ini akan diselesaikan di Pengadilan Negeri Jakarta Selatan.
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <Link href="/" className="text-sm text-emerald-600 hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
