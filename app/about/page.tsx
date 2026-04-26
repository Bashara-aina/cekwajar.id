import type { Metadata } from 'next'
import { User } from 'lucide-react'
import { SecurityBadges } from '@/components/legal/SecurityBadges'

export const metadata: Metadata = {
  title: 'Tentang Kami — cekwajar.id',
  description: 'Tentang founder dan misi cekwajar.id.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <User className="h-5 w-5 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Tentang Kami</h1>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 mb-4">
          <User className="h-12 w-12 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">
          Foto founder akan ditambahkan soon.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Reach us at <a href="mailto:founder@cekwajar.id" className="text-emerald-600 hover:underline">founder@cekwajar.id</a>
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Misi kami</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Saya membangun cekwajar.id untuk membantu pekerja Indonesia memverifikasi
          apakah slip gaji mereka sudah dihitung dengan benar sesuai PMK 168/2023 dan regulasi BPJS.
          Saya commit untuk:
        </p>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            'Tidak pernah menjual atau memprofiling data pengguna.',
            'Semua kalkulasi bisa diverifikasi dengan dokumen resmi.',
            'Respons email founder dalam 24 jam.',
            'Transparansi penuh soal insiden keamanan.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Kontak langsung</h2>
        <p className="text-sm text-slate-600">
          <a href="mailto:founder@cekwajar.id" className="text-emerald-600 hover:underline">founder@cekwajar.id</a> — balas dalam 24 jam.
        </p>
      </section>

      <SecurityBadges />
    </div>
  )
}