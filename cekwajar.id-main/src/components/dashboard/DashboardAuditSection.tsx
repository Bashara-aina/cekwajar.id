// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Dashboard Audit Section (client component)
// Fetches last 10 audits and renders AuditHistoryCards + AuditDetailSheet
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Calculator, FileText, AlertTriangle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AuditHistoryCard } from '@/components/dashboard/AuditHistoryCard'
import { AuditDetailSheet } from '@/components/dashboard/AuditDetailSheet'
import type { PayslipVerdict } from '@/types/database.types'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

interface AuditSummary {
  id: string
  verdict: PayslipVerdict | null
  city: string
  monthNumber: number
  year: number
  grossSalary: number
  createdAt: string
  isPaidResult: boolean
  violationCount: number
  topViolation: string | null
}

interface AuditDetail {
  id: string
  verdict: PayslipVerdict
  city: string
  monthNumber: number
  year: number
  grossSalary: number
  createdAt: string
  violations: Array<{
    code: string
    severity: string
    titleID: string
    descriptionID: string
    differenceIDR: number
    actionID: string
  }>
  calculatedPph21: number | null
  calculatedJht: number | null
  calculatedJp: number | null
  calculatedKesehatan: number | null
  cityUmk: number | null
  isPaidResult: boolean
}

interface DashboardAuditSectionProps {
  subscriptionTier: 'free' | 'basic' | 'pro'
}

export function DashboardAuditSection({ subscriptionTier }: DashboardAuditSectionProps) {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-audits'],
    queryFn: async () => {
      const res = await fetch('/api/audit-history?limit=10')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json() as { success: boolean; data: { audits: AuditSummary[] } }
      return json.data.audits
    },
  })

  const audits = data ?? []

  // Full detail for the selected sheet
  const selectedAudit = useQuery({
    queryKey: ['audit-detail', selectedAuditId],
    queryFn: async () => {
      if (!selectedAuditId) return null
      const res = await fetch(`/api/audit-history/${selectedAuditId}`)
      if (!res.ok) return null
      const json = await res.json()
      return json as { success: boolean; data: AuditDetail }
    },
    enabled: selectedAuditId !== null,
  })

  const detailData = selectedAudit.data?.data ?? null

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
          <p className="text-sm text-slate-500">Gagal memuat riwayat audit.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Cards list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : audits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-3">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                Belum ada audit slip gaji.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                Mulai analisis pertama kamu sekarang.
              </p>
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/wajar-slip">
                  <Calculator className="mr-1.5 h-3.5 w-3.5" />
                  Cek Slip Gaji
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2.5">
              {audits.map((audit) => (
                  <AuditHistoryCard
                    key={audit.id}
                    id={audit.id}
                    verdict={audit.verdict ?? 'SESUAI'}
                    city={audit.city}
                    monthNumber={audit.monthNumber}
                    year={audit.year}
                    grossSalary={audit.grossSalary}
                    createdAt={audit.createdAt}
                    violationCount={audit.violationCount}
                    topViolation={audit.topViolation ?? undefined}
                    isPaidResult={audit.isPaidResult}
                    onClick={() => setSelectedAuditId(audit.id)}
                  />
                ))}
            </div>

            {/* View all link */}
            <div className="flex justify-center pt-1">
              <Button asChild variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 gap-1">
                <Link href="/dashboard/audit-history">
                  Lihat semua riwayat
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Audit detail sheet */}
      <AuditDetailSheet
        open={selectedAuditId !== null}
        onClose={() => setSelectedAuditId(null)}
        audit={selectedAudit.isLoading ? null : (selectedAudit.data?.data ?? null)}
        subscriptionTier={subscriptionTier}
      />
    </>
  )
}