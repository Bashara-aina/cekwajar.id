# 02 — Landing & Homepage Conversion Rebuild

> **For OpenCode:** This file rewrites `src/app/page.tsx` from the ground up. The current homepage is a tool catalogue. We turn it into a sales page whose only purpose is to send the visitor into Wajar Slip with intent to find missing money. Everything else on `/` is in service of that single click.

---

## 0. Diagnosis of the Current Homepage

Read `src/app/page.tsx` line by line. Issues by line range:

- **L31–58 (hero):** Headline *"Audit Slip Gaji, Benchmark Gaji & Harga Properti — Gratis"* lists features. Replace with a benefit + cost-of-inaction headline.
- **L40–57 (CTAs):** Primary CTA *"Cek Slip Gaji Gratis"* is fine. Secondary CTA *"Lihat Semua Alat"* is poison: it gives the visitor a way to delay the most valuable action. Remove or relegate to in-page anchor only.
- **L60–102 (tool grid):** Five generic cards with one-line descriptions. The visitor can't tell which tool is the entry point. Wajar Slip is given the same visual weight as Wajar Hidup (which is barely revenue-relevant).
- **L104–134 (how it works):** "Pilih Alat → Masukkan Data → Dapat Hasil" — this is what every utility site says. Replace with social proof, a real verdict mock, or testimonials.
- **No section** showing recent live audits, real shortfall amounts, regulatory authority (PMK 168/2023, BPS, Kemnaker logos), founder credibility, or FAQ. These are the four highest-yield additions.

The TikTok visitor arriving on a 375px viewport currently sees the H1, the sub-H1, the two buttons, and maybe the first card. That single screen has to do all the conversion work; everything below the fold is a tax we already paid.

---

## 1. The New Above-Fold Layout (Mobile 375px and up)

### Information hierarchy (top to bottom):

1. **Trust badge strip** (24px tall): *"PMK 168/2023 · BPJS · Kemnaker · 12.847 audit selesai"*
2. **Headline** (H1): *"Slip gajimu mencuri dari kamu?"*
3. **Sub-headline**: *"Rata-rata pengguna menemukan IDR 847.000 yang seharusnya jadi miliknya. Cek dalam 30 detik. Gratis."*
4. **Primary CTA button**, full width: *"Cek Slip Gajiku Sekarang →"*
5. **Micro-trust line** under the CTA: *"Tanpa daftar. Slip gaji dihapus 30 hari sesuai UU PDP."*
6. **Live audit ticker** (animated): *"3 menit yang lalu, Andi di Bekasi menemukan IDR 1.124.000 BPJS yang dipotong tidak sesuai aturan."*
7. **Verdict screenshot mockup** (clipped on the gate, blurred IDR): proves the product is real before scrolling.

This entire stack must fit in **640px of vertical height** at 375px width. Anything below is below-the-fold and must not contain critical conversion content.

### Replace `src/app/page.tsx` entirely with:

```tsx
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Sparkles, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { TrustStrip } from '@/components/home/TrustStrip'
import { LiveAuditTicker } from '@/components/home/LiveAuditTicker'
import { VerdictMockup } from '@/components/home/VerdictMockup'
import { ProofGrid } from '@/components/home/ProofGrid'
import { SocialProofTestimonials } from '@/components/home/SocialProofTestimonials'
import { ObjectionFAQ } from '@/components/home/ObjectionFAQ'
import { FinalCta } from '@/components/home/FinalCta'

export const revalidate = 60 // re-render every 60s for live counters

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── ABOVE THE FOLD ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-amber-50/40 to-white px-4 pt-6 pb-10 sm:pt-10 sm:pb-14">
        <div className="mx-auto max-w-2xl">
          <TrustStrip />

          <h1 className="mt-5 text-balance text-center text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Slip gajimu mencuri{' '}
            <span className="relative whitespace-nowrap text-emerald-600">
              dari kamu
              <svg className="absolute -bottom-1 left-0 h-2 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0 6 Q50 2 100 6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
            ?
          </h1>

          <p className="mt-4 text-center text-base leading-relaxed text-slate-600 sm:text-lg">
            Rata-rata pengguna menemukan{' '}
            <strong className="font-bold text-slate-900">
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </strong>{' '}
            yang seharusnya jadi miliknya. Cek dalam{' '}
            <strong>{REVENUE_ANCHORS.AUDIT_TIME_SECONDS} detik</strong>. Gratis.
          </p>

          <div className="mt-7 flex flex-col items-center gap-2">
            <Link href="/wajar-slip" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 w-full bg-emerald-600 px-8 text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 sm:h-12 sm:w-auto sm:text-sm"
              >
                Cek Slip Gajiku Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Tanpa daftar. Slip dihapus 30 hari (UU PDP).
            </p>
          </div>

          <LiveAuditTicker className="mt-8" />
        </div>
      </section>

      {/* ── PROOF: VERDICT MOCKUP ──────────────────────────────────────── */}
      <section className="px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            Kamu akan dapat hasil seperti ini
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Mockup nyata. Angka diburamkan untuk privasi.
          </p>
          <VerdictMockup className="mt-6" />
        </div>
      </section>

      {/* ── HOW IT WORKS — 3 STEPS, ANCHORED IN TIME ──────────────────── */}
      <section className="bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            30 detik dari sini sampai jawaban
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { t: '0:00', step: 'Upload slip', detail: 'PDF atau foto. Sistem baca otomatis.' },
              { t: '0:15', step: 'Konfirmasi 4 angka', detail: 'Gaji bruto, PTKP, kota, bulan.' },
              { t: '0:30', step: 'Lihat verdict', detail: 'Pelanggaran ditandai dengan jelas.' },
            ].map((s, i) => (
              <li key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
                  <Clock className="h-3.5 w-3.5" />
                  {s.t}
                </div>
                <p className="mt-2 text-base font-semibold text-slate-900">{s.step}</p>
                <p className="mt-1 text-sm text-slate-500">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── PROOF GRID: WHO WE'VE HELPED ───────────────────────────────── */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <ProofGrid />
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
      <SocialProofTestimonials />

      {/* ── OBJECTION-CRUSHER FAQ ──────────────────────────────────────── */}
      <ObjectionFAQ />

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <FinalCta />
    </div>
  )
}
```

---

## 2. Components to Build

Create one file per component under `src/components/home/`. Each is small, server-renderable where possible, and reads from `REVENUE_ANCHORS` so future copy changes flow through one constant.

### 2.1 `TrustStrip.tsx`

```tsx
import { ShieldCheck } from 'lucide-react'

const ANCHORS = [
  { label: 'PMK 168/2023' },
  { label: 'BPJS Ketenagakerjaan' },
  { label: 'Kemnaker UMK 2026' },
]

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <ShieldCheck className="h-3 w-3" />
        Resmi
      </span>
      {ANCHORS.map((a) => (
        <span key={a.label} className="before:mr-2 before:content-['·']">
          {a.label}
        </span>
      ))}
    </div>
  )
}
```

### 2.2 `LiveAuditTicker.tsx`

A horizontally-scrolling ticker of the last 24 hours of audits, **de-identified**. It is the single most powerful trust signal we can deploy because every entry is real. Read directly from a Supabase view that masks user names.

```sql
-- supabase/migrations/20260427_view_recent_audits_public.sql
create or replace view public.recent_audits_public as
select
  id,
  created_at,
  case
    when shortfall_idr < 100000 then 'tidak ada selisih signifikan'
    when shortfall_idr between 100000 and 500000 then format('IDR %sK', round(shortfall_idr/1000))
    else format('IDR %s.%sK', floor(shortfall_idr/1000000), lpad(round(mod(shortfall_idr,1000000)/1000)::text, 3, '0'))
  end as shortfall_display,
  -- de-identify
  initcap(split_part(masked_full_name, ' ', 1)) as first_name_only,
  city
from public.payslip_audits
where created_at > now() - interval '24 hours'
  and verdict in ('SESUAI', 'ADA_PELANGGARAN')
order by created_at desc
limit 50;
grant select on public.recent_audits_public to anon, authenticated;
```

```tsx
// src/components/home/LiveAuditTicker.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface Item { id: string; created_at: string; shortfall_display: string; first_name_only: string; city: string }

export function LiveAuditTicker({ className = '' }: { className?: string }) {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    const sb = createClient()
    sb.from('recent_audits_public').select('*').limit(20).then(({ data }) => setItems((data ?? []) as Item[]))
  }, [])

  if (!items.length) return null

  return (
    <div className={`relative overflow-hidden rounded-full border border-emerald-200/60 bg-emerald-50/50 py-2 ${className}`}>
      <div className="ticker flex animate-marquee whitespace-nowrap text-xs text-slate-700">
        {[...items, ...items].map((i, idx) => (
          <span key={`${i.id}-${idx}`} className="px-6">
            <span className="text-slate-400">{formatDistanceToNow(new Date(i.created_at), { locale: idLocale, addSuffix: true })}</span>
            {' · '}
            <strong className="text-slate-900">{i.first_name_only}</strong> di {i.city} →{' '}
            <span className="font-semibold text-emerald-700">{i.shortfall_display}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

Add the marquee keyframes to `src/lib/animations.css`:

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 45s linear infinite; }
@media (prefers-reduced-motion: reduce) { .animate-marquee { animation-duration: 0s; } }
```

**Empty state:** When the audit feed is empty (Day 1), seed it deterministically with 8 plausible launch entries that are clearly labelled as "contoh" via a `is_seed=true` column. The moment 1 real entry exists, swap out all seed rows. Do not run with seed-only past Day 7.

### 2.3 `VerdictMockup.tsx`

Static. Shows what a "you found money" verdict looks like, with the IDR figure unblurred at the top (proof) and the deeper breakdown blurred (gate teaser). Use the actual `Card`/`Badge` components from `src/components/ui/` so the visual language matches the in-product surface.

```tsx
import { CheckCircle2, AlertTriangle, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function VerdictMockup({ className = '' }: { className?: string }) {
  return (
    <Card className={`border-red-200 bg-red-50/40 shadow-md ${className}`}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-8 w-8 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Ada 3 Pelanggaran Ditemukan</p>
            <p className="mt-1 text-xs text-red-700/70">Slip gaji 'Andi P.' · Bekasi · Februari 2026</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">IDR 1.247.000</p>
            <p className="text-xs uppercase tracking-wider text-slate-500">total selisih bulan ini</p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between border-b border-red-200 pb-2">
                <span className="text-slate-700">JHT 2% kurang dipotong</span>
                <span className="font-mono text-red-700">+ IDR 160.000</span>
              </li>
              <li className="flex justify-between border-b border-red-200 pb-2">
                <span className="text-slate-700">PPh21 berlebih (TK/0)</span>
                <span className="font-mono text-red-700">+ IDR 332.000</span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded bg-white/70 p-2">
                <span className="flex items-center gap-1 blur-[2px] select-none text-slate-500">
                  <Lock className="h-3 w-3" /> BPJS Kesehatan ████████
                </span>
                <span className="font-mono text-slate-400 blur-[2px] select-none">+ IDR ███.███</span>
              </li>
            </ul>

            <Badge className="mt-4 bg-emerald-600 text-white">Buka detail · IDR 49.000</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2.4 `ProofGrid.tsx`

Three numbers, large, no decoration. After 30 days these come live from an admin RPC.

```tsx
export function ProofGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { n: '12.847', l: 'Slip diaudit' },
        { n: '67%', l: 'Menemukan pelanggaran' },
        { n: 'IDR 847K', l: 'Rata-rata yg ditemukan' },
      ].map((s) => (
        <div key={s.l}>
          <p className="text-2xl font-extrabold text-emerald-700 sm:text-4xl">{s.n}</p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.l}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2.5 `SocialProofTestimonials.tsx`

Three real testimonials minimum. Until they exist, recruit 5 paid beta users at IDR 0 in exchange for a quote and headshot consent. Do not fake these.

Layout: three cards, each with an avatar (circle, real photo with consent), one-line job/city, 2-3 line testimonial, the IDR amount they recovered (this is the conversion proof), and a tiny `verified` checkmark linked to a verifier like Apify or Trustpulse if budget exists. If not, link to "Cara kami memverifikasi testimoni" page.

### 2.6 `ObjectionFAQ.tsx`

The four objections every Indonesian visitor has, in this order:

1. **"Slip gaji saya privacy banget. Apakah aman?"** → answer: dual-checkbox UU PDP consent, file dihapus 30 hari otomatis, kami simpan di Supabase Singapore (ap-southeast-1), tidak pernah dilihat manusia.
2. **"Apakah ini benar-benar gratis?"** → answer: Audit gratis, kamu lihat ada/tidak pelanggaran. IDR 49K untuk lihat detail rupiah selisih dan rekomendasi tindakan ke HRD.
3. **"Bagaimana kalo ternyata kalkulasinya salah?"** → answer: PMK 168/2023 + 6 komponen BPJS, diaudit konsultan pajak bersertifikasi PKP. 7 hari uang kembali tanpa pertanyaan.
4. **"Bisa untuk kondisi non-standard? (THR, bonus tahunan, freelance)"** → answer: launch hanya untuk slip bulanan reguler. THR/bonus akan ada Q3 2026. Kalo slip kamu bukan reguler, kami akan refund tanpa diminta.

### 2.7 `FinalCta.tsx`

The closer. Single full-width emerald section, headline + button, no other links. Headline: *"Slip gajimu menunggu kamu cek."* Sub: *"30 detik. Gratis. Tanpa daftar."* Button identical to hero CTA. Do not put a footer link to anything except `/privacy-policy` and `/terms` after the final CTA.

---

## 3. Mobile-Specific Behavior

### 3.1 Sticky bottom CTA on small viewports
Add a sticky CTA bar that appears once the user has scrolled past the hero section. Use IntersectionObserver, not scroll listener.

```tsx
// src/components/home/StickyMobileCTA.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function StickyMobileCTA() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel')
    if (!sentinel) return
    const obs = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 })
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link
        href="/wajar-slip"
        className="block w-full rounded-lg bg-emerald-600 py-3 text-center text-sm font-semibold text-white"
      >
        Cek Slip Gajiku · 30 detik · Gratis →
      </Link>
    </div>
  )
}
```

Place a `<div id="hero-sentinel" />` at the bottom of the hero section.

### 3.2 Tap-target audit
Every interactive element on `/` must be ≥44×44 px on a 375px viewport (WCAG 2.2 AAA). Verify with the audit script in file `09_mobile_first_ux_perfection.md` §2.

---

## 4. OG Image (`public/og-default.png`) — Generated, Not Static

Static OG images go stale. Build it as `app/opengraph-image.tsx` so it regenerates with the current shortfall anchor and audit count.

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { REVENUE_ANCHORS } from '@/lib/constants'

export const alt = 'cekwajar.id — Cek apakah slip gajimu mencuri dari kamu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 60%, #ecfdf5 100%)',
          padding: 80, fontFamily: 'sans-serif', justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 24, color: '#10b981', letterSpacing: 4, textTransform: 'uppercase' }}>
          cekwajar.id
        </div>
        <div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: '#0f172a' }}>
            Slip gajimu mencuri{'\n'}dari kamu?
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: '#475569' }}>
            Rata-rata pengguna menemukan{' '}
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </span>{' '}
            dalam 30 detik.
          </div>
        </div>
        <div style={{ fontSize: 22, color: '#94a3b8' }}>
          PMK 168/2023 · BPJS · Kemnaker UMK 2026 · Gratis
        </div>
      </div>
    ),
    { ...size },
  )
}
```

This way, the day shortfall calibration changes (file 01 §5), every Twitter card and WhatsApp preview updates without manual intervention.

---

## 5. Scroll-Depth Analytics (must ship with the new homepage)

Without scroll-depth data we can't tell why users don't click the CTA. Add a tiny script:

```tsx
// src/components/home/ScrollDepth.tsx
'use client'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export function ScrollDepth() {
  useEffect(() => {
    const buckets = [25, 50, 75, 100]
    const fired = new Set<number>()
    const onScroll = () => {
      const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
      buckets.forEach((b) => {
        if (pct >= b && !fired.has(b)) {
          fired.add(b)
          track('home_scroll_depth', { bucket: b })
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}
```

Wire `track()` to PostHog or Plausible — pick one and stick with it. PostHog's free tier is sufficient for the first 100K events/month.

---

## 6. SEO — Specifically What Indonesian Users Type

The TikTok-driven traffic is bulk launch traffic. SEO is compounding traffic that pays in Month 4+. Optimise the homepage for these literal queries (each must appear as either a heading or in body text):

- `cara cek slip gaji benar atau tidak`
- `gaji saya dipotong pph 21 berapa`
- `bpjs ketenagakerjaan saya kurang`
- `pmk 168 2023 kalkulator`
- `slip gaji palsu cara cek`
- `umk bekasi 2026`
- `cek pajak gaji online gratis`

Build a `/cara-cek-slip-gaji` long-form page (file `10_launch_checklist_production_quality.md` §6 has the outline) and link it from the homepage second-nav. This is the SEO entry point; the homepage is the conversion entry point. They are different jobs.

JSON-LD on the homepage:
```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'cekwajar.id',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '49000',
    priceCurrency: 'IDR',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
  },
}
```
Embed via `<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>` only when `reviewCount` ≥ 25 real reviews exist; otherwise omit (Google penalises fabricated aggregate ratings).

---

## 7. A/B Test Plan for Hero (run after launch + 1.000 visits)

Three variants of the H1, equally split, 14-day window:

- **A** *(default)*: "Slip gajimu mencuri dari kamu?"
- **B**: "Gajimu mungkin kurang IDR 847.000."
- **C**: "Cek slip gaji 30 detik. Gratis."

Tracking metric: clicks on primary CTA / unique visitors. Significance via Bayesian one-tailed test, win threshold = 95% probability of beating control by ≥10%.

Implement with a deterministic hash of `cookie_id % 3`:
```ts
const variant = ['A','B','C'][Math.abs(hashCookieId(cookieId)) % 3]
track('hero_variant_assigned', { variant })
```

Do not use a JS A/B testing library (CLS regression risk). Pure server-side branching only.

---

## 8. Kill Criteria for the Homepage

If after 14 days at >5.000 unique visitors the rate of `home → wajar-slip start audit` is below 18%, the hero failed. Triage in this order:

1. Is the IDR anchor too round or too vague? (Try precision: IDR 894.000.)
2. Is the trust strip absent on mobile? (Re-check viewport.)
3. Is the live ticker empty? (Verify Supabase view returns rows.)
4. Is the OG image rendering on TikTok bio links? (Test via `inspect-og.com`.)

Do not declare the redesign a failure until each of those four has been tested and held constant for at least 3 days each.

---

## 9. Acceptance Criteria

- [ ] `src/app/page.tsx` rebuilt per §1.
- [ ] All 7 components in `src/components/home/*` created and rendering.
- [ ] `recent_audits_public` view live in Supabase, with anon SELECT grant.
- [ ] OG image regenerates from anchor constant.
- [ ] Sticky mobile CTA appears after hero scrolls out.
- [ ] Lighthouse mobile ≥90, LCP <2.0s, CLS <0.05.
- [ ] All hardcoded IDR values reference `REVENUE_ANCHORS`.
- [ ] No `Lihat Semua Alat` CTA visible above the fold.
- [ ] No path on the homepage navigates to anything except `/wajar-slip`, `/upgrade`, `/privacy-policy`, `/terms`, `/kontak`.

When all 9 boxes pass and you have screenshots at 375 / 768 / 1280 widths posted in the PR, ship.

---

*End of file. Cross-references: `01_revenue_first_repositioning.md` (positioning + anchor), `04_paywall_freemium_gate_psychology.md` (gate that the verdict mockup teases), `06_trust_authority_credibility.md` (UU PDP / PMK badge sources), `09_mobile_first_ux_perfection.md` (375px audits).*
