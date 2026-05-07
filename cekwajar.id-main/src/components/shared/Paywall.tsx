'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { REVENUE_ANCHORS } from '@/lib/constants'

interface BasePaywallProps {
  feature: string
  customCta?: string
  compact?: boolean
  className?: string
}

interface NumericRevealProps extends BasePaywallProps {
  shortfallIdr: number
  partialContent?: never
}

interface PartialContentProps extends BasePaywallProps {
  partialContent: React.ReactNode
  shortfallIdr?: never
}

type PaywallProps = NumericRevealProps | PartialContentProps

export function Paywall(props: PaywallProps) {
  if (props.compact) return <CompactGate feature={props.feature} className={props.className} customCta={props.customCta} />
  if ('shortfallIdr' in props) return <NumericGate shortfallIdr={(props as NumericRevealProps).shortfallIdr} feature={props.feature} className={props.className} customCta={props.customCta} />
  return <ContentGate partialContent={(props as PartialContentProps).partialContent} feature={props.feature} className={props.className} customCta={props.customCta} />
}

// ─── NumericGate — verdict-page hero ────────────────────────────────────────
function NumericGate({ shortfallIdr, feature, customCta, className }: NumericRevealProps) {
  const ctaText = customCta ?? `Buka detail · IDR ${REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}`

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border-2 border-[var(--primary)]/30 bg-gradient-to-b from-white to-[var(--primary)]/5 p-5 shadow-lg sm:p-7', className)}>
      <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
        <Sparkles className="h-3.5 w-3.5" />
        Detail rupiah selisih
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-[var(--muted-foreground)]">Ada uang yang seharusnya jadi milikmu</p>
        <p
          className="mt-2 select-none font-mono text-5xl font-black leading-none tracking-tight text-slate-900 blur-md sm:text-6xl"
          aria-label="Selisih tersembunyi, klik tombol untuk membuka"
        >
          IDR {shortfallIdr.toLocaleString('id-ID')}
        </p>
        <p className="mt-3 text-sm text-[var(--page-text-muted)]">
          {feature}. Bayar IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} sekali, lihat detail selamanya.
        </p>
      </div>

      <Link href="/upgrade?from=verdict" className="mt-5 block">
        <Button className="h-12 w-full text-base font-semibold shadow-md">
          {ctaText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>

      <RiskReversalStrip />

      <UrgencyPulse />
    </div>
  )
}

// ─── ContentGate — tables/charts ─────────────────────────────────────────────
function ContentGate({ partialContent, feature, customCta, className }: PartialContentProps) {
  const ctaText = customCta ?? `Upgrade · IDR ${REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}`

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <div className="select-none blur-3xl saturate-[0.8]" aria-hidden>
        {partialContent}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/40 via-white/85 to-white/95 p-4">
        <div className="w-full max-w-sm rounded-xl border border-[var(--gray-200)] bg-white p-5 text-center shadow-lg">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">{feature}</p>
          <Link href="/upgrade?from=table" className="mt-3 block">
            <Button className="w-full">
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <RiskReversalStrip mini />
        </div>
      </div>
    </div>
  )
}

// ─── CompactGate — inline one-liner ────────────────────────────────────────
function CompactGate({ feature, className }: BasePaywallProps) {
  return (
    <div className={cn('flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs', className)}>
      <Lock className="h-3 w-3 text-amber-600" />
      <span className="select-none blur-[3px] text-slate-700">Rp ███.███</span>
      <Link href="/upgrade?from=inline" className="ml-auto font-semibold text-[var(--primary)] hover:underline">
        Buka →
      </Link>
    </div>
  )
}

// ─── RiskReversalStrip ──────────────────────────────────────────────────────
function RiskReversalStrip({ mini = false }: { mini?: boolean }) {
  if (mini) {
    return <p className="mt-2 text-xs text-[var(--muted-foreground)]">Garansi 7 hari uang kembali</p>
  }
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[var(--muted-foreground)]">
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-[var(--primary)]" /> Garansi 7 hari
      </span>
      <span className="inline-flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-[var(--primary)]" /> Batal kapan saja
      </span>
    </div>
  )
}

// ─── UrgencyPulse — soft social proof from real recent payments ──────────────
function UrgencyPulse() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/stats/recent-payments').then((r) => r.json()).then((d) => setCount(d.count ?? null)).catch(() => {})
  }, [])
  if (!count || count < 3) return null
  return (
    <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)]/40" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
      </span>
      {count} orang baru saja membuka detailnya dalam 1 jam terakhir.
    </p>
  )
}
