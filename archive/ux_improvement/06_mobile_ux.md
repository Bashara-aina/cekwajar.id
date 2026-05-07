# 06 — Mobile UX (Primary Platform)
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: GlobalNav uses a hamburger Sheet menu on mobile. City selection is a 514-item standard Select. Input heights are default 40px. Some flex-row comparison layouts compress badly on 375px screens. No bottom navigation bar.

## Objective
Add a persistent bottom navigation bar for mobile. Replace city Select with bottom-sheet picker on mobile. Increase all form input touch targets. Fix all flex-row layouts that break on 375px. Make the entire app one-thumb navigable.

---

## Task 1: Create MobileBottomNav Component

Create file: `src/components/MobileBottomNav.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, TrendingUp, MapPin, Plane, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home', exact: true },
  { href: '/wajar-slip', icon: FileText, label: 'Slip', color: 'text-amber-500' },
  { href: '/wajar-gaji', icon: TrendingUp, label: 'Gaji', color: 'text-blue-500' },
  { href: '/wajar-tanah', icon: MapPin, label: 'Tanah', color: 'text-stone-500' },
  { href: '/wajar-kabur', icon: Plane, label: 'Kabur', color: 'text-indigo-500' },
  { href: '/wajar-hidup', icon: BarChart3, label: 'Hidup', color: 'text-teal-500' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  // Don't show on auth pages
  if (pathname.startsWith('/auth')) return null

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border safe-area-pb"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center justify-around px-1 py-1">
        {NAV_ITEMS.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-0 flex-1 transition-all duration-150',
                'tap-highlight-transparent active:scale-95',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40'
                  : 'hover:bg-muted/50'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive
                    ? (item.color ?? 'text-emerald-600 dark:text-emerald-400')
                    : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none transition-colors',
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Apply to root layout:**

Open `src/app/layout.tsx`. Add inside the body, after Footer:

```tsx
import { MobileBottomNav } from '@/components/MobileBottomNav'
// ...
<Footer />
<MobileBottomNav />
```

**Add bottom padding to main content so it doesn't hide behind the nav:**

In `src/app/globals.css`:
```css
@media (max-width: 767px) {
  main {
    padding-bottom: 72px; /* height of bottom nav */
  }
}
```

**Also add safe area support in globals.css:**
```css
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## Task 2: Create MobileCitySheet Component

This replaces the city `<Select>` on mobile with a full bottom-sheet picker.

Create file: `src/components/MobileCitySheet.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Search, Check, ChevronDown } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const TOP_CITIES = [
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur',
  'Bekasi', 'Tangerang', 'Tangerang Selatan', 'Depok', 'Bogor',
  'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
]

interface MobileCitySheetProps {
  cities: string[]
  value: string
  onValueChange: (city: string) => void
  placeholder?: string
}

export function MobileCitySheet({
  cities,
  value,
  onValueChange,
  placeholder = 'Pilih kota kerja',
}: MobileCitySheetProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const topInList = TOP_CITIES.filter(c => cities.includes(c))
  const others = cities.filter(c => !TOP_CITIES.includes(c))

  const filtered = search
    ? cities.filter(c => c.toLowerCase().includes(search.toLowerCase())).slice(0, 50)
    : null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full h-14 flex items-center justify-between px-4 rounded-xl border bg-background',
            'text-left text-sm transition-colors',
            'hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1',
            !value && 'text-muted-foreground'
          )}
        >
          <span>{value || placeholder}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh] px-0 pb-0">
        <SheetHeader className="px-4 pb-3 border-b">
          <SheetTitle className="text-base">Pilih Kota Kerja</SheetTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11"
              autoFocus
            />
          </div>
        </SheetHeader>

        <div className="overflow-y-auto flex-1 h-full pb-safe">
          {filtered ? (
            // Search results
            <div className="px-2 py-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Kota tidak ditemukan. Coba kata kunci lain.
                </p>
              ) : (
                filtered.map(city => (
                  <CityItem
                    key={city}
                    city={city}
                    isSelected={value === city}
                    onSelect={() => { onValueChange(city); setOpen(false); setSearch('') }}
                  />
                ))
              )}
            </div>
          ) : (
            <>
              {/* Popular cities */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Kota Populer
                </p>
              </div>
              <div className="px-2">
                {topInList.map(city => (
                  <CityItem
                    key={city}
                    city={city}
                    isSelected={value === city}
                    onSelect={() => { onValueChange(city); setOpen(false); setSearch('') }}
                  />
                ))}
              </div>
              
              <div className="border-t mx-4 my-3" />
              
              {/* All other cities */}
              <div className="px-4 pb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Semua Kota
                </p>
              </div>
              <div className="px-2 pb-8">
                {others.map(city => (
                  <CityItem
                    key={city}
                    city={city}
                    isSelected={value === city}
                    onSelect={() => { onValueChange(city); setOpen(false); setSearch('') }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CityItem({
  city,
  isSelected,
  onSelect,
}: {
  city: string
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm text-left',
        'transition-colors active:scale-[0.98]',
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium'
          : 'hover:bg-muted/50 text-foreground'
      )}
    >
      {city}
      {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
    </button>
  )
}
```

**Apply responsive city picker:**

In each tool's form component, use a responsive wrapper. On mobile use `MobileCitySheet`, on desktop use `CityCommandSelect` (from file 03):

```tsx
// In each tool form:
import { useMediaQuery } from '@/hooks/use-media-query' // or create this hook
import { MobileCitySheet } from '@/components/MobileCitySheet'
import { CityCommandSelect } from '@/components/CityCommandSelect'

// Usage in JSX:
{isMobile ? (
  <MobileCitySheet cities={cities} value={kota} onValueChange={setKota} />
) : (
  <CityCommandSelect cities={cities} value={kota} onValueChange={setKota} />
)}
```

**Create the `useMediaQuery` hook** if it doesn't exist:

Create file: `src/hooks/use-media-query.ts`

```ts
'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Convenience hook
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
```

---

## Task 3: Fix All Flex-Row Layouts That Break at 375px

Search the entire codebase for `flex-row` and `flex` with child elements containing IDR amounts or comparison data. Apply `flex-col sm:flex-row` pattern:

**Find and fix these patterns:**

```tsx
// BEFORE (breaks on 375px):
<div className="flex gap-4">
  <div>Slip: Rp 1.500.000</div>
  <div>Seharusnya: Rp 1.650.000</div>
  <div>Selisih: Rp 150.000</div>
</div>

// AFTER (stacks on mobile):
<div className="flex flex-col sm:flex-row gap-3">
  <div className="flex-1">Slip: Rp 1.500.000</div>
  <div className="flex-1">Seharusnya: Rp 1.650.000</div>
  <div className="flex-1 font-bold text-red-600">Selisih: Rp 150.000</div>
</div>
```

Apply this pattern to:
- Wajar Slip calculation comparison table cells
- Wajar Kabur salary comparison side-by-side
- Wajar Hidup two-city comparison
- Any ViolationItem that shows multiple IDR columns

---

## Task 4: Fix Global Mobile Input Sizing

Open `src/app/globals.css`. Add mobile-specific sizing rules:

```css
@media (max-width: 640px) {
  /* Ensure all interactive form elements meet 44px minimum touch target */
  input[type="text"],
  input[type="number"],
  input[type="email"],
  input[type="tel"],
  select,
  textarea {
    min-height: 52px;
    font-size: 16px; /* Prevents iOS zoom on focus */
  }

  /* Larger buttons on mobile */
  .btn, [role="button"], button:not([aria-label]) {
    min-height: 48px;
  }
  
  /* Prevent zoom on all inputs (iOS) */
  input, select, textarea {
    font-size: max(16px, 1rem);
  }
}
```

---

## Task 5: Make Wajar Kabur Country Grid Mobile-Friendly

Open `src/app/wajar-kabur/page.tsx`. Find the country selection UI (likely a grid of country cards or a Select).

If it's a grid of buttons, change:
```tsx
// BEFORE:
<div className="grid grid-cols-3 md:grid-cols-4 gap-3">

// AFTER:
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
```

If it's a `<Select>`, replace it with `MobileCitySheet` pattern but for countries:

The top countries should be: SG, AU, MY, US, JP, GB, DE, NL, KR, CA — pin these at the top of the sheet.

---

## Task 6: Add Tap Highlight Disable for Better Mobile Feel

In `src/app/globals.css`:

```css
/* Remove tap highlight on iOS/Android for custom interactive elements */
a, button, [role="button"], [role="tab"], [role="option"] {
  -webkit-tap-highlight-color: transparent;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Prevent content from going under the bottom nav */
@media (max-width: 767px) {
  .pb-nav {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
}
```

Apply `pb-nav` class to any scrollable main content container on tool pages.

---

## Task 7: Add Active State Visual Feedback for Mobile

In `src/app/globals.css`, add active states for touch feedback:

```css
@media (hover: none) and (pointer: coarse) {
  /* Mobile: show press state */
  button:active,
  a:active,
  [role="button"]:active {
    transform: scale(0.97);
    transition: transform 0.1s ease;
  }
  
  /* Card press state */
  .card-interactive:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}
```

Add `card-interactive` class to all clickable tool cards on the homepage and dashboard.

---

## Acceptance Criteria

- [ ] Bottom nav bar appears on all pages on mobile (`<768px`), hidden on desktop
- [ ] Bottom nav shows 6 items: Home + 5 tools, each with correct accent color when active
- [ ] Bottom nav does NOT appear on auth pages (`/auth/*`)
- [ ] Main content has 72px padding-bottom on mobile so it's not hidden by the bottom nav
- [ ] City field on mobile opens a full-height bottom sheet with search + popular cities pinned
- [ ] City field on desktop uses the Command searchable dropdown
- [ ] All form inputs have minimum height of 52px on mobile, font-size 16px (no iOS zoom)
- [ ] All flex comparison layouts stack vertically on mobile (flex-col sm:flex-row)
- [ ] `npm run build` passes with zero errors
