import { ShieldCheck } from 'lucide-react'

const ANCHORS = [
  { label: 'PMK 168/2023' },
  { label: 'BPJS Ketenagakerjaan' },
  { label: 'Kemnaker UMK 2026' },
  { label: 'UU PDP No.27/2022' },
]

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
        <ShieldCheck className="h-3 w-3" />
        Resmi &amp; Terverifikasi
      </span>
      {ANCHORS.map((a) => (
        <span
          key={a.label}
          className="inline-flex items-center gap-1.5 text-slate-400"
        >
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          {a.label}
        </span>
      ))}
    </div>
  )
}
