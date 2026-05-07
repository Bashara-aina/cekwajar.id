// ==============================================================================
// cekwajar.id — Terms of Service in Bahasa Indonesia
// Static server component — focus on disclaimer & dispute resolution
// ==============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Syarat dan Ketentuan — cekwajar.id',
  description: 'Syarat dan ketentuan penggunaan layanan cekwajar.id.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Syarat dan Ketentuan</h1>
          <p className="text-sm text-slate-500">Versi 1.0 · Berlaku 1 Mei 2026</p>
        </div>

        <div className="space-y-10 text-sm text-slate-700">

          {/* Disclaimer — Heart of the page */}
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">⚠️ Penafian Utama</p>
            <p className="mt-2 text-amber-800">
              Hasil audit cekwajar.id bersifat <strong>informatif</strong> berdasarkan data yang kamu berikan dan peraturan yang berlaku. Hasil ini <strong>bukan merupakan konsultasi pajak, konsultasi hukum, atau penilaian resmi</strong>. Untuk keputusan finansial penting (mis. menggugat perusahaan, file SPT), konsultasikan dengan konsultan pajak atau pengacara terdaftar.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Deskripsi Layanan</h2>
            <p className="text-slate-600">
              cekwajar.id menyediakan alat bantu analisis berbasis data untuk membantu pengguna memahami hak-upah mereka di Indonesia. Semua hasil bersifat indikatif dan tidak menggantikan konsultasi profesional.
            </p>
          </section>

          {/* Section 2: Service description */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Layanan Kami</h2>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li><strong>Wajar Slip</strong> — Analisis kepatuhan slip gaji (PMK 168/2023, PP 46/2015)</li>
              <li><strong>Wajar Gaji</strong> — Benchmark gaji berdasarkan grade dan provinsi</li>
              <li><strong>Wajar Hidup</strong> — Perbandingan biaya hidup antar kota di Indonesia</li>
              <li><strong>Wajar Kabur</strong> — Perbandingan daya beli internasional (PPP)</li>
              <li><strong>Wajar Tanah</strong> — Analisis kelayakan properti</li>
            </ul>
          </section>

          {/* Section 3: Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Batasan Tanggung Jawab</h2>
            <p className="text-slate-600">
              cekwajar.id tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan ini. Selalu konsultasikan dengan HR departemen, sindical, atau penasihat hukum untuk kepastian hak-hak kamu.
            </p>
            <p className="mt-2 text-slate-600">
              Kalkulasi kami berbasis data yang kamu input. Kami tidak memverifikasi akurasi slip gaji kamu secara independen.
            </p>
          </section>

          {/* Section 4: Subscription & payment */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Paket Berlangganan dan Pembayaran</h2>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>Pembayaran dilakukan melalui Midtrans. Kami tidak menyimpan data pembayaran penuh.</li>
              <li>Langganan diperpanjang secara otomatis pada akhir periode kecuali dibatalkan.</li>
              <li>Pembatalan dapat dilakukan kapan saja melalui dashboard.</li>
              <li>Refund 7 hari tersedia untuk pengguna pertama kali (berlaku untuk paket Pro).</li>
            </ul>
          </section>

          {/* Section 5: Prohibited uses */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Larangan Penggunaan</h2>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>Mengirimkan slip gaji palsu atau dimanipulasi untuk tujuan penipuan.</li>
              <li>Menggunakan layanan untuk menarget individu tertentu tanpa persetujuan.</li>
              <li>Menggunakan automated bot atau scraper untuk mengakses layanan.</li>
              <li>Mereproduksi atau mendistribusikan konten premium tanpa izin.</li>
            </ul>
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              Pelanggaran terhadap larangan ini dapat mengakibatkan penghentian akun dan tindakan hukum.
            </p>
          </section>

          {/* Section 6: Applicable law */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Hukum yang Berlaku dan Penyelesaian Sengketa</h2>
            <p className="text-slate-600">
              Layanan ini beroperasi di Indonesia dan diatur oleh hukum Republik Indonesia, termasuk Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen. Setiap perselisihan yang timbul dari penggunaan layanan ini akan diselesaikan melalui{' '}
              <strong>Badan Arbitrase Nasional (BANI)</strong> atau <strong>Pengadilan Negeri</strong> yang berwenang di Indonesia.
            </p>
          </section>

          {/* Section 7: Changes */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Perubahan Syarat</h2>
            <p className="text-slate-600">
              Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan signifikan akan diumumkan melalui email. Penggunaan berkelanjutan setelah perubahan berarti kamu terikat pada syarat yang diperbarui.
            </p>
          </section>

          {/* Section 8: Contact */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Kontak</h2>
            <p className="text-slate-600">
              Email: <a href="mailto:support@cekwajar.id" className="text-emerald-600 hover:underline">support@cekwajar.id</a>
            </p>
          </section>

          {/* Security badges */}
          <div className="pt-4 border-t">
            <SecurityBadges />
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Link href="/privacy-policy" className="hover:text-emerald-600">Kebijakan Privasi</Link>
            <Link href="/security/policy" className="hover:text-emerald-600">Kebijakan Keamanan</Link>
          </div>
        </div>
      </div>
    </div>
  )
}