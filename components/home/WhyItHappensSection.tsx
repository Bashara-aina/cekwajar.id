import { Calculator, Building2, TrendingDown, AlertCircle } from 'lucide-react'

const VIOLATIONS = [
  {
    icon: Calculator,
    title: 'PPh21 formula salah atau outdated',
    desc: 'PMK 168/2023 mengubah metode TER secara signifikan per Januari 2024. Banyak software payroll HRD belum diperbarui — atau sengaja tidak diperbarui.',
    stat: 'Rp 100K – 500K / bulan',
    statLabel: 'Selisih rata-rata',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  {
    icon: Building2,
    title: 'BPJS tidak disetorkan penuh',
    desc: '5 komponen BPJS wajib (JHT, JP, JKK, JKM, Kesehatan) sering ada selisih antara yang dipotong dari gaji dan yang benar-benar disetor ke BPJS.',
    stat: 'Rp 80K – 300K / bulan',
    statLabel: 'Selisih rata-rata',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  {
    icon: TrendingDown,
    title: 'Gaji di bawah UMK / UMR',
    desc: 'UMK/UMR naik tiap 1 Januari. Tidak semua perusahaan update tepat waktu. Ini bukan hanya unfair — ini pelanggaran hukum yang bisa dibawa ke Disnaker.',
    stat: 'Pelanggaran hukum',
    statLabel: 'Bisa dilaporkan',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dotColor: 'bg-red-500',
  },
]

export function WhyItHappensSection() {
  return (
    <section className="bg-slate-900 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 mt-0.5">
            <AlertCircle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
              Kenapa gaji bisa salah tanpa kamu sadar?
            </h2>
            <p className="mt-2 text-slate-400 max-w-xl">
              Ini bukan salah kamu. Regulasi berubah, sistem HRD sering outdated,
              dan tidak ada yang mengecek kecuali kamu sendiri.
            </p>
          </div>
        </div>

        {/* Violation cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {VIOLATIONS.map((v) => {
            const Icon = v.icon
            return (
              <div
                key={v.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${v.bg}`}>
                  <Icon className={`h-5 w-5 ${v.color}`} />
                </div>
                <p className="text-sm font-semibold text-white leading-snug">{v.title}</p>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                <div className={`mt-4 rounded-lg border ${v.border} ${v.bg} px-3 py-2`}>
                  <p className={`text-xs font-bold ${v.color}`}>{v.stat}</p>
                  <p className="text-[10px] text-slate-500">{v.statLabel}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom stat */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-lg font-bold text-white">
            <span className="text-amber-400">67%</span> slip gaji yang diaudit di platform kami mengandung setidaknya satu pelanggaran.
          </p>
          <p className="mt-1.5 text-sm text-slate-400">
            Apakah slip bulan ini kamu termasuk yang 67% itu? Cek dalam 30 detik — gratis.
          </p>
        </div>
      </div>
    </section>
  )
}
