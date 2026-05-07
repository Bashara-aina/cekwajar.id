# 09 — Mobile-First UX Perfection (375px and Up)

> **For OpenCode:** ~78% of TikTok-driven traffic to cekwajar.id will be on a 375px-wide phone screen, with the address bar and bottom nav stealing another ~140px of vertical space. The product must work flawlessly there or the entire revenue model collapses. This file is a mobile-specific audit and rebuild covering every flow, every breakpoint, every gesture.

---

## 0. Diagnosis: Where Mobile Breaks Today

Walk through the live deployment on a 375×667 viewport (iPhone SE, the lowest common denominator):

| Surface | Issue | Severity |
|---------|-------|----------|
| GlobalNav.tsx L89 | `className="stick top-0 z-50"` — typo `stick` not `sticky` → header doesn't stick | P0 |
| GlobalNav mobile menu | Sheet width `w-72` = 288px → 80% of a 375px screen → cramped, poor reachability | P1 |
| Homepage hero | Two CTAs side-by-side at 375px (`sm:flex-row`) but break to column too late | P1 |
| Wajar Slip IDLE | Disclaimer banner pushes the upload zone below the fold on iPhone SE | P0 |
| Wajar Slip form | Three-column row (Bulan/Tahun/NPWP) is illegible at 375px | P0 |
| Wajar Slip verdict | `<table>` with 4 columns wraps awkwardly on 375px | P1 |
| Wajar Gaji IDLE | Skeleton placeholders only — no actual form rendered | P0 (broken) |
| Wajar Tanah IDLE | Province cascade requires three selects + lots of vertical scroll | P2 |
| Pricing/Upgrade | 3 cards force horizontal scroll on 375px | P1 |
| Dashboard Bento | `lg:col-span-2 lg:row-span-2` falls to 1×1 on mobile, looks empty | P2 |
| Login/Signup | Form inside `Card` with shadow + padding eats 32px on each side | P2 |

Most are fixable in 1–3 commits each. Together they represent the difference between a 25% audit-completion rate and a 65% one.

---

## 1. The Mobile Tap-Target Audit (run before every release)

Every interactive element ≥44×44px (iOS HIG / Android Material spec). Add to `package.json`:

```json
"scripts": {
  "audit:tap-targets": "node scripts/audit-tap-targets.mjs"
}
```

```js
// scripts/audit-tap-targets.mjs — uses Playwright to find any clickable <44px element
import { chromium } from 'playwright'

const PAGES = ['/', '/wajar-slip', '/wajar-gaji', '/wajar-tanah', '/wajar-kabur', '/wajar-hidup', '/upgrade', '/dashboard', '/auth/login']
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
const page = await ctx.newPage()

let failures = 0
for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  const shorts = await page.$$eval(
    'a, button, [role=button], input[type=submit], input[type=checkbox], [tabindex="0"]',
    (els) =>
      els
        .map((e) => ({ rect: e.getBoundingClientRect(), tag: e.tagName, text: (e.textContent || '').slice(0, 40) }))
        .filter((e) => e.rect.width > 0 && (e.rect.width < 44 || e.rect.height < 44)),
  )
  if (shorts.length) {
    failures += shorts.length
    console.log(`✗ ${path} — ${shorts.length} too-small targets`)
    for (const s of shorts.slice(0, 5)) console.log(`   ${s.tag} "${s.text}" ${Math.round(s.rect.width)}×${Math.round(s.rect.height)}`)
  }
}
await browser.close()
process.exit(failures > 5 ? 1 : 0) // tolerate up to 5 cross-cutting violations during transition
```

Run in CI on every PR.

---

## 2. The 320px Floor

We support viewports as small as 320px (iPhone 5 / older Android). At 320px:
- All padding ≤16px on outer containers.
- Hero font sizes use `clamp()` (already present in `globals.css`).
- No fixed-width images >280px.
- Tables horizontally scroll inside `overflow-x-auto`.
- Modals fill the viewport (`w-screen` instead of `w-[400px]`).

Audit: build a 320px Storybook frame and screenshot every page; compare against design.

---

## 3. GlobalNav Fixes (P0 — SHIP TODAY)

Open `src/components/layout/GlobalNav.tsx` line 89:

```tsx
// BEFORE (BROKEN):
<header className="stick top-0 z-50 w-full border-b shadow-sm" ...>

// AFTER:
<header className="sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur-md bg-white/90 dark:bg-slate-950/90" ...>
```

Add `backdrop-blur` for the iOS-feel sticky header.

### Mobile Sheet — Improvements

```tsx
<SheetContent
  side="right"
  className="w-[88vw] max-w-sm bg-white p-5 dark:bg-slate-950"  // was w-72 (288px)
  style={{ /* keep custom styles */ }}
>
```

Inside the sheet:
- Bigger tap targets (each tool: `py-3 text-base`, was `py-2 text-base` but inside cramped padding).
- Group spacing: 24px between tools and auth section.
- Add a subtle close icon top-right for users who don't know the swipe gesture: `<X className="h-5 w-5" />`.

### Hamburger placement

A 44×44 button. Currently `<Button variant="ghost" size="icon">` defaults to ~36×36 in shadcn. Override:

```tsx
<Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Buka menu">
  <Menu className="h-5 w-5" />
</Button>
```

---

## 4. Homepage Hero (375px) — Specific Fixes

Already covered in file 02 §1 but reinforce here:

- `flex-col items-center` is the **default**, switch to `sm:flex-row` only at ≥640px. Currently the buttons are side-by-side at 375px — they don't fit cleanly.
- Primary CTA full-width on mobile: `className="w-full sm:w-auto"`.
- Hero `min-height: 64svh` (small-viewport-height unit) so address-bar height collapse doesn't push the CTA below the fold.

```tsx
<section className="relative bg-gradient-to-b from-amber-50/40 to-white px-4 pt-6 pb-10 sm:pt-10 sm:pb-14"
  style={{ minHeight: 'min(64svh, 600px)' }}>
```

---

## 5. Wajar Slip IDLE — Critical Mobile Path

The most-trafficked surface. Layout from top to bottom on 375×667 (iPhone SE):

| Px | Element |
|----|---------|
| 0   | Sticky nav (56px) |
| 56  | H1 + subtitle (84px) |
| 140 | Trust strip (28px) |
| 168 | Disclaimer info button — small (24px) |
| 192 | Upload drop zone — full width × 240px |
| 432 | "Atau isi manual" link (24px) |
| 456 | Live audit ticker (44px) |
| 500 | Bottom safe-area gap |

The above fits in 500px → user can scroll a tiny bit but the whole frame is one screen on iPhone SE.

The current code violates this by inserting the `<DisclaimerBanner>` at 84px, taking ~80px. Remove it from IDLE and put behind an info button. Same goes for the manual fallback link — make it small text, not a button.

---

## 6. Wajar Slip Manual Form — Mobile Re-Layout

Current 3-column row at line 662:

```tsx
<div className="grid grid-cols-3 gap-4">
  <div>...month...</div>
  <div>...year...</div>
  <div>...NPWP radios...</div>
</div>
```

At 375px, three columns × 16px gap × 4px content padding = each column is ~108px wide. NPWP radio "Ya"/"Tidak" with their hover state doesn't fit. Fix:

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
  <div className="col-span-1">...month...</div>
  <div className="col-span-1">...year...</div>
  <div className="col-span-2 sm:col-span-1">...NPWP radios...</div>
</div>
```

Apply the same logic to other 3+ column rows.

Inputs:
- All financial inputs use `inputMode="numeric"` + `pattern="[0-9]*"` (mobile keyboard).
- Phone select: ensure native iOS picker (`<select>`) is used by `Select` shadcn component on iOS Safari — fall back if not.
- Labels above inputs (already correct), no inline labels.

---

## 7. Wajar Slip Verdict — Mobile Layout

The current verdict card at lines 366–386 has `<CardContent className="flex items-start gap-4 p-6">` — fine on desktop. On 375px, the icon (40×40) + 16px gap + remaining text means the title can wrap to 3 lines.

Fix: stack vertically below `sm`:

```tsx
<CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
  <Icon className="h-10 w-10 shrink-0 ..." />
  <div>...title + paragraph...</div>
</CardContent>
```

The calculation table (lines 455–506) is the worst offender. Replace with **stacked rows** under `sm`:

```tsx
<div className="space-y-3 sm:hidden">
  {rows.map((row) => (
    <div key={row.label} className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">{row.label}</p>
        <p className={`font-mono text-xs ${row.diff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {row.diff > 0 ? '+' : ''}Rp {Math.abs(row.diff).toLocaleString('id-ID')}
        </p>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <span>Slip: <span className="font-mono text-slate-700">Rp {row.slip.toLocaleString('id-ID')}</span></span>
        <span>Seharusnya: <span className="font-mono text-slate-700">Rp {row.correct.toLocaleString('id-ID')}</span></span>
      </div>
    </div>
  ))}
</div>
<table className="hidden sm:table w-full text-sm">...</table>
```

Reading 4 columns on a 320px screen is impossible. Stacked rows work.

---

## 8. Pricing/Upgrade — Mobile Single-Tier Card

After file 05's single-tier collapse, the pricing card is one block. On mobile:
- Card has `mx-auto max-w-md` so it never exceeds ~28rem.
- Price `text-5xl` (36px) on mobile, `text-6xl` (48px) on desktop.
- CTA button `h-14` (56px) tall; that's the comfortable-thumb minimum.
- Lay testimonials below as a **horizontal-scroll carousel** with snap points:

```tsx
<div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
  {testimonials.map((t) => (
    <div key={t.id} className="w-[80vw] shrink-0 snap-center sm:w-auto">
      ...
    </div>
  ))}
</div>
```

Add small dot indicators below the carousel using IntersectionObserver to highlight the active card.

---

## 9. Dashboard — Mobile Stacking

Restructure the dashboard sections:
1. Cumulative block — full width.
2. Recent audits — full width (limit 5 visible, then "Lihat semua").
3. Subscription — full width.
4. Other tools — 2×2 grid with smaller cards.

Bottom sticky CTA: *"Audit slip terbaru"* persistent across the whole dashboard until user has audited today. Disappears if `last_audit_at < 24h ago`.

---

## 10. Forms — Mobile-Specific Patterns

### 10.1 Single-column always

No matter how big the screen, on mobile **never** use multi-column form layouts. The user's eye scans top-to-bottom; multi-column forces left-right scanning that fails when keyboards open.

### 10.2 Auto-advance focus

After a numeric input is filled to expected length, auto-advance to next input. Especially for: month, year, OCR confirmations. Use `useEffect` on input `value` length.

### 10.3 Floating sticky submit

When the form is long and the user is editing midway, surface a sticky submit at the bottom of the viewport:

```tsx
<div className="sticky bottom-0 left-0 right-0 -mx-4 mt-6 border-t border-slate-200 bg-white p-3 sm:mx-0 sm:border-0 sm:p-0">
  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto">
    Cek Slip Gaji →
  </Button>
</div>
```

The mobile user can submit from any scroll position.

### 10.4 Keyboard-aware viewport

Detect `visualViewport` API to adjust layout when the iOS keyboard opens. Without this, the keyboard covers the submit button and the user has to dismiss to submit.

```tsx
useEffect(() => {
  if (!('visualViewport' in window)) return
  const onResize = () => {
    document.documentElement.style.setProperty(
      '--keyboard-h',
      `${(window.innerHeight - window.visualViewport!.height)}px`,
    )
  }
  window.visualViewport!.addEventListener('resize', onResize)
  return () => window.visualViewport!.removeEventListener('resize', onResize)
}, [])
```

CSS:
```css
.sticky-cta {
  position: sticky;
  bottom: var(--keyboard-h, 0);
}
```

---

## 11. Modals & Dialogs On Mobile

Replace centered `Dialog` with bottom-sheet on mobile (`<Sheet>` with `side="bottom"`). The PdpConsentGate (file 06 §1) and the cancel/refund dialogs (file 08 §4) all benefit. Bottom sheets feel native and reach-friendly.

Pattern:
```tsx
const isMobile = useMediaQuery('(max-width: 640px)')
return isMobile ? <Sheet side="bottom">...</Sheet> : <Dialog>...</Dialog>
```

Include a `useMediaQuery` hook (write your own — 10 lines):
```ts
import { useEffect, useState } from 'react'
export function useMediaQuery(q: string) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(q); setV(m.matches)
    const h = (e: MediaQueryListEvent) => setV(e.matches)
    m.addEventListener('change', h); return () => m.removeEventListener('change', h)
  }, [q])
  return v
}
```

---

## 12. Performance Budget — Mobile

| Metric | Mobile target | Tools |
|--------|---------------|-------|
| LCP | ≤ 2.0s on 4G | Lighthouse, RUM |
| CLS | ≤ 0.05 | Lighthouse |
| INP | ≤ 200ms | Lighthouse |
| First page JS | ≤ 130KB gz | Next.js build output |
| Image total | ≤ 200KB above fold | webp + next/image |

Specifically for cekwajar.id:
- Hero gradient is CSS, not image. ✓
- Verdict mockup is inline SVG/HTML, not image. ✓
- LiveAuditTicker queries Supabase from client — keep query small, cache 60s in KV.
- Framer Motion: dynamic import only on pages that need it; disable on `prefers-reduced-motion`.
- `tesseract.js` is large (~7MB worker) — load only on the manual fallback path; never on initial page load.

```tsx
// dynamic load
const Tesseract = dynamic(() => import('@/lib/ocr/tesseract-client'), { ssr: false })
```

---

## 13. Image Optimisation

All images via `next/image`:
- Founder photo: 320×320 webp, lazy.
- Testimonial avatars: 96×96 webp.
- OG default: pre-rendered Edge.
- Verdict mockup: ideally pure CSS/SVG; if image used, ≤30KB.

Block any PNG/JPG > 100KB at build time:
```js
// scripts/check-image-size.js
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
const MAX = 100_000
async function* walk(dir) { for (const f of await readdir(dir, { withFileTypes: true })) {
  const p = join(dir, f.name); if (f.isDirectory()) yield* walk(p); else yield p } }
let bad = 0
for await (const p of walk('public')) {
  if (!/\.(png|jpe?g)$/i.test(p)) continue
  const s = await stat(p); if (s.size > MAX) { console.log(`✗ ${p} ${(s.size/1024).toFixed(0)}KB`); bad++ }
}
process.exit(bad ? 1 : 0)
```

---

## 14. Accessibility — Mobile Specifically

- `prefers-reduced-motion`: respect everywhere (already partially done).
- Voice-over labels on every icon-only button.
- Focus rings visible on tab — never `outline:none` without a replacement.
- Text base size ≥ 14px on body, ≥ 16px on inputs (iOS Safari otherwise zooms).
- Color contrast WCAG AA: emerald-600 on white = 4.61:1 ✓; emerald-600 on emerald-50 = 1.31:1 ✗ (use emerald-700 there).
- All form errors `role="alert"` and connected to inputs via `aria-describedby`.

---

## 15. Acceptance Criteria

- [ ] `stick top-0` typo fixed → `sticky top-0` (file 10 §1 also lists this).
- [ ] Tap-target audit script in `package.json`, passes (≤5 tolerated).
- [ ] All forms single-column on `<sm` viewport.
- [ ] Wajar Slip verdict table renders as stacked cards on mobile.
- [ ] PdpConsentGate renders as bottom sheet on mobile.
- [ ] All numeric inputs have `inputMode="numeric"`.
- [ ] Pricing card centred, max-w-md, sticky CTA visible at all scroll positions.
- [ ] Dashboard sticky "Audit slip terbaru" button persistent until daily audit done.
- [ ] Image-size build check passes.
- [ ] Lighthouse mobile score ≥90 on `/`, `/wajar-slip`, `/upgrade`, `/dashboard`.
- [ ] Visual regression screenshots at 320 / 375 / 414 / 768 / 1280 widths, posted in PR.

---

*End of file. Cross-references: `02_landing_homepage_conversion.md` (sticky mobile CTA), `03_wajar_slip_full_flow_audit.md` (form layout), `04_paywall_freemium_gate_psychology.md` (modal-to-sheet swap), `10_launch_checklist_production_quality.md` (typo fix list).*
