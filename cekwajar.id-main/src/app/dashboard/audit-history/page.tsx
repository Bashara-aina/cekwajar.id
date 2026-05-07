/**
 * Audit History page — lists all past audits for the authenticated user.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { AuditHistory } from '@/components/dashboard/AuditHistory'
import { Button } from '@/components/ui/button'

export default async function AuditHistoryPage() {
  const { user } = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Riwayat Audit
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Semua analisis slip gaji yang pernah kamu lakukan.
            </p>
          </div>
        </div>

        <AuditHistory />
      </div>
    </div>
  )
}