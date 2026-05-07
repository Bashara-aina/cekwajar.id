# cekwajar.id — Audit Fix Instructions
**Feed this entire file to Claude Code. Fix every item in order. Run `npm run build` after each P0 section.**

Current score: 68.9/100 (C+). Target: 90+/100 (A).
All fixes are code changes only — no new dependencies except where explicitly stated.

---

## P0 — CRITICAL: Fix These First (Brand & Trust Failures)

### Fix 1: Broken Footer Privacy Link
**File:** `src/components/Footer.tsx` — line ~59

Find:
```tsx
href="/privacy"
```
Replace with:
```tsx
href="/privacy-policy"
```

Do this for every occurrence of `href="/privacy"` in the entire codebase. Search globally:
- `src/components/Footer.tsx`
- `src/app/auth/login/page.tsx` (line ~142)
- Any other file linking to `/privacy`

There should be no `/privacy` link remaining. The correct route is `/privacy-policy`.

---

### Fix 2: button.tsx Default Variant — Slate to Emerald
**File:** `src/components/ui/button.tsx`

Find the `variants` object. The `default` variant currently uses `bg-slate-900`. Change it to emerald:

```tsx
// BEFORE:
default: 'bg-slate-900 text-white hover:bg-slate-800 ...',

// AFTER:
default: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 ...',
```

Also fix the dark mode for the default variant — add:
```tsx
'dark:bg-emerald-600 dark:hover:bg-emerald-700'
```

After this change, every `<Button>` rendered without an explicit `variant` prop will show the emerald brand color instead of slate-900.

---

### Fix 3: NPWP Radio Group — Add Fieldset Wrapper
**File:** `src/app/wajar-slip/page.tsx` — line ~692–710

Find the two radio inputs for "Punya NPWP?" (Yes/No). They are currently bare `<input type="radio">` elements. Wrap them in a `<fieldset>` with a `<legend>`:

```tsx
// BEFORE (approximate):
<div>
  <label>
    <input type="radio" name="has_npwp" value="true" />
    Ya, punya NPWP
  </label>
  <label>
    <input type="radio" name="has_npwp" value="false" />
    Tidak punya
  </label>
</div>

// AFTER:
<fieldset className="border-0 p-0 m-0">
  <legend className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
    Punya NPWP?
    {/* FieldTooltip if available, or plain text */}
  </legend>
  <div className="flex gap-4">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="has_npwp"
        value="true"
        className="accent-emerald-600"
        aria-describedby="npwp-hint"
      />
      <span className="text-sm">Ya, punya NPWP</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="has_npwp"
        value="false"
        className="accent-emerald-600"
      />
      <span className="text-sm">Tidak punya</span>
    </label>
  </div>
  <p id="npwp-hint" className="text-xs text-muted-foreground mt-1">
    Tanpa NPWP, tarif PPh21 lebih tinggi 20%.
  </p>
</fieldset>
```

Apply this same `<fieldset>` + `<legend>` pattern to any other radio group in the codebase.

---

### Fix 4: Pricing Page Mobile Overflow
**File:** `src/app/pricing/page.tsx` — line ~88–136

Find the feature comparison table that has fixed-width columns (`w-28` or similar). Replace the desktop table with a mobile-friendly card stack approach:

```tsx
// Wrap the comparison table:
<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
  <table className="min-w-[600px] sm:min-w-0 sm:w-full ...">
    {/* existing table content */}
  </table>
</div>
```

Add a mobile scroll hint below the table on small screens:
```tsx
<p className="text-xs text-center text-muted-foreground mt-2 sm:hidden">
  ← Geser untuk lihat semua fitur →
</p>
```

Additionally, remove all hardcoded `w-28` column widths and replace with `w-1/4` or `min-w-[100px]`.

---

## P1 — SHOULD FIX: UX Quality

### Fix 5: Replace Hardcoded Slate Colors with CSS Variables

The following files use hardcoded Tailwind color classes where CSS variables should be used. Go through each file and apply these replacements:

**Replacement Map:**

| Hardcoded class | CSS variable equivalent |
|----------------|------------------------|
| `text-slate-900` | `text-foreground` |
| `text-slate-700` | `text-foreground/80` |
| `text-slate-500` | `text-muted-foreground` |
| `text-slate-400` | `text-muted-foreground/70` |
| `bg-white` (in cards) | `bg-card` or `bg-background` |
| `bg-slate-50` | `bg-muted` |
| `bg-slate-100` | `bg-muted` |
| `border-slate-200` | `border-border` |
| `border-slate-300` | `border-border` |

**Files to update:**

1. `src/app/dashboard/page.tsx` — This file uses `slate-900 dark:slate-50` throughout. Replace all instances following the map above.

2. `src/components/GlobalNav.tsx` — Find any `style={}` inline props for background or border. Replace with Tailwind class `bg-background` and `border-border`. Also replace `text-emerald-700` in the logo link with `text-emerald-600 dark:text-emerald-400`.

3. `src/components/ui/input.tsx` — Replace hardcoded slate color classes with `border-border`, `bg-background`, `text-foreground`, `placeholder:text-muted-foreground`.

4. `src/app/wajar-slip/page.tsx` line ~495–499 — Find the calculations table. Replace `text-slate-500` cell colors with `text-muted-foreground`.

5. `src/app/pricing/page.tsx` — Replace `text-slate-400` with `text-muted-foreground` throughout. Check that text on `bg-slate-50` meets contrast requirements.

After applying the map, search the entire codebase for remaining `text-slate-[0-9]` and `bg-slate-[0-9]` occurrences in component files (`src/components/` and `src/app/`) and apply the same replacement logic.

---

### Fix 6: GlobalNav Dropdown — Add Keyboard Navigation

**File:** `src/components/GlobalNav.tsx` — line ~155 (dropdown section)

The user dropdown currently has no keyboard navigation. Wrap the dropdown content in a component that handles `Escape` to close and arrow key navigation. If the dropdown uses a Radix UI `DropdownMenu` component, it already supports this — verify it is actually using `DropdownMenu` from `@/components/ui/dropdown-menu` and not a custom div.

If it IS using shadcn/ui `DropdownMenu`:
- No changes needed for keyboard behavior — Radix handles it
- Verify `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` are being used

If it is a custom div-based dropdown, replace with shadcn/ui `DropdownMenu`:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Replace custom dropdown with:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button aria-label="Menu pengguna" className="...">
      {/* user avatar */}
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <div className="px-3 py-2">
      <p className="text-sm font-medium truncate">{user.name}</p>
      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
    </div>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <Link href="/dashboard">Dashboard</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
      Keluar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Also add `aria-label` to the mobile sheet trigger button in GlobalNav (find the hamburger icon button that opens the Sheet — add `aria-label="Buka menu navigasi"`).

---

### Fix 7: Fix All Loading Message Strings

Search the entire codebase for the string `"Menghitung..."` and replace with context-specific messages:

**File: `src/app/wajar-slip/page.tsx` — line ~782–784**
```tsx
// BEFORE:
"Menghitung..."

// AFTER:
"Memvalidasi slip gaji kamu... ⚡"
```

Search for all occurrences of generic loading strings and replace:

| Find | Replace with |
|------|-------------|
| `"Menghitung..."` | `"Memvalidasi slip gaji kamu... ⚡"` |
| `"Memuat..."` | `"Mengambil data..."` |
| `"Loading..."` | `"Memuat..."` |
| `"Mengirim..."` | `"Menyimpan..."` |
| `"Menganalisis..."` | `"AI menganalisis komponen gaji..."` |

In the submit button of Wajar Slip specifically:
```tsx
// BEFORE:
{isLoading ? 'Menghitung...' : 'Cek Sekarang'}

// AFTER:
{isLoading ? 'Memvalidasi slip gaji kamu... ⚡' : 'Cek Slip Gaji Sekarang'}
```

---

### Fix 8: Fix Typo in Pricing Page FAQ

**File:** `src/app/pricing/page.tsx` — line ~61

Find and fix the mixed-language/character corruption:
```tsx
// BEFORE (corrupted text):
"PTKP yang適用 untuk semua级别 karyawan"

// AFTER:
"PTKP yang berlaku untuk semua level karyawan"
```

Search the entire file for any other non-Latin characters that don't belong in Bahasa Indonesia text.

---

### Fix 9: Fix Typography Inconsistency — Add Responsive Headings

**Files:** All tool pages and dashboard

The homepage uses `text-3xl sm:text-4xl lg:text-5xl` (responsive). Other pages use fixed `text-2xl font-bold`. Standardize page headings:

Create a consistent page heading pattern. In each tool page, find the main `<h1>` or page title heading and apply:

```tsx
// Tool page heading (wajar-slip, wajar-gaji, wajar-tanah, wajar-kabur, wajar-hidup):
<h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
  {pageTitle}
</h1>

// Dashboard heading:
<h1 className="text-xl sm:text-2xl font-bold text-foreground">
  {dashboardTitle}
</h1>

// Pricing page heading:
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
  {pricingTitle}
</h1>
```

Replace all fixed `text-2xl font-bold` headings in tool pages with `text-2xl sm:text-3xl font-bold`.

---

### Fix 10: Add inputMode="numeric" to IDR Inputs

**File:** `src/app/wajar-slip/page.tsx` — line ~603 and all IDR input fields

The salary field uses `type="text"` (correct for IDR formatting) but needs `inputMode="numeric"` to trigger the numeric keyboard on iOS/Android:

Find every IDR text input and the `IDRInput` component. Add the attribute:

```tsx
// In IDRInput component or wherever IDR inputs are rendered:
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="7.500.000"
  ...
/>
```

Open `src/components/IDRInput.tsx` (or wherever the component is defined) and add `inputMode="numeric"` to the underlying `<input>` element.

---

### Fix 11: Back Navigation Consistency

Standardize all back/reset navigation across tool pages:

**File: `src/app/wajar-gaji/page.tsx`** — find "← Cari Lagi"
**File: `src/app/wajar-tanah/page.tsx`** — find "← Cek Lagi"
**File: `src/app/wajar-slip/page.tsx`** — find "Batal" text button

Replace all with a consistent pattern using Lucide icon:

```tsx
import { ChevronLeft } from 'lucide-react'

// Standard back/reset button:
<button
  type="button"
  onClick={handleReset}
  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
>
  <ChevronLeft className="w-4 h-4" />
  Cek lagi
</button>
```

Apply the same text "Cek lagi" and icon pattern on all 5 tool pages.

---

### Fix 12: Dashboard — Fix Hardcoded Zero Stats

**File:** `src/app/dashboard/page.tsx` — lines ~268–312

Find the stat cards showing "Audit Hari Ini: 0/3", "Total Audit: 0", "Gaji Ditemukan: 0", "Minggu Ini: 0". These are hardcoded zeros.

Replace with real Supabase queries. Add a `useEffect` or server component data fetch:

```tsx
// Add a useEffect to fetch real stats:
useEffect(() => {
  const fetchStats = async () => {
    const supabase = createClient()
    
    // Total audits for this user
    const { count: totalAudits } = await supabase
      .from('payslip_audits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    // Audits today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayAudits } = await supabase
      .from('payslip_audits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
    
    // Salary benchmarks this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const { count: weekGaji } = await supabase
      .from('salary_queries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString())
    
    setStats({
      totalAudits: totalAudits ?? 0,
      todayAudits: todayAudits ?? 0,
      weekGaji: weekGaji ?? 0,
    })
  }
  
  if (user) fetchStats()
}, [user])
```

If the table names are different from `payslip_audits` and `salary_queries`, adjust to match your actual Supabase schema. The key requirement is that these numbers come from real queries, not hardcoded zeros.

---

## P2 — POLISH: Accessibility & Navigation

### Fix 13: Add Skip-to-Content Link

**File:** `src/app/layout.tsx`

Add as the very first element inside `<body>`, before GlobalNav:

```tsx
{/* Skip to content — accessibility requirement */}
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
>
  Langsung ke konten utama
</a>
```

Then add `id="main-content"` to the `<main>` element in layout.tsx:

```tsx
<main id="main-content">
  {children}
</main>
```

---

### Fix 14: Add aria-live Region for Verdict Results

**File:** `src/app/wajar-slip/page.tsx`

Find the container that renders the verdict result (the section that appears after CALCULATING state). Add an `aria-live` attribute:

```tsx
{/* Verdict result container */}
<div
  aria-live="polite"
  aria-atomic="true"
  aria-label="Hasil audit slip gaji"
>
  {phase === 'VERDICT' && (
    // existing verdict content
  )}
</div>
```

Also add `aria-busy` to the form container during loading:

```tsx
<form
  aria-busy={phase === 'CALCULATING'}
  aria-label="Form audit slip gaji"
  ...
>
```

---

### Fix 15: Fix Homepage Tool Card Focus States

**File:** `src/app/page.tsx` — line ~74–98

Find the tool card `<Link>` elements. They have hover states but no visible focus ring. Add:

```tsx
// Add to each tool card Link's className:
'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
```

Also add `aria-label` to each card link since the card content may not be sufficient for screen readers:

```tsx
<Link
  href="/wajar-slip"
  aria-label="Wajar Slip — Audit slip gaji PPh21 dan BPJS"
  className="... focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl"
>
```

---

### Fix 16: Add aria-label to Icon-Only Buttons

**File:** `src/components/GlobalNav.tsx`

Find the mobile sheet trigger button (hamburger icon, line ~200). Add:
```tsx
aria-label="Buka menu navigasi"
```

Find any other icon-only buttons (buttons with only an icon child and no text). Add descriptive `aria-label` to each:
- Theme toggle: verify it has `aria-label="Ganti tema"` or `aria-label="Toggle dark mode"`
- Any close (X) buttons: `aria-label="Tutup"`
- Any expand buttons: `aria-label="Buka"` / `aria-label="Tutup"`

---

### Fix 17: Fix Contrast Issue on Pricing Page

**File:** `src/app/pricing/page.tsx` — line ~169

Find `text-slate-400` used as body text on white/light backgrounds. This has contrast ratio ~3.2:1, below WCAG AA (4.5:1). Replace with `text-muted-foreground` which maps to a higher-contrast token.

Specifically:
```tsx
// BEFORE:
className="text-slate-400"

// AFTER:
className="text-muted-foreground"  // or text-slate-500 minimum
```

Also check `text-xs uppercase tracking-wide text-slate-700 on bg-slate-50` — if text is smaller than 14px, WCAG requires 4.5:1 contrast. Use `text-slate-800` or `text-foreground/70` instead.

---

### Fix 18: Add 404 Page

Create file: `src/app/not-found.tsx`

```tsx
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-emerald-600 dark:text-emerald-400 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Halaman tidak ditemukan
        </h1>
        <p className="text-muted-foreground mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/wajar-slip">
              <ArrowLeft className="w-4 h-4" />
              Cek Slip Gaji
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
```

---

### Fix 19: Add Smooth Transition to Crowdsource Form Success State

**File:** `src/app/wajar-gaji/page.tsx` — line ~819–823

Find where the skeleton transitions to the success state after form submission. Currently it snaps abruptly. Wrap the success content in a fade-in:

```tsx
{submitSuccess && (
  <div className="animate-fade-in-up text-center py-8">
    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
    <h3 className="font-semibold text-lg mb-1">Data berhasil dikirim!</h3>
    <p className="text-sm text-muted-foreground">
      Terima kasih kontribusinya. Data akan diverifikasi sebelum masuk ke database. 🙏
    </p>
  </div>
)}
```

If `animate-fade-in-up` is defined in the animation system, it will apply. If not, add to `tailwind.config.ts`:
```ts
animation: {
  'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
},
keyframes: {
  'fade-in-up': {
    '0%': { opacity: '0', transform: 'translateY(12px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
```

---

### Fix 20: Add Hover Background to Homepage Tool Cards

**File:** `src/app/page.tsx` — line ~77

The tool cards have `hover:border-emerald-200 hover:shadow-md` but no background color change on hover. Add:

```tsx
// Add to the tool card Link className:
'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
```

This makes hover feel active, not just a border/shadow change.

---

### Fix 21: Add PageHeader Component and Apply to All Pages

Create file: `src/components/PageHeader.tsx`

```tsx
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon?: LucideIcon
  iconColor?: string
  badge?: string
  title: string
  description?: string
  className?: string
}

export function PageHeader({ icon: Icon, iconColor = 'text-emerald-600 dark:text-emerald-400', badge, title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {badge && (
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3',
          'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
        )}>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {badge}
        </div>
      )}
      {!badge && Icon && (
        <div className={cn('w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3')}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
```

Apply to each tool page — replace any custom inline header with:

```tsx
import { PageHeader } from '@/components/PageHeader'
import { FileText } from 'lucide-react' // use the appropriate icon per tool

// Wajar Slip:
<PageHeader
  icon={FileText}
  badge="Audit PPh21 & BPJS"
  title="Wajar Slip"
  description="Cek apakah potongan pajak dan BPJS di slip gajimu sudah sesuai regulasi PMK 168/2023."
/>
```

Repeat with appropriate icon, badge, and description for each of the 5 tool pages.

---

### Fix 22: UMK Label — Show Both Terms

**File:** `src/app/wajar-slip/page.tsx` — line ~389–396

Find where "UMK" is displayed in the verdict/result area. Add the alternate term:

```tsx
// BEFORE:
<span>UMK {cityName}</span>

// AFTER:
<span>UMK/UMR {cityName}</span>
```

Also update any tooltip or description that only mentions UMK to include: "UMK (Upah Minimum Kota/Kabupaten) — juga dikenal sebagai UMR di beberapa daerah."

---

## Final Verification Checklist

After all fixes are applied, verify:

- [ ] `npm run build` — zero TypeScript errors, zero build errors
- [ ] Navigate to `/privacy` in browser — should redirect or 404 gracefully (the correct link should now go to `/privacy-policy`)
- [ ] Click every `<Button>` without a variant prop — should be emerald, not slate/dark
- [ ] Open Wajar Slip on mobile (375px) — NPWP section shows as a proper fieldset with legend
- [ ] Open Pricing page on 375px width — no horizontal scroll, table content readable
- [ ] Tab through the homepage with keyboard — every tool card shows a visible focus ring
- [ ] Press Escape with GlobalNav dropdown open — dropdown closes
- [ ] Check Dashboard stats — all numbers should come from live Supabase queries (may show 0 for new users, which is correct)
- [ ] Navigate to a fake URL (e.g., `/does-not-exist`) — shows the custom 404 page
- [ ] Run Lighthouse in Chrome DevTools on `/wajar-slip` — Accessibility score should be 80+
- [ ] Search entire codebase for `"Menghitung..."` — should return zero results
- [ ] Search for `href="/privacy"` (not `/privacy-policy`) — should return zero results
- [ ] Search for `bg-slate-900` in component files — should return zero results (replaced with emerald or CSS vars)
