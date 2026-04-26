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
  shortfallIdr?: number
  partialContent?: React.ReactNode
}

type PaywallProps = BasePaywallProps

export function Paywall(props: PaywallProps) {
  if (props.compact) return <CompactGate feature={props.feature} className={props.className} />
  if (props.shortfallIdr !== undefined) return <NumericGate shortfallIdr={props.shortfallIdr} feature={props.feature} customCta={props.customCta} className={props.className} />
  return <ContentGate partialContent={props.partialContent ?? null} feature={props.feature} customCta={props.customCta} className={props.className} />
}

function NumericGate({ shortfallIdr, feature, customCta, className }: { shortfallIdr: number; feature: string; customCta?: string; className?: string }) {
  const ctaText = customCta ?? `Buka detail · IDR ${REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}`

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-lg sm:p-7', className)}>
      <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
        <Sparkles className="h-3.5 w-3.5" />
        Detail rupiah selisih
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">Ada uang yang seharusnya jadi milikmu</p>
        <p
          className="mt-2 select-none font-mono text-5xl font-black leading-none tracking-tight text-slate-900 blur-md sm:text-6xl"
          aria-label="Selisih tersembunyi, klik tombol untuk membuka"
        >
          IDR {shortfallIdr.toLocaleString('id-ID')}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          {feature}. Bayar IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} sekali, lihat detail selamanya.
        </p>
      </div>

      <Link href="/upgrade?from=verdict" className="mt-5 block">
        <Button className="h-12 w-full bg-emerald-600 text-base font-semibold shadow-md shadow-emerald-500/30 hover:bg-emerald-700">
          {ctaText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>

      <RiskReversalStrip />

      <UrgencyPulse />
    </div>
  )
}

function ContentGate({ partialContent, feature, customCta, className }: { partialContent: React.ReactNode; feature: string; customCta?: string; className?: string }) {
  const ctaText = customCta ?? `Upgrade · IDR ${REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}`

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <div className="select-none blur-[6px] saturate-[0.6]" aria-hidden>
        {partialContent}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/40 via-white/85 to-white/95 p-4">
        <div className="w-full max-w-sm rounded-xl border border-emerald-200 bg-white p-5 text-center shadow-lg">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">{feature}</p>
          <Link href="/upgrade?from=table" className="mt-3 block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
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

function CompactGate({ feature: _feature, className }: BasePaywallProps) {
  return (
    <div className={cn('flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs', className)}>
      <Lock className="h-3 w-3 text-amber-600" />
      <span className="select-none blur-[3px] text-slate-700">Rp ███.███</span>
      <Link href="/upgrade?from=inline" className="ml-auto font-semibold text-emerald-700 hover:underline">
        Buka →
      </Link>
    </div>
  )
}

function RiskReversalStrip({ mini = false }: { mini?: boolean }) {
  if (mini) {
    return <p className="mt-2 text-[10px] text-slate-400">Garansi 7 hari uang kembali</p>
  }
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-emerald-600" /> Garansi 7 hari
      </span>
      <span className="inline-flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-emerald-600" /> Batal kapan saja
      </span>
    </div>
  )
}

function UrgencyPulse() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/stats/recent-payments')
      .then((r) => r.json())
      .then((d) => setCount(d.lastHour ?? null))
      .catch(() => {})
  }, [])
  if (!count || count < 3) return null
  return (
    <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-[11px] text-slate-500 w-full">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      {count} orang baru saja membuka detailnya dalam 1 jam terakhir.
    </p>
  )
}
