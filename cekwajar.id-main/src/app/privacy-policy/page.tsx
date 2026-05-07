// ==============================================================================
// cekwajar.id — Privacy Policy in Bahasa Indonesia
// Static server component — structured by data type for UU PDP compliance
// ==============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — cekwajar.id',
  description: 'Kebijakan privasi cekwajar.id. Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi kamu berdasarkan UU No. 27/2022 (PDP).',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Kebijakan Privasi</h1>
          <p className="text-sm text-slate-500">Versi 1.0 · Berlaku 1 Mei 2026</p>
        </div>

        <div className="space-y-10 text-sm text-slate-700">

          {/* Section 1: Data table */}
          <section id="general">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Apa yang kami simpan, kapan, dan kenapa</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Data</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Klasifikasi</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Disimpan berapa lama</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Untuk apa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-2 px-3 font-medium">Slip gaji (PDF/foto)</td>
                    <td className="py-2 px-3"><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">SENSITIF</span></td>
                    <td className="py-2 px-3">30 hari (auto-delete)</td>
                    <td className="py-2 px-3">OCR + audit</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Status PTKP</td>
                    <td className="py-2 px-3"><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">SENSITIF</span></td>
                    <td className="py-2 px-3">90 hari</td>
                    <td className="py-2 px-3">Kalkulasi PPh21</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Gaji bruto (anonim)</td>
                    <td className="py-2 px-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">UMUM</span></td>
                    <td className="py-2 px-3">Anonymized after 90 days</td>
                    <td className="py-2 px-3">Benchmark agregat</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Email + akun</td>
                    <td className="py-2 px-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">UMUM</span></td>
                    <td className="py-2 px-3">Selama akun aktif</td>
                    <td className="py-2 px-3">Login + komunikasi</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Riwayat audit</td>
                    <td className="py-2 px-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">UMUM</span></td>
                    <td className="py-2 px-3">24 bulan, lalu anonim</td>
                    <td className="py-2 px-3">Riwayat</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">IP address</td>
                    <td className="py-2 px-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">UMUM</span></td>
                    <td className="py-2 px-3">90 hari (dalam bentuk hash)</td>
                    <td className="py-2 px-3">Pencegahan fraud</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: What we DON'T do */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Apa yang TIDAK kami lakukan</h2>
            <ul className="space-y-2 text-slate-600">
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

          {/* Section 3: Your rights */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Hak kamu (UU PDP Pasal 22–27)</h2>
            <p className="mb-3 text-slate-600">Setiap saat, kamu berhak:</p>
            <ul className="space-y-2 text-slate-600">
              {[
                { label: 'Akses', desc: 'minta salinan data kamu yang kami simpan' },
                { label: 'Koreksi', desc: 'minta kami betulkan data salah' },
                { label: 'Hapus', desc: 'minta kami hapus seluruh data kamu (max 7 hari)' },
                { label: 'Tarik persetujuan', desc: 'hentikan pemrosesan data sensitif' },
              ].map((right) => (
                <li key={right.label} className="flex items-start gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{right.label}</span>
                  {right.desc}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Cara: email ke <a href="mailto:pdp@cekwajar.id" className="text-emerald-600 hover:underline">pdp@cekwajar.id</a> atau klik "Hapus akun saya" di dashboard.
            </p>
          </section>

          {/* Section 4: Cross-border */}
          <section id="payslip">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Pemrosesan Lintas Negara (Pasal 56)</h2>
            <p className="text-slate-600">
              Data kamu disimpan di Supabase region <strong>ap-southeast-1 (Singapore)</strong>.
              Singapore tidak ada di daftar adekuasi Indonesia (per April 2026), jadi kami menggunakan
              mekanisme Standard Contractual Clauses (SCC) sesuai Pasal 56(2)(a).
              Salinan SCC kami tersedia di <Link href="/legal/scc-supabase" className="text-emerald-600 hover:underline">/legal/scc-supabase</Link>.
            </p>
          </section>

          {/* Section 5: Incidents */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Insiden / Kebocoran</h2>
            <p className="text-slate-600">
              Kalau ada insiden keamanan yang menyentuh data kamu, kami akan:
            </p>
            <ol className="mt-2 space-y-1 text-slate-600 list-decimal list-inside">
              <li>Memberitahu kamu individual via email dalam 24 jam (Pasal 46)</li>
              <li>Lapor BSSN/Kominfo dalam 3 hari (Pasal 46)</li>
              <li>Publikasikan ringkasan teknis di <Link href="/security/incidents" className="text-emerald-600 hover:underline">/security/incidents</Link></li>
            </ol>
          </section>

          {/* Section 6: DPO contact */}
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Kontak Pengawas Internal (DPO)</h2>
            <p className="text-slate-600">
              Founder bertindak sebagai Data Protection Officer.
              Kontak: <a href="mailto:dpo@cekwajar.id" className="text-emerald-600 hover:underline">dpo@cekwajar.id</a> (response SLA 5 hari kerja)
            </p>
          </section>

          {/* Security badges */}
          <div className="pt-4 border-t">
            <SecurityBadges />
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-emerald-600">Syarat & Ketentuan</Link>
            <Link href="/security/policy" className="hover:text-emerald-600">Kebijakan Keamanan</Link>
            <Link href="/regulasi/audit-letter" className="hover:text-emerald-600">Surat Audit PKP</Link>
          </div>
        </div>
      </div>
    </div>
  )
}