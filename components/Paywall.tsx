'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
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
  if (props.shortfallIdr !== undefined)
    return (
      <NumericGate
        shortfallIdr={props.shortfallIdr}
        feature={props.feature}
        customCta={props.customCta}
        className={props.className}
      />
    )
  return (
    <ContentGate
      partialContent={props.partialContent ?? null}
      feature={props.feature}
      customCta={props.customCta}
      className={props.className}
    />
  )
}

function NumericGate({
  shortfallIdr,
  feature,
  customCta,
  className,
}: {
  shortfallIdr: number
  feature: string
  customCta?: string
  className?: string
}) {
  const roi = Math.round(shortfallIdr / REVENUE_ANCHORS.PRO_PRICE_IDR)
  const ctaText = customCta ?? `Buka Detail Lengkap · IDR ${REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}`

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-xl shadow-emerald-500/15 sm:p-7',
        className
      )}
    >
      {/* ROI badge */}
      {roi >= 2 && (
        <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 w-fit mx-auto">
          <TrendingUp className="h-3.5 w-3.5" />
          {roi}× ROI hanya dari bulan ini
        </div>
      )}

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Uang yang seharusnya milikmu — tersembunyi
        </p>
        <p
          className="mt-3 select-none font-mono text-5xl font-black leading-none tracking-tight text-slate-900 blur-lg sm:text-6xl"
          aria-label="Jumlah tersembunyi, upgrade untuk membuka"
        >
          IDR {shortfallIdr.toLocaleString('id-ID')}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Lock className="h-3 w-3 text-amber-500" />
          Terkunci untuk pengguna Free
        </div>
      </div>

      {/* Feature pitch */}
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
        <p className="font-semibold mb-2">Buka Pro untuk mendapat:</p>
        <ul className="space-y-1 text-xs text-emerald-800">
          {[
            'Detail rupiah per komponen (PPh21, JHT, JP, BPJS Kes)',
            'Skrip langkah ke HRD + referensi pasal hukum',
            'Riwayat audit & ekspor PDF dokumentasi',
          ].map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button className="mt-5 h-[52px] w-full bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700" asChild>
        <Link href="/upgrade?from=verdict">
          {ctaText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>

      <RiskReversalStrip />
      <UrgencyPulse />
    </div>
  )
}

function ContentGate({
  partialContent,
  feature,
  customCta,
  className,
}: {
  partialContent: React.ReactNode
  feature: string
  customCta?: string
  className?: string
}) {
  const ctaText = customCta ?? `Upgrade Pro · IDR ${REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}`

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <div className="select-none blur-[6px] saturate-[0.4]" aria-hidden>
        {partialContent}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/30 via-white/80 to-white/98 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-slate-800">{feature}</p>
          <p className="mt-1 text-xs text-slate-500">
            Fitur ini eksklusif untuk pengguna Pro.
          </p>
          <Link href="/upgrade?from=table" className="mt-4 block">
            <Button className="w-full bg-emerald-600 font-semibold hover:bg-emerald-700">
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
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs',
        className
      )}
    >
      <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
      <span className="select-none blur-[3px] text-slate-700 font-mono">Rp ███.███</span>
      <Link
        href="/upgrade?from=inline"
        className="ml-auto shrink-0 font-bold text-emerald-700 hover:underline"
      >
        Buka →
      </Link>
    </div>
  )
}

function RiskReversalStrip({ mini = false }: { mini?: boolean }) {
  if (mini) {
    return (
      <p className="mt-2 text-[10px] text-slate-400 text-center">
        Garansi 7 hari uang kembali · Batalkan kapan saja
      </p>
    )
  }
  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-emerald-600" /> Garansi 7 hari
      </span>
      <span className="h-3 w-px bg-slate-200" />
      <span className="inline-flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-emerald-600" /> Batal kapan saja
      </span>
      <span className="h-3 w-px bg-slate-200" />
      <span>Midtrans aman</span>
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
    <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[11px] text-slate-500">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <strong className="text-slate-700">{count} orang</strong> baru buka detail dalam 1 jam terakhir
    </p>
  )
}
