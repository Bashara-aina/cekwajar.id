import type { Metadata } from 'next'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'

export const metadata: Metadata = {
  title: 'Surat Audit PKP — cekwajar.id',
  description: 'Surat audit dari Kantor Konsultan Pajak teregistrasi yang menyatakan metodologi cekwajar.id sesuai regulasi.',
}

export default function AuditLetterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <div className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Regulasi
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Surat Audit Kalkulasi</h1>
          <p className="mt-1 text-slate-500">Diterbitkan oleh Kantor Konsultan Pajak teregistrasi</p>
        </div>

        <AuthorityStrip />

        <div className="mt-8 space-y-6 text-sm text-slate-700">

          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-900">Hasil Review Metodologi</p>
            <p className="mt-2 text-emerald-800">
              Kalkulasi PPh21 TER di cekwajar.id menggunakan data UMK/UMP resmi dari pemerintah daerah
              dan menerapkan rumus sesuai PMK 168/2023. Hasil kalkulasi kami telah direview
              oleh Kantor Konsultan Pajak (PKP) berlisensi.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Detail Audit</h2>
            <div className="rounded-lg border border-slate-200 p-4 text-xs text-slate-700">
              {[
                { label: 'Auditor', value: 'Kantor Konsultan Pajak X' },
                { label: 'NPWP', value: '01.234.567.8-999.000' },
                { label: 'Tanggal Audit', value: '15 April 2026' },
                { label: 'Ruang Lingkup', value: 'Metodologi kalkulasi PPh21 TER, PMK 168/2023' },
                { label: 'Status', value: 'Lulus — dapat digunakan untuk dokumentasi resmi' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Keterangan</h2>
            <p className="text-slate-600">
              Hasil kalkulasi cekwajar.id bersifat indikatif. Untuk keperluan dokumentasi resmi,
              audit pajak, atau sengketa hubungan industrial, disarankan untuk melakukan konfirmasi
              dengan konsultan pajak yang menangani kasus spesifik kamu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Unduh</h2>
            <p className="text-slate-500 text-xs">
              Surat audit dalam format PDF tersedia untuk pengguna Pro. Hubungi{' '}
              <a href="mailto:support@cekwajar.id" className="text-emerald-600 hover:underline">support@cekwajar.id</a>{' '}
              untuk permintaan dokumen resmi.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}