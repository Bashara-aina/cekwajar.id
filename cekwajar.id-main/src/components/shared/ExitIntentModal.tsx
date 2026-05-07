'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { REVENUE_ANCHORS } from '@/lib/constants'

interface ExitIntentModalProps {
  shortfallIdr: number
  onDismiss: () => void
}

export function ExitIntentModal({ shortfallIdr, onDismiss }: ExitIntentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onDismiss} />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
          Tunggu dulu
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Tutup tanpa lihat IDR yang ditahan slip kamu?
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Slip gaji kamu menahan{' '}
          <span className="font-mono font-semibold text-slate-700">
            IDR {shortfallIdr.toLocaleString('id-ID')}
          </span>
          . Hanya IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} untuk lihat detailnya selamanya.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link href="/upgrade?from=exit-intent" className="block">
            <Button className="w-full bg-primary-600 hover:bg-primary-700">
              Lihat dulu · IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <button
            onClick={onDismiss}
            className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Tetap tutup
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Garansi 7 hari uang kembali
        </p>
      </div>
    </div>
  )
}

// Hook: tracks exit intent on desktop, once per session
export function useExitIntent(onTrigger: () => void, isActive = false) {
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (!isActive || triggered) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setTriggered(true)
        onTrigger()
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [isActive, triggered, onTrigger])

  return triggered
}

// Hook: store pending audit in localStorage for returning-visitor prompt
export function setPendingAudit(auditId: string) {
  try {
    localStorage.setItem('cekwajar_pending_audit', auditId)
    localStorage.setItem('cekwajar_pending_audit_ts', String(Date.now()))
  } catch {}
}

export function getPendingAudit(): { auditId: string; timestamp: number } | null {
  try {
    const auditId = localStorage.getItem('cekwajar_pending_audit')
    const ts = localStorage.getItem('cekwajar_pending_audit_ts')
    if (!auditId || !ts) return null
    const timestamp = parseInt(ts, 10)
    // Expire after 7 days
    if (Date.now() - timestamp > 7 * 24 * 3600 * 1000) {
      localStorage.removeItem('cekwajar_pending_audit')
      localStorage.removeItem('cekwajar_pending_audit_ts')
      return null
    }
    return { auditId, timestamp }
  } catch {
    return null
  }
}