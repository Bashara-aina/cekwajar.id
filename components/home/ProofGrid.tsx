import { REVENUE_ANCHORS } from '@/lib/constants'

export function ProofGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { n: '12.847', l: 'Slip diaudit' },
        { n: '67%', l: 'Menemukan pelanggaran' },
        { n: `IDR ${Math.round(REVENUE_ANCHORS.AVG_SHORTFALL_IDR / 1000)}K`, l: 'Rata-rata yg ditemukan' },
      ].map((s) => (
        <div key={s.l}>
          <p className="text-2xl font-extrabold text-emerald-700 sm:text-4xl">
            {s.n}
          </p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.l}</p>
        </div>
      ))}
    </div>
  )
}
