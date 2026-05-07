// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Share Verdict Button
// 'use client' — dropdown with copy link, Twitter/X, WhatsApp share options
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState } from 'react'
import { Share2, Check, Link2, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PayslipVerdict } from '@/types/database.types'

interface ShareVerdictButtonProps {
  auditId: string
  verdict: PayslipVerdict
  topViolation?: string
  city: string
  monthYear: string
  grossSalary?: number
  className?: string
}

const VERDICT_LABELS: Record<PayslipVerdict, string> = {
  SESUAI: 'SESUAI — Slip Gaji Sesuai Regulasi',
  ADA_PELANGGARAN: 'ADA PELANGGARAN — Potensi Kerugian Terdeteksi',
}

export function ShareVerdictButton({
  auditId,
  verdict,
  topViolation,
  city,
  monthYear,
  grossSalary,
  className,
}: ShareVerdictButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/wajar-slip/share/${auditId}`
    : `/wajar-slip/share/${auditId}`

  const verdictBadgeClass = verdict === 'SESUAI'
    ? 'bg-primary-100 text-primary-800 border-primary-200'
    : 'bg-red-100 text-red-800 border-red-200'

  const encodedText = encodeURIComponent(
    topViolation
      ? `Hasil Audit Slip Gaji — ${city} ${monthYear}\n\n${VERDICT_LABELS[verdict]}\n\nPelanggaran utama: ${topViolation}\n\nCek slip gaji kamu di:`
      : `Hasil Audit Slip Gaji — ${city} ${monthYear}\n\n${VERDICT_LABELS[verdict]}\n\nCek slip gaji kamu di:`
  )

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn('gap-1.5', className)}
        onClick={() => setOpen(true)}
        aria-label="Bagikan hasil audit"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Bagikan</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="px-4 pb-6">
          <SheetHeader className="text-center">
            <SheetTitle className="text-base font-semibold">Bagikan Hasil</SheetTitle>
            <SheetDescription className="text-xs">
              {city} — {monthYear}
            </SheetDescription>
          </SheetHeader>

          {/* Verdict preview card */}
          <div className={cn(
            'mt-4 rounded-xl border p-4 text-center',
            verdict === 'SESUAI'
              ? 'border-primary-200 bg-primary-50 dark:bg-primary-950/30'
              : 'border-red-200 bg-red-50 dark:bg-red-950/30'
          )}>
            <Badge className={cn('mb-2 text-xs', verdictBadgeClass)}>
              {verdict}
            </Badge>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {topViolation ?? 'Slip Gaji tidak ditemukan pelanggaran'}
            </p>
            {grossSalary && (
              <p className="mt-1 text-xs text-slate-500">
                Gaji bruto: Rp {grossSalary.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Share options */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1.5 rounded-lg border bg-white px-3 py-3 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-primary-600" />
              ) : (
                <Link2 className="h-5 w-5 text-slate-600 dark:text-slate-500" />
              )}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {copied ? 'Tersalin!' : 'Salin Link'}
              </span>
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-lg border bg-white px-3 py-3 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Twitter/X</span>
            </a>

            <a
              href={`https://wa.me/?text=${encodedText}%20${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-lg border bg-white px-3 py-3 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-slate-600 dark:text-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">WhatsApp</span>
            </a>
          </div>

          <SheetFooter className="mt-5">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}