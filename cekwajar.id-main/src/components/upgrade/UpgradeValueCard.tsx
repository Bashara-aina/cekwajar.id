import { Check } from 'lucide-react'

const VALUE = [
  'Detail rupiah selisih per komponen (PPh21, JHT, JP, JKK, JKM, BPJS Kesehatan)',
  'Skrip langkah ke HRD — apa yang harus dikatakan, dengan referensi peraturan',
  'Riwayat audit lengkap, ekspor PDF untuk dokumentasi',
  'Akses Wajar Gaji P25-P75 per kota dan Wajar Kabur 20 negara',
  'Update otomatis kalo PMK / UMK berubah — kamu tidak ketinggalan',
]

export function UpgradeValueCard() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Yang kamu dapat dengan Pro
        </h2>
        <ul className="mt-6 space-y-3">
          {VALUE.map((v) => (
            <li key={v} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-sm text-slate-700">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}