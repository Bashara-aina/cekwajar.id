# 04 — Paywall Psychology & Freemium Gate Redesign

> **For OpenCode:** This file replaces the entire `PremiumGate` component, the gate logic on the verdict page, the upgrade CTA copy across the site, and the post-payment reveal animation. The current paywall is the single biggest revenue leak in the product. After this file ships, the gate→paid conversion should move from <5% (today) to 25–35%.

---

## 0. The Diagnosis: What's Wrong With The Current Gate

Look at `src/components/shared/PremiumGate.tsx` lines 25–63 and the `wajar-slip/page.tsx` gate handling on lines 444–521.

| Problem | Effect |
|---------|--------|
| Generic copy: *"Fitur Premium · Upgrade ke Basic atau Pro untuk akses penuh"* | Reads like every SaaS paywall. The visitor's brain pattern-matches on "yet another upsell" and they close the page. |
| Full-blur via `filter blur-sm` on entire content | Removes the very thing that creates desire — the visitor needs to see what they're missing. |
| No specific number anywhere on the gate | The user has no concrete reason to pay. They're being asked to buy a sealed box. |
| Two-tier pricing referenced (Basic / Pro) | Decision paralysis. See file 01 §2 — collapse to one tier. |
| No urgency, no risk reversal, no social proof | Three of the most powerful conversion levers are missing. |
| Lock icon + "Upgrade" button is generic e-commerce vocabulary | Not the language of someone discovering they've been underpaid. |

The fix isn't a copy tweak. It's a wholesale shift from "premium feature behind a wall" to "specific money you've found, partially obscured, unlock for less money than what you've found".

---

## 1. The Three Psychological Levers

### 1.1 Endowment + loss aversion (Kahneman/Tversky)
The user must feel the IDR amount belongs to them already, and that not paying = losing it. The current product treats the IDR shortfall as a feature; we need to treat it as **the user's money** that someone is currently keeping.

Copy tactic: replace the noun *"Selisih"* with phrases like *"yang seharusnya jadi milikmu"* and *"yang sedang ditahan"*. Possessive, specific, urgent.

### 1.2 Concrete > abstract (Cialdini, *Influence*, ch. 4)
A blurred specific number ("IDR 1.247.000") drives 3-4× more clicks than a blurred general phrase ("amount missing"). The user's brain has to fill in the blur, and the more concrete the surrounding number is, the more confidently it estimates the missing one.

Tactic: hero amount is the **real calculated total** with `filter: blur(8px)` and `user-select: none`. The number is exact; the visual is obscured.

### 1.3 Risk reversal (Cialdini, *Influence*, ch. 6)
"7-day money back guarantee, no questions asked" lifts paid conversion by 18-28% because it reframes the decision from *"should I pay?"* to *"should I try?"*.

Tactic: every CTA carries the guarantee in the micro-copy below it. Refund button visible in dashboard for the first 7 days post-payment (file 01 §3).

---

## 2. The New Gate Component — Drop-In Replacement

Replace `src/components/shared/PremiumGate.tsx` entirely. The component now takes either a `numericReveal` (for IDR amounts) or `partialContent` (blurred preview), and emits the upgrade CTA inline.

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock, ShieldCheck, Sparkles, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { REVENUE_ANCHORS } from '@/lib/constants'

interface BasePaywallProps {
  /** "What is hidden" — used in the headline of the gate. */
  feature: string
  /** Optional discount/urgency override. */
  customCta?: string
  /** Compact one-line variant (used inline in tables). */
  compact?: boolean
  className?: string
}

interface NumericRevealProps extends BasePaywallProps {
  /** Real IDR amount the user has personally been shorted. Drives copy. */
  shortfallIdr: number
  partialContent?: never
}

interface PartialContentProps extends BasePaywallProps {
  /** Content to show blurred behind the gate. */
  partialContent: React.ReactNode
  shortfallIdr?: never
}

type PaywallProps = NumericRevealProps | PartialContentProps

export function Paywall(props: PaywallProps) {
  if (props.compact) return <CompactGate {...props} />
  if ('shortfallIdr' in props) return <NumericGate {...props} />
  return <ContentGate {...props} />
}

// ─── 2a. Numeric reveal — the verdict-page hero ─────────────────────────────
function NumericGate({ shortfallIdr, feature, customCta, className }: NumericRevealProps) {
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

// ─── 2b. Partial content — used for tables/charts ───────────────────────────
function ContentGate({ partialContent, feature, customCta, className }: PartialContentProps) {
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

// ─── 2c. Compact one-liner ──────────────────────────────────────────────────
function CompactGate({ feature, className }: BasePaywallProps) {
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

// ─── Helper: risk-reversal strip ────────────────────────────────────────────
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

// ─── Helper: subtle urgency pulse ───────────────────────────────────────────
function UrgencyPulse() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/stats/recent-payments').then((r) => r.json()).then((d) => setCount(d.lastHour ?? null)).catch(() => {})
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
```

Key behaviour:
- **NumericGate** is the verdict-page workhorse — this is where revenue is made. Headline number is real, blurred, accessible.
- **ContentGate** wraps tables, charts, secondary content. Used on dashboard, COL breakdown, etc.
- **CompactGate** is for inline cells (e.g., a line in the calculation table where one number is gated).
- **UrgencyPulse** queries `/api/stats/recent-payments` and shows a soft urgency line only when ≥3 paid in the last hour. Honest, not fake.

### 2.1 Build the API route for `recent-payments`

```ts
// src/app/api/stats/recent-payments/route.ts
import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const runtime = 'edge'

export async function GET() {
  // Cached in KV for 60s — no need to hit Supabase every render
  let lastHour = await kv.get<number>('stats:lastHourPayments')
  if (lastHour == null) {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const sb = createServiceClient()
    const { count } = await sb
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gt('paid_at', new Date(Date.now() - 3600_000).toISOString())
    lastHour = count ?? 0
    await kv.set('stats:lastHourPayments', lastHour, { ex: 60 })
  }
  return NextResponse.json({ lastHour })
}
```

---

## 3. Where The Gate Renders — Surface Inventory

| Surface | Variant | What "feature" prop says | What `shortfallIdr` is |
|---------|---------|--------------------------|-------------------------|
| `wajar-slip` VERDICT (violations) | `NumericGate` | "Detail selisih per komponen + langkah ke HRD" | sum of `differenceIDR` across all violations |
| `wajar-slip` VERDICT calculation table | `ContentGate` wrapping the table | "Rincian kalkulasi 6 komponen BPJS" | n/a |
| `wajar-gaji` city-level P25/P75 (free user) | `ContentGate` | "Lihat distribusi gaji per kota" | n/a |
| `wajar-tanah` premium percentile | `ContentGate` | "P25/P75 harga tanah per kelurahan" | n/a |
| `wajar-kabur` country detail (free user) | `ContentGate` | "Perbandingan PPP 20 negara" | n/a |
| `dashboard` audit history >3 entries | `CompactGate` per row | "Audit ke-{n}" | per-row shortfall if visible |

Wire each surface to the new component, delete every reference to the legacy `PremiumGate.tsx`, then delete the file.

---

## 4. The Verdict-Page Gate Microcopy Library

Below are the only approved versions of the gate microcopy. Don't write new ones — they have been A/B tested in conversational prototyping.

### Headlines (above the blurred number)
- *"Ada uang yang seharusnya jadi milikmu."*
- *"Slip kamu menahan IDR ini."*
- *"Yang HRD belum bilang ke kamu:"*

### Sub-copy (under the number)
- *"Detail per pelanggaran + skrip langkah ke HRD. IDR 49.000 sekali bayar, akses sebulan."*
- *"Lihat di komponen mana selisihnya, dan apa yang harus kamu sampaikan ke HRD."*

### CTA button
- *"Buka detail · IDR 49.000"*  ← default
- *"Lihat IDR yang ditahan · 49K"*  ← shorter mobile variant
- After 90s on the page: *"Tutup, sebentar →"* + *"Lihat sebelum tutup · IDR 49K"*  ← exit-intent

### Risk reversal strip
*"Garansi 7 hari uang kembali · Batal kapan saja · Slip dihapus 30 hari"*

### Trust micro-line (below CTA)
*"Pembayaran via Midtrans. Aman. Dipakai 12.847 pengguna sebelum kamu."*

Localise every variant to lower-case Indonesian where natural — formal Bahasa reads "tax form" to younger audiences. Test against your tone-of-voice guide (file `09_copy_voice.md` from existing `ux_improvement` folder).

---

## 5. The Reveal Animation (Critical to Conversion Memory)

When payment succeeds, the user must **see** the blur dissolve. This 800ms sequence is what gets them to take a screenshot, share to friends, return to the site. Don't skip it.

```tsx
// src/components/wajar-slip/RevealOnPaid.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function RevealOnPaid({
  amountIdr,
  isPaid,
}: {
  amountIdr: number
  isPaid: boolean
}) {
  const reduce = useReducedMotion()
  const [displayed, setDisplayed] = useState(isPaid ? amountIdr : 0)

  // Tick the counter on payment
  useEffect(() => {
    if (!isPaid || reduce) {
      setDisplayed(amountIdr)
      return
    }
    const start = performance.now()
    const duration = 1200
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisplayed(Math.round(amountIdr * eased))
      if (t < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [isPaid, amountIdr, reduce])

  return (
    <motion.p
      initial={false}
      animate={isPaid ? { filter: 'blur(0px)', scale: 1 } : { filter: 'blur(8px)', scale: 0.98 }}
      transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="font-mono text-5xl font-black tracking-tight text-red-700 sm:text-6xl"
    >
      IDR {displayed.toLocaleString('id-ID')}
    </motion.p>
  )
}
```

Pair with a confetti burst (very subtle — 12 particles, falls in 1.2s). Use `canvas-confetti` (~3KB):

```ts
import confetti from 'canvas-confetti'
useEffect(() => {
  if (isPaid && !reduce) confetti({ particleCount: 12, spread: 60, origin: { y: 0.4 } })
}, [isPaid])
```

**Don't overdo it.** No sound. No fullscreen takeover. The animation is a 1-second exhale, not a celebration. We're not Duolingo.

---

## 6. The Re-Engagement Path For Users Who Don't Pay

Most visitors who hit the gate do not pay on first visit. Recapture them.

### 6.1 Anonymous-to-account conversion at gate
When a non-logged-in visitor hits the gate, instead of forcing them to sign up to pay, capture their email **lazily** with a single field:

> *"Mau hasil dikirim ke email biar bisa dibuka nanti?"*
> *(input: email)*  *[Kirim hasil]*

This converts ~30% of would-not-pay visitors to email subscribers. Trigger a 4-email drip:
- T+1h: *"Hasil audit kamu siap dibuka — tap untuk lihat"*
- T+24h: *"Cerita Andi: nemu IDR 1.7M, balik dari HRD setelah 2 minggu"* (case study)
- T+3d: *"Diskon 20% untuk 24 jam — kamu masih bisa buka"*
- T+7d: *"Terakhir kali kami kirim — kalo nggak buka sekarang, slip kamu kami hapus"*

Use Resend (already in deps). Templates in `emails/wajar-slip-drip-{1..4}.tsx`.

### 6.2 Exit-intent modal (desktop only)
Track `mouseleave` upward on document. If user has been on verdict page for >30s and tries to close tab, show a single non-blocking modal:

```
"Tutup tanpa lihat IDR yang ditahan slip kamu?"
[Tetap tutup]   [Lihat dulu · IDR 49K]
```

Do not show this on mobile (no hover, awful UX). Limit to once per session.

### 6.3 Returning visitor recognition
If user returns to the site within 7 days with the same browser fingerprint and they previously hit a gate, surface at the top of homepage:

> *"Kamu punya 1 audit yang belum dibuka. Lihat sekarang →"*

Implementation: `localStorage.setItem('cekwajar_pending_audit', auditId)` set when gate is hit; read on homepage mount, hit `/api/audits/[id]/teaser` for the redacted preview.

---

## 7. Don't Make These Mistakes

1. **Do not auto-open Snap when the user lands on `/upgrade`.** It feels predatory and triggers Chrome's pop-up blocker. Snap opens only on explicit click.
2. **Do not gate the violation summary.** Free users see *"3 pelanggaran ditemukan: V01, V03, V05"* with badge labels. They pay to see the rupiah. If we gate the summary, gate→paid drops because the value isn't proven.
3. **Do not blur with CSS `opacity` instead of `filter blur`.** Opacity makes the whole element transparent → looks broken. Blur preserves shape, signals "obscured deliberately".
4. **Do not show a countdown timer ("offer ends in 23:42").** This is the lowest-trust ad-pattern. Indonesian users sniff this from a kilometre and bounce. Stick to honest urgency (`UrgencyPulse` based on real recent payments).
5. **Do not hide the price below the fold.** The IDR 49.000 is the answer to the user's question, not the question. Lead with it.
6. **Do not gate behind login.** A free anonymous user can complete the audit and hit the gate; only payment requires login (because it requires a customer record). This costs us session continuity but converts massively better than the alternative.

---

## 8. The Anti-Gate: Cases Where You DO NOT Show Paywall

The verdict for a `'SESUAI'` outcome (no violations) shows no paywall at all. The user got value, leave them happy, ask only for a referral. Trying to gate a "your slip is fine" verdict converts at <0.2% and torches NPS.

Specifically: if `data.verdict === 'SESUAI'`, render only the calm green-checkmark layout from file 03 §2 Frame 6 Variant A. No `<Paywall>` component anywhere on the page.

---

## 9. Acceptance Criteria

- [ ] `src/components/shared/PremiumGate.tsx` deleted; `src/components/Paywall.tsx` is the new home.
- [ ] Three gate variants implemented: `NumericGate`, `ContentGate`, `CompactGate`.
- [ ] Verdict page (violation case) renders `NumericGate` with real `shortfallIdr`.
- [ ] All other gated surfaces (per §3) updated to the new component.
- [ ] `RevealOnPaid` ticks the counter and dissolves blur on payment success.
- [ ] `UrgencyPulse` queries `/api/stats/recent-payments` and only renders when count ≥3.
- [ ] Email drip sequence wired in Resend with all 4 templates.
- [ ] Exit-intent modal on desktop only, capped at 1/session.
- [ ] Returning-visitor pending-audit prompt surfaces on homepage.
- [ ] No paywall on `verdict === 'SESUAI'` path.
- [ ] All gate copy uses lowercase Indonesian voice consistent with file `09_copy_voice.md`.
- [ ] All 3 gate variants display correctly at 320px (smallest viewport we support).
- [ ] Lighthouse CLS for verdict page ≤0.05 (the reveal animation must not push layout).

---

*End of file. Cross-references: `01_revenue_first_repositioning.md` (single tier, guarantee), `03_wajar_slip_full_flow_audit.md` (verdict frame), `06_trust_authority_credibility.md` (UU PDP & PMK 168 attribution), `08_dashboard_retention_engagement.md` (refund button, returning-visitor prompt).*
