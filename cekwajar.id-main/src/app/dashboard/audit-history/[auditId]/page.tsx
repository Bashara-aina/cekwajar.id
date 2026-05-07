/**
 * Audit Detail page — shows full audit result with all violations.
 * Paid tier: shows IDR amounts.
 * Free tier: shows verdict + violation codes only.
 */

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Violation, ViolationCode, ViolationSeverity } from '@/types/database.types'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const VIOLATION_LABELS: Record<ViolationCode, string> = {
  V01: 'Iuran JHT (2%) tidak dipotong dari gaji',
  V02: 'Iuran JP (1%) tidak dipotong dari gaji',
  V03: 'PPh21 tidak dipotong / kurang',
  V04: 'Selisih PPh21 lebih besar dari seharusnya',
  V05: 'Iuran BPJS Kesehatan (1%) tidak dipotong',
  V06: 'Gaji di bawah UMK kota',
  V07: 'JP (1%) dihitung dari total gaji, bukan gaji s.d. batas iuran',
}

const SEVERITY_COLORS: Record<ViolationSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

interface PageProps {
  params: Promise<{ auditId: string }>
}

export default async function AuditDetailPage({ params }: PageProps) {
  const { auditId } = await params
  const { user, tier } = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: audit, error } = await supabase
    .from('payslip_audits')
    .select('*')
    .eq('id', auditId)
    .eq('user_id', user.id)
    .single()

  if (error || !audit) {
    notFound()
  }

  const a = audit as {
    verdict: 'SESUAI' | 'ADA_PELANGGARAN'
    city: string
    month_number: number
    year: number
    gross_salary: number
    violations: Violation[]
    calculated_pph21: number | null
    calculated_jht: number | null
    calculated_jp: number | null
    calculated_kesehatan: number | null
    city_umk: number | null
    created_at: string
    is_paid_result: boolean
    subscription_tier_at_time: string
  }

  const violations: Violation[] = Array.isArray(a.violations) ? a.violations : []
  const isPaid = tier !== 'free'
  const showAmounts = isPaid && a.is_paid_result

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/dashboard/audit-history">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>

        {/* Verdict */}
        <Card className={a.verdict === 'SESUAI'
          ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30'
          : 'border-red-200 bg-red-50 dark:bg-red-950/30'
        }>
          <CardContent className="flex items-start gap-4 p-6">
            {a.verdict === 'SESUAI' ? (
              <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-10 w-10 shrink-0 text-red-600" />
            )}
            <div>
              <h2 className={`text-xl font-bold ${a.verdict === 'SESUAI' ? 'text-emerald-800' : 'text-red-800'}`}>
                {a.verdict === 'SESUAI'
                  ? 'Slip Gaji Sesuai Regulasi'
                  : `${violations.length} Pelanggaran Terdeteksi`}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-500">
                {MONTHS[a.month_number - 1]} {a.year} — {a.city}
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Gaji Bruto: {formatIDR(a.gross_salary)}
              </p>
              {a.city_umk && (
                <p className="text-xs text-slate-500">
                  UMK {a.city}: {formatIDR(a.city_umk)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Violations */}
        {violations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Detail Pelanggaran
            </h3>
            {violations.map((v) => (
              <Card key={v.code}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={SEVERITY_COLORS[v.severity]}>
                          {v.code}
                        </Badge>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {v.titleID}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        {v.descriptionID}
                      </p>
                      {showAmounts && v.differenceIDR > 0 && (
                        <p className="mt-1 text-sm font-semibold text-red-600">
                          Potensi kerugian: {formatIDR(v.differenceIDR)}
                        </p>
                      )}
                    </div>
                    {!showAmounts && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Upgrade untuk detail
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Calculations — paid only */}
        {showAmounts && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rincian Perhitungan</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {[
                  { label: 'PPh21 yang dipotong', value: a.calculated_pph21, code: 'V03' },
                  { label: 'JHT Karyawan (2%)', value: a.calculated_jht, code: 'V01' },
                  { label: 'JP Karyawan (1%)', value: a.calculated_jp, code: 'V02' },
                  { label: 'BPJS Kesehatan (1%)', value: a.calculated_kesehatan, code: 'V05' },
                ].map(({ label, value, code }) => {
                  const violation = violations.find((v) => v.code === code)
                  const diff = violation?.differenceIDR ?? 0
                  return (
                    <div key={code} className="flex items-center justify-between">
                      <dt className="text-slate-600 dark:text-slate-500">{label}</dt>
                      <dd className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {value != null ? formatIDR(value) : '—'}
                        </span>
                        {diff > 0 && (
                          <span className="ml-2 text-xs text-red-500">
                            -{formatIDR(diff)}
                          </span>
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/audit-history">
              Kembali
            </Link>
          </Button>
          {isPaid && violations.length > 0 && (
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/wajar-slip?surat=${auditId}`}>
                Buat Surat Keberatan
              </Link>
            </Button>
          )}
          {!isPaid && violations.length > 0 && (
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/upgrade">
                Upgrade untuk Surat Keberatan
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}