import type { Metadata } from 'next'
import { Scale } from 'lucide-react'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Syarat dan Ketentuan — cekwajar.id',
  description: 'Syarat dan ketentuan penggunaan cekwajar.id.',
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Scale className="h-5 w-5 text-slate-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Syarat dan Ketentuan</h1>
      </div>

      <p className="text-xs text-slate-400">Berlaku sejak 1 Mei 2026</p>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">1. Layanan</h2>
        <p className="text-sm text-slate-600">
          cekwajar.id adalah platform audit kepatuhan slip gaji yang menghitung pelanggaran
          PPh21 dan BPJS berdasarkan data yang kamu berikan dan peraturan yang berlaku.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">2. Disclaimer</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Hasil audit cekwajar.id bersifat informatif</strong> berdasarkan data yang kamu
            berikan dan peraturan yang berlaku. Hasil ini <strong>bukan merupakan konsultasi pajak,
            konsultasi hukum, atau penilaian resmi</strong>. Untuk keputusan finansial penting
            (mis. menggugat perusahaan, file SPT), konsultasikan dengan konsultan pajak atau
            pengacara terdaftar.
          </p>
        </div>
        <p className="text-sm text-slate-600">
          Kami sudahberusaha semaksimal mungkin memastikan akurasi kalkulasi, namun kami tidak bertanggung jawab
          atas kerugian yang timbul dari penggunaan hasil audit ini.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">3. Pembayaran dan Refund</h2>
        <p className="text-sm text-slate-600">
          Langganan Pro dibayar di muka per bulan. Kamu bisa membatalkan kapan saja dari dashboard.
          Kalau membatalkan dalam 7 hari setelah pembayaran pertama, kamu berhak minta refund penuh.
          Setelah 7 hari, langganan berjalan sampai akhir periode yang sudah dibayar.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">4. Penyelesaian Sengketa</h2>
        <p className="text-sm text-slate-600">
          Kalau ada sengketa, kami akan berusaha menyelesaikan secara kekeluargaan terlebih dahulu.
          Kalau tidak bisa, sengketa diselesaikan melalui Mediasi sesuai UU No. 30/1999
          tentang Arbitrase dan Mediasi. Kalau mediation gagal, arbitration di Semarang, Indonesia.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">5. Perubahan</h2>
        <p className="text-sm text-slate-600">
          Kami bisa ubah syarat ini sewaktu-waktu. Perubahan akan diumumkan lewat email
          atau notifikasi di dashboard paling tidak 14 hari sebelum berlaku.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">6. Kontak</h2>
        <p className="text-sm text-slate-600">
          Pertanyaan soal syarat ini: <a href="mailto:legal@cekwajar.id" className="text-emerald-600 hover:underline">legal@cekwajar.id</a>
        </p>
      </section>

      <SecurityBadges />
    </div>
  )
}