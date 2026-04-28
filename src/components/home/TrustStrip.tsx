import { ShieldCheck } from 'lucide-react'

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <ShieldCheck className="h-3 w-3" />
        Resmi
      </span>
      {['PMK 168/2023', 'BPJS Ketenagakerjaan', 'Kemnaker UMK 2026'].map((label) => (
        <span key={label} className="before:mr-2 before:content-['·']">{label}</span>
      ))}
    </div>
  )
}