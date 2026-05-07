// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Audit Detail Sheet (mobile-first bottom sheet)
// Shows full audit result — violations, calculations, share, upgrade prompt
// Free tier: IDR amounts gated. Paid tier: full detail visible.
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { CheckCircle2, AlertTriangle, X, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ShareVerdictButton } from '@/components/shared/ShareVerdictButton'
import { cn } from '@/lib/utils'
import type { PayslipVerdict } from '@/types/database.types'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

interface Violation {
  code: string
  severity: string
  titleID: string
  descriptionID: string
  differenceIDR: number
  actionID: string
}

interface AuditDetailSheetProps {
  open: boolean
  onClose: () => void
  audit: {
    id: string
    verdict: PayslipVerdict
    city: string
    monthNumber: number
    year: number
    grossSalary: number
    createdAt: string
    violations: Violation[]
    calculatedPph21: number | null
    calculatedJht: number | null
    calculatedJp: number | null
    calculatedKesehatan: number | null
    cityUmk: number | null
    isPaidResult: boolean
  } | null
  subscriptionTier: 'free' | 'basic' | 'pro'
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function AuditDetailSheet({ open, onClose, audit, subscriptionTier }: AuditDetailSheetProps) {
  if (!audit) return null

  const isPaid = subscriptionTier !== 'free'
  const showAmounts = isPaid && audit.isPaidResult
  const violations = audit.violations ?? []
  const isSesuai = audit.verdict === 'SESUAI'
  const topViolation = violations[0]?.titleID

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="flex flex-col overflow-y-auto max-h-[90vh] px-4 pb-6">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-base font-semibold text-left">
            Detail Audit
          </SheetTitle>
          <SheetDescription className="text-xs text-left">
            {MONTHS[audit.monthNumber - 1]} {audit.year} — {audit.city}
          </SheetDescription>
        </SheetHeader>

        {/* Verdict banner */}
        <div className={cn(
          'mt-4 rounded-xl border p-4',
          isSesuai
            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30'
            : 'border-red-200 bg-red-50 dark:bg-red-950/30'
        )}>
          <div className="flex items-start gap-3">
            {isSesuai ? (
              <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 shrink-0 text-red-600" />
            )}
            <div className="flex-1 min-w-0">
              <Badge className={cn(
                'mb-1',
                isSesuai
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              )}>
                {audit.verdict}
              </Badge>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isSesuai
                  ? 'Slip Gaji Sesuai Regulasi'
                  : `${violations.length} Pelanggaran Terdeteksi`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Diudit pada {formatDate(audit.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {/* Gross salary + UMK */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Gaji Bruto</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {showAmounts ? formatIDR(audit.grossSalary) : '••••••'}
              </p>
            </div>
            {audit.cityUmk && showAmounts && (
              <div className="text-right">
                <p className="text-xs text-slate-500">UMK {audit.city}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formatIDR(audit.cityUmk)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Violations */}
        {!isSesuai && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Detail Pelanggaran
            </h3>
            {violations.length === 0 ? (
              <p className="text-xs text-slate-500">Tidak ada detail pelanggaran.</p>
            ) : (
              violations.map((v) => (
                <Card key={v.code} className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn('text-xs', SEVERITY_COLORS[v.severity] ?? 'bg-slate-100 text-slate-700')}>
                        {v.code}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {v.titleID}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-7">
                      {v.descriptionID}
                    </p>
                    {showAmounts && v.differenceIDR > 0 && (
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Potensi kerugian: {formatIDR(v.differenceIDR)}
                      </p>
                    )}
                    {!showAmounts && (
                      <Badge variant="outline" className="text-xs">
                        Upgrade untuk detail IDR
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Calculations — paid only */}
        {showAmounts && !isSesuai && (
          <div className="mt-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Rincian Perhitungan
                </h4>
                <dl className="space-y-2 text-sm">
                  {[
                    { label: 'PPh21 yang dipotong', value: audit.calculatedPph21, code: 'V03' },
                    { label: 'JHT Karyawan (2%)', value: audit.calculatedJht, code: 'V01' },
                    { label: 'JP Karyawan (1%)', value: audit.calculatedJp, code: 'V02' },
                    { label: 'BPJS Kesehatan (1%)', value: audit.calculatedKesehatan, code: 'V05' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <dt className="text-slate-600 dark:text-slate-500">{label}</dt>
                      <dd className="text-right font-medium text-slate-900 dark:text-slate-100">
                        {value != null ? formatIDR(value) : '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 space-y-2.5 shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={onClose}
            >
              Tutup
            </Button>
            <ShareVerdictButton
              auditId={audit.id}
              verdict={audit.verdict}
              topViolation={topViolation}
              city={audit.city}
              monthYear={`${MONTHS[audit.monthNumber - 1]} ${audit.year}`}
              grossSalary={showAmounts ? audit.grossSalary : undefined}
              className="flex-1"
            />
          </div>

          {!isPaid && violations.length > 0 && (
            <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/upgrade">
                <ArrowRight className="h-4 w-4 mr-1.5" />
                Upgrade untuk Surat Keberatan
              </Link>
            </Button>
          )}

          {isPaid && violations.length > 0 && (
            <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/wajar-slip?surat=${audit.id}`}>
                <ArrowRight className="h-4 w-4 mr-1.5" />
                Buat Surat Keberatan
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}