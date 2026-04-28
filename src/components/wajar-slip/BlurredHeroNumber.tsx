interface BlurredHeroNumberProps {
  amountIdr: number
  label?: string
}

export function BlurredHeroNumber({ amountIdr, label = 'Selisih yang ditemukan' }: BlurredHeroNumberProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className="mt-1 select-none font-mono text-5xl font-black tracking-tight text-slate-900 blur-md sm:text-6xl"
        aria-label="Jumlah tersembunyi"
      >
        IDR {amountIdr.toLocaleString('id-ID')}
      </p>
    </div>
  )
}
