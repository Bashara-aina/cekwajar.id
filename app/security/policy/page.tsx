import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kebijakan Keamanan — cekwajar.id',
  description: 'Kebijakan transparansi insiden dan keamanan data cekwajar.id.',
}

export default function SecurityPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kebijakan Keamanan</h1>
          <p className="text-xs text-slate-500">Cara cekwajar.id menangani insiden</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        Kami percaya transparansi mengurangi risiko, bukan menambahnya.
      </p>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Kami percaya transparansi mengurangi risiko, bukan menambahnya.</h2>
        <p className="text-sm text-slate-600">Kalau ada insiden, ini yang akan kamu dapat:</p>
        <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
          <li><strong>Dalam 1 jam</strong> — bucket terkait di-isolasi, akses dicabut.</li>
          <li><strong>Dalam 24 jam</strong> — kamu dapat email individual yang menjelaskan apa yang terjadi.</li>
          <li><strong>Dalam 3 hari</strong> — kami laporkan BSSN/Kominfo (Pasal 46 UU PDP).</li>
          <li><strong>Dalam 48 jam publik</strong> — kami publikasi postmortem teknis di /security/incidents.</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Yang TIDAK akan kami lakukan:</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            'Kami tidak akan menyembunyikan kebocoran.',
            'Kami tidak akan menyalahkan pengguna.',
            'Kami tidak akan menghapus komentar di publik.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">—</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Riwayat insiden</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Belum ada insiden sejak peluncuran.
          </p>
        </div>
      </section>
    </div>
  )
}