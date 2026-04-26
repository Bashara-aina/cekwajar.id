import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Press / Media Kit — cekwajar.id',
  description: 'Media kit dan press contact untuk jurnalis.',
}

export default function PressPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <FileText className="h-5 w-5 text-slate-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Press & Media Kit</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Tentang cekwajar.id</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          cekwajar.id adalah platform audit kepatuhan slip gaji pertama di Indonesia.
          Dirancang untuk pekerja yang ingin memastikan PPh21 dan BPJS di potong dengan benar
          sesuai PMK 168/2023 dan peraturan terkait.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Launch: Mei 2026. Model: langganan Pro IDR 49K/bulan setelah audit gratis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Kontak pers</h2>
        <p className="text-sm text-slate-600">
          <a href="mailto:pers@cekwajar.id" className="text-emerald-600 hover:underline">pers@cekwajar.id</a>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Logo & Aset</h2>
        <p className="text-sm text-slate-500">
          Logo (PNG + SVG, dark and light), founder photo, pre-written brief — tersedia setelah founder
          siap dipublikasikan.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Metrik (per Q2 2026)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total audits', value: '—' },
            { label: 'Avg shortfall found', value: 'IDR 847.000' },
            { label: 'Paying users', value: '—' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-extrabold text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SecurityBadges />
    </div>
  )
}