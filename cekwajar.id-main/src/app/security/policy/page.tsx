import type { Metadata } from 'next'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Kebijakan Keamanan — cekwajar.id',
  description: 'Kebijakan keamanan data cekwajar.id — enkripsi, backup, dan prosedur insiden.',
}

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Keamanan
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Kebijakan Keamanan</h1>
          <p className="mt-1 text-sm text-slate-500">Versi 1.0 · Terakhir diperbarui 1 Mei 2026</p>
        </div>

        <div className="space-y-10 text-sm text-slate-700">

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="font-semibold text-emerald-900">Ringkasan Eksekutif</h2>
            <p className="mt-2 text-emerald-800">
              Semua data dienkripsi in-transit (TLS 1.3) dan at-rest (AES-256).
              Kami tidak menyimpan slip gaji lebih dari 30 hari.
              Database berada di region Singapore dengan backup harian terenkripsi.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Enkripsi</h2>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li><strong>In-transit:</strong> TLS 1.3 untuk semua koneksi HTTP</li>
              <li><strong>At-rest:</strong> AES-256 untuk database dan file storage</li>
              <li><strong>API keys:</strong> Disimpan di environment variables, tidak di kode</li>
              <li><strong>Midtrans:</strong> Kami tidak melihat atau menyimpan data kartu kredit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Akses Data</h2>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>Tidak ada manusia yang dapat mengakses slip gaji pengguna</li>
              <li>Akses ke database produksi hanya melalui VPN + SSO</li>
              <li>Semua akses logged dan di-audit triwulanan</li>
              <li>Two-factor authentication (2FA) wajib untuk semua staff</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Backup & Disaster Recovery</h2>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>Backup database harian ke S3 dengan enkripsi AES-256</li>
              <li>Retensi backup: 30 hari</li>
              <li>Recovery time objective (RTO): 4 jam</li>
              <li>Recovery point objective (RPO): 24 jam</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Vulnerability Management</h2>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>Dependency scanning otomatis pada setiap pull request</li>
              <li>Penetration test eksternal tahunan</li>
              <li>Bug bounty program di <a href="mailto:security@cekwajar.id" className="text-emerald-600 hover:underline">security@cekwajar.id</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Insiden Keamanan</h2>
            <p className="text-slate-600">
              Jika kamu menemukan celah keamanan, laporkan ke{' '}
              <a href="mailto:security@cekwajar.id" className="text-emerald-600 hover:underline">security@cekwajar.id</a>{' '}
              dengan subjek <code className="rounded bg-slate-100 px-1">[SECURITY]</code>.
              Kami akan merespons dalam 48 jam dan memberi update dalam 7 hari.
            </p>
            <p className="mt-2 text-slate-600">
              Riwayat insiden dipublikasikan di <a href="/security/incidents" className="text-emerald-600 hover:underline">/security/incidents</a>.
            </p>
          </section>

          <div className="pt-4 border-t">
            <SecurityBadges />
          </div>
        </div>
      </div>
    </div>
  )
}