import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — cekwajar.id',
  description: 'Kebijakan privasi pemrosesan data pribadi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Kebijakan Privasi</h1>
        <p className="mt-1 text-sm text-slate-500">Terakhir diperbarui: April 2026</p>

        <div className="mt-8 space-y-6 text-sm text-slate-600">
          <section>
            <h2 className="text-base font-semibold text-slate-900">1. Data yang Kami Kumpulkan</h2>
            <p className="mt-2">
              Kami mengumpulkan slip gaji yang Anda upload untuk tujuan audit PPh21 dan BPJS. File slip gaji
              diproses secara otomatis dan tidak dibaca oleh manusia. Data yang kami simpan: nama file, hasil
              audit, dan metadata pembayaran.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">2. Penyimpanan dan Penghapusan</h2>
            <p className="mt-2">
              Slip gaji disimpan di server Supabase (Singapore, ap-southeast-1) dan dihapus secara permanen
              dalam waktu 30 hari setelah upload. Data audit yang telah diproses akan disimpan sesuai
              kebutuhan layanan.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">3. Pembagian Data</h2>
            <p className="mt-2">
              Kami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga. Data hanya digunakan
 untuk menyediakan layanan audit slip gaji di cekwajar.id.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">4. Hak Anda (UU PDP Pasal 5–8)</h2>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Minta salinan data pribadi Anda</li>
              <li>Minta perbaikan data yang tidak akurat</li>
              <li>Minta penghapusan data pribadi Anda</li>
              <li>Menarik persetujuan sewaktu-waktu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">5. Pembayaran</h2>
            <p className="mt-2">
              Pembayaran diproses oleh Midtrans. Kami tidak menyimpan data kartu kredit atau debit Anda.
              Detail pembayaran tunduk pada kebijakan privasi Midtrans.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">6. Hubungi Kami</h2>
            <p className="mt-2">
              Untuk pertanyaan tentang kebijakan privasi ini, hubungi kami di{' '}
              <a href="mailto:privacy@cekwajar.id" className="text-emerald-600 hover:underline">
                privacy@cekwajar.id
              </a>
              .
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
