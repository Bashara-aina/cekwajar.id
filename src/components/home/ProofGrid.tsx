export function ProofGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { n: '12.847', l: 'Slip diaudit' },
        { n: '67%', l: 'Menemukan pelanggaran' },
        { n: 'IDR 847K', l: 'Rata-rata yg ditemukan' },
      ].map(({ n, l }) => (
        <div key={l}>
          <p className="text-2xl font-extrabold text-emerald-700 sm:text-4xl">{n}</p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{l}</p>
        </div>
      ))}
    </div>
  )
}