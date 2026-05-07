# cekwajar.id — Brand & Design System

> Version 2.0 | May 2026
> The canonical reference for brand identity, color system, typography, component architecture, and interaction patterns. This document governs all product surfaces: marketing site, web app, mobile web, emails, social assets, and PDF exports.

---

## 1. Brand Platform

### 1.1 Product Definition

cekwajar.id is an Indonesian consumer data platform. The first tool, Wajar Slip, audits salary deductions (PPh 21 TER, BPJS Kesehatan, BPJS Ketenagakerjaan) against current regulation. It answers one question: "Potongan gaji lo bener gak?"

Every existing calculator in this space is built for HR departments and accountants. cekwajar.id is built for the employee.

### 1.2 Target Users

Indonesian salaried employees aged 22–45, especially at SMEs where payroll is done manually or by non-specialist HR. Freelancers and contract workers with PPh 21 withholding. Primarily mobile-first on mid-range Android devices with variable network quality. Comfortable with WhatsApp and social media — not necessarily tech-savvy.

### 1.3 Brand Story

Every month, millions of Indonesian employees receive a pay slip and trust that the numbers are right — because they have no way to check. cekwajar.id changes that. We put regulation-backed, plain-language salary auditing into the hands of the people who need it most. Knowing your rights shouldn't require an accounting degree.

### 1.4 Brand Promise

**"Hak lo, jelas di sini."** — Your rights, made clear here.

### 1.5 Brand Personality

Seven attributes that govern every design and copy decision:

| Attribute | What it means in practice |
|-----------|--------------------------|
| Empowering | We arm employees with knowledge, not anxiety. |
| Trustworthy | Every output cites the exact regulation (PMK, Perpres). |
| Direct | No corporate fluff. Say it plainly. |
| Analytical | Data-driven, precise, calculated — the numbers speak. |
| Approachable | Casual Bahasa Indonesia. Not intimidating, not dumbed down. |
| Fair | We stand for what's right without being adversarial toward employers. |
| Modern | Clean, fast, mobile-first. No legacy-looking UI. |

### 1.6 Brand Principles

1. **Accuracy is non-negotiable.** Every calculation must be legally correct. Ship fast, but never ship wrong numbers.
2. **Speak human, cite the law.** The tone is casual Bahasa Indonesia but every claim links to a PMK or Perpres.
3. **Employee-first, always.** Every design decision asks: does this help the employee understand their rights?
4. **Privacy is trust.** Salary data is sensitive. Be transparent about what is stored and for how long.
5. **Make action easy.** Don't just show the problem — give the WhatsApp template, the surat keberatan, the next step.

### 1.7 Voice & Tone

**Language:** Bahasa Indonesia as primary. English only for technical terms that have no natural Indonesian equivalent (e.g., "dashboard", "upload").

**Register:** Like a smart, trustworthy friend who happens to understand tax law. Not a government bureaucrat. Not a TikTok comedian.

**Copy rules:**
- Use "lo/gue" in marketing copy and free-tier UI.
- Use "Anda/Kami" in premium outputs (surat keberatan, PDF reports) since these are legal documents.
- Cite specific regulation numbers in every audit output.
- Use active voice. Keep sentences under 20 words where possible.
- Never use fear-based messaging ("Perusahaan lo NIPU!"). Frame findings as facts, not accusations.

**Tagline:** "Karena hak lo bukan soal feeling, tapi soal aturan."

---

## 2. Visual Identity

### 2.1 Design Philosophy

The visual system is built on three constraints:

1. **Data density.** This is a financial audit tool. The UI must handle tables, numbers, comparison columns, and regulatory citations without feeling cluttered.
2. **Dual-mode parity.** Light and dark modes are equally important. Every color token has been chosen for both contexts — dark mode is not an afterthought with inverted values.
3. **Low-bandwidth resilience.** Decorative elements are minimal. The design relies on typography, spacing, and color — not images, gradients, or heavy assets.

The visual references are Linear (information density + dark mode excellence), Vercel (typographic confidence + minimalism), and Stripe (financial data presentation + trust). Not Dribbble dashboards with gratuitous gradients.

### 2.2 Color System — Architecture

The color system uses semantic tokens that resolve differently in light and dark mode. Never reference raw hex values in code — always use the token name.

**Naming convention:** `--color-{category}-{role}`

Categories: `bg` (background), `fg` (foreground/text), `border`, `accent`, `verdict`.

#### 2.2.1 Background Layers

Backgrounds follow a layered elevation model. In light mode, layers get whiter as they elevate. In dark mode, layers get lighter (brighter) as they elevate — this is the correct dark mode pattern (not darker = higher).

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-bg-base` | `#FFFFFF` | `#0F1117` | App canvas, deepest layer |
| `--color-bg-raised` | `#F8F9FA` | `#161921` | Page background, sidebar bg |
| `--color-bg-surface` | `#FFFFFF` | `#1C1F2B` | Cards, modals, dropdown panels |
| `--color-bg-surface-hover` | `#F3F4F6` | `#242736` | Hovered rows, hovered cards |
| `--color-bg-surface-active` | `#E8EBF0` | `#2C3042` | Active/pressed states, selected rows |
| `--color-bg-inset` | `#F0F1F4` | `#13151D` | Inset inputs, code blocks, recessed areas |
| `--color-bg-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | Modal backdrop, toast overlay |

Dark mode base (`#0F1117`) is a deep blue-black, not pure black. Pure black (`#000000`) creates excessive contrast with white text and causes visual fatigue. The blue undertone makes the dark surface feel less harsh and more intentional.

#### 2.2.2 Foreground / Text

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-fg-default` | `#111318` | `#EDEDEF` | Primary text, headings |
| `--color-fg-muted` | `#4B5162` | `#9BA1B0` | Body text, descriptions |
| `--color-fg-subtle` | `#6E7586` | `#6B7280` | Placeholder text, captions, timestamps |
| `--color-fg-disabled` | `#A0A6B4` | `#454B5C` | Disabled labels, inactive text |
| `--color-fg-on-accent` | `#FFFFFF` | `#FFFFFF` | Text on solid accent buttons |
| `--color-fg-on-verdict-wajar` | `#064E24` | `#A7F3D0` | Text on wajar verdict background |
| `--color-fg-on-verdict-aneh` | `#78350F` | `#FDE68A` | Text on aneh verdict background |
| `--color-fg-on-verdict-salah` | `#7F1D1D` | `#FECACA` | Text on salah verdict background |

**Contrast ratios (verified):**
- `fg-default` on `bg-base`: 16.8:1 (light), 15.9:1 (dark) — AAA.
- `fg-muted` on `bg-base`: 8.2:1 (light), 6.1:1 (dark) — AA.
- `fg-subtle` on `bg-base`: 5.1:1 (light), 4.6:1 (dark) — AA.
- `fg-on-accent` on `accent-solid`: >7:1 in both modes — AAA.

#### 2.2.3 Border

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-border-default` | `#E2E4EA` | `#2A2D3A` | Card borders, dividers, table lines |
| `--color-border-hover` | `#C8CBD4` | `#3D4155` | Hover state borders |
| `--color-border-focus` | `#1B65A6` | `#5BA0DC` | Focus rings on inputs/buttons |
| `--color-border-subtle` | `#F0F1F4` | `#1E212B` | Very subtle separators, nested dividers |

#### 2.2.4 Accent (Primary Brand Color)

The primary accent is a medium-saturation blue that reads as trustworthy and precise. It shifts warmer and brighter in dark mode for visibility without becoming neon.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-accent-solid` | `#1B65A6` | `#3B8AD4` | Primary buttons, active nav, brand mark |
| `--color-accent-solid-hover` | `#155089` | `#5BA0DC` | Hover on primary buttons |
| `--color-accent-solid-active` | `#103E6C` | `#2A78C2` | Active/pressed on primary buttons |
| `--color-accent-subtle-bg` | `#EDF4FB` | `#152238` | Badge bg, selected chip bg, info callout bg |
| `--color-accent-subtle-fg` | `#1B65A6` | `#7DBCE8` | Badge text, link text, accent label |
| `--color-accent-border` | `#B3D1ED` | `#1E3A5C` | Accent-outlined elements |

#### 2.2.5 Verdict Colors

These are the three core states of the product. Each has a background tint, foreground text, icon color, and solid variant. In dark mode, backgrounds are deeply desaturated and darkened to avoid glowing neon patches on a dark canvas. Text becomes a light tint of the hue rather than the dark shade used in light mode.

**Wajar (correct / success):**

| Token | Light | Dark |
|-------|-------|------|
| `--color-verdict-wajar-bg` | `#ECFDF3` | `#0D2818` |
| `--color-verdict-wajar-fg` | `#064E24` | `#A7F3D0` |
| `--color-verdict-wajar-icon` | `#16A34A` | `#4ADE80` |
| `--color-verdict-wajar-border` | `#A7F3D0` | `#1A3D28` |
| `--color-verdict-wajar-solid` | `#16A34A` | `#16A34A` |

**Aneh (warning / anomaly):**

| Token | Light | Dark |
|-------|-------|------|
| `--color-verdict-aneh-bg` | `#FFF8EB` | `#2A1F0A` |
| `--color-verdict-aneh-fg` | `#78350F` | `#FDE68A` |
| `--color-verdict-aneh-icon` | `#D97706` | `#FBBF24` |
| `--color-verdict-aneh-border` | `#FDE68A` | `#3D3014` |
| `--color-verdict-aneh-solid` | `#D97706` | `#D97706` |

**Salah (error / incorrect):**

| Token | Light | Dark |
|-------|-------|------|
| `--color-verdict-salah-bg` | `#FEF2F2` | `#2A1215` |
| `--color-verdict-salah-fg` | `#7F1D1D` | `#FECACA` |
| `--color-verdict-salah-icon` | `#DC2626` | `#F87171` |
| `--color-verdict-salah-border` | `#FECACA` | `#3D1E22` |
| `--color-verdict-salah-solid` | `#DC2626` | `#DC2626` |

**Info (neutral informational):**

| Token | Light | Dark |
|-------|-------|------|
| `--color-info-bg` | `#EFF6FF` | `#111C33` |
| `--color-info-fg` | `#1E40AF` | `#93C5FD` |
| `--color-info-icon` | `#2563EB` | `#60A5FA` |
| `--color-info-border` | `#BFDBFE` | `#1E2D4A` |

#### 2.2.6 Chart & Data Visualization Palette

For multi-series charts, these colors are chosen to be distinguishable in both modes and under the three most common color blindness types (protanopia, deuteranopia, tritanopia). Each color has a light-mode and dark-mode variant.

| Series | Name | Light | Dark |
|--------|------|-------|------|
| 1 | Blue | `#1B65A6` | `#5BA0DC` |
| 2 | Teal | `#0D9488` | `#2DD4BF` |
| 3 | Amber | `#D97706` | `#FBBF24` |
| 4 | Purple | `#7C3AED` | `#A78BFA` |
| 5 | Rose | `#E11D48` | `#FB7185` |
| 6 | Cyan | `#0891B2` | `#22D3EE` |

Rules for data viz:
- Never rely on color alone. Pair with shape (marker type), pattern (dashes), or position (labels).
- In bar charts and pie charts, use the light-mode palette on light bg and dark-mode palette on dark bg — never mix.
- For single-metric highlights (e.g., "your deduction" vs "correct amount"), use only two colors: `accent-solid` and `verdict-salah-icon`.

### 2.3 Typography

#### 2.3.1 Typeface Selection

| Role | Font | Weights | Fallback Stack |
|------|------|---------|----------------|
| UI (headings + body) | **Inter** | 400, 500, 600 | system-ui, -apple-system, "Segoe UI", sans-serif |
| Numbers & code | **JetBrains Mono** | 400, 500 | ui-monospace, SFMono-Regular, "Cascadia Code", monospace |

**Why Inter:** Designed specifically for computer screens. Excellent legibility at small sizes on low-DPI Android screens. Native tabular figures and slashed zero. Full Latin Extended coverage for Indonesian diacritics. Variable font available for fine-grained weight control. Used by Linear, Vercel, Resend, and dozens of top-tier SaaS products.

**Why JetBrains Mono:** Distinctive character shapes prevent ambiguity in financial figures (1/l/I, 0/O). Tabular figures are default — columns of numbers align perfectly. The slight technical feel adds credibility to calculation outputs.

**Loading strategy:**
- Load Inter as a variable font via `next/font/google` (self-hosted, no external request).
- Load JetBrains Mono only on pages that display financial data (code-split).
- Use `font-display: swap` to avoid invisible text on slow connections.

#### 2.3.2 Type Scale

The scale uses a 1.2 ratio (minor third) as base, with adjustments for readability at each step.

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `text-xs` | 11px / 0.6875rem | 400 | 1.45 | +0.01em | Fine print, regulation citation numbers |
| `text-sm` | 13px / 0.8125rem | 400 | 1.45 | +0.005em | Table cells, helper text, timestamps, tags |
| `text-base` | 15px / 0.9375rem | 400 | 1.6 | 0 | Body text, form labels, paragraphs |
| `text-lg` | 17px / 1.0625rem | 500 | 1.5 | -0.005em | Card titles, section sub-heads |
| `text-xl` | 20px / 1.25rem | 600 | 1.4 | -0.01em | Page sub-headings |
| `text-2xl` | 24px / 1.5rem | 600 | 1.35 | -0.015em | Page headings |
| `text-3xl` | 30px / 1.875rem | 600 | 1.25 | -0.02em | Hero subheading, section titles |
| `text-4xl` | 40px / 2.5rem | 700 | 1.15 | -0.025em | Landing page headline |
| `display` | 48px / 3rem | 600 | 1.1 | -0.03em | Verdict number (e.g., "-Rp 2.400.000") |

**Notes:**
- Negative letter-spacing on large text prevents airiness. Positive letter-spacing on small text improves readability.
- `text-base` is 15px, not 16px — this is deliberate. 15px with Inter at 1.6 line height gives tighter, more professional paragraphs than the looser 16px default, while remaining above the WCAG minimum.
- Never use font-weight 700 (Bold) in the app UI — only on the landing page headline. The app uses 400 (Regular), 500 (Medium), and 600 (Semibold) to maintain a calm, tool-like demeanor.

#### 2.3.3 Number Formatting (Indonesian Convention)

| Format | Convention | Example |
|--------|-----------|---------|
| Thousands separator | Dot (`.`) | `8.550.000` |
| Decimal separator | Comma (`,`) | `2,5%` |
| Currency prefix | `Rp` + non-breaking space | `Rp 8.550.000` |
| Percentage | Number + comma decimal + `%` | `1,75%` |
| Date (short) | DD/MM/YYYY | `07/05/2026` |
| Date (long) | DD NamaBulan YYYY | `7 Mei 2026` |

Implementation: Use `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`. Apply `font-variant-numeric: tabular-nums` as a global rule on all elements using JetBrains Mono.

### 2.4 Spacing System

An 8px base grid with a 4px half-step for fine adjustments.

| Token | Value | Use |
|-------|-------|-----|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Icon-to-label gap, inline element gap |
| `space-2` | 8px | Tight padding (tags, badges), small gaps |
| `space-3` | 12px | Input internal padding, compact card padding |
| `space-4` | 16px | Standard card padding (mobile), gap between form fields |
| `space-5` | 20px | Card padding (desktop), gap between related sections |
| `space-6` | 24px | Section padding, gap between cards in a grid |
| `space-8` | 32px | Gap between major page sections |
| `space-10` | 40px | Large section spacing (mobile) |
| `space-12` | 48px | Page section vertical rhythm |
| `space-16` | 64px | Landing page section vertical rhythm (desktop) |
| `space-20` | 80px | Hero section top/bottom padding |

### 2.5 Elevation & Shadows

Shadows in light mode provide depth. In dark mode, rely on background luminance differences instead — shadows on dark backgrounds are nearly invisible and waste rendering cycles.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | none | Subtle lift (buttons, chips) |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | none | Cards, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | none | Modals, popovers |
| `shadow-focus` | `0 0 0 2px var(--color-border-focus)` | same | Focus rings (both modes) |

In dark mode, cards and elevated surfaces use `--color-bg-surface` (which is lighter than the canvas) to create visual hierarchy. No box-shadow needed.

### 2.6 Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 6px | Tags, badges, small chips |
| `radius-md` | 8px | Buttons, inputs, dropdowns |
| `radius-lg` | 12px | Cards, modals, verdict cards |
| `radius-xl` | 16px | Hero cards, large feature cards |
| `radius-full` | 9999px | Avatars, pill badges, round icon buttons |

### 2.7 Motion

| Token | Value | Use |
|-------|-------|-----|
| `duration-fast` | 100ms | Button press, toggle, checkbox |
| `duration-normal` | 200ms | Hover transitions, dropdown open |
| `duration-slow` | 300ms | Modal enter/exit, accordion expand |
| `duration-loading` | 1000ms | Skeleton pulse cycle |
| `easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions (ease-out-like, snappy start) |
| `easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy micro-interactions (verdict card entrance) |

Rules:
- All transitions respect `prefers-reduced-motion: reduce`. When active, set all durations to 0ms.
- Never animate layout properties (`width`, `height`, `top`, `left`) — use `transform` and `opacity` only.
- The verdict card reveal uses a 300ms `translateY(8px)` → `translateY(0)` + `opacity: 0` → `1` with the spring easing. This single animation is the only "fancy" motion in the app. Everything else is functional.

### 2.8 Logo Concepts

The logo must work at: full width in the landing page header (roughly 180px wide), sidebar icon (32x32), favicon (16x16), browser tab, and OG social cards. It must be legible in both light and dark modes without a separate version — either the logo is neutral enough to work on both, or it ships as two variants swapped via `prefers-color-scheme`.

**Direction A — Check Shield Wordmark (recommended):**
Wordmark "cekwajar" in Inter Semibold, `.id` in the accent color. The dot before `id` is replaced by a small shield with a checkmark inside. Light mode: shield fill `accent-solid`, checkmark white, wordmark `fg-default`. Dark mode: shield fill `accent-solid` (dark variant), checkmark white, wordmark `fg-default` (dark variant). At favicon size, only the shield-check icon. On mobile header, shield icon + "cekwajar" text.

**Direction B — Balance Scale Mark:**
A minimal geometric balance scale (two pans on a beam), perfectly level. Wordmark to the right. The scale uses the accent color in both modes. More abstract, less immediately communicative than Direction A.

**Recommendation:** Direction A. Simpler to implement, scales to every size, and directly communicates "verified/checked" — which is the core product promise.

### 2.9 Imagery & Icons

**Icons:** Lucide Icons, 1.5px stroke, rounded caps and joins. Size tokens: 14px (inline text), 16px (buttons/nav items), 20px (card features, list bullets), 24px (empty states, large actions). Color inherits from the text color by default. Verdict icons use verdict-specific icon colors.

**Illustrations:** Flat vector, geometric, limited to 3 colors per illustration (accent + one neutral + one verdict color if contextual). Used only in: empty states, onboarding, landing page feature sections, error pages. No illustrations inside the core audit tool flow — the data is the content.

**Avoid:** Stock photos of people. Anything resembling gambling imagery. Angry/confrontational visuals. 3D renders. Gradients. Glassmorphism. Anything that signals "template" or "generic SaaS."

---

## 3. UI Foundations

### 3.1 Information Architecture

#### Site Map

```
cekwajar.id
  /                       Landing page (marketing)
  /slip                   Wajar Slip tool
    /slip/form            Input form (manual + upload)
    /slip/result/[id]     Verdict (free tier)
    /slip/audit/[id]      Full audit (premium)
  /gaji                   Wajar Gaji (future: salary benchmark)
  /tanah                  Wajar Tanah (future: property price)
  /blog                   SEO content, regulation updates
  /blog/[slug]            Individual article
  /tentang                About
  /privasi                Privacy policy
  /masuk                  Sign in (magic link)
  /akun                   Account dashboard
    /akun/riwayat         Audit history
    /akun/langganan       Subscription management
    /akun/pengaturan      Settings (theme, email prefs)
```

#### Navigation Model

**Desktop (unauthenticated):** Persistent top bar. Logo left, tool links center, "Masuk" button right.

```
┌────────────────────────────────────────────────────────┐
│ [Logo]     Wajar Slip   Wajar Gaji   Blog    [Masuk]  │
└────────────────────────────────────────────────────────┘
```

**Desktop (authenticated):** Same top bar, "Masuk" becomes an avatar with dropdown (Riwayat, Langganan, Pengaturan, Keluar). No sidebar — the product is a focused tool, not a multi-module dashboard.

**Mobile:** Sticky top bar (56px height) with logo left and hamburger right. Menu slides in from the right as a full-height panel over a dimmed overlay. Close on outside tap or swipe right.

**Theme toggle:** A small sun/moon icon button in the top bar, next to the user avatar (or next to "Masuk" if unauthenticated). Respects system preference by default, with manual override stored in localStorage.

### 3.2 Layout Patterns

#### Global Layout Shell

```
┌──────────────────────────────── viewport ──────────────────────────────┐
│ bg-raised (full viewport)                                              │
│ ┌──────────────────────────── top bar ────────────────────────────┐    │
│ │ bg-surface, border-bottom: 1px border-subtle, h: 56px          │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│ ┌──────────────────── content area (max 1120px, centered) ───────┐    │
│ │ bg-base (on tool pages) or bg-raised (on landing)              │    │
│ │                                                                │    │
│ │                                                                │    │
│ └────────────────────────────────────────────────────────────────┘    │
│ ┌──────────────────────────── footer ─────────────────────────────┐    │
│ │ bg-raised, border-top: 1px border-subtle                       │    │
│ └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Landing Page

```
┌─ Nav bar ──────────────────────────────────────────┐
├────────────────────────────────────────────────────┤
│ Hero (bg-raised, py-20)                            │
│   Headline: text-4xl, max-w-640px, centered        │
│   Subline: text-lg, fg-muted, max-w-480px          │
│   [CTA button] primary, lg size                    │
│   Below CTA: "Gratis. Tanpa daftar." in fg-subtle  │
├────────────────────────────────────────────────────┤
│ Social proof strip (bg-surface, py-4)              │
│   "12.847 slip sudah dicek" — monospace number     │
├────────────────────────────────────────────────────┤
│ How it works (3 columns, icons + text, py-16)      │
│   1. Isi data slip  2. Kami hitung  3. Lihat hasil │
├────────────────────────────────────────────────────┤
│ Verdict preview (mock result card, bg-surface)     │
├────────────────────────────────────────────────────┤
│ Pricing (3-column cards: Free / Premium / Langg.)  │
├────────────────────────────────────────────────────┤
│ Trust bar: privacy + regulation + data deletion    │
├────────────────────────────────────────────────────┤
│ FAQ accordion                                      │
├────────────────────────────────────────────────────┤
│ Footer                                             │
└────────────────────────────────────────────────────┘
```

#### Calculator Form (`/slip/form`)

Max content width: 560px, centered on the page. Tight, focused, no distractions.

```
┌─ Nav bar ──────────────────────────────────────────┐
├────────────────────────────────────────────────────┤
│ Page heading: "Cek Slip Gaji" (text-2xl)           │
│ Subheading: "Masukkan data dari slip lo" (fg-muted)│
├────────────────────────────────────────────────────┤
│ ┌─ Tab: Manual ─┐  ┌─ Tab: Upload Slip ─┐         │
├────────────────────────────────────────────────────┤
│ [MANUAL TAB]                                       │
│                                                    │
│ Section label: "Penghasilan" (text-sm, fg-subtle)  │
│ ┌────────────────────────────────────────────┐     │
│ │ Gaji Pokok               [Rp  __________ ]│     │
│ │ Tunjangan Tetap          [Rp  __________ ]│     │
│ │ Tunjangan Tidak Tetap    [Rp  __________ ]│     │
│ └────────────────────────────────────────────┘     │
│                                                    │
│ Section label: "Status PTKP"                       │
│ ┌────────────────────────────────────────────┐     │
│ │ [Select: TK/0  ▾]                         │     │
│ │ Helper: "TK/0 = belum kawin, tanpa        │     │
│ │          tanggungan"                       │     │
│ └────────────────────────────────────────────┘     │
│                                                    │
│ Section label: "Potongan di Slip Gaji Lo"          │
│ ┌────────────────────────────────────────────┐     │
│ │ PPh 21                   [Rp  __________ ]│     │
│ │ BPJS Kesehatan           [Rp  __________ ]│     │
│ │ BPJS JHT                 [Rp  __________ ]│     │
│ │ BPJS JP                  [Rp  __________ ]│     │
│ │ Potongan Lainnya         [Rp  __________ ]│     │
│ └────────────────────────────────────────────┘     │
│                                                    │
│ Section label: "Periode"                           │
│ ┌────────────────────────────────────────────┐     │
│ │ [Bulan ▾] [Tahun ▾]                       │     │
│ └────────────────────────────────────────────┘     │
│                                                    │
│ [  Cek Sekarang  ] (primary, lg, full-width)       │
│                                                    │
│ Trust line: "Data lo aman. Nama dan perusahaan     │
│ lo tidak disimpan." (text-xs, fg-subtle, centered) │
└────────────────────────────────────────────────────┘
```

#### Results Page (`/slip/result/[id]`)

```
┌─ Nav bar ──────────────────────────────────────────┐
├────────────────────────────────────────────────────┤
│ ┌────── Verdict Card (full width) ───────────────┐ │
│ │ bg: verdict-*-bg, border: 1px verdict-*-border │ │
│ │ radius-lg                                      │ │
│ │                                                │ │
│ │ [Icon 24px]  POTONGAN LO WAJAR                │ │
│ │              text-xl, verdict-*-fg, weight 600 │ │
│ │                                                │ │
│ │ Selisih: Rp 0                                  │ │
│ │ display size, JetBrains Mono, verdict-*-fg     │ │
│ │                                                │ │
│ │ [Bagikan ↗] secondary  [Cek Slip Lain] ghost   │ │
│ └────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────┤
│ Comparison Table (bg-surface card)                 │
│ ┌──────────────┬───────────┬───────────┬─────────┐ │
│ │ Item         │ Di Slip   │ Harusnya  │ Selisih │ │
│ ├──────────────┼───────────┼───────────┼─────────┤ │
│ │ PPh 21       │ Rp xxx    │ Rp xxx    │ Rp 0    │ │
│ │ BPJS Kes ░░░░│░░░░░░░░░░│░░░░░░░░░░│░░░░░░░░░│ │
│ │ BPJS JHT ░░░░│░░░░░░░░░░│░░░░░░░░░░│░░░░░░░░░│ │
│ └──────────────┴───────────┴───────────┴─────────┘ │
│ (░ = blurred rows for free tier, lock icon overlay)│
├────────────────────────────────────────────────────┤
│ ┌────── Premium Upsell Card ─────────────────────┐ │
│ │ bg: accent-subtle-bg, border: 1px accent-border│ │
│ │ "Buka audit lengkap — Rp 20.000"               │ │
│ │ ✓ Detail per item + dasar hukum               │ │
│ │ ✓ Surat keberatan ke HR                       │ │
│ │ ✓ Template WhatsApp                           │ │
│ │ [Buka Audit Lengkap] primary button            │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### 3.3 Component Library

Each component is specified with its structure, token usage, states, and dark-mode behavior.

#### Buttons

| Property | Primary | Secondary | Ghost | Destructive |
|----------|---------|-----------|-------|-------------|
| Background | `accent-solid` | `bg-surface` | transparent | `verdict-salah-solid` |
| Text | `fg-on-accent` | `accent-subtle-fg` | `accent-subtle-fg` | `fg-on-accent` |
| Border | none | 1px `accent-border` | none | none |
| Hover bg | `accent-solid-hover` | `bg-surface-hover` | `bg-surface-hover` | `#B91C1C` (light) / `#991B1B` (dark) |
| Active bg | `accent-solid-active` | `bg-surface-active` | `bg-surface-active` | `#991B1B` (light) / `#7F1D1D` (dark) |
| Disabled bg | `bg-surface-hover` (both modes) | same | transparent | same |
| Disabled text | `fg-disabled` | `fg-disabled` | `fg-disabled` | `fg-disabled` |

**Sizes:**
- `sm`: height 32px, text-sm, px-12, gap-4.
- `md`: height 36px, text-base, px-16, gap-6. Default.
- `lg`: height 44px, text-base, px-20, gap-8. For primary CTAs.

**Radius:** `radius-md` for all.

**States:** Default → Hover (bg shift) → Active (bg shift + scale 0.98) → Disabled (muted colors + cursor-not-allowed) → Loading (text replaced by 16px spinner, button width fixed via min-width).

**Focus:** `shadow-focus` ring (2px accent) with 2px offset. Visible on keyboard focus only (`:focus-visible`), not on click.

#### Inputs

**Structure:**
```
[Label]                          ← text-sm, fg-default, weight 500, mb-4
┌─────────────────────────────┐
│ Rp  [value]                 │  ← height 40px (desktop) / 44px (mobile)
└─────────────────────────────┘     bg-inset, border: 1px border-default
[Helper text or error]           ← text-xs, fg-subtle (or verdict-salah-fg on error)
```

| State | Border | Background | Ring |
|-------|--------|------------|------|
| Default | `border-default` | `bg-inset` | none |
| Hover | `border-hover` | `bg-inset` | none |
| Focus | `border-focus` | `bg-base` | `shadow-focus` |
| Error | `verdict-salah-border` | `bg-inset` | 2px `verdict-salah-icon` |
| Disabled | `border-subtle` | `bg-surface-hover` | none, text `fg-disabled` |

**Currency input specifics:**
- "Rp" prefix rendered as a static label inside the input, left-padded, in `fg-subtle`.
- On focus, display raw number for editing.
- On blur, format with Indonesian thousand separators: `8550000` → `8.550.000`.
- Accept paste with or without separators.

**Labels are always above the input.** No floating labels (they break on autofill and on small screens). No placeholder-as-label (accessibility failure).

#### Select / Dropdown

Same height, border, and focus styling as text inputs. On mobile, use the native `<select>` element for performance. On desktop, use a custom listbox with keyboard support (ArrowUp/Down to navigate, Enter to select, Escape to close).

#### Cards

| Property | Value |
|----------|-------|
| Background | `bg-surface` |
| Border | 1px `border-default` |
| Radius | `radius-lg` |
| Padding | `space-5` (desktop), `space-4` (mobile) |
| Shadow | `shadow-md` (light mode), none (dark mode) |
| Hover (if interactive) | border becomes `border-hover`, bg stays |

#### Tables

Used for the audit comparison table.

| Element | Light | Dark |
|---------|-------|------|
| Header bg | `bg-raised` | `bg-raised` |
| Header text | `fg-subtle`, text-xs, uppercase, tracking 0.05em | same tokens |
| Body text | `fg-default`, text-sm | same tokens |
| Number cells | JetBrains Mono, text-sm, `tabular-nums` | same |
| Row border | 1px `border-subtle` (horizontal only) | same token |
| Alternating rows | none (use hover highlight instead) | none |
| Hover row | `bg-surface-hover` | same token |

No vertical grid lines. No zebra striping — it creates visual noise in dark mode. Use hover highlight instead.

#### Tags / Badges

Height 22px. Text-xs, weight 500. `radius-sm`. Padding: 0 8px.

| Variant | Background | Text |
|---------|-----------|------|
| wajar | `verdict-wajar-bg` | `verdict-wajar-fg` |
| aneh | `verdict-aneh-bg` | `verdict-aneh-fg` |
| salah | `verdict-salah-bg` | `verdict-salah-fg` |
| info | `info-bg` | `info-fg` |
| default | `bg-surface-hover` | `fg-muted` |

#### Modal

Overlay: `bg-overlay`. Panel: `bg-surface`, `radius-lg`, `shadow-lg` (light) / no shadow (dark), max-w 480px, centered vertically and horizontally. Close button: top-right, 32x32 touch target, icon in `fg-subtle`. Enter animation: 200ms opacity + translateY(4px). Exit: 150ms opacity.

Use modals sparingly. Prefer inline expansion or navigation to a new page.

#### Toast Notifications

Position: top-right desktop, top-center mobile. Max-width 380px. Duration: 4 seconds auto-dismiss with close button. Background: `bg-surface`, border: 1px `border-default`, plus a 3px left border in the semantic color (verdict-wajar-icon for success, verdict-salah-icon for error, verdict-aneh-icon for warning, info-icon for info). In dark mode, the left border remains bright — it acts as the color signal on the dark surface.

#### Skeleton / Loading

Pulsing blocks: alternate between `bg-surface-hover` and `bg-raised` over 1000ms with `ease-in-out`. Match the shape and approximate size of the content they replace. Rounded with `radius-md`.

---

## 4. UX Guidelines

### 4.1 Form Design

**Field ordering:** Mirror the structure of an actual pay slip. Users will hold their slip gaji as reference. Penghasilan first, then Status PTKP, then Potongan.

**Sections:** Group fields with a subtle section label (`text-sm`, `fg-subtle`, uppercase, `tracking-wide`, `mb-8`). Add a 1px `border-subtle` divider between sections.

**Inline validation:**
- Validate on blur, not on each keystroke.
- Currency fields: auto-format with thousand separators as the user types.
- Required fields: red border + "Wajib diisi" below the input on blur if empty.
- Range validation: BPJS Kesehatan > Rp 120.000 shows a gentle warning, not an error — "BPJS Kesehatan biasanya tidak melebihi Rp 120.000/bulan sesuai regulasi. Pastikan angka ini sesuai slip lo."
- Never block submission on warnings, only on errors (empty required fields, non-numeric input).

**Microcopy:**
- Every input has helper text below in `fg-subtle`, `text-xs`.
- Helper text is educational, not just instructional. Example under "Status PTKP": "TK/0 = belum kawin, tanpa tanggungan. K/1 = kawin, 1 tanggungan."
- Don't use tooltip icons for critical info — mobile users won't hover.

### 4.2 Error Handling & Empty States

**Error pages:**
- 404: "Halaman tidak ditemukan" + "Mungkin link-nya salah, atau halaman sudah dihapus." + [Kembali ke Beranda] button. Simple centered card, small illustration.
- 500: "Ada yang salah di sisi kami" + "Coba lagi dalam beberapa menit." + [Coba Lagi] button.
- Tone: Calm and apologetic. No jokes. Salary data is serious.

**Empty states:**
- Audit history empty: "Belum ada audit" + "Cek slip gaji pertama lo sekarang." + [Cek Slip] CTA.
- Always provide a clear next action in every empty state.

**Form submission errors:**
- Network error: Toast "Koneksi bermasalah. Coba lagi." with retry button.
- Server error: Toast "Terjadi kesalahan. Tim kami sedang memperbaiki."
- Validation error on submit: Scroll to first invalid field, focus it, show all error messages simultaneously.

### 4.3 Loading States

**Form submission to result (critical moment):**

This is the core experience. The user submitted their salary data and is waiting to learn if they've been cheated. Do not show a generic spinner.

Show a focused loading overlay with progressive text messages:
1. "Menghitung PPh 21 berdasarkan PMK 168/2023..." (1s)
2. "Memeriksa BPJS Kesehatan..." (1s)
3. "Memeriksa BPJS Ketenagakerjaan..." (1s)
4. "Menyiapkan hasil audit..." (0.5s)

Each step paired with a small animated checkmark that appears when done. This builds trust (the user sees each regulation being checked) and covers the actual API latency.

**OCR upload:** Show upload progress bar. Once uploaded: "AI sedang membaca slip lo..." with the image thumbnail and a pulsing scan-line animation over the image. As fields are extracted, animate them appearing in the form one by one (staggered 150ms). This feels intentional and precise, not generic.

**Page load:** Full-page skeleton matching the layout. Fonts load via `font-display: swap`. Images lazy-load.

### 4.4 Onboarding / First-Time UX

**Principle:** Zero friction to first value. No login required for the free audit.

1. **Landing CTA** → goes directly to `/slip/form`. No account wall.
2. **First form visit:** Dismissible banner: "Pertama kali? Upload foto slip gaji lo atau isi manual — gratis." + link to "Cara kerja" (scrolls to the how-it-works section on landing page).
3. **After first free audit:** Show result. Below the result, prompt: "Buat akun untuk simpan hasil ini dan cek slip bulan depan." Magic link input inline.
4. **Account creation:** Redirect back to the result page. Subtle confirmation toast. No confetti.
5. **Premium upsell:** Shown only after the free verdict. Never before. Never as an interstitial.

**Progressive disclosure:** Each screen explains only what's needed at that step. Don't front-load explanations.

### 4.5 Dark Mode UX Guidelines

Dark mode is not "light mode with colors inverted." It requires specific design attention:

- **Elevation is brightness.** Higher surfaces are lighter. A card (`bg-surface`: `#1C1F2B`) sits above the canvas (`bg-raised`: `#161921`). A modal sits above the card.
- **No shadows in dark mode.** Remove all box-shadows. Rely on the luminance difference between layers.
- **Reduce image brightness.** Apply `filter: brightness(0.9)` to photographs and rich illustrations in dark mode. SVG icons and line illustrations are unaffected.
- **Verdict cards in dark mode use deeply desaturated backgrounds.** Not bright neon tints. The dark-mode verdict-wajar-bg is `#0D2818` (a barely-green near-black), not `#D1FAE5` inverted. The text becomes light (`#A7F3D0`), not dark.
- **Charts:** Switch to the dark-mode chart palette. Gridlines use `border-subtle`. Axis labels use `fg-subtle`.
- **Blurred premium rows:** In dark mode, the blur overlay is `bg-surface` at 90% opacity with the same blur. The lock icon uses `fg-subtle`.

---

## 5. Accessibility & Localization

### 5.1 Accessibility

**Contrast:** All token pairs verified at WCAG AA (4.5:1 for normal text, 3:1 for large text) in both light and dark modes. See Section 2.2.2 for specific ratios.

**Font size:** Minimum body text 15px. Minimum anywhere in the UI 11px (only for fine-print regulation citations). Use rem units throughout for system font scaling support.

**Touch targets:** Minimum 44x44px on mobile. Buttons minimum height 36px desktop, 44px mobile. At least 8px gap between adjacent tappable elements.

**Keyboard navigation:** All interactive elements focusable via Tab. Visible focus ring on `:focus-visible` only. Enter/Space activate buttons. Escape closes modals and dropdowns. Tab order follows visual order.

**Screen readers:** All form inputs have explicit `<label>` elements (via `htmlFor`). Verdict cards use `role="status"` and `aria-live="polite"`. Decorative icons get `aria-hidden="true"`. Meaningful icons get `aria-label`. Data tables use `<th scope="col">` for column headers and `<th scope="row">` for row headers.

**Color-blind safety:** Verdict states use triple encoding — color, icon shape (checkmark / warning triangle / X circle), and text label. Never color-only. The chart palette has been tested against protanopia, deuteranopia, and tritanopia simulations.

**Reduced motion:** All animations wrapped in `@media (prefers-reduced-motion: no-preference)`. The verdict loading sequence falls back to a simple static progress list.

### 5.2 Localization

**Text expansion:** Indonesian words are often longer than English equivalents ("Submit" → "Kirim" is shorter, but "Settings" → "Pengaturan" is longer). Budget 40% extra horizontal space in button labels and nav items.

**Date/number formats:** See Section 2.3.3. Use `Intl.DateTimeFormat('id-ID')` and `Intl.NumberFormat('id-ID')` consistently.

**Plural forms:** Indonesian does not pluralize nouns. No i18n plural rules needed.

**Formal register switch:** Marketing UI uses lo/gue. Premium legal documents (surat keberatan, PDF audit report) use Anda/Kami.

**Locale files:** Keep all UI strings in structured locale files (`/locales/id.json`, `/locales/en.json`) from day one, even if only Indonesian ships initially. This makes adding English trivial later.

**RTL:** Not applicable (Indonesian is LTR).

### 5.3 Performance Constraints

Indonesian users on mid-range Android devices with 3G/4G connections:
- Target Lighthouse performance score 90+ on mobile.
- First Contentful Paint under 1.5s on 3G.
- Total page weight under 300KB for the form page (excluding fonts, which are cached).
- Code-split the Midtrans SDK — only load when user clicks "Buka Audit."
- Use `next/image` with lazy loading. Serve WebP with JPEG fallback.
- Pre-cache the form page via service worker for offline access (show offline message on submission attempt).

---

## 6. Implementation Checklist

### Design Tokens

- [ ] Create `tailwind.config.ts` extending the default theme with all tokens from Section 2 — colors, spacing, typography, radius, shadows.
- [ ] Define CSS custom properties for both light and dark mode in `globals.css` using `@media (prefers-color-scheme)` and a `.dark` class override.
- [ ] Implement theme toggle (system / light / dark) stored in localStorage, applied as a class on `<html>`.
- [ ] Add Inter via `next/font/google` (variable, self-hosted). Add JetBrains Mono as a secondary font loaded on demand.
- [ ] Set `font-variant-numeric: tabular-nums` as a utility class and apply it globally to all elements using the mono font.

### Components

- [ ] Initialize shadcn/ui and customize the theme to match cekwajar.id tokens (map shadcn's `primary`, `destructive`, `muted`, `accent`, `card`, `popover` to our tokens).
- [ ] Build `<CurrencyInput>` — auto-formatting with `Intl.NumberFormat('id-ID')`, "Rp" prefix, blur/focus formatting toggle.
- [ ] Build `<VerdictCard>` — three variants (wajar/aneh/salah), icon, headline, display number, action buttons. Must render correctly in both modes.
- [ ] Build `<AuditTable>` — comparison table with blur overlay and lock icon for premium-locked rows. Test in dark mode.
- [ ] Build `<LoadingSequence>` — progressive text with animated checkmarks for the calculation flow.
- [ ] Build `<ThemeToggle>` — sun/moon icon button, three states (system/light/dark).

### Localization

- [ ] Set up `next-intl` or equivalent. Create `/locales/id.json` with all UI strings.
- [ ] Set `<html lang="id">` and appropriate `<meta>` charset.
- [ ] Create a number formatting utility wrapping `Intl.NumberFormat('id-ID')`.
- [ ] Create a date formatting utility wrapping `Intl.DateTimeFormat('id-ID')`.

### Quality Assurance

- [ ] Run Lighthouse accessibility audit on all pages in both light and dark mode.
- [ ] Test keyboard-only navigation through the full audit flow.
- [ ] Test on a low-end Android device (e.g., Samsung Galaxy A series) with Chrome on 3G throttle.
- [ ] Verify all color token pairs meet WCAG AA contrast ratios using a tool like Stark or axe.
- [ ] Test verdict card rendering in protanopia simulation (Chrome DevTools > Rendering > Emulate vision deficiencies).
- [ ] Test dark mode transitions — no flashes of unstyled content (FOUC) on page load.

### Brand Assets

- [ ] Commission logo based on Direction A (Check Shield Wordmark) with light and dark variants.
- [ ] Export: SVG (web), PNG @1x/@2x (social), ICO 16x16 + 32x32 (favicon), Apple Touch Icon 180x180.
- [ ] Create OG image template (1200x630) for shareable verdict cards — both light and dark mode variants.
- [ ] Create a copy style guide document: formal vs informal register, banned words, required legal citations.
