# UI/UX Compliance Audit — cekwajar.id

**Project:** `/Users/basharaaina/Projects/cekwajar_id-main/cekwajar.id-main`
**Audited:** `globals.css`, 8 home components, 3 dashboard components, `Paywall.tsx`, `next.config.ts`, `animations.css`
**Standard:** UI/UX Pro Max rules (Priorities 4–7 = MEDIUM, 8+ = LOW)

---

## 1. `src/app/globals.css`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 1 | **Light mode muted text** | `--muted-foreground: #64748b` (slate-500, `#64748b`) | Should be `#475569` (slate-600) or darker for body text in light mode | MEDIUM-5 |

**Code (line 17):**
```css
--muted-foreground: #64748b; /* slate-500 — too light for light-mode body text */
```
Should be `#475569` for proper contrast without being too dark.

### CORRECTLY IMPLEMENTED

- `--foreground: #0f172a` (slate-900) — correct dark body text
- `--muted-foreground: #94a3b8` in `.dark` (slate-400) — correct for dark mode
- `--border: #e2e8f0` (slate-200) — correct light mode border
- `--primary: #10b981` (emerald-500) — correct
- Fluid typography scale defined (`--text-xs` through `--text-3xl`) — good
- `--font-sans: var(--font-jakarta)` — correct (Plus Jakarta Sans)
- oklch shadow tokens — excellent (tone-matched, not gray opacity)
- CSS `@theme inline` for Tailwind v4 integration — correct approach

---

## 2. `src/lib/animations.css`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 2 | **Micro-interaction duration** | `--motion-duration-slow: 500ms`, `--motion-duration-slower: 700ms` | Micro-interactions should be 150–300ms max | MEDIUM-5 |
| 3 | **Marquee animation** | `animate-marquee 45s linear infinite` | No reduced-motion pause; only `animation-duration: 0s` override at line 215 | MEDIUM-5 |
| 4 | **`fade-in-up` entrance** | `0.5s var(--motion-ease-out)` | Page entrances should be 200–300ms | MEDIUM-6 |
| 5 | **Float ambient animation** | `float 6s ease-in-out infinite` | 6s is excessive; 2–3s is sufficient | MEDIUM-6 |

**Code (lines 10–13):**
```css
--motion-duration-fast: 150ms;
--motion-duration-normal: 300ms;
--motion-duration-slow: 500ms;   /* VIOLATION: slow is not micro-interaction */
--motion-duration-slower: 700ms;  /* VIOLATION: too slow for any UI element */
```

**Code (line 44):**
```css
--animate-float: float 6s ease-in-out infinite; /* VIOLATION: 6s is excessive */
```

**Code (line 212):**
```css
.animate-marquee {
  animation: marquee 45s linear infinite;
}
/* Missing: animation-play-state: paused on hover, prefers-reduced-motion */
```

### CORRECTLY IMPLEMENTED

- `prefers-reduced-motion` override at lines 196–204 — excellent
- `--motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — proper ease-out
- `--motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — good spring
- Shimmer keyframe and `bg-shimmer` utility — correct
- `animate-marquee` has `prefers-reduced-motion: reduce` override — good

---

## 3. `src/components/dashboard/BentoCard.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 6 | **Hover scale transform** | `whileHover={{ y: -4, scale: 1.01 }}` — scale 1.01 shifts layout | Use only `y` translate or opacity, NOT scale that causes layout shift | MEDIUM-5 |
| 7 | **Hover duration** | `transition={{ duration: 0.2, ... }}` on motion.div | 200ms is at the edge of acceptable; 150ms preferred | MEDIUM-6 |

**Code (line 69–72):**
```tsx
<motion.div
  whileHover={{ y: -4, scale: 1.01 }}  // VIOLATION: scale causes layout shift
  whileTap={{ scale: 0.99 }}
  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
```
`scale: 1.01` changes the element's visual size on hover, which shifts adjacent elements in a grid — this violates "Stable hover states: color/opacity transitions NOT scale transforms that shift layout."

**Code (line 74):**
```tsx
'...rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300',
```
`duration-300` is on the CSS transition for the border/hover state — acceptable, but 300ms borderline for micro-interaction.

### CORRECTLY IMPLEMENTED

- `useReducedMotion()` check at line 32 — excellent; returns static card when reduced motion preferred
- `whileTap: { scale: 0.99 }` — tap feedback is fine (scale down is not a layout-shifting issue)
- `borderClass` prop for border color transition on hover — color/opacity hover is compliant

---

## 4. `src/components/dashboard/AuditHistoryCard.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 8 | **Hover border + shadow** | `hover:shadow-md hover:border-slate-300` — both are layout-affecting | Shadow transition alone is fine; border color change is OK but not shadow + border together | MEDIUM-6 |

**Code (line 65):**
```tsx
className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 ..."
```
`hover:shadow-md` + `hover:border-slate-300` simultaneously — two layout-affecting properties changing at once; should pick one (shadow is sufficient).

### CORRECTLY IMPLEMENTED

- Lucide icons used correctly (CheckCircle2, AlertTriangle, ChevronRight)
- Icon sizing: `h-5 w-5` on 24x24 viewBox icons — compliant
- `text-emerald-600` / `text-red-500` for verdict icons — correct color contrast
- Dark mode text colors: `text-slate-900 dark:text-slate-100` — good

---

## 5. `src/components/dashboard/DashboardStats.tsx`

No violations. StatsGrid usage is clean.

---

## 6. `src/components/home/LiveAuditTicker.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 9 | **Hover opacity** | `bg-emerald-50/50` — 50% opacity white on light green background | For glass-card effect in light mode: `bg-white/80` or similar | MEDIUM-5 |

**Code (line 59):**
```tsx
<div className={`relative overflow-hidden rounded-full border border-emerald-200/60 bg-emerald-50/50 py-2 ${className}`}>
```
`bg-emerald-50/50` is 50% opacity of emerald-50 — this is not a glass card pattern, it's a semi-transparent background. For ticker contrast, `bg-emerald-50` (full) or `bg-white/90` would be more stable.

### CORRECTLY IMPLEMENTED

- No emoji icons — Lucide `ChevronDown` is proper SVG
- `animate-marquee` from animations.css with reduced-motion override — compliant
- `border-emerald-200/60` for subtle tinted border — OK
- Font sizing: `text-xs` for ticker items — appropriate

---

## 7. `src/components/home/SocialProofTestimonials.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 10 | **Card muted text** | `text-slate-500` (#64748b) | Should be `#475569` (slate-600) for proper contrast | MEDIUM-5 |
| 11 | **Avatar bg** | `bg-slate-100` | Use a more distinct background for avatar containers | MEDIUM-6 |

**Code (line 66):**
```tsx
className="h-10 w-10 rounded-full bg-slate-100 object-contain"
```
`object-contain` on avatar is unusual — avatars typically use `object-cover` to fill the circle without stretching.

**Code (line 75, 82):**
```tsx
<p className="text-xs text-slate-500">{t.city} · {t.job}</p>
...
<span className="text-xs text-slate-500">Total ditemukan</span>
```
`text-slate-500` is too light for light mode body text on white/card backgrounds.

### CORRECTLY IMPLEMENTED

- Lucide icons (CheckCircle2) — proper SVG
- `h-3.5 w-3.5` for verified badge icon — correct fixed size
- `text-emerald-700` / `bg-emerald-50` — correct secondary color usage
- Card shadow: `shadow-sm` — appropriate weight

---

## 8. `src/components/home/ObjectionFAQ.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 12 | **FAQ answer text** | `text-sm leading-relaxed text-slate-600` | `leading-relaxed` = 1.625; should be `leading-6` or `1.75` for body (1.5–1.75 range) | MEDIUM-6 |

**Code (line 59):**
```tsx
<p className="text-sm leading-relaxed text-slate-600">{item.a}</p>
```
`leading-relaxed` maps to `line-height: 1.625`, below the recommended 1.5–1.75 for body text.

### CORRECTLY IMPLEMENTED

- ChevronDown icon from Lucide — SVG compliant
- `h-4 w-4` on ChevronDown — correct fixed size
- `text-slate-900` for question text — correct high contrast
- `border-slate-200` / `border-slate-100` — correct borders
- `transition-transform duration-200` on chevron rotation — 200ms is within micro-interaction range

---

## 9. `src/components/home/FinalCta.tsx`

### VIOLATIONS

None found. This is a clean component.

**CORRECTLY IMPLEMENTED:**
- `bg-emerald-600` — correct primary color
- `text-emerald-100` / `text-emerald-200` — proper muted text on dark bg
- `text-white` for headline — correct contrast
- ArrowRight icon from Lucide with `h-5 w-5` — proper size
- Button hover: `hover:bg-emerald-50` (lightening) not scale — compliant
- `underline` on links with `hover:text-white` — color transition, not scale — compliant

---

## 10. `src/components/home/TrustStrip.tsx`

### VIOLATIONS

None found.

**CORRECTLY IMPLEMENTED:**
- ShieldCheck icon from Lucide — SVG compliant
- `h-3 w-3` — correct fixed icon size
- `text-emerald-700` — proper accent color
- Uppercase tracking via Tailwind (`tracking-wider`) — appropriate for this use
- No emoji — compliant

---

## 11. `src/components/home/StickyMobileCTA.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 13 | **`prefers-reduced-motion` missing** | `transition-transform duration-300` with no reduced-motion guard | Should respect `prefers-reduced-motion` like BentoCard does | MEDIUM-5 |

**Code (line 28):**
```tsx
className={`...transition-transform duration-300 ${
  show ? 'translate-y-0' : 'translate-y-full'
}`}
```
This transition runs for all users with no `prefers-reduced-motion` override. Compare to BentoCard which has `useReducedMotion()` hook guard.

### CORRECTLY IMPLEMENTED

- `bg-white/95` for sticky bar — correct glass-like background on white
- `border-t border-slate-200` — proper border
- `text-white` on button — correct contrast

---

## 12. `src/components/home/VerdictMockup.tsx`

### VIOLATIONS

None found.

**CORRECTLY IMPLEMENTED:**
- AlertTriangle icon from Lucide — SVG
- Lock icon from Lucide — SVG
- `h-8 w-8` for AlertTriangle — appropriate large icon
- `h-3 w-3` for Lock inside blurred content — correct small icon
- `border-red-200` / `bg-red-50/40` — correct red palette usage
- `text-red-700/70` with 70% opacity — acceptable translucent text

---

## 13. `src/components/shared/Paywall.tsx`

### VIOLATIONS

| # | Rule | Current | Recommended | Priority |
|---|------|---------|-------------|----------|
| 14 | **`UrgencyPulse` animation** | `animate-ping` with `animate-pulse-soft` using 2s ease-in-out | Micro-interaction pulse is 2s — within acceptable range but should be 1.5s or less | MEDIUM-6 |
| 15 | **Blur intensity on content** | `blur-[6px] saturate-[0.6]` on partialContent | Too aggressive — `blur-[3px] saturate-[0.8]` is sufficient to indicate gated content | MEDIUM-6 |

**Code (lines 141–143):**
```tsx
<span className="relative flex h-1.5 w-1.5">
  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
</span>
```
`animate-ping` is a ring animation that creates a soft pulsing effect. This is the `pulse-soft` keyframe (2s). This is a UI element, not page content, so 2s is borderline acceptable.

**Code (line 79):**
```tsx
<div className="select-none blur-[6px] saturate-[0.6]" aria-hidden>
```
6px blur is quite aggressive. A lighter blur (`3px`) with less desaturation (`0.8`) achieves the same psychological effect while being less visually disruptive.

### CORRECTLY IMPLEMENTED

- All icons are Lucide SVG (ArrowRight, Lock, ShieldCheck, Sparkles) — compliant
- Icon sizes: `h-3.5 w-3.5`, `h-4 w-4`, `h-5 w-5` — consistent viewBox 24x24, correct `w-* h-*` classes
- No emoji — compliant
- Button hover uses color change (emerald-600 → emerald-700), not scale — compliant
- `bg-white/95` on gradient gate — correct glass pattern

---

## 14. `next.config.ts`

### VIOLATIONS

None found.

**CORRECTLY IMPLEMENTED:**
- No custom `experimental.font` optimization — using Next.js built-in font optimization via `next/font/google` in layout.tsx — correct approach
- `images.remotePatterns` configured for Google avatars and Supabase — appropriate
- Security headers configured — comprehensive

---

## Summary Table

| File | Rule | Severity | Line(s) |
|------|------|----------|---------|
| `animations.css` | `--motion-duration-slower: 700ms` — too slow | MEDIUM-5 | 13 |
| `animations.css` | `--animate-float: 6s` — excessive | MEDIUM-6 | 44 |
| `animations.css` | `fade-in-up: 0.5s` — too slow | MEDIUM-6 | 25 |
| `animations.css` | Marquee missing reduced-motion hover pause | MEDIUM-5 | 207–216 |
| `BentoCard.tsx` | `scale: 1.01` on hover — layout shift | MEDIUM-5 | 70 |
| `AuditHistoryCard.tsx` | `hover:shadow-md` + `hover:border-slate-300` — dual layout effect | MEDIUM-6 | 65 |
| `SocialProofTestimonials.tsx` | `text-slate-500` (#64748b) for body — too light | MEDIUM-5 | 75, 82 |
| `SocialProofTestimonials.tsx` | `object-contain` on avatar — should be `object-cover` | MEDIUM-6 | 66 |
| `ObjectionFAQ.tsx` | `leading-relaxed` (1.625) — below 1.5 minimum | MEDIUM-6 | 59 |
| `StickyMobileCTA.tsx` | Missing `prefers-reduced-motion` guard | MEDIUM-5 | 28 |
| `Paywall.tsx` | `blur-[6px] saturate-[0.6]` — too aggressive | MEDIUM-6 | 79 |
| `globals.css` | `--muted-foreground: #64748b` (light mode) — should be `#475569` | MEDIUM-5 | 17 |

**Total MEDIUM violations: 12**
**Total LOW violations: 0**
**Correctly implemented patterns: 18+**

---

## What IS Implemented Correctly

- **Font pairing:** Plus Jakarta Sans (variable `--font-jakarta`) — professional, geometric sans-serif with personality that matches fintech/legal context
- **Fluid typography scale:** `clamp()`-based `--text-xs` through `--text-3xl` — excellent responsive system
- **SVG icons:** All icons from Lucide React with consistent `h-4 w-4`, `h-5 w-5`, `h-3 w-3` classes on 24x24 viewBox — fully compliant
- **No emoji:** Zero emoji in any audited component — compliant
- **CSS oklch shadows:** Tone-matched shadows using oklch color notation — modern and correct
- **`prefers-reduced-motion`:** Animations.css has comprehensive override at line 196 — excellent
- **Dark mode palette:** Proper slate-900 backgrounds with slate-50 text — well-balanced
- **BentoCard reduced-motion guard:** `useReducedMotion()` hook returns static card — excellent pattern
- **Button hover transitions:** Color/opacity changes only, no scale transforms on CTA buttons — compliant
- **`bg-white/95` on glass elements:** StickyMobileCTA uses proper translucent white on white — correct glass pattern
- **Border colors:** `border-slate-200` / `border-emerald-200` used correctly — not pure white borders