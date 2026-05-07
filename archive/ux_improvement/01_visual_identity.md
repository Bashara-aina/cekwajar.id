# 01 — Visual Identity & Brand Design
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: emerald-500 primary color, slate-900 foreground, Plus Jakarta Sans font. Tool-specific badge colors defined but only appear on small badges. No brand motif, no per-tool visual identity, favicon is default. The site looks like every other shadcn/ui starter.

## Objective
Give cekwajar.id a distinct visual identity: per-tool page tints, wordmark logo component, balance scale SVG motif, and a proper favicon. All changes use existing Tailwind config — no new dependencies.

---

## Task 1: Add Per-Tool Page Tint System to tailwind.config.ts

Open `tailwind.config.ts`. Add tool-specific background color tokens under `theme.extend.colors`:

```ts
// tailwind.config.ts — inside theme.extend.colors
toolColors: {
  slip: {
    tint: '#fffbeb',      // amber-50
    accent: '#f59e0b',    // amber-500
    accentDark: '#d97706', // amber-600
  },
  gaji: {
    tint: '#eff6ff',      // blue-50
    accent: '#3b82f6',    // blue-500
    accentDark: '#2563eb', // blue-600
  },
  tanah: {
    tint: '#fafaf9',      // stone-50
    accent: '#78716c',    // stone-500
    accentDark: '#57534e', // stone-600
  },
  kabur: {
    tint: '#eef2ff',      // indigo-50
    accent: '#6366f1',    // indigo-500
    accentDark: '#4f46e5', // indigo-600
  },
  hidup: {
    tint: '#f0fdfa',      // teal-50
    accent: '#14b8a6',    // teal-500
    accentDark: '#0d9488', // teal-600
  },
},
```

---

## Task 2: Apply Tool Tints to Hero Sections

For each tool page, wrap the existing hero/header section in a tinted div. Find the top section of each page file and add the background class.

**File: `src/app/wajar-slip/page.tsx`**
Find the outermost section or div that contains the page title and description. Add class:
```
className="bg-toolColors-slip-tint dark:bg-amber-950/20"
```

**File: `src/app/wajar-gaji/page.tsx`**
```
className="bg-toolColors-gaji-tint dark:bg-blue-950/20"
```

**File: `src/app/wajar-tanah/page.tsx`**
```
className="bg-toolColors-tanah-tint dark:bg-stone-950/20"
```

**File: `src/app/wajar-kabur/page.tsx`**
```
className="bg-toolColors-kabur-tint dark:bg-indigo-950/20"
```

**File: `src/app/wajar-hidup/page.tsx`**
```
className="bg-toolColors-hidup-tint dark:bg-teal-950/20"
```

If Tailwind JIT doesn't pick up the custom tokens immediately, use the direct Tailwind class equivalents: `bg-amber-50`, `bg-blue-50`, `bg-stone-50`, `bg-indigo-50`, `bg-teal-50`.

---

## Task 3: Create Wordmark Logo Component

Create file: `src/components/WordmarkLogo.tsx`

```tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface WordmarkLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
}

export function WordmarkLogo({ className, size = 'md' }: WordmarkLogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-0 hover:opacity-90 transition-opacity', className)}>
      <span className={cn('font-normal text-foreground tracking-tight', sizeMap[size])}>
        cek
      </span>
      <span className={cn('font-bold text-emerald-600 dark:text-emerald-400 tracking-tight', sizeMap[size])}>
        wajar
      </span>
      <span className={cn('font-normal text-muted-foreground text-sm ml-0.5 self-end mb-0.5', size === 'lg' ? 'text-base' : 'text-xs')}>
        .id
      </span>
    </Link>
  )
}
```

**Apply it:** Open `src/components/GlobalNav.tsx`. Find where the logo text "cekwajar.id" is rendered (likely a `<Link>` or `<span>`). Replace it with:
```tsx
import { WordmarkLogo } from '@/components/WordmarkLogo'
// ...
<WordmarkLogo size="md" />
```

Also apply to `src/components/Footer.tsx`:
```tsx
<WordmarkLogo size="sm" />
```

---

## Task 4: Create Balance Scale SVG Motif Component

Create file: `src/components/BalanceScaleSVG.tsx`

```tsx
import { cn } from '@/lib/utils'

interface BalanceScaleSVGProps {
  className?: string
  opacity?: number
}

export function BalanceScaleSVG({ className, opacity = 0.06 }: BalanceScaleSVGProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-emerald-500', className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Center pole */}
      <rect x="98" y="20" width="4" height="110" fill="currentColor" />
      {/* Base */}
      <rect x="70" y="130" width="60" height="6" rx="3" fill="currentColor" />
      <rect x="85" y="120" width="30" height="12" rx="2" fill="currentColor" />
      {/* Crossbar */}
      <rect x="30" y="38" width="140" height="4" rx="2" fill="currentColor" />
      {/* Left chain */}
      <rect x="46" y="42" width="2" height="30" fill="currentColor" />
      {/* Right chain */}
      <rect x="152" y="42" width="2" height="30" fill="currentColor" />
      {/* Left pan */}
      <path d="M26 72 Q47 82 68 72" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Right pan */}
      <path d="M132 72 Q153 82 174 72" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Top pivot dot */}
      <circle cx="100" cy="22" r="6" fill="currentColor" />
    </svg>
  )
}
```

**Apply to homepage hero:** Open `src/app/page.tsx`. Find the main hero section (the div containing the headline text). Add `relative overflow-hidden` to that container, then add inside it (as a background element):

```tsx
import { BalanceScaleSVG } from '@/components/BalanceScaleSVG'
// Inside the hero section, as first child:
<BalanceScaleSVG className="absolute right-4 top-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none" opacity={0.05} />
```

---

## Task 5: Create Proper Favicon Files

Create file: `src/app/icon.svg` (Next.js 15 auto-uses this as favicon):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#10b981"/>
  <rect x="15" y="4" width="2" height="20" fill="white"/>
  <rect x="4" y="9" width="24" height="2" rx="1" fill="white"/>
  <rect x="7" y="11" width="2" height="8" fill="white"/>
  <rect x="23" y="11" width="2" height="8" fill="white"/>
  <path d="M4 19 Q8.5 23 13 19" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M19 19 Q23.5 23 28 19" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <rect x="10" y="24" width="12" height="2" rx="1" fill="white"/>
  <circle cx="16" cy="4" r="2" fill="white"/>
</svg>
```

Also create `src/app/apple-icon.png` — for now, instruct Claude Code to skip this if image generation tools are unavailable; the SVG favicon is sufficient.

---

## Task 6: Add Tool Icon Color Accents to Navigation Links

Open `src/components/GlobalNav.tsx`. Find where each tool link is rendered. Add a small colored dot or left border accent to each link based on the tool:

```tsx
// Tool color map - add above the component
const toolAccentColors: Record<string, string> = {
  'wajar-slip': 'text-amber-500',
  'wajar-gaji': 'text-blue-500',
  'wajar-tanah': 'text-stone-500',
  'wajar-kabur': 'text-indigo-500',
  'wajar-hidup': 'text-teal-500',
}
```

For each tool link in the nav, apply the accent color to the icon (if present) or add a small 6px colored circle before the label.

---

## Task 7: Add CSS Custom Properties for Tool Themes

Open `src/app/globals.css`. Add at the bottom:

```css
/* Tool theme variables */
[data-tool="wajar-slip"] {
  --tool-accent: 245 158 11; /* amber-500 */
  --tool-tint: 255 251 235; /* amber-50 */
}
[data-tool="wajar-gaji"] {
  --tool-accent: 59 130 246; /* blue-500 */
  --tool-tint: 239 246 255; /* blue-50 */
}
[data-tool="wajar-tanah"] {
  --tool-accent: 120 113 108; /* stone-500 */
  --tool-tint: 250 250 249; /* stone-50 */
}
[data-tool="wajar-kabur"] {
  --tool-accent: 99 102 241; /* indigo-500 */
  --tool-tint: 238 242 255; /* indigo-50 */
}
[data-tool="wajar-hidup"] {
  --tool-accent: 20 184 166; /* teal-500 */
  --tool-tint: 240 253 250; /* teal-50 */
}
```

Then on each tool page's root `<div>` or `<main>`, add `data-tool="wajar-slip"` (adjust per tool). This enables future CSS-only tool theming without additional Tailwind classes.

---

## Acceptance Criteria

- [ ] Each tool page has a distinct background tint in its hero section visible at first render
- [ ] GlobalNav shows the wordmark logo with "cek" (regular) + "wajar" (bold emerald) + ".id" (muted)
- [ ] Footer shows the wordmark logo
- [ ] Homepage hero section has the balance scale SVG visible at very low opacity (background motif)
- [ ] Browser tab shows the emerald favicon (scales icon on green background)
- [ ] Navigation tool links have tool-specific accent colors on their icons
- [ ] `npm run build` passes with zero errors after all changes
