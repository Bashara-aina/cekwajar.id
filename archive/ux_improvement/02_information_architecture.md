# 02 — Information Architecture & Homepage
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: Homepage is a hero + 5 equal tool cards in a grid. No hierarchy, no recommended starting point, no cross-tool suggestions after results. Users arriving from TikTok expecting Wajar Slip see 5 equal options and must figure out where to go.

## Objective
Redesign homepage to feature Wajar Slip as the primary CTA. Add cross-tool suggestion components after every verdict. Add a "Mulai dari mana?" decision helper. Improve navigation hierarchy.

---

## Task 1: Redesign Homepage Hero Section

Open `src/app/page.tsx`. Replace the current hero section entirely with the following structure:

```tsx
// src/app/page.tsx — hero section replacement
// Keep all existing imports, add these:
import { ArrowRight, ShieldCheck, TrendingUp, MapPin, Plane, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Hero section JSX — replaces the existing hero div:
<section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-16 md:py-24 px-4">
  {/* Background motif — import BalanceScaleSVG from task in file 01 */}
  <div className="max-w-3xl mx-auto text-center relative z-10">
    
    {/* Trust pill */}
    <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5 text-sm text-emerald-700 dark:text-emerald-400 mb-6 shadow-sm">
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Gratis · Berbasis PMK 168/2023 · Data Terenkripsi</span>
    </div>

    {/* Main headline */}
    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 leading-tight mb-4">
      Slip Gaji Kamu Dipotong<br />
      <span className="text-emerald-600 dark:text-emerald-400">Sesuai Aturan Nggak?</span>
    </h1>
    
    <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
      AI audit PPh21, BPJS, dan UMK slip gajimu dalam 30 detik. 
      Gratis, tanpa daftar.
    </p>
    
    {/* Primary CTA */}
    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
      <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base h-12 px-8">
        <Link href="/wajar-slip">
          Cek Slip Gaji Sekarang
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="text-base h-12">
        <Link href="/wajar-gaji">
          Cek Standar Gaji
        </Link>
      </Button>
    </div>
    
    {/* Social proof line */}
    <p className="text-sm text-muted-foreground">
      Sudah{' '}
      <AuditCounter />{' '}
      slip gaji dicek minggu ini
    </p>
  </div>
</section>
```

---

## Task 2: Create AuditCounter Client Component

Create file: `src/components/AuditCounter.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'

export function AuditCounter() {
  const [count, setCount] = useState<string>('...')

  useEffect(() => {
    fetch('/api/stats/audit-count')
      .then(res => res.json())
      .then(data => {
        if (data.count) {
          setCount(new Intl.NumberFormat('id-ID').format(data.count))
        }
      })
      .catch(() => setCount('ratusan'))
  }, [])

  return <strong className="text-slate-700 dark:text-slate-300">{count}</strong>
}
```

Create API route: `src/app/api/stats/audit-count/route.ts`

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 300 // cache 5 minutes

export async function GET() {
  try {
    const supabase = createClient()
    const { count } = await supabase
      .from('payslip_audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
```

Import and use `AuditCounter` in the hero section above.

---

## Task 3: Redesign Tool Cards Below Hero

Replace the current equal 5-card grid with a two-tier layout: Wajar Slip is the featured tool; the other 4 are secondary.

```tsx
// Below the hero section in src/app/page.tsx:

{/* Secondary tools section */}
<section className="py-12 px-4 max-w-5xl mx-auto">
  <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
    Juga tersedia
  </h2>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      {
        href: '/wajar-gaji',
        icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
        label: 'Wajar Gaji',
        desc: 'Benchmark gaji posisimu',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      },
      {
        href: '/wajar-tanah',
        icon: <MapPin className="w-5 h-5 text-stone-500" />,
        label: 'Wajar Tanah',
        desc: 'Harga tanah & properti',
        badge: 'bg-stone-50 text-stone-700 dark:bg-stone-950/40 dark:text-stone-400',
      },
      {
        href: '/wajar-kabur',
        icon: <Plane className="w-5 h-5 text-indigo-500" />,
        label: 'Wajar Kabur',
        desc: 'Bandingkan daya beli luar negeri',
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      },
      {
        href: '/wajar-hidup',
        icon: <BarChart3 className="w-5 h-5 text-teal-500" />,
        label: 'Wajar Hidup',
        desc: 'Biaya hidup antar kota',
        badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
      },
    ].map(tool => (
      <Link
        key={tool.href}
        href={tool.href}
        className={`group rounded-xl border p-4 hover:shadow-md transition-all duration-200 ${tool.badge}`}
      >
        <div className="flex items-center gap-2 mb-2">
          {tool.icon}
          <span className="font-semibold text-sm">{tool.label}</span>
        </div>
        <p className="text-xs opacity-80">{tool.desc}</p>
        <ArrowRight className="w-3 h-3 mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    ))}
  </div>
</section>
```

---

## Task 4: Create CrossToolSuggestion Component

This component appears at the bottom of every tool result, suggesting the next logical tool.

Create file: `src/components/CrossToolSuggestion.tsx`

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CrossToolSuggestionProps {
  fromTool: 'wajar-slip' | 'wajar-gaji' | 'wajar-tanah' | 'wajar-kabur' | 'wajar-hidup'
  className?: string
}

const suggestions: Record<string, { href: string; text: string; subtext: string; color: string }[]> = {
  'wajar-slip': [
    {
      href: '/wajar-gaji',
      text: 'Cek apakah gajimu wajar di pasaran',
      subtext: 'Benchmark dengan ribuan data gaji posisi yang sama',
      color: 'border-blue-200 hover:border-blue-400 dark:border-blue-800',
    },
  ],
  'wajar-gaji': [
    {
      href: '/wajar-slip',
      text: 'Audit slip gaji kamu',
      subtext: 'Pastikan potongan PPh21 dan BPJS sudah benar',
      color: 'border-amber-200 hover:border-amber-400 dark:border-amber-800',
    },
    {
      href: '/wajar-kabur',
      text: 'Bandingkan dengan gaji di luar negeri',
      subtext: 'Berapa nilai riil gajimu jika kerja di SG, AU, atau US?',
      color: 'border-indigo-200 hover:border-indigo-400 dark:border-indigo-800',
    },
  ],
  'wajar-tanah': [
    {
      href: '/wajar-hidup',
      text: 'Cek biaya hidup di kota tersebut',
      subtext: 'Berapa habis per bulan jika pindah ke sana?',
      color: 'border-teal-200 hover:border-teal-400 dark:border-teal-800',
    },
  ],
  'wajar-kabur': [
    {
      href: '/wajar-hidup',
      text: 'Bandingkan biaya hidup kota asal vs tujuan',
      subtext: 'Lihat perbedaan pengeluaran bulanan secara detail',
      color: 'border-teal-200 hover:border-teal-400 dark:border-teal-800',
    },
  ],
  'wajar-hidup': [
    {
      href: '/wajar-kabur',
      text: 'Hitung daya beli gajimu di luar negeri',
      subtext: 'PPP-adjusted comparison untuk 30+ negara',
      color: 'border-indigo-200 hover:border-indigo-400 dark:border-indigo-800',
    },
  ],
}

export function CrossToolSuggestion({ fromTool, className }: CrossToolSuggestionProps) {
  const items = suggestions[fromTool] ?? []
  if (items.length === 0) return null

  return (
    <div className={cn('mt-8 space-y-3', className)}>
      <p className="text-sm font-medium text-muted-foreground">Juga cek:</p>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'group flex items-center justify-between p-4 rounded-xl border-2 bg-background',
            'hover:shadow-sm transition-all duration-200',
            item.color
          )}
        >
          <div>
            <p className="font-semibold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {item.text}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.subtext}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-4" />
        </Link>
      ))}
    </div>
  )
}
```

**Apply to each tool:** At the bottom of every tool's result/verdict section, import and add:

```tsx
// In wajar-slip result section:
<CrossToolSuggestion fromTool="wajar-slip" />

// In wajar-gaji result section:
<CrossToolSuggestion fromTool="wajar-gaji" />

// In wajar-tanah result section:
<CrossToolSuggestion fromTool="wajar-tanah" />

// In wajar-kabur result section:
<CrossToolSuggestion fromTool="wajar-kabur" />

// In wajar-hidup result section:
<CrossToolSuggestion fromTool="wajar-hidup" />
```

---

## Task 5: Add "Mulai dari Mana?" Decision Helper on Homepage

Add this section between the hero and the secondary tool cards in `src/app/page.tsx`:

```tsx
// "Mulai dari mana?" section
<section className="py-8 px-4 max-w-2xl mx-auto">
  <p className="text-center text-sm font-medium text-muted-foreground mb-4">Mulai dari mana?</p>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {[
      {
        href: '/wajar-slip',
        question: '💼 Punya slip gaji?',
        action: 'Audit sekarang →',
        bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border-amber-200',
      },
      {
        href: '/wajar-gaji',
        question: '💰 Mau tahu gaji standar?',
        action: 'Benchmark gaji →',
        bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 border-blue-200',
      },
      {
        href: '/wajar-kabur',
        question: '✈️ Minat kerja di LN?',
        action: 'Hitung daya beli →',
        bg: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 border-indigo-200',
      },
    ].map(item => (
      <Link
        key={item.href}
        href={item.href}
        className={`rounded-xl border p-4 transition-all duration-150 ${item.bg}`}
      >
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{item.question}</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{item.action}</p>
      </Link>
    ))}
  </div>
</section>
```

---

## Task 6: Update Page Title and Meta for Each Tool

Open `src/app/wajar-slip/page.tsx` and ensure the metadata export is:

```ts
export const metadata = {
  title: 'Wajar Slip — Audit PPh21 & BPJS Slip Gaji Gratis | cekwajar.id',
  description: 'Upload slip gaji kamu. AI audit PPh21, BPJS, dan UMK dalam 30 detik. Gratis, berbasis PMK 168/2023.',
}
```

Repeat for each tool with appropriate descriptions:
- `wajar-gaji`: "Benchmark gaji posisimu dengan data crowdsourced ribuan karyawan Indonesia."
- `wajar-tanah`: "Cek apakah harga tanah atau properti yang kamu lihat tergolong murah, wajar, atau mahal."
- `wajar-kabur`: "Bandingkan daya beli gajimu dengan 30+ negara menggunakan PPP World Bank."
- `wajar-hidup`: "Perbandingan biaya hidup bulanan antar kota di Indonesia."

---

## Acceptance Criteria

- [ ] Homepage hero features Wajar Slip as the primary CTA with specific headline about slip gaji
- [ ] "Cek Slip Gaji Sekarang" is the largest/most prominent button on the homepage
- [ ] AuditCounter fetches from API and displays weekly audit count (shows "ratusan" on error)
- [ ] Secondary tools appear in 2×2 grid below hero with tool-specific tint colors
- [ ] "Mulai dari mana?" section with 3 decision cards appears between hero and tool grid
- [ ] CrossToolSuggestion renders at the bottom of each tool's result section
- [ ] Each tool page has a proper SEO title with tool name + description
- [ ] `npm run build` passes with zero errors
