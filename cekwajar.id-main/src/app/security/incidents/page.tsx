import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insiden Keamanan — cekwajar.id',
  description: 'Riwayat insiden keamanan dan kebocoran data cekwajar.id.',
}

export default function SecurityIncidentsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Keamanan
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Insiden Keamanan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan insiden keamanan yang mempengaruhi data pengguna.
          </p>
        </div>

        <div className="space-y-4">
          {/* Empty state — no incidents */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <p className="font-semibold text-slate-800">Belum ada insiden keamanan yang tercatat.</p>
            <p className="mt-1 text-sm text-slate-500">
              Ini berarti tidak ada kebocoran atau kehilangan data pengguna sejak launch.
              Kebijakan kami adalah transparan — jika suatu saat ada insiden,
              kami akan memperbarui halaman ini dalam 24 jam setelah konfirmasi.
            </p>
          </div>

          {/* Process explanation */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="font-semibold text-emerald-900 mb-2">Prosedur Insiden Kami</h2>
            <ol className="space-y-1 text-sm text-emerald-800 list-decimal list-inside">
              <li>Konfirmasi dan assess cakupannya (0–24 jam)</li>
              <li>Beritahu pengguna yang affected via email langsung (24 jam)</li>
              <li>Lapor ke BSSN/Kominfo jika diperlukan (3 hari, Pasal 46 UU PDP)</li>
              <li>Publikasi ringkasan teknis di halaman ini (7 hari)</li>
              <li>Post-mortem dalam 30 hari</li>
            </ol>
          </div>

          <p className="text-center text-xs text-slate-500">
            Terakhir diperbarui: 1 Mei 2026
          </p>
        </div>
      </div>
    </div>
  )
}