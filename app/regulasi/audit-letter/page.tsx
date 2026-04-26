import type { Metadata } from 'next'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Audit Letter — cekwajar.id',
  description: 'Surat keterangan audit dari Kantor Konsultan Pajak tervifikasi.',
}

export default function AuditLetterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <FileText className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Surat Keterangan Audit</h1>
          <p className="text-xs text-slate-500">Audit kalkulasi oleh Konsultan Pajak Berizen</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">
          Surat audit dari Kantor Konsultan Pajak (PKP) tervifikasi akan diunggah setelah proses
          audit selesai. Dokumen ini akan membuktikan bahwa kalkulasi di cekwajar.id sudah sesuai
          dengan peraturan yang berlaku.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Estimated: Mei 2026 setelah launch.
        </p>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 text-sm text-emerald-800">
        <strong>Sasaran:</strong> TC-01 through TC-15 (per PMK 168/2023 Lampiran A, B, C).
        Semua test case harus menghasilkan output matching expected values dalam IDR 100 tolerance.
      </div>
    </div>
  )
}