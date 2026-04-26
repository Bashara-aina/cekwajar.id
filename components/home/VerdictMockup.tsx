import { AlertTriangle, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { REVENUE_ANCHORS } from '@/lib/constants'

export function VerdictMockup({ className = '' }: { className?: string }) {
  return (
    <Card
      className={`border-red-200 bg-red-50/40 shadow-md ${className}`}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-8 w-8 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Ada 3 Pelanggaran Ditemukan
            </p>
            <p className="mt-1 text-xs text-red-700/70">
              Slip gaji &apos;Andi P.&apos; · Bekasi · Februari 2026
            </p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </p>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              total selisih bulan ini
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between border-b border-red-200 pb-2">
                <span className="text-slate-700">JHT 2% kurang dipotong</span>
                <span className="font-mono text-red-700">+ IDR 160.000</span>
              </li>
              <li className="flex justify-between border-b border-red-200 pb-2">
                <span className="text-slate-700">PPh21 berlebih (TK/0)</span>
                <span className="font-mono text-red-700">+ IDR 332.000</span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded bg-white/70 p-2">
                <span className="flex items-center gap-1 blur-[2px] select-none text-slate-500">
                  <Lock className="h-3 w-3" /> BPJS Kesehatan ████████
                </span>
                <span className="font-mono text-slate-400 blur-[2px] select-none">
                  + IDR ███.███
                </span>
              </li>
            </ul>

            <Badge className="mt-4 bg-emerald-600 text-white">
              Buka detail · IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
