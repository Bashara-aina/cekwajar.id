'use client'

// components/kabur/SeveranceBreakdown.tsx
// Table showing uang pesangon, UPMK, uang pengganti hak, total severance

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SeveranceResult } from '@/lib/engines/severance'

interface SeveranceBreakdownProps {
  severance: SeveranceResult
  currencyFmt: (n: number) => string
}

interface Row {
  label: string
  detail: string
  amount: number
  highlight?: boolean
}

export function SeveranceBreakdown({ severance, currencyFmt }: SeveranceBreakdownProps) {
  const rows: Row[] = [
    {
      label: 'Uang Pesangon',
      detail: `${severance.uangPesangonMultiple} bulan × ${currencyFmt(severance.masaKerjaYears > 0 ? Math.round(severance.uangPesangon / severance.uangPesangonMultiple) : 0)}`,
      amount: severance.uangPesangon,
      highlight: false,
    },
    {
      label: 'Uang Penghargaan Masa Kerja (UPMK)',
      detail: `${severance.upmkMonths} bulan × ${currencyFmt(severance.masaKerjaYears > 0 && severance.upmkMonths > 0 ? Math.round(severance.upmk / severance.upmkMonths) : 0)}`,
      amount: severance.upmk,
    },
    {
      label: 'Uang Penggantian Hak',
      detail: `15% dari (Pesangon + UPMK)`,
      amount: severance.uangPenggantianHak,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rincian Pesangon (PP 35/2021)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{row.label}</p>
                <p className="text-xs text-slate-500">{row.detail}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {currencyFmt(row.amount)}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Total Pesangon</p>
              <p className="text-xs text-slate-500">
                {severance.type === 'resign'
                  ? 'Resign — tidak termasuk pesangon'
                  : severance.type === 'phk'
                    ? 'PHK — pesangon penuh'
                    : 'PKWT Habis'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold text-emerald-700">
                {currencyFmt(severance.totalGross)}
              </p>
              {severance.isTaxable && (
                <p className="text-xs text-amber-600">
                  +Pajak {currencyFmt(severance.taxableAmount)} (di atas threshold)
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}