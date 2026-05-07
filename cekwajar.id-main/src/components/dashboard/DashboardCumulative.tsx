// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Dashboard Cumulative Shortfall Headline
// Shows total IDR found/recovered across all audits
// First-visit state drives user to first audit
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { useQuery } from '@tanstack/react-query'
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface CumulativeShortfall {
  totalIdrFound: number
  auditCount: number
  lastAuditDate: string | null
}

function formatIDR(n: number): string {
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  }
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function DashboardCumulative() {
  const { data, isLoading } = useQuery({
    queryKey: ['cumulative-shortfall'],
    queryFn: async () => {
      const res = await fetch('/api/stats/cumulative-shortfall')
      if (!res.ok) return null
      const json = await res.json()
      return json.data as CumulativeShortfall | null
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // First visit state — no audits yet
  if (!data || data.auditCount === 0) {
    return (
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-950/50 dark:to-slate-950">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Total IDR Ditemukan
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Belum ada audit
                </p>
              </div>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
              <Link href="/wajar-slip">
                <Calculator className="mr-2 h-4 w-4" />
                Cek Slip Pertama
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-500">
            Deteksi penahanan PPh21 & BPJS di slip gaji kamu.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Has audits — show cumulative found
  const hasFindings = data.totalIdrFound > 0

  return (
    <Card className={`border ${hasFindings ? 'border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-950/50 dark:to-slate-950'}`}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${hasFindings ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
              {hasFindings ? (
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                Total IDR Ditemukan
              </p>
              <p className={`text-2xl font-bold ${hasFindings ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-slate-50'}`}>
                {formatIDR(data.totalIdrFound)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {data.auditCount} audit · {data.lastAuditDate ? `terakhir ${formatDate(data.lastAuditDate)}` : 'belum ada'}
            </p>
            <Button asChild size="sm" className="mt-1 bg-emerald-600 hover:bg-emerald-700 shrink-0">
              <Link href="/wajar-slip">
                <Calculator className="mr-1.5 h-3.5 w-3.5" />
                Audit Lagi
              </Link>
            </Button>
          </div>
        </div>
        {hasFindings && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
            Total selisih PPh21 + BPJS dari {data.auditCount} audit.
          </p>
        )}
      </CardContent>
    </Card>
  )
}