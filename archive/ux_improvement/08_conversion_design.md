# 08 — Conversion Design (Free → Paid)
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: PremiumGate uses full `filter blur-sm` blur + lock overlay + generic "Upgrade untuk akses fitur lengkap" text. Pricing page shows a feature-comparison table. After Midtrans payment success, user is likely redirected to dashboard with no celebration moment.

## Objective
Convert the PremiumGate from full-blur to partial-reveal. Personalize gate messages with audit-specific data. Restructure the pricing page with outcome-led copy. Build a post-payment success page. Add value framing to the price.

---

## Task 1: Rebuild PremiumGate with Partial Reveal

Open `src/components/PremiumGate.tsx`. The current implementation blurs all content. Replace with a partial-reveal design:

```tsx
'use client'

import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PremiumGateProps {
  /** What specific data is hidden — used for personalized gate message */
  hiddenLabel?: string
  /** Short description of what upgrading unlocks */
  benefit?: string
  /** Compact mode for inline gating */
  compact?: boolean
  /** Custom class */
  className?: string
  /** Partial preview content to show blurred */
  previewContent?: React.ReactNode
}

export function PremiumGate({
  hiddenLabel = 'Data lengkap',
  benefit = 'Lihat selisih IDR, detail perhitungan, dan rekomendasi tindak lanjut',
  compact = false,
  className,
  previewContent,
}: PremiumGateProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground py-2', className)}>
        <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="blur-sm select-none pointer-events-none">Rp ██.███.███</span>
        <Link
          href="/upgrade"
          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex-shrink-0"
        >
          Upgrade →
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)}>
      {/* Partial preview — visible but blurred */}
      {previewContent && (
        <div className="blur-sm select-none pointer-events-none opacity-60" aria-hidden="true">
          {previewContent}
        </div>
      )}
      
      {/* Overlay */}
      <div
        className={cn(
          'rounded-xl border-2 border-emerald-200 dark:border-emerald-800',
          'bg-gradient-to-b from-white/95 to-emerald-50/95 dark:from-slate-900/95 dark:to-emerald-950/95',
          'p-6 text-center',
          previewContent ? 'absolute inset-0 flex flex-col items-center justify-center' : ''
        )}
      >
        {/* Lock icon */}
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        {/* Personalized message */}
        <h3 className="font-bold text-foreground text-base mb-1">
          {hiddenLabel}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          {benefit}
        </p>
        
        {/* Price + CTA */}
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-xs gap-2">
          <Link href="/upgrade">
            <Sparkles className="w-4 h-4" />
            Upgrade Paket Basic — Rp 29K/bulan
          </Link>
        </Button>
        
        {/* Value framing */}
        <p className="text-xs text-muted-foreground mt-2">
          Kurang dari 1 gelas kopi. Batal kapan saja.
        </p>
      </div>
    </div>
  )
}
```

**Apply personalized messages per violation type:**

In the Wajar Slip result section, pass specific props to PremiumGate based on what violations were found:

```tsx
// For a PPh21 violation (V02):
<PremiumGate
  hiddenLabel="Selisih PPh21 kamu tersembunyi"
  benefit="Lihat persis berapa PPh21 yang kurang dipotong bulan ini dan akumulasinya per tahun"
  previewContent={
    <div className="space-y-1 text-xs">
      <div className="flex justify-between">
        <span>PPh21 di slip:</span><span className="font-mono">Rp ██.███</span>
      </div>
      <div className="flex justify-between">
        <span>Seharusnya:</span><span className="font-mono">Rp ██.███</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Selisih:</span><span className="font-mono text-red-500">Rp ██.███</span>
      </div>
    </div>
  }
/>

// For UMK violation (V06):
<PremiumGate
  hiddenLabel="Selisih UMK tersembunyi"
  benefit="Lihat berapa persen gajimu di bawah UMK dan berapa yang seharusnya kamu terima"
/>

// For BPJS violation:
<PremiumGate
  hiddenLabel="Detail potongan BPJS tersembunyi"
  benefit="Lihat komponen BPJS mana yang salah dan berapa totalnya selama setahun"
/>
```

---

## Task 2: Restructure Pricing Page with Outcome-Led Copy

Open `src/app/pricing/page.tsx` or `src/app/upgrade/page.tsx`. Redesign the page structure:

```tsx
// NEW pricing page structure:

// 1. OUTCOME HEADLINE (not feature comparison):
<section className="text-center py-16 px-4 max-w-2xl mx-auto">
  <h1 className="text-3xl md:text-4xl font-bold mb-4">
    Cari tahu persis<br />
    <span className="text-emerald-600">berapa yang kurang dibayar perusahaanmu</span>
  </h1>
  <p className="text-muted-foreground text-lg">
    Upgrade untuk akses angka lengkap — bukan estimasi, tapi kalkulasi PMK 168/2023 yang akurat.
  </p>
</section>

// 2. PRICING CARDS:
<section className="px-4 max-w-4xl mx-auto pb-16">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
    
    {/* Basic card */}
    <div className="border-2 border-emerald-500 rounded-2xl p-6 relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          PALING POPULER
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Paket Basic</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">Rp 29K</span>
          <span className="text-muted-foreground">/bulan</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Kurang dari 1 kopi per hari</p>
      </div>
      
      {/* What you get — outcome focused, not feature list */}
      <ul className="space-y-3 mb-6 text-sm">
        {[
          'Lihat selisih IDR per komponen (PPh21, JHT, JP, BPJS)',
          'Tabel kalkulasi lengkap dengan metode TER',
          'Rekomendasi tindak lanjut per pelanggaran',
          'Riwayat semua audit tersimpan',
          'Audit slip gaji tanpa batas',
        ].map(item => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      
      {/* Value framing */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 mb-4 text-xs text-emerald-700 dark:text-emerald-400">
        💡 Jika selisih PPh21 kamu Rp 50K/bulan, break-even dalam 2 minggu pertama.
      </div>
      
      <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
        <Link href="/upgrade/checkout?plan=basic">
          Mulai Paket Basic →
        </Link>
      </Button>
    </div>
    
    {/* Pro card */}
    <div className="border rounded-2xl p-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Paket Pro</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">Rp 79K</span>
          <span className="text-muted-foreground">/bulan</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Untuk HRD dan profesional</p>
      </div>
      
      <ul className="space-y-3 mb-6 text-sm">
        {[
          'Semua fitur Basic',
          'Export PDF laporan audit',
          'Benchmark gaji unlimited (Wajar Gaji)',
          'API akses untuk integrasi',
          'Priority support',
        ].map(item => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      
      <Button asChild variant="outline" className="w-full h-12">
        <Link href="/upgrade/checkout?plan=pro">
          Mulai Paket Pro →
        </Link>
      </Button>
    </div>
  </div>
  
  {/* Sample result link */}
  <p className="text-center text-sm text-muted-foreground mt-8">
    Belum yakin?{' '}
    <button
      type="button"
      className="text-emerald-600 underline hover:no-underline"
      onClick={() => {/* Open sample result modal */}}
    >
      Lihat dulu contoh hasil lengkapnya →
    </button>
  </p>
</section>
```

---

## Task 3: Build Post-Payment Success Page

Create file: `src/app/upgrade/success/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ConfettiEffect } from '@/components/ConfettiEffect'

export default function UpgradeSuccessPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'basic'
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Small delay so the page renders before confetti fires
    const t = setTimeout(() => setShowConfetti(true), 300)
    return () => clearTimeout(t)
  }, [])

  const planLabel = plan === 'pro' ? 'Pro' : 'Basic'
  const planPrice = plan === 'pro' ? 'Rp 79.000' : 'Rp 29.000'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <ConfettiEffect trigger={showConfetti} />
      
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          Paket {planLabel} Aktif! 🎉
        </h1>
        
        <p className="text-muted-foreground mb-2">
          {planPrice}/bulan · Bisa dibatalkan kapan saja
        </p>
        
        <p className="text-sm text-muted-foreground mb-8">
          Email konfirmasi sudah dikirim ke alamat email kamu.
        </p>
        
        {/* What's unlocked */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 mb-8 text-left">
          <p className="font-semibold text-sm mb-3">Yang baru bisa kamu akses:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Selisih IDR per komponen pelanggaran
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Tabel kalkulasi PPh21 TER lengkap
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Rekomendasi tindak lanjut per pelanggaran
            </li>
          </ul>
        </div>
        
        {/* Primary CTA — return to what they were doing */}
        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 gap-2 mb-3">
          <Link href="/wajar-slip">
            <FileText className="w-4 h-4" />
            Audit Slip Gaji Sekarang →
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full h-12 gap-2">
          <Link href="/dashboard">
            Dashboard →
          </Link>
        </Button>
      </div>
    </main>
  )
}
```

**Update Midtrans webhook or payment callback** to redirect to `/upgrade/success?plan=basic` or `/upgrade/success?plan=pro` instead of `/dashboard` after successful payment.

Find the payment success redirect in:
- `src/app/api/payment/webhook/route.ts` (if redirecting from webhook)
- Or the Midtrans Snap `onSuccess` callback in the frontend

Change:
```ts
// BEFORE:
router.push('/dashboard')

// AFTER:
router.push(`/upgrade/success?plan=${planName}`)
```

---

## Task 4: Add Value Framing to All Upgrade CTAs

Wherever the "Upgrade" or "Rp 29K" price appears, add a micro-copy value frame:

Create a helper constant: `src/lib/upgrade-copy.ts`

```ts
export const UPGRADE_COPY = {
  priceLabel: 'Rp 29K/bulan',
  valueFrame: 'Kurang dari 1 kopi per hari',
  roiFrame: 'Jika selisih PPh21 Rp 50K/bulan → BEP 2 minggu',
  ctaPrimary: 'Upgrade Paket Basic',
  ctaSecondary: 'Lihat paket lengkap →',
  cancelAnytime: 'Bisa dibatalkan kapan saja',
  trialNote: 'Tidak ada kontrak, tidak ada biaya tersembunyi',
}
```

Apply `UPGRADE_COPY.valueFrame` as a sub-label wherever the price is displayed:

```tsx
<div>
  <span className="font-bold text-lg">Rp 29K</span>
  <span className="text-muted-foreground text-sm">/bulan</span>
  <p className="text-xs text-muted-foreground">{UPGRADE_COPY.valueFrame}</p>
</div>
```

---

## Task 5: Add "Lihat Contoh Hasil" Sample Modal on Pricing Page

Create file: `src/components/SamplePaidResultModal.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export function SamplePaidResultModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-emerald-600 dark:text-emerald-400 underline hover:no-underline text-sm">
          Lihat contoh hasil lengkap →
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contoh Hasil Paket Basic</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground italic">Contoh dengan data fiktif — bukan data nyata</p>
          
          {/* Sample violation with IDR detail */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">V02</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">TINGGI</span>
            </div>
            <p className="font-semibold text-sm mb-2">PPh21 Tidak Dipotong</p>
            
            {/* Full IDR breakdown — visible in sample */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPh21 di slip:</span>
                <span className="font-mono">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seharusnya (TER):</span>
                <span className="font-mono">Rp 185.000</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 mt-1.5">
                <span className="font-semibold">Selisih bulan ini:</span>
                <span className="font-mono font-bold text-red-600">Rp 185.000</span>
              </div>
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span className="font-semibold">Potensi akumulasi setahun:</span>
                <span className="font-mono font-bold">Rp 2.220.000</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              → Tunjukkan hasil ini ke HRD dan minta koreksi di slip bulan berikutnya.
            </p>
          </div>
          
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
            <a href="/upgrade">Unlock Paket Basic — Rp 29K/bulan →</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

Add `<SamplePaidResultModal />` to the pricing page below the pricing cards.

---

## Acceptance Criteria

- [ ] PremiumGate shows partial preview with blurred `Rp ██.███` text — not full content blur
- [ ] PremiumGate `hiddenLabel` and `benefit` props are set contextually per violation type in Wajar Slip result
- [ ] Pricing page hero headline leads with outcome ("berapa yang kurang dibayar") not feature list
- [ ] Pricing cards show: price, value frame, outcome-focused bullet list, CTA
- [ ] "Kurang dari 1 kopi per hari" value frame appears near every price display
- [ ] Post-payment redirects to `/upgrade/success` (not `/dashboard`)
- [ ] `/upgrade/success` page fires confetti, shows what was unlocked, has CTA to Wajar Slip
- [ ] SamplePaidResultModal opens from pricing page with full IDR breakdown visible
- [ ] `npm run build` passes with zero errors
