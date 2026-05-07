// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Audit History Card
// Mobile-friendly card for a single audit in the dashboard/history list
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShareVerdictButton } from '@/components/shared/ShareVerdictButton'
import type { PayslipVerdict } from '@/types/database.types'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

interface AuditHistoryCardProps {
  id: string
  verdict: PayslipVerdict | null
  city: string
  monthNumber: number
  year: number
  grossSalary: number
  createdAt: string
  violationCount: number
  topViolation?: string
  isPaidResult: boolean
  onClick?: () => void
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function AuditHistoryCard({
  id,
  verdict,
  city,
  monthNumber,
  year,
  grossSalary,
  createdAt,
  violationCount,
  topViolation,
  isPaidResult,
  onClick,
}: AuditHistoryCardProps) {
  const isSesuai = verdict === 'SESUAI'
  const monthLabel = MONTHS[monthNumber - 1]

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-4">
          {/* Verdict icon */}
          <div className="shrink-0 mt-0.5">
            {isSesuai ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {monthLabel} {year} — {city}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                  {formatDate(createdAt)}
                </p>
              </div>

              {/* Violation badge + salary */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatIDR(grossSalary)}
                </p>
                <Badge
                  variant={violationCount > 0 ? 'destructive' : 'secondary'}
                  className="mt-1 text-xs"
                >
                  {violationCount > 0
                    ? `${violationCount} pelanggaran`
                    : 'Sesuai'}
                </Badge>
              </div>
            </div>

            {/* Mobile: show top violation if available */}
            {topViolation && violationCount > 0 && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-500 truncate">
                {topViolation}
              </p>
            )}
          </div>

          {/* Chevron / share */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <ShareVerdictButton
              auditId={id}
              verdict={verdict ?? 'SESUAI'}
              topViolation={topViolation}
              city={city}
              monthYear={`${monthLabel} ${year}`}
              grossSalary={isPaidResult ? grossSalary : undefined}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}