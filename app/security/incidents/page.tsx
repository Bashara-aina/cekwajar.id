import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security Incidents — cekwajar.id',
  description: 'Riwayat insiden keamanan cekwajar.id.',
}

export default function SecurityIncidentsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Security Incidents</h1>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">
          Belum ada insiden keamanan yang dipublikasi.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Ini adalah halaman ringkasan teknis kalau ada insiden di masa depan.
          Setiap insiden akan diposting di sini dalam 48 jam setelah resolved.
        </p>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 text-sm text-emerald-800">
        <strong> Subscribe:</strong> Kalau ada insiden baru, akan muncul di halaman ini.
        Tidak ada mailing list — cek halaman ini secara berkala atau follow repository.
      </div>
    </div>
  )
}