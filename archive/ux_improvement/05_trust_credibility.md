# 05 — Trust & Credibility Signals
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: DisclaimerBanner leads with legal hedging. No security badges, no user count, no testimonials. Indonesians share payslips only with trusted platforms. The platform communicates liability avoidance, not user protection.

## Objective
Add a TrustBadges component above every form. Reframe disclaimers. Add an audit counter. Add founder section. Build the foundation for future testimonials. All components use Lucide icons already installed.

---

## Task 1: Create TrustBadges Component

Create file: `src/components/TrustBadges.tsx`

```tsx
import { ShieldCheck, Trash2, UserX, FileCheck, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Badge {
  icon: React.ElementType
  label: string
  sublabel?: string
}

const DEFAULT_BADGES: Badge[] = [
  {
    icon: Lock,
    label: 'Enkripsi TLS 1.3',
    sublabel: 'Data aman saat transfer',
  },
  {
    icon: Trash2,
    label: 'Hapus Otomatis 30 Hari',
    sublabel: 'Data tidak disimpan permanen',
  },
  {
    icon: UserX,
    label: 'Tanpa Nama Tersimpan',
    sublabel: 'Audit bisa tanpa daftar',
  },
  {
    icon: FileCheck,
    label: 'Berbasis PMK 168/2023',
    sublabel: 'Regulasi pajak resmi Indonesia',
  },
]

interface TrustBadgesProps {
  badges?: Badge[]
  className?: string
  variant?: 'row' | 'compact'
}

export function TrustBadges({ badges = DEFAULT_BADGES, className, variant = 'row' }: TrustBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
        {badges.map(badge => {
          const Icon = badge.icon
          return (
            <div
              key={badge.label}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1"
            >
              <Icon className="w-3 h-3 text-emerald-500" />
              <span>{badge.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3 mb-6', className)}>
      {badges.map(badge => {
        const Icon = badge.icon
        return (
          <div
            key={badge.label}
            className="flex flex-col items-center text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900"
          >
            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{badge.label}</p>
            {badge.sublabel && (
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 leading-tight">{badge.sublabel}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

**Apply to all 5 tool pages:**

Add `<TrustBadges />` just before the form section on each tool page. For Wajar Slip specifically, also add a property-specific badge set:

```tsx
// In wajar-tanah/page.tsx — override with property-specific badges
<TrustBadges
  badges={[
    { icon: Lock, label: 'Enkripsi TLS 1.3', sublabel: 'Data aman saat transfer' },
    { icon: Trash2, label: 'Hapus Otomatis', sublabel: '30 hari setelah audit' },
    { icon: FileCheck, label: 'Data dari Listing Publik', sublabel: '99.co & Rumah123' },
    { icon: ShieldCheck, label: 'IQR Statistical Method', sublabel: 'Outlier otomatis dibuang' },
  ]}
/>
```

---

## Task 2: Reframe DisclaimerBanner Component

Open `src/components/DisclaimerBanner.tsx`. Find the current content. Replace the defensive legal language with informative, positive-framed versions:

**Current pattern (change this):**
> "cekwajar.id tidak bertanggung jawab atas kerugian yang timbul..."

**New pattern for Wajar Slip:**

```tsx
// Replace the disclaimer content for the slip tool:
<div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
  <div>
    <strong>Tentang akurasi:</strong> Hasil audit berdasarkan regulasi PMK 168/2023 dan data UMK 2026 resmi.
    Untuk kepastian hukum atau perselisihan kerja, konsultasikan dengan konsultan pajak atau Disnaker setempat.
  </div>
</div>
```

**For Wajar Tanah:**
```tsx
<div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
  <div>
    <strong>Estimasi pasar:</strong> Harga berdasarkan data listing publik, bukan penilaian KJPP.
    Untuk transaksi resmi, gunakan jasa penilai properti bersertifikat.
  </div>
</div>
```

Keep the same amber warning styling. Only change the text from liability-first to information-first.

Add `import { Info } from 'lucide-react'` to the component.

---

## Task 3: Add Audit Counter to Homepage (API + Component)

If not already created from file 02, create the API route:

**`src/app/api/stats/audit-count/route.ts`:**

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 300 // refresh every 5 minutes

export async function GET() {
  try {
    const supabase = createClient()
    
    // Count from payslip_audits — adjust table name to match your actual schema
    const { count: slipCount } = await supabase
      .from('payslip_audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Also count salary benchmarks if that table exists
    const { count: gajiCount } = await supabase
      .from('salary_queries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const total = (slipCount ?? 0) + (gajiCount ?? 0)
    
    return NextResponse.json({ count: total }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' }
    })
  } catch (error) {
    console.error('Audit count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
```

**`src/components/AuditCounterBadge.tsx`:**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

export function AuditCounterBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stats/audit-count')
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => setCount(null))
  }, [])

  if (count === null) return null

  const formatted = new Intl.NumberFormat('id-ID').format(count)

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
      <span>
        <strong className="text-foreground">{formatted}</strong> pengecekan minggu ini
      </span>
    </div>
  )
}
```

Add `<AuditCounterBadge />` in the homepage hero section just below the primary CTA buttons.

---

## Task 4: Create FounderSection Component

Create file: `src/components/FounderSection.tsx`

```tsx
import { Heart } from 'lucide-react'

export function FounderSection() {
  return (
    <section className="py-16 px-4 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-900">
        <div className="flex items-center gap-3 mb-5">
          {/* Founder avatar placeholder — replace with actual photo if available */}
          <div className="w-14 h-14 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-2xl font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            B
          </div>
          <div>
            <p className="font-bold text-foreground">Bashara</p>
            <p className="text-sm text-muted-foreground">Founder, cekwajar.id</p>
          </div>
        </div>
        
        <blockquote className="text-foreground leading-relaxed mb-4">
          "Saya bikin cekwajar.id karena pernah kena underpay BPJS hampir setahun penuh sebelum sadar.
          Waktu itu saya nggak tahu harus cek ke mana, dan nggak ada tools yang mudah.
          Sekarang kamu nggak perlu ngalamin hal yang sama."
        </blockquote>
        
        <div className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
          <Heart className="w-4 h-4" />
          <span>Dibuat dengan penuh untuk karyawan Indonesia</span>
        </div>
      </div>
    </section>
  )
}
```

**Apply to:**
- `src/app/page.tsx` — add near the bottom of the homepage, above the footer
- `src/app/kontak/page.tsx` — as the opening section of the contact/about page

---

## Task 5: Create TestimonialsSection Component (Placeholder Ready for Real Data)

Create file: `src/components/TestimonialsSection.tsx`

```tsx
interface Testimonial {
  initials: string
  name: string
  city: string
  quote: string
  tool: string
}

// Replace with real testimonials after beta — use placeholder for now
const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'R',
    name: 'Rizky',
    city: 'Tangerang',
    quote: 'Ternyata BPJS saya kurang dipotong selama 8 bulan. Langsung saya tunjukkan ke HRD dan sudah dikoreksi.',
    tool: 'Wajar Slip',
  },
  {
    initials: 'D',
    name: 'Dimas',
    city: 'Bandung',
    quote: 'Gajimu ada di P38 — itu yang bikin saya akhirnya berani negosiasi saat review tahunan.',
    tool: 'Wajar Gaji',
  },
  {
    initials: 'S',
    name: 'Sari',
    city: 'Jakarta',
    quote: 'Niat pindah ke Singapore, tapi setelah cek PPP ternyata gaya hidup saya di Jakarta lebih terjangkau. Jadi lebih objektif pertimbangannya.',
    tool: 'Wajar Kabur',
  },
]

export function TestimonialsSection() {
  // Only render when real testimonials are confirmed — set SHOW_TESTIMONIALS to true
  const SHOW_TESTIMONIALS = false
  if (!SHOW_TESTIMONIALS) return null

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-center font-bold text-xl mb-8">Kata mereka yang sudah pakai</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map(t => (
          <div key={t.name} className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400">
                {t.initials}
              </div>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city} · via {t.tool}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

Add to `src/app/page.tsx` — below the FounderSection. When real testimonials are collected after beta, set `SHOW_TESTIMONIALS = true`.

---

## Task 6: Add Security Indicator to Auth Pages

Open `src/app/auth/login/page.tsx`. Below the login form, add:

```tsx
<div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
  <div className="flex items-center gap-1">
    <Lock className="w-3 h-3" />
    <span>Supabase Auth</span>
  </div>
  <span>·</span>
  <div className="flex items-center gap-1">
    <ShieldCheck className="w-3 h-3" />
    <span>OAuth 2.0</span>
  </div>
  <span>·</span>
  <div className="flex items-center gap-1">
    <UserX className="w-3 h-3" />
    <span>Tidak ada password disimpan</span>
  </div>
</div>
```

Add matching imports: `import { Lock, ShieldCheck, UserX } from 'lucide-react'`

---

## Acceptance Criteria

- [ ] TrustBadges renders above the form on all 5 tool pages (4 badges each)
- [ ] DisclaimerBanner text is information-first, not liability-first, on all tools
- [ ] AuditCounterBadge renders on homepage with live count from `/api/stats/audit-count`
- [ ] API route `/api/stats/audit-count` returns count from Supabase without error
- [ ] FounderSection renders on homepage (bottom) and kontak page (top)
- [ ] TestimonialsSection exists in codebase but `SHOW_TESTIMONIALS = false` (placeholder ready)
- [ ] Auth login page shows security indicators below the form
- [ ] `npm run build` passes with zero errors
