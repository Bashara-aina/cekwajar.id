import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tentang Kami — cekwajar.id',
  description: 'CekWajar.id membantu pekerja Indonesia memahami hak-upah mereka.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">CekWajar.id</h1>
          <p className="mt-2 text-slate-500">
            Alat bantu transparansi upah untuk pekerja Indonesia
          </p>
        </div>

        <div className="space-y-10 text-sm text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Apa itu CekWajar.id?</h2>
            <p className="text-slate-600">
              CekWajar.id adalah alat analisis berbasis data yang membantu pekerja Indonesia memahami
              apakah slip gaji mereka sesuai dengan regulasi yang berlaku — termasuk PMK 168/2023 (TER)
              dan aturan BPJS 6 komponen. Kami percaya transparency is power.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Founder</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-lg font-bold text-slate-600">FH</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Founder & Developer</p>
                  <p className="mt-1 text-slate-500 text-xs">
                    ex-Googler, ex-ByteDance. Bangun produk yang solving masalah personal finance untuk pekerja Indonesia.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <a href="mailto:founder@cekwajar.id" className="text-xs text-emerald-600 hover:underline">
                      founder@cekwajar.id
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Values</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Transparansi', body: 'Angka yang kami hitung bisa kamu verifikasi sendiri. Kami tidak hide atau manipulasi hasil.' },
                { title: 'Privacy-first', body: 'Slip gaji kamu dihapus 30 hari. Tidak ada manusia yang melihat data kamu.' },
                { title: 'Edukasi', body: 'Kami jelaskan kenapa pelanggaran dan bagaimana cara memperjuangkan hak kamu.' },
                { title: 'No BS', body: 'Tidak ada hidden costs, tidak ada iklan, tidak ada profiling.' },
              ].map((v) => (
                <div key={v.title} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800">{v.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{v.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Stack Teknologi</h2>
            <div className="flex flex-wrap gap-2">
              {['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel', 'Framer Motion', 'Tesseract OCR', 'Google Vision API'].map((tech) => (
                <span key={tech} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tech}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Kontak</h2>
            <div className="space-y-2 text-slate-600">
              <p>Email: <a href="mailto:support@cekwajar.id" className="text-emerald-600 hover:underline">support@cekwajar.id</a></p>
              <p>DPo (Privacy): <a href="mailto:pdp@cekwajar.id" className="text-emerald-600 hover:underline">pdp@cekwajar.id</a></p>
              <p>Security: <a href="mailto:security@cekwajar.id" className="text-emerald-600 hover:underline">security@cekwajar.id</a></p>
            </div>
          </section>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Link href="/privacy-policy" className="hover:text-emerald-600">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-emerald-600">Syarat & Ketentuan</Link>
            <Link href="/security/policy" className="hover:text-emerald-600">Kebijakan Keamanan</Link>
            <Link href="/regulasi/pmk-168-2023" className="hover:text-emerald-600">Regulasi</Link>
          </div>
        </div>
      </div>
    </div>
  )
}