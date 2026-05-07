'use client'

/**
 * AuditHistory — displays paginated list of past audits for the authenticated user.
 * Filterable by verdict (SESUAI / ADA_PELANGGARAN).
 * Uses card-based layout since shadcn table is not installed.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Calculator, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { PayslipVerdict } from '@/types/database.types'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
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
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AuditHistory() {
  const [page, setPage] = useState(1)
  const [verdictFilter, setVerdictFilter] = useState<PayslipVerdict | ''>('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-history', page, verdictFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (verdictFilter) params.set('verdict', verdictFilter)
      const res = await fetch(`/api/audit-history?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ success: boolean; data: { audits: AuditSummary[]; pagination: PaginationMeta } }>
    },
  })

  const audits = data?.data?.audits ?? []
  const pagination = data?.data?.pagination

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={verdictFilter}
          onValueChange={(v) => { setVerdictFilter(v as PayslipVerdict | ''); setPage(1) }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua verdict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua verdict</SelectItem>
            <SelectItem value="SESUAI">SESUAI</SelectItem>
            <SelectItem value="ADA_PELANGGARAN">ADA_PELANGGARAN</SelectItem>
          </SelectContent>
        </Select>
        {pagination && (
          <p className="text-xs text-slate-500">
            Total: {pagination.total} audit
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-3">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                Belum ada audit.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                Mulai dari Wajar Slip.
              </p>
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/wajar-slip">
                  <Calculator className="mr-1.5 h-3.5 w-3.5" />
                  Cek Slip Gaji
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="shrink-0">
                    {audit.verdict === 'SESUAI' ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {MONTHS[audit.monthNumber - 1]} {audit.year} — {audit.city}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(audit.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatIDR(audit.grossSalary)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <Badge
                        variant={audit.violationCount > 0 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {audit.violationCount} pelanggaran
                      </Badge>
                    </div>
                  </div>

                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link href={`/dashboard/audit-history/${audit.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-xs text-slate-500">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}