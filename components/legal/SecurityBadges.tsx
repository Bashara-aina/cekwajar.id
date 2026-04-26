import { ShieldCheck, Lock, MapPin } from 'lucide-react'

export function SecurityBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> TLS 1.3</span>
      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Singapore (ap-southeast-1)</span>
      <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> AES-256 at rest</span>
      <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Auto-delete 30 hari (UU PDP)</span>
    </div>
  )
}