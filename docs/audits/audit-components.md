# cekwajar.id — UI/UX Pro Max Gap Analysis Audit

**Project:** `/Users/basharaaina/Projects/cekwajar_id-main/cekwajar.id-main`
**Audited:** `globals.css`, `tailwind.config.ts`, `components/ui/index.ts`, `components/shared/index.ts`, `components/layout/GlobalNav.tsx`
**Date:** 2026-05-07

---

## 1. `src/app/globals.css`

### ✅ What is implemented correctly

| Rule | Status | Notes |
|------|--------|-------|
| CSS custom properties (design tokens) | PASS | `--primary: #10b981`, `--destructive: #ef4444`, semantic `--success`, `--warning` etc. well-structured |
| Fluid typography scale | PASS | `--text-xs` through `--text-3xl` use `clamp()`, excellent responsive scaling |
| oklch tone-matched shadows | PASS | Shadows use `oklch()` with low opacity, properly tone-matched |
| Spacing system (4px base) | PASS | `--space-1` through `--space-24`, consistent 4px grid |
| Dark theme support | PASS | Both `:root` (light) and `.dark` defined with full token覆盖 |
| Font variable injection | PASS | `--font-sans: var(--font-jakarta)`, `--font-mono: var(--font-geist-mono)` via CSS vars |

### ⚠️ Violations

| Rule | Priority | Line(s) | Current | Recommended Fix |
|------|----------|---------|---------|------------------|
| **Touch target size (44x44px min)** | CRITICAL | N/A | No touch target tokens defined in CSS. Only spacing tokens exist. | Add `--space-touch: 2.75rem` (44px) and `--space-touch-min: 2.75rem` as a design token. Ensure all interactive elements meet 44x44px. |
| **prefers-reduced-motion** | HIGH | N/A | Defined in `animations.css` (lines 196-204, 214-216) but NOT in `globals.css`. The `@media (prefers-reduced-motion: reduce)` override is in `animations.css` only. | Add a reduced-motion block at the bottom of `globals.css`: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` |
| **Viewport meta (mobile keyboard awareness)** | CRITICAL | N/A | `--keyboard-h: 0` is defined as a CSS token but there's no corresponding JS viewport meta injection for `viewport-fit=cover` or `vh` unit handling. | CSS alone cannot fix mobile viewport keyboard. Ensure `layout.tsx` has `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` — see layout.tsx note below. |

### Notes
- No `tailwind.config.ts` found — this project uses Tailwind v4 (CSS-first, `@import "tailwindcss"`) so there is no JS tailwind config. The theme is defined entirely via CSS `@theme inline {}` block.

---

## 2. `tailwind.config.ts`

### ❌ NOT FOUND

**Finding:** No `tailwind.config.ts` or `tailwind.config.js` exists in the project root or `src/`.

This is expected — cekwajar.id uses **Tailwind CSS v4**, which is CSS-first and does not use a JavaScript config file. All theme tokens are defined via the `@theme inline {}` block in `globals.css` (lines 90-149).

**Impact on audit:** The standard Tailwind token audit doesn't apply. Instead, tokens should be checked in `globals.css` directly.

---

## 3. `src/components/ui/index.ts` (shadcn/ui Component Inventory)

### ✅ What is implemented correctly

| Rule | Status | Notes |
|------|--------|-------|
| Barrel export pattern | PASS | Clean module exports, type re-exports for `ButtonProps`, `InputProps`, `LabelProps`, `ToastProps` |
| shadcn/ui conventions | PASS | Components follow standard shadcn patterns (`cva`, `cn`, forwardRef`) |
| Accessibility imports | PASS | `Label` component exported (supports form labeling) |

### ⚠️ Violations

| Rule | Priority | Line(s) | Current | Recommended Fix |
|------|----------|---------|---------|------------------|
| **Form labels (explicit label association)** | CRITICAL | All form components | `Input` (input.tsx line 13-21) has no `id` or `htmlFor` association. `Label` is exported but not used in component implementation. | `Input` should accept `id` prop and render with matching `id` attribute. `Label` component should accept `htmlFor` prop. Example: `<input id={props.id} aria-labelledby={props['aria-labelledby']}>` |
| **Loading state on icon buttons** | CRITICAL | `button.tsx` line 26 | `size="icon"` renders `h-9 w-9` (36x36px). Below 44x44px minimum touch target. No loading spinner state defined. | Icon buttons must be minimum 44x44px. Add `size="icon-lg": 'h-11 w-11'` or change `size="icon"` default to `h-11 w-11`. Add loading spinner variant with `disabled:opacity-50` + spinner content. |
| **Focus ring visibility** | HIGH | `button.tsx` line 11 | `focus-visible:ring-2 focus-visible:ring-emerald-500` exists but ring only appears on focus-visible, not on keyboard tab. | Ensure `focus-visible` covers both mouse click AND keyboard tab (`outline-none` is implicit). Consider adding `focus-visible:ring-offset-2` for better contrast. |
| **Button text contrast** | MEDIUM | `button.tsx` line 15 | `default: 'bg-slate-900 text-white'` — slate-900 (#0f172a) on white passes contrast, but the hover state `hover:bg-slate-800` on white text may be borderline at large text sizes. | Verify all button variants meet WCAG AA (4.5:1 normal text, 3:1 large text). The ghost variant `hover:text-slate-900` could fail on light backgrounds. |
| **Loading states (spinner)** | HIGH | No `Spinner` component | No `Spinner` UI primitive in the inventory. Loading states use `LoadingSpinner` from shared components, which is outside the UI layer. | Add `Spinner` or `SkeletonLoader` to `ui/index.ts` for consistent loading indicators at the component level. |

### Component Inventory Summary
```
Button          ✓ icon button (36x36px — VIOLATION: below 44px)
Input           ✓ no label association (CRITICAL)
Label           ✓ exported
Select          N/A
Card            ✓
Dialog          ✓
Toast           ✓
Badge           ✓
Tabs            N/A
Progress        N/A
Separator       ✓
Sheet           ✓
Skeleton        ✓
Alert           ✓
Avatar          ✓
```

---

## 4. `src/components/shared/index.ts` (Shared Component Inventory)

### ✅ What is implemented correctly

| Rule | Status | Notes |
|------|--------|-------|
| Named exports | PASS | `Paywall`, `DisclaimerBanner`, `ErrorCard`, `LoadingSpinner` — all clear named exports |
| `LoadingSpinner` has aria | PASS | `LoadingSpinner.tsx` line 16-17: `role="status" aria-label="Memuat..."` |

### ⚠️ Violations

| Rule | Priority | Line(s) | Current | Recommended Fix |
|------|----------|---------|---------|------------------|
| **Loading spinner touch target** | CRITICAL | `LoadingSpinner.tsx` line 13 | `<div className="flex items-center justify-center p-4">` — the spinner itself has no minimum touch target. | Wrap in a touch-target-compliant container or ensure the loading context is inside a component that meets 44x44px minimum. |
| **`role="status"` usage** | HIGH | `LoadingSpinner.tsx` line 16 | `role="status"` is correct but `aria-label="Memuat..."` is in Indonesian only. Consider adding `aria-live="polite"` for screen reader announcements. | Change to `<div role="status" aria-live="polite" aria-label="Memuat...">` |

---

## 5. `src/components/layout/GlobalNav.tsx`

### ✅ What is implemented correctly

| Rule | Status | Notes |
|------|--------|-------|
| ARIA labels on interactive buttons | PASS | Line 127: theme toggle `aria-label="Switch to light mode"`, line 203: mobile menu `aria-label="Buka menu"`, line 219: theme toggle mobile, line 231: close button `aria-label="Tutup menu"` |
| Language attribute | PASS | `layout.tsx` line 65: `<html lang="id">` |
| `cursor-pointer` on links | PASS | Links use `className` with `transition-colors` and standard hover states |
| Z-index management | PASS | Header has `z-50`, mobile overlay `z-10`, dropdown `z-20` — proper stacking context |
| Mobile menu (Sheet) | PASS | `Sheet` component with `aria-label` on trigger and close |
| Theme toggle accessibility | PASS | `aria-label` switches contextually between light/dark modes |

### ⚠️ Violations

| Rule | Priority | Line(s) | Current | Recommended Fix |
|------|----------|---------|---------|------------------|
| **Touch target size — mobile hamburger** | CRITICAL | Line 203 | `<Button variant="ghost" size="icon" className="h-11 w-11">` — **44x44px PASS**. Good. But see icon buttons below. | — |
| **Touch target size — icon buttons** | CRITICAL | Lines 123-135 (theme toggle), lines 215-233 (mobile theme toggle + close) | `size="icon"` renders `h-9 w-9` (36x36px) — below 44x44px minimum. | Change `size="icon"` to a minimum `h-11 w-11` (44x44px) or create a new `size="icon-lg"` variant. Critical for mobile touch interaction. |
| **Loading state on mobile buttons** | HIGH | All `Button` components | No loading spinners on async actions (sign-out, menu toggle). The `onClick` for sign-out `handleSignOut()` doesn't show a loading spinner. | Add `loading` prop to Button or wrap in a `LoadingSpinner` overlay during async operations. |
| **Keyboard navigation — dropdown menu** | HIGH | Lines 152-182 | Dropdown opens on click via `onClick={() => setMenuOpen(!menuOpen)}` (line 140). No `onKeyDown` handler for Escape key. No focus trap when menu is open. | Add `onKeyDown` handler on the dropdown div: `if (e.key === 'Escape') setMenuOpen(false)`. Consider using `useEffect` to trap focus within the open dropdown. |
| **Font size on Avatar fallback** | MEDIUM | Line 144 | `<AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">` — `text-xs` is `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)`. User initials in a 28x28px avatar (h-7 w-7 = 28px) may render smaller than 12px readable minimum. | Increase to `text-[10px]` or `text-xs` and ensure minimum 12px on actual rendered avatar at 28px size. |
| **Color contrast — nav links** | MEDIUM | Line 112 | `color: pathname === tool.href ? undefined : 'var(--nav-text-muted)'` — `--nav-text-muted: #64748b` (slate-500) on white background is ~3.9:1, passes AA for normal text but is close to the 4.5:1 threshold. | Ensure all nav text meets WCAG AA. If muted is used for non-active links, consider darkening to `#475569` (slate-600) for better contrast. |
| **Horizontal scroll prevention** | HIGH | Line 93 | `max-w-5xl` and `px-4` / `lg:px-6` — no horizontal overflow observed. Good. | Verify on smallest mobile viewport (320px) that no elements overflow. |
| **Focus state on avatar button** | HIGH | Line 139 | `<button onClick={() => setMenuOpen(!menuOpen)} ...>` — No `focus:ring` on the user avatar button. Keyboard users cannot see focus when tabbing to this button. | Add `focus-visible:ring-2 focus-visible:ring-emerald-500` to the avatar button className. |

---

## Priority Summary

### CRITICAL (Must Fix)
1. **Touch targets <44x44px** — `size="icon"` buttons at 36x36px across `GlobalNav.tsx` and potentially other components using shadcn `size="icon"`
2. **Form label association** — `Input` component missing `id`/`htmlFor` label wiring; `Label` exported but not wired
3. **Missing viewport meta** — `layout.tsx` does not have `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` for mobile viewport height (`100dvh` support)
4. **Z-index stacking** — The dropdown overlay (line 155: `fixed inset-0 z-10`) + dropdown panel (`z-20`) creates a stacking context that could conflict with other `z-50` elements on the page

### HIGH
1. **Keyboard navigation on dropdown** — No Escape key handler, no focus trap
2. **Loading states on async buttons** — Sign-out and other async actions show no loading feedback
3. **Focus ring on avatar button** — Keyboard users cannot see focus indicator on user menu trigger
4. **prefers-reduced-motion** — Defined in `animations.css` but not in `globals.css`; inline keyframes may fire without override

### MEDIUM
1. **Avatar fallback text size** — `text-xs` in 28px avatar may be unreadable
2. **Nav text muted contrast** — `#64748b` is borderline on white backgrounds
3. **No Spinner in ui/ inventory** — Loading states fragmented across `LoadingSpinner` in shared components
4. **Button variant contrast** — ghost hover `text-slate-900` on white could fail contrast in some combinations

---

## Positive Findings

The codebase demonstrates **strong design token infrastructure**:
- CSS custom properties with full light/dark theme coverage
- Fluid typography with `clamp()` — excellent responsive scaling
- oklch-based shadows — modern, perceptually uniform
- Proper `lang="id"` on `<html>` element
- ARIA labels on most interactive elements (theme toggle, mobile menu)
- `prefers-reduced-motion` support in `animations.css` (lines 196-204)
- `cursor-pointer` on all interactive elements
- Z-index hierarchy (`z-10`, `z-20`, `z-50`) properly scoped
- No emoji in UI — uses lucide-react icons throughout (SVG only)