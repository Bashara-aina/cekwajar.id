import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — cekwajar.id',
  description: 'Kebijakan privasi cekwajar.id: apa yang kami simpan, berapa lama, dan untuk apa.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Kebijakan Privasi</h1>
      </div>

      <p className="text-xs text-slate-400">Versi 1.0 · Berlaku 1 Mei 2026</p>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">1. Apa yang kami simpan, kapan, dan kenapa</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="pb-2 pr-4 text-xs font-semibold text-slate-500">Data</th>
                <th className="pb-2 pr-4 text-xs font-semibold text-slate-500">Klasifikasi</th>
                <th className="pb-2 pr-4 text-xs font-semibold text-slate-500">Disimpan berapa lama</th>
                <th className="pb-2 text-xs font-semibold text-slate-500">Untuk apa</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Slip gaji (PDF/foto)</td>
                <td className="py-2 pr-4"><span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">SENSITIF</span></td>
                <td className="py-2 pr-4">30 hari (auto-delete)</td>
                <td className="py-2">OCR + audit</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Status PTKP</td>
                <td className="py-2 pr-4"><span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">SENSITIF</span></td>
                <td className="py-2 pr-4">90 hari</td>
                <td className="py-2">Kalkulasi PPh21</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Gaji bruto</td>
                <td className="py-2 pr-4"><span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">UMUM</span></td>
                <td className="py-2 pr-4">Anonim setelah 90 hari</td>
                <td className="py-2">Benchmark agregat</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Email + akun</td>
                <td className="py-2 pr-4"><span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">UMUM</span></td>
                <td className="py-2 pr-4">Selama akun aktif</td>
                <td className="py-2">Login + komunikasi</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Riwayat audit</td>
                <td className="py-2 pr-4"><span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">UMUM</span></td>
                <td className="py-2 pr-4">24 bulan, lalu anonim</td>
                <td className="py-2">Riwayat</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">IP address</td>
                <td className="py-2 pr-4"><span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">UMUM</span></td>
                <td className="py-2 pr-4">90 hari (hash)</td>
                <td className="py-2">Pencegahan fraud</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">2. Apa yang TIDAK kami lakukan</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            'Kami tidak menjual data ke pihak ketiga.',
            'Kami tidak mempelajari slip kamu untuk profiling.',
            'Kami tidak share dengan pemberi kerja kamu.',
            'Kami tidak menampilkan iklan di produk ini.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">3. Hak kamu (UU PDP Pasal 22-27)</h2>
        <p className="text-sm text-slate-600">Setiap saat, kamu berhak:</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li><strong>Akses</strong> — minta salinan data kamu yang kami simpan</li>
          <li><strong>Koreksi</strong> — minta kami betulkan data salah</li>
          <li><strong>Hapus</strong> — minta kami hapus seluruh data kamu (max 7 hari)</li>
          <li><strong>Tarik persetujuan</strong> — hentikan pemrosesan data sensitif</li>
        </ul>
        <p className="text-sm text-slate-600">
          Cara: email ke <a href="mailto:pdp@cekwajar.id" className="text-emerald-600 hover:underline">pdp@cekwajar.id</a> atau klik &quot;Hapus akun saya&quot; di dashboard.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">4. Pemrosesan Lintas Negara (Pasal 56)</h2>
        <p className="text-sm text-slate-600">
          Data kamu disimpan di Supabase region <strong>ap-southeast-1 (Singapore)</strong>.
          Singapore tidak ada di daftar adekuasi Indonesia (per April 2026), jadi kami menggunakan
          mekanisme Standard Contractual Clauses (SCC) sesuai Pasal 56(2)(a).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">5. Insiden / Kebocoran</h2>
        <p className="text-sm text-slate-600">Kalau ada insiden keamanan yang menyentuh data kamu, kami akan:</p>
        <ol className="space-y-1.5 text-sm text-slate-600 list-decimal list-inside">
          <li>Memberitahu kamu individual via email dalam 24 jam (Pasal 46)</li>
          <li>Lapor BSSN/Kominfo dalam 3 hari (Pasal 46)</li>
          <li>Publikasikan ringkasan teknis di <a href="/security/incidents" className="text-emerald-600 hover:underline">/security/incidents</a></li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">6. Kontak Pengawas Internal (DPO)</h2>
        <p className="text-sm text-slate-600">
          Founder bertindak sebagai Data Protection Officer.
          Kontak: <a href="mailto:dpo@cekwajar.id" className="text-emerald-600 hover:underline">dpo@cekwajar.id</a> (response SLA 5 hari kerja)
        </p>
      </section>

      <SecurityBadges />
    </div>
  )
}