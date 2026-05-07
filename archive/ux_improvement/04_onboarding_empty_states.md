# 04 — Onboarding & Empty States
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: No onboarding exists on any tool page. Users land on the form with zero context about what they'll get. The OCR upload has no photo quality guidance. Dashboard audit history is likely empty space for new users. No first-visit banner.

## Objective
Add a "How It Works" section above every tool form. Add a sample result teaser. Add OCR photo guidance. Fix all empty states. Add a first-visit awareness banner. Zero new dependencies needed — all components are pure Tailwind + Lucide.

---

## Task 1: Create HowItWorks Component

Create file: `src/components/HowItWorks.tsx`

```tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  icon: LucideIcon
  title: string
  description: string
}

interface HowItWorksProps {
  steps: Step[]
  className?: string
}

export function HowItWorks({ steps, className }: HowItWorksProps) {
  return (
    <div className={cn('mb-8', className)}>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-5">
        Cara kerjanya
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={index} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Apply to Wajar Slip (`src/app/wajar-slip/page.tsx`):**

```tsx
import { HowItWorks } from '@/components/HowItWorks'
import { Upload, Brain, ShieldCheck } from 'lucide-react'

// Add above the form:
<HowItWorks
  steps={[
    {
      icon: Upload,
      title: 'Upload atau isi manual',
      description: 'Foto slip gaji atau ketik angkanya langsung',
    },
    {
      icon: Brain,
      title: 'AI audit otomatis',
      description: 'Hitung PPh21 TER, BPJS, dan cek UMK 2026',
    },
    {
      icon: ShieldCheck,
      title: 'Lihat hasil lengkap',
      description: 'Temukan pelanggaran dengan penjelasan dan saran tindak lanjut',
    },
  ]}
/>
```

**Apply to Wajar Gaji (`src/app/wajar-gaji/page.tsx`):**

```tsx
import { Search, BarChart2, Users } from 'lucide-react'

<HowItWorks
  steps={[
    {
      icon: Search,
      title: 'Masukkan posisi & kota',
      description: 'Ketik jabatan dan pilih kota tempat kamu bekerja',
    },
    {
      icon: BarChart2,
      title: 'AI bandingkan data pasar',
      description: 'Blending data crowdsourced + scraping job portal',
    },
    {
      icon: Users,
      title: 'Lihat posisi gajimu',
      description: 'P25–P75 range dan di mana gajimu berdiri',
    },
  ]}
/>
```

**Apply to Wajar Tanah (`src/app/wajar-tanah/page.tsx`):**

```tsx
import { MapPin, TrendingUp, FileCheck } from 'lucide-react'

<HowItWorks
  steps={[
    {
      icon: MapPin,
      title: 'Pilih lokasi & tipe',
      description: 'Provinsi, kota, kecamatan, dan tipe properti',
    },
    {
      icon: TrendingUp,
      title: 'AI analisis harga pasar',
      description: 'IQR dari data listing 99.co dan Rumah123',
    },
    {
      icon: FileCheck,
      title: 'Dapat verdict harga',
      description: 'MURAH / WAJAR / MAHAL / SANGAT MAHAL berdasarkan data lokal',
    },
  ]}
/>
```

**Apply to Wajar Kabur (`src/app/wajar-kabur/page.tsx`):**

```tsx
import { Globe, Calculator, DollarSign } from 'lucide-react'

<HowItWorks
  steps={[
    {
      icon: Globe,
      title: 'Masukkan gaji & negara',
      description: 'Gaji IDR kamu dan negara/kota tujuan',
    },
    {
      icon: Calculator,
      title: 'Hitung PPP adjustment',
      description: 'World Bank PPP data + kurs real-time Frankfurter',
    },
    {
      icon: DollarSign,
      title: 'Lihat daya beli riil',
      description: 'Perbandingan nilai riil gaji setelah penyesuaian biaya hidup',
    },
  ]}
/>
```

**Apply to Wajar Hidup (`src/app/wajar-hidup/page.tsx`):**

```tsx
import { Home, ArrowLeftRight, PieChart } from 'lucide-react'

<HowItWorks
  steps={[
    {
      icon: Home,
      title: 'Pilih kota asal & tujuan',
      description: 'Bandingkan dua kota di Indonesia',
    },
    {
      icon: ArrowLeftRight,
      title: 'AI kalkulasi perbedaan',
      description: 'Sewa, makanan, transport, utilitas, hiburan',
    },
    {
      icon: PieChart,
      title: 'Lihat breakdown lengkap',
      description: 'Selisih per kategori pengeluaran bulanan',
    },
  ]}
/>
```

---

## Task 2: Create SampleResultTeaser Component

Create file: `src/components/SampleResultTeaser.tsx`

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SampleResultTeaser() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium">Lihat contoh hasil audit →</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {open && (
        <div className="px-4 pb-4 animate-fade-in-up">
          <p className="text-xs text-muted-foreground mb-3 italic">Contoh — bukan data nyata</p>
          
          {/* Sample verdict badge */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-bold text-red-700 dark:text-red-400">2 Pelanggaran Ditemukan</span>
            </div>
            
            {/* Sample violation 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-2 border border-red-100 dark:border-red-900">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-mono">V02</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold">TINGGI</span>
              </div>
              <p className="text-sm font-semibold">PPh21 Tidak Dipotong</p>
              <p className="text-xs text-muted-foreground mt-0.5">HRD tidak memotong PPh21 bulan ini.</p>
              <div className="mt-2 text-xs text-muted-foreground">
                Selisih: <span className="blur-sm select-none">Rp 185.000</span>
                <span className="ml-2 text-emerald-600 text-xs">🔒 Upgrade untuk lihat angka</span>
              </div>
            </div>
            
            {/* Sample violation 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-yellow-100 dark:border-yellow-900">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded font-mono">V04</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">SEDANG</span>
              </div>
              <p className="text-sm font-semibold">JP Karyawan Kurang Dipotong</p>
              <p className="text-xs text-muted-foreground mt-0.5">Jaminan Pensiun yang dipotong lebih kecil dari seharusnya.</p>
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Hasil nyata bergantung pada data slip gaji kamu
          </p>
        </div>
      )}
    </div>
  )
}
```

**Apply to Wajar Slip page** — add below the HowItWorks section, above the form:

```tsx
import { SampleResultTeaser } from '@/components/SampleResultTeaser'
// ...
<HowItWorks steps={...} />
<SampleResultTeaser />
{/* form below */}
```

---

## Task 3: Add OCR Photo Guidance to PayslipUploader

Open the PayslipUploader component (find it in `src/components/wajar-slip/` or wherever it's defined).

Add this below or inside the upload dropzone area:

```tsx
import { AlertCircle, CheckCircle2 } from 'lucide-react'

// Add below the dropzone:
<details className="mt-3 group">
  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 transition-colors list-none">
    <span>📷 Tips foto slip gaji yang baik</span>
    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
  </summary>
  <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
      <div className="flex items-center gap-1 text-green-700 dark:text-green-400 font-semibold mb-2">
        <CheckCircle2 className="w-3 h-3" /> Foto yang bagus
      </div>
      <ul className="space-y-1 text-green-700 dark:text-green-400">
        <li>✓ Pencahayaan cukup, tidak gelap</li>
        <li>✓ Teks terbaca jelas</li>
        <li>✓ Tidak ada bayangan di atas teks</li>
        <li>✓ Seluruh slip masuk frame</li>
        <li>✓ Tidak buram / blur</li>
      </ul>
    </div>
    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
      <div className="flex items-center gap-1 text-red-700 dark:text-red-400 font-semibold mb-2">
        <AlertCircle className="w-3 h-3" /> Hindari
      </div>
      <ul className="space-y-1 text-red-700 dark:text-red-400">
        <li>✗ Foto miring atau terpotong</li>
        <li>✗ Flash langsung ke kertas</li>
        <li>✗ Resolusi terlalu rendah</li>
        <li>✗ File PDF yang di-screenshot</li>
        <li>✗ Bayangan jari/tangan</li>
      </ul>
    </div>
  </div>
  <p className="text-xs text-muted-foreground mt-2">
    💡 Kalau hasilnya tidak akurat, coba isi manual di bawah.
  </p>
</details>
```

---

## Task 4: Fix Empty States Across the App

**Dashboard audit history empty state:**

Find the dashboard page (`src/app/dashboard/page.tsx`). Find where audit history / recent audits are listed. Add an empty state when the list is empty:

```tsx
// When audits array is empty:
{audits.length === 0 && (
  <div className="text-center py-16 px-4">
    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
      <FileSearch className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
    </div>
    <h3 className="font-semibold text-lg mb-2">Belum ada riwayat audit</h3>
    <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
      Mulai cek slip gaji pertama kamu. Gratis, butuh 30 detik.
    </p>
    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
      <Link href="/wajar-slip">Audit Slip Gaji Sekarang →</Link>
    </Button>
  </div>
)}
```

Add `import { FileSearch } from 'lucide-react'` to the imports.

**Wajar Gaji — no results empty state:**

When the salary benchmark returns no data for the entered job+city combination:

```tsx
{noResults && (
  <div className="text-center py-10 px-4 bg-muted/30 rounded-xl">
    <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
    <h3 className="font-semibold mb-1">Data belum tersedia</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Belum ada data gaji untuk posisi ini di kota tersebut. Coba kota terdekat atau jabatan yang lebih umum.
    </p>
    <p className="text-xs text-muted-foreground">
      💡 Kontribusi data gajimu: <Link href="/wajar-gaji/kontribusi" className="text-emerald-600 underline">Isi survey gaji anonim →</Link>
    </p>
  </div>
)}
```

---

## Task 5: Add First-Visit Banner

Create file: `src/components/FirstVisitBanner.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { X, Zap } from 'lucide-react'
import Link from 'next/link'

export function FirstVisitBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('cw_has_visited')
      if (!hasSeen) {
        setVisible(true)
        localStorage.setItem('cw_has_visited', '1')
      }
    } catch {
      // localStorage unavailable — don't show banner
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-slide-in-bottom">
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl shadow-xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Baru di cekwajar.id? 👋</p>
          <p className="text-xs text-emerald-100 mt-0.5">Cek slip gaji butuh 30 detik. Gratis, tanpa daftar.</p>
          <Link
            href="/wajar-slip"
            className="inline-block mt-2 text-xs font-semibold bg-white text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors"
            onClick={() => setVisible(false)}
          >
            Coba sekarang →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

**Apply to root layout:**

Open `src/app/layout.tsx`. Import and add `<FirstVisitBanner />` inside the body, after the main content:

```tsx
import { FirstVisitBanner } from '@/components/FirstVisitBanner'
// ...
<main>{children}</main>
<Footer />
<FirstVisitBanner />
```

---

## Task 6: Add Loading Skeleton for Tool Results

If not already present, add a skeleton loading state for each tool's result section.

Create file: `src/components/ResultSkeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ResultSkeleton() {
  return (
    <div className="space-y-4 mt-8" aria-label="Memuat hasil..." aria-busy="true">
      {/* Verdict badge skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />
      
      {/* Violation cards skeleton */}
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      
      {/* Calculation table skeleton */}
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}
```

Use this wherever `isCalculating` or `isLoading` is true, replacing any generic spinner.

---

## Acceptance Criteria

- [ ] Every tool page (5 total) has a "Cara kerjanya" section above the form with 3 steps
- [ ] Wajar Slip page has a "Lihat contoh hasil" collapsible teaser showing sample violations
- [ ] PayslipUploader has a "Tips foto" collapsible section with good/bad guidance
- [ ] Dashboard shows an empty state with CTA when no audits exist (not blank space)
- [ ] Wajar Gaji shows a proper "Data belum tersedia" state with suggestions when no results
- [ ] FirstVisitBanner appears for first-time visitors (bottom right, emerald) and doesn't reappear
- [ ] All loading states show ResultSkeleton instead of just a spinner
- [ ] `npm run build` passes with zero errors
