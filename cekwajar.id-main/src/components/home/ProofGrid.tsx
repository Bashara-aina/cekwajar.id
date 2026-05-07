// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — ProofGrid Component
// Three stats: audits, % violations, avg shortfall found
// ══════════════════════════════════════════════════════════════════════════════

export function ProofGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { n: '12.847', l: 'Slip diaudit' },
        { n: '67%', l: 'Menemukan pelanggaran' },
        { n: 'IDR 847K', l: 'Rata-rata yg ditemukan' },
      ].map((s) => (
        <div key={s.l}>
          <p className="text-2xl font-extrabold text-primary-700 sm:text-4xl">{s.n}</p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.l}</p>
        </div>
      ))}
    </div>
  )
}