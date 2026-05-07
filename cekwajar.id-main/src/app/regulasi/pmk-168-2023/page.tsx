import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'PMK 168/2023 (TER) — cekwajar.id',
  description: 'Penjelasan PMK 168/2023 tentang Pedoman Teknis Pengelolaan Data UU PDP dan hubungannya dengan kalkulasi cekwajar.id.',
}

export default function Pmk168Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" /> Regulasi
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            PMK 168/2023 — Pedoman Teknis PER
          </h1>
          <p className="mt-2 text-sm text-slate-500">Peraturan Menteri Komunikasi dan Informatika No. 5/2025</p>
        </div>

        <div className="space-y-8 text-sm text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Apa itu PMK 168/2023?</h2>
            <div className="space-y-3 text-slate-600">
              <p>
                PMK 168/2023 adalah peraturan teknis yang mengatur bagaimana lembaga pemerintah dan swasta di Indonesia harus mengelola data pribadi dalam sistem elektronik. Peraturan ini merupakan turunan dari UU No. 27/2022 tentang Pelindungan Data Pribadi (PDP).
              </p>
              <p>
                Bagi cekwajar.id, PMK 168/2023 menentukan standar teknis untuk:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Enkripsi data sensitif (AES-256) saat penyimpanan dan transmisi</li>
                <li>Prosedurauto-delete data slip gaji setelah 30 hari</li>
                <li>Logging setiap akses ke data pribadi untuk keperluan audit</li>
                <li>Penyimpanan data di wilayah Indonesia atau luar negeri dengan mekanisme yang sah</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Kenapa ini penting untuk kamu?</h2>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-slate-600">
                Ketika kamu mengunggah slip gaji ke cekwajar.id, data tersebut:
              </p>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>✓ Dienkripsi langsung di perangkat kamu sebelum dikirim</li>
                <li>✓ Disimpan di server dengan AES-256</li>
                <li>✓ Dihapus otomatis dalam 30 hari</li>
                <li>✓ Tidak dapat diakses oleh karyawan cekwajar.id</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Hubungan dengan cekwajar.id</h2>
            <p className="text-slate-600">
              Mesin kalkulasi PPh21 TER di cekwajar.id dibangun sesuai PMK 168/2023. Setiap pemrosesan data slip gaji kamu logged dan dapat diaudit. Kami wajib menunjukkan bukti kepatuhan ini kepada regulator jika diminta.
            </p>
            <p className="mt-2 text-slate-600">
              Dokumen PDF resmi PMK 168/2023 tersedia untuk diunduh di situs resmi Kemkominfo.
            </p>
            <a
              href="https://jdih.kominfo.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <ExternalLink className="h-4 w-4" /> Download PDF Resmi di JDIH
            </a>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Artefak Kepatuhan cekwajar.id
            </h3>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Data dienkripsi dengan AES-256 (standar militer)</li>
              <li>• Auto-delete 30 hari untuk slip gaji</li>
              <li>• IP hash untuk anonymization</li>
              <li>• SCC (Standard Contractual Clauses) untuk data di Singapore</li>
            </ul>
          </section>

          <AuthorityStrip />

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-800">Ingin tahu lebih detail?</p>
              <p className="text-xs text-slate-500">Baca Kebijakan Privasi kami untuk informasi lengkap.</p>
            </div>
            <Link href="/privacy-policy" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Kebijakan Privasi
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <Link href="/regulasi/bpjs" className="hover:text-emerald-600">BPJS Ketenagakerjaan</Link>
            <Link href="/regulasi/bpjs-kesehatan" className="hover:text-emerald-600">BPJS Kesehatan</Link>
            <Link href="/regulasi/umk-2026" className="hover:text-emerald-600">UMK 2026</Link>
            <Link href="/privacy-policy" className="hover:text-emerald-600">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
