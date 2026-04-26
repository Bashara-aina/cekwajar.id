import Link from 'next/link'
import { ShieldCheck, FileText } from 'lucide-react'

const AUTHORITIES = [
  { label: 'PMK 168/2023 (TER)', href: '/regulasi/pmk-168-2023' },
  { label: 'PP 44, 45, 46/2015 (BPJS)', href: '/regulasi/bpjs' },
  { label: 'Perpres 82/2018 (Kesehatan)', href: '/regulasi/bpjs-kesehatan' },
  { label: 'UU 27/2022 (PDP)', href: '/privacy' },
  { label: 'Audited by Kantor Konsultan Pajak', href: '/regulasi/audit-letter' },
]

export function AuthorityStrip() {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        <ShieldCheck className="h-3 w-3" /> Kalkulasi berdasarkan
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
        {AUTHORITIES.map((a) => (
          <li key={a.label}>
            <Link href={a.href} className="inline-flex items-center gap-1 hover:text-emerald-700 hover:underline">
              <FileText className="h-3 w-3" /> {a.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}