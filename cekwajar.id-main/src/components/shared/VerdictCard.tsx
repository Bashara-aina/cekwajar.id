'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — VerdictCard Component
// Shows WAJAR / ADA YANG ANEH / SALAH verdict with shortfall amount
// Spring entrance animation, dark mode, role="status"
// ══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface VerdictCardProps {
  variant: 'wajar' | 'aneh' | 'salah'
  shortfallIdr: number
  className?: string
  onShare?: () => void
  onCekSlipLain?: () => void
}

interface VerdictConfig {
  icon: typeof CheckCircle
  bg: string
  text: string
  iconText: string
  label: string
  description: string
  border: string
}

const VERDICT_CONFIG: Record<VerdictCardProps['variant'], VerdictConfig> = {
  wajar: {
    icon: CheckCircle,
    bg: 'bg-[var(--verdict-wajar-bg)]',
    text: 'text-[var(--verdict-wajar)]',
    iconText: 'text-[var(--verdict-wajar)]',
    border: 'border-[var(--verdict-wajar)]',
    label: 'WAJAR',
    description: 'Slip Gaji Kamu',
  },
  aneh: {
    icon: AlertTriangle,
    bg: 'bg-[var(--verdict-aneh-bg)]',
    text: 'text-[var(--verdict-aneh)]',
    iconText: 'text-[var(--verdict-aneh)]',
    border: 'border-[var(--verdict-aneh)]',
    label: 'ADA YANG ANEH',
    description: 'Ada item yang tidak sesuai',
  },
  salah: {
    icon: XCircle,
    bg: 'bg-[var(--verdict-salah-bg)]',
    text: 'text-[var(--verdict-salah)]',
    iconText: 'text-[var(--verdict-salah)]',
    border: 'border-[var(--verdict-salah)]',
    label: 'SALAH',
    description: 'Ada yang tidak beres di slip kamu',
  },
} as const

function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function VerdictCard({
  variant,
  shortfallIdr,
  className,
  onShare,
  onCekSlipLain,
}: VerdictCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const config = VERDICT_CONFIG[variant]
  const Icon = config.icon
  const showAmount = shortfallIdr > 0 && variant !== 'wajar'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Verdict: ${config.label}`}
      className={cn(
        'w-full overflow-hidden rounded-2xl border-2 p-6 sm:p-8',
        config.bg,
        config.border,
        // Spring entrance: starts slightly below + invisible, animates to rest
        'translate-y-2 opacity-0',
        mounted && 'transition-all duration-300 ease-out',
        mounted && 'translate-y-0 opacity-100',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <Icon
          className={cn('h-6 w-6 sm:h-7 sm:w-7', config.iconText)}
          aria-hidden
        />
        <p
          className={cn(
            'mt-3 text-base font-semibold uppercase tracking-widest sm:text-lg',
            config.text
          )}
        >
          {config.label}
        </p>
        <p className={cn('mt-0.5 text-xs sm:text-sm', config.text)}>
          {config.description}
        </p>
      </div>

      {/* Shortfall amount — only show if > 0 and not wajar */}
      {showAmount && (
        <div className="mt-5 text-center">
          <p
            className={cn(
              'font-mono text-3xl font-black tracking-tight sm:text-4xl',
              config.text
            )}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatIDR(shortfallIdr)}
          </p>
          <p className={cn('mt-1 text-xs', config.text)}>selisih yang tidak sesuai</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          variant="secondary"
          className={cn('flex-1', config.text)}
          onClick={onShare}
        >
          Bagikan
        </Button>
        <Button
          variant="ghost"
          className={cn(
            'flex-1 border',
            variant === 'wajar'
              ? 'border-[var(--verdict-wajar)] text-[var(--verdict-wajar)] hover:bg-[var(--verdict-wajar-bg)]'
              : 'border-[var(--verdict-salah)] text-[var(--verdict-salah)] hover:bg-[var(--verdict-salah-bg)]'
          )}
          onClick={onCekSlipLain}
        >
          Cek Slip Lain
        </Button>
      </div>
    </div>
  )
}
