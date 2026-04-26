import { ShieldCheck } from 'lucide-react'

const ANCHORS = [
  { label: 'PMK 168/2023' },
  { label: 'BPJS Ketenagakerjaan' },
  { label: 'Kemnaker UMK 2026' },
]

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <ShieldCheck className="h-3 w-3" />
        Resmi
      </span>
      {ANCHORS.map((a) => (
        <span key={a.label} className="before:mr-2 before:content-['·']">
          {a.label}
        </span>
      ))}
    </div>
  )
}
