import type { Metadata } from 'next'
import { Suspense } from 'react'
import { UpgradeHero } from '@/components/upgrade/UpgradeHero'
import { UpgradeValueCard } from '@/components/upgrade/UpgradeValueCard'
import { UpgradeDemo } from '@/components/upgrade/UpgradeDemo'
import { UpgradePricingCard } from '@/components/upgrade/UpgradePricingCard'
import { UpgradeTestimonials } from '@/components/upgrade/UpgradeTestimonials'
import { UpgradePriceJustify } from '@/components/upgrade/UpgradePriceJustify'
import { UpgradeHowWeCalculate } from '@/components/upgrade/UpgradeHowWeCalculate'
import { UpgradeRefundExplain } from '@/components/upgrade/UpgradeRefundExplain'
import { UpgradeFAQ } from '@/components/upgrade/UpgradeFAQ'
import { UpgradeFinalCta } from '@/components/upgrade/UpgradeFinalCta'

export const metadata: Metadata = {
  title: 'Buka Detail Slip Gajimu — IDR 49.000 / bulan · cekwajar.id',
  description:
    'Lihat detail rupiah selisih + skrip ke HRD. Garansi 7 hari uang kembali. Pembayaran via Midtrans.',
  alternates: { canonical: 'https://cekwajar.id/upgrade' },
  openGraph: {
    title: 'Pro IDR 49.000 — Buka detail slip gajimu',
    description: 'Garansi 7 hari uang kembali. Batalkan kapan saja.',
    type: 'website',
  },
}

function PricingCardFallback() {
  return <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
}

export default function UpgradePage() {
  return (
    <div className="bg-white">
      <UpgradeHero />
      <UpgradeValueCard />
      <UpgradeDemo />
      <Suspense fallback={<PricingCardFallback />}>
        <UpgradePricingCard />
      </Suspense>
      <UpgradeTestimonials />
      <UpgradePriceJustify />
      <UpgradeHowWeCalculate />
      <UpgradeRefundExplain />
      <UpgradeFAQ />
      <UpgradeFinalCta />
    </div>
  )
}
