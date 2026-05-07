# cekwajar.id — 100-Perspective Master Audit
**CLAUDE CODE INSTRUCTIONS:**
1. Read this entire file before doing anything.
2. Audit the full codebase at `src/` against every one of the 100 dimensions below.
3. For each dimension, give it a score 0–100 based on what you find in the actual code.
4. Fix every dimension that scores below 95.
5. Run `npm run build` after every 10 fixes. Stop if build breaks and fix errors before continuing.
6. At the end, output a final score table for all 100 dimensions.

**Project stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Framer Motion, Recharts, Lucide React, Plus Jakarta Sans.
**Target users:** Indonesian employees aged 22–35, arriving via TikTok on mobile. Low financial literacy. High distrust of apps that ask for sensitive documents.
**Tools:** Wajar Slip (payslip audit), Wajar Gaji (salary benchmark), Wajar Tanah (property price), Wajar Kabur (PPP comparison), Wajar Hidup (COL comparison).
**Monetization:** Freemium — Midtrans Snap, IDR 29K/month Basic, IDR 79K/month Pro.

**Score thresholds:**
- 95–100 = Ship it. No action needed.
- 80–94 = Minor fix. Do it.
- 0–79 = Must fix. Do not skip.

---

## CLUSTER A — VISUAL DESIGN (Dimensions 1–15)

### 1. Brand Color Consistency
**Audit:** Search all `src/components/` and `src/app/` files for `bg-slate-900`, `text-slate-900` used as primary/brand color. Check `button.tsx` default variant. Check `GlobalNav.tsx` for hardcoded colors. Check that emerald-600 is the primary brand color throughout.
**95/100 target:** Every primary interactive element (default Button, active nav item, focus ring, primary CTA) uses emerald-600. No slate-900 as primary brand color anywhere.
**Fix:** In `button.tsx`, change `default` variant from `bg-slate-900` to `bg-emerald-600 hover:bg-emerald-700`. Audit and replace all `text-emerald-700` in GlobalNav with `text-emerald-600 dark:text-emerald-400`. Remove any `style={{}}` inline color props.

---

### 2. CSS Variable vs Hardcoded Color Discipline
**Audit:** Count occurrences of `text-slate-[0-9]`, `bg-slate-[0-9]`, `border-slate-[0-9]`, `bg-white` in component files. The design system defines CSS tokens (`--foreground`, `--background`, `--muted`, `--border`) in `globals.css`. These should be used, not Tailwind color classes.
**95/100 target:** All text colors in components use `text-foreground`, `text-muted-foreground`, `text-card-foreground`. All backgrounds use `bg-background`, `bg-card`, `bg-muted`. Borders use `border-border`. Fewer than 10 hardcoded slate exceptions in total.
**Fix:** Apply this replacement map across all files in `src/`:
- `text-slate-900` → `text-foreground`
- `text-slate-700` → `text-foreground/80`
- `text-slate-500` → `text-muted-foreground`
- `text-slate-400` → `text-muted-foreground/70`
- `bg-white` (in cards) → `bg-card`
- `bg-slate-50` → `bg-muted`
- `bg-slate-100` → `bg-muted`
- `border-slate-200` → `border-border`

---

### 3. Dark Mode Completeness
**Audit:** Open every page in dark mode by checking for `dark:` class coverage. Check: dashboard cards, tool result sections, calculation tables, pricing tiers, violation cards, PremiumGate overlay, DisclaimerBanner. Find any hardcoded `bg-white` that does not have a `dark:bg-card` pair.
**95/100 target:** Every visible surface has a dark mode variant. No white surfaces appear in dark mode. Color contrast is maintained.
**Fix:** For every `bg-white` without a `dark:` pair, add `dark:bg-card` or `dark:bg-slate-900`. For every `text-slate-900` without `dark:text-slate-50` or `dark:text-foreground`, add it.

---

### 4. Typography Scale Consistency
**Audit:** Check heading sizes across pages. Homepage uses `text-3xl sm:text-4xl lg:text-5xl`. Other pages may use fixed `text-2xl font-bold`. Check wajar-slip, wajar-gaji, wajar-tanah, wajar-kabur, wajar-hidup, dashboard, pricing pages — all h1 elements.
**95/100 target:** All page h1 headings use responsive classes. Tool pages: `text-2xl sm:text-3xl font-bold`. Dashboard: `text-xl sm:text-2xl font-bold`. Pricing: `text-2xl sm:text-3xl lg:text-4xl font-bold`. No fixed pixel sizes.
**Fix:** Replace every fixed `text-2xl font-bold` h1 on tool pages with `text-2xl sm:text-3xl font-bold`. Replace `text-3xl font-bold` on pricing with `text-2xl sm:text-3xl lg:text-4xl font-bold`.

---

### 5. Per-Tool Visual Identity
**Audit:** Check if each of the 5 tool pages has a distinct visual accent. Look for tool-specific background tints, badge colors, or accent elements in the hero/header section of each tool page. Tools should feel distinct, not identical.
**95/100 target:** Each tool page has a distinct hero background tint: Wajar Slip = amber-50, Wajar Gaji = blue-50, Wajar Tanah = stone-50, Wajar Kabur = indigo-50, Wajar Hidup = teal-50.
**Fix:** On each tool page, find the outermost container of the hero/header section and add the appropriate background class:
- wajar-slip: `bg-amber-50 dark:bg-amber-950/20`
- wajar-gaji: `bg-blue-50 dark:bg-blue-950/20`
- wajar-tanah: `bg-stone-50 dark:bg-stone-950/20`
- wajar-kabur: `bg-indigo-50 dark:bg-indigo-950/20`
- wajar-hidup: `bg-teal-50 dark:bg-teal-950/20`

---

### 6. Icon System Consistency
**Audit:** Check every icon used across the app. All icons should be from Lucide React only. No emoji used as functional icons in UI components (emoji in copy text is acceptable). Check for inconsistent icon sizes — most should be `w-4 h-4` (inline) or `w-5 h-5` (standalone).
**95/100 target:** 100% Lucide React icons. Icon sizes follow a consistent scale: `w-3.5 h-3.5` (badge), `w-4 h-4` (inline text), `w-5 h-5` (button), `w-6 h-6` (card header), `w-8 h-8` (feature icon). No mixed sizing within the same component.
**Fix:** Find any emoji used as icons in JSX (not in string copy). Replace with the appropriate Lucide icon. Audit icon sizes and standardize per the scale above.

---

### 7. Spacing & Layout Rhythm
**Audit:** Check vertical spacing between sections on each page. Look for inconsistent `my-`, `py-`, `gap-` values. Check if section spacing follows a 4px grid (multiples of 4). Look for `mt-5`, `py-7` type oddities that break the rhythm.
**95/100 target:** All spacing uses Tailwind's 4px grid (values: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24). No odd values like `mt-7`, `py-11`. Section padding: `py-12` or `py-16`. Component gap: `gap-4` or `gap-6`.
**Fix:** Replace non-standard spacing values with the nearest standard equivalent. `mt-7` → `mt-6` or `mt-8`. `py-11` → `py-10` or `py-12`.

---

### 8. Shadow System Usage
**Audit:** The app has OKLCH shadow tokens. Check that `shadow-sm`, `shadow-md`, `shadow-lg` are used on cards, modals, and dropdowns — not hardcoded `box-shadow` CSS. Verify shadows appear correctly in both light and dark modes.
**95/100 target:** All elevated surfaces use Tailwind shadow utilities. No inline `style={{ boxShadow: ... }}`. Cards use `shadow-sm`. Modals/dropdowns use `shadow-lg`.
**Fix:** Remove any inline `style={{ boxShadow }}` props and replace with Tailwind `shadow-*` classes.

---

### 9. Border Radius Consistency
**Audit:** Check `rounded-*` values across cards, buttons, inputs, badges. They should follow a consistent scale: buttons = `rounded-lg`, cards = `rounded-xl`, small badges = `rounded-full` or `rounded-md`, inputs = `rounded-lg`.
**95/100 target:** No `rounded` (4px) used on main cards — use `rounded-xl` (12px). No `rounded-sm` on buttons — use `rounded-lg`. Consistent across all tool pages.
**Fix:** Audit and standardize: replace stray `rounded` (without size) → `rounded-md`. Replace `rounded-sm` on buttons → `rounded-lg`.

---

### 10. Animation Cohesion
**Audit:** Check all animation durations and easing curves. BentoCard uses Framer Motion with `0.2s cubic-bezier(0.16, 1, 0.3, 1)`. Button uses Tailwind `transition-colors`. Verify: are there instant snap transitions where smooth transitions should be? Are Framer Motion and Tailwind transitions used in the same component without coordination?
**95/100 target:** All page-entry animations use `fade-in-up` (0.4s). All scale reveals use `scale-in` (0.3s). All color/border transitions use `transition-all duration-200`. No instant snaps on interactive elements.
**Fix:** Add `transition-all duration-200` to any interactive card, link, or button missing a transition. Ensure verdict cards use `animate-scale-in` on mount. Wrap success states in `animate-fade-in-up`.

---

### 11. Favicon & Brand Mark
**Audit:** Check `src/app/icon.svg`, `src/app/icon.png`, `src/app/apple-icon.png`. Is there a proper favicon or is it the default Next.js favicon? Check what appears in the browser tab.
**95/100 target:** Custom favicon exists as `src/app/icon.svg` with the balance scale icon in emerald on white/transparent background. Works in both light and dark browser themes.
**Fix:** Create `src/app/icon.svg` with a balance scale SVG in emerald. See file `01_visual_identity.md` in this folder for the SVG code.

---

### 12. Logo & Wordmark
**Audit:** Check `GlobalNav.tsx` and `Footer.tsx`. Is the logo just plain text "cekwajar.id" or is there a styled wordmark? Is it the same in both nav and footer?
**95/100 target:** The logo renders as "cek" (regular weight, foreground) + "wajar" (bold, emerald-600) + ".id" (small, muted). Same in nav and footer. No plain text.
**Fix:** Create `src/components/WordmarkLogo.tsx` component and apply to both `GlobalNav.tsx` and `Footer.tsx`. Code in file `01_visual_identity.md` in this folder.

---

### 13. Loading Skeleton Quality
**Audit:** Check skeleton loading states on wajar-gaji, wajar-tanah, and any page that fetches data. Are skeletons properly shaped to match the actual content? Or just generic grey bars?
**95/100 target:** Each skeleton matches the shape of the actual content: same number of rows, similar widths, shimmer animation active.
**Fix:** For any skeleton that is just a single `<Skeleton className="h-10 w-full" />`, replace with a structured skeleton that mirrors the actual layout with 2–4 skeleton elements reflecting real content structure.

---

### 14. Hover State Completeness
**Audit:** Check every clickable element (cards, buttons, links, nav items) for hover state classes. Any element without a visible hover state on desktop feels broken.
**95/100 target:** Every interactive element shows a visual change on hover: color shift, shadow change, or background tint. Cards: `hover:shadow-md hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20`. Buttons: `hover:bg-*-700`. Nav links: `hover:text-foreground`.
**Fix:** Audit all `<Link>` and `<button>` elements. For any missing hover state, add `hover:bg-muted/50` (neutral) or tool-specific hover tint.

---

### 15. Responsive Breakpoint Completeness
**Audit:** Test layout at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop). Check for elements that overflow, compress, or break at any breakpoint.
**95/100 target:** Zero horizontal scroll at 375px on any page. No text truncation that loses meaning. No overlapping elements. Tables that can't fit reflow or scroll with a visual cue.
**Fix:** For any layout that breaks at 375px: add `sm:` breakpoint variants to switch from multi-column to single column. For tables: wrap in `overflow-x-auto` and add scroll indicator. For pricing table specifically: add mobile scroll cue.

---

## CLUSTER B — USER EXPERIENCE (Dimensions 16–30)

### 16. First Impression & Clarity
**Audit:** Read the homepage h1 headline. Does it clearly tell a first-time visitor what cekwajar.id does in under 5 seconds? Is the primary action obvious? Is there a value proposition above the fold?
**95/100 target:** H1 answers: "What is this? Who is it for? What do I do?" in one sentence. Primary CTA button is the largest/most prominent element below the headline. Value proposition is visible without scrolling on a 375px screen.
**Fix:** If the homepage headline is generic (e.g., "Platform cek kewajaran"), replace with specific: "Slip Gaji Kamu Dipotong Sesuai Aturan Nggak?" with subtext: "AI audit PPh21, BPJS, dan UMK dalam 30 detik. Gratis, tanpa daftar."

---

### 17. Homepage Information Hierarchy
**Audit:** Does the homepage show Wajar Slip as the featured primary tool, or are all 5 tools shown equally? An equal 5-card grid is a decision paralysis pattern.
**95/100 target:** Wajar Slip is visually dominant (larger card, different background, explicit "Mulai di sini" or "Gratis" badge). The other 4 tools appear in a secondary grid below.
**Fix:** Redesign the tool card section: Wajar Slip gets full-width featured card at top. Other 4 get a 2×2 or 4-column smaller grid below with "Juga tersedia:" heading.

---

### 18. Navigation Clarity
**Audit:** Can a new user understand the 5 tool names from the nav alone? "Wajar Slip", "Wajar Gaji" etc. are branded names — not immediately obvious what they do. Check if tooltips or subtexts exist on nav items.
**95/100 target:** Each nav tool link shows a brief descriptor on hover (tooltip) or has an icon that communicates the tool type. On mobile Sheet menu, each tool has a 1-line description.
**Fix:** In `GlobalNav.tsx`, add a `title` attribute or tooltip to each tool nav link with a brief descriptor: "Wajar Slip — audit PPh21 & BPJS". In the mobile Sheet menu, add a `<span className="text-xs text-muted-foreground">` below each tool name.

---

### 19. Cross-Tool User Journey
**Audit:** After completing a Wajar Slip audit, is there a suggestion to use Wajar Gaji next? After Wajar Gaji, is there a suggestion for Wajar Kabur? Check the bottom of each tool's result section for cross-tool links.
**95/100 target:** Every tool result page ends with at least one relevant cross-tool suggestion with a specific, contextual CTA (not generic "also check this").
**Fix:** Add `CrossToolSuggestion` component at the bottom of each tool's result section. See `02_information_architecture.md` in this folder for the component code.

---

### 20. Form UX — Wajar Slip
**Audit:** Count the number of fields visible at once on the Wajar Slip form on a 375px screen. If more than 5 fields are visible simultaneously, it is cognitively overwhelming. Check if there is a multi-step wizard or a single-page form.
**95/100 target:** Wajar Slip form has a 3-step wizard: Step 1 = essentials (gapok, kota, bulan, ptkp, npwp), Step 2 = deductions (all BPJS fields), Step 3 = review + submit. Progress bar visible at top.
**Fix:** Refactor the Wajar Slip form into 3 steps. The existing state machine (IDLE → MANUAL_FORM → CALCULATING → VERDICT) can drive a `formStep` variable (1|2|3). Add `FormProgress` component. See `03_form_ux_wizard.md` for full implementation.

---

### 21. Form Field Inline Help
**Audit:** Check every technical field in the forms (PTKP, NPWP, JP Karyawan, JHT Karyawan, BPJS Kesehatan). Is there a tooltip or helper text that explains the term in plain Bahasa Indonesia? Or are users expected to know what "JP Karyawan" means?
**95/100 target:** Every technical field (PTKP, NPWP, JP, JHT, BPJS, PPh21) has a ⓘ icon that opens a tooltip with a plain-language explanation. Explanation is 1–2 sentences max.
**Fix:** Add `FieldTooltip` component to each technical field label. Use `FIELD_TOOLTIPS` constants. See `03_form_ux_wizard.md` for full implementation.

---

### 22. City Selection UX
**Audit:** Check how city is selected on Wajar Slip, Wajar Gaji, Wajar Tanah, Wajar Hidup forms. Is it a standard `<Select>` with 514 alphabetical cities? A standard select with 514 items requires excessive scrolling.
**95/100 target:** City selection uses a searchable `<Command>` component (shadcn/ui, already installed) on desktop. On mobile (≤767px), it uses a bottom-sheet Sheet with search input and popular cities pinned at top (Jakarta, Bekasi, Surabaya, Bandung, Tangerang).
**Fix:** Replace all city `<Select>` with `CityCommandSelect` component on desktop and `MobileCitySheet` on mobile. See `03_form_ux_wizard.md` and `06_mobile_ux.md` for component code.

---

### 23. Empty States
**Audit:** Check what appears when: (a) dashboard audit history is empty, (b) Wajar Gaji finds no benchmark data, (c) recent audits section has no data. Is there blank space? A generic "no data" message? Or a purposeful empty state with CTA?
**95/100 target:** Every empty state has: icon, title, description, and a CTA button that moves the user forward. No blank space, no "null", no undefined rendering.
**Fix:** In `dashboard/page.tsx`, find the audit history empty state and add the full empty state component. In `wajar-gaji/page.tsx`, add a "Data belum tersedia" empty state with a suggestion to contribute or try nearby city. See `04_onboarding_empty_states.md`.

---

### 24. Onboarding — "How It Works"
**Audit:** Is there a "Cara kerjanya" or "How it works" section on any of the 5 tool pages? First-time users need to understand what they'll get before investing time in a form.
**95/100 target:** Every tool page has a 3-step "Cara kerjanya" section (icon + title + description for each step) placed above the form. Steps take under 10 seconds to read.
**Fix:** Add `HowItWorks` component above each tool form. See `04_onboarding_empty_states.md` for implementation with specific content for all 5 tools.

---

### 25. Sample Result Preview
**Audit:** Before a user fills out the Wajar Slip form, can they see what a sample result looks like? Or do they have to commit to the full form first to see the product?
**95/100 target:** Wajar Slip page has a collapsible "Lihat contoh hasil →" section below the HowItWorks, showing a sample verdict with mock violations. Users can see the output format before committing.
**Fix:** Add `SampleResultTeaser` component below HowItWorks on Wajar Slip page. See `04_onboarding_empty_states.md` for the full component.

---

### 26. OCR Photo Guidance
**Audit:** In the PayslipUploader component, is there any guidance on what makes a good payslip photo? Or do users upload whatever photo they have and get frustrated when OCR fails?
**95/100 target:** PayslipUploader has an expandable "Tips foto yang baik" section with good/bad examples (text-based, no actual images needed). Lists 5 good practices and 5 things to avoid.
**Fix:** Add the photo guidance collapsible below the upload dropzone. See `04_onboarding_empty_states.md` Task 3 for full implementation.

---

### 27. Error Recovery UX
**Audit:** When a form submission fails (network error, invalid city, OCR failure), what does the user see? Do they see the error and know what to do next? Or just an error message with no path forward?
**95/100 target:** Every error state includes: (a) what went wrong in plain language, (b) what the user should do next (specific action, not just "try again"). Error messages from COPY constants, not raw error strings.
**Fix:** Update all `toast({ description: error.message })` calls to use specific COPY error constants. Add a "Coba isi manual" link on OCR errors. See `09_copy_voice.md` for error message rewrites.

---

### 28. Verdict Result Impact
**Audit:** Is the verdict result card — the culmination of the user's form submission — visually impactful? Does it animate in? Does a SESUAI result feel celebratory? Does a PELANGGARAN result feel urgent? Or does it just appear as static text?
**95/100 target:** Verdict card uses `animate-scale-in` on render. SESUAI state has large checkmark, celebration text, and confetti. PELANGGARAN state has violation count as large prominent number before listing individual violations. V06 (UMK violation) has pulsing red border.
**Fix:** Apply `animate-scale-in` to verdict card container. Add confetti (`canvas-confetti` package: `npm install canvas-confetti @types/canvas-confetti`). Add `ViolationSummaryBanner` component. See `07_verdict_results.md`.

---

### 29. Back/Reset Navigation
**Audit:** After viewing results, can users easily go back and try different inputs? Is the back button consistently labeled and positioned across all 5 tools?
**95/100 target:** All 5 tool pages have a consistent back/reset button using `ChevronLeft` icon + "Cek lagi" text, placed above the result card. Not "Batal" on some and "← Cari Lagi" on others.
**Fix:** Standardize to `<ChevronLeft className="w-4 h-4" /> Cek lagi` on all tool reset buttons. See Fix 11 in `00_audit_fixes.md`.

---

### 30. Result Shareability
**Audit:** Can users share their result with WhatsApp, Instagram, or copy a link? This is the primary viral loop. Check for any share functionality in the result sections.
**95/100 target:** Every verdict result has a "Bagikan ke WhatsApp" button that opens `https://wa.me/?text=` with pre-filled result text. Takes 5 lines of code.
**Fix:** Add `ShareVerdictButton` component to Wajar Slip result. See `07_verdict_results.md` Task 4.

---

## CLUSTER C — LOGIC & CALCULATION ACCURACY (Dimensions 31–42)

### 31. PPh21 TER Method Implementation
**Audit:** Review the PPh21 calculation in the Wajar Slip engine. Verify it uses the TER (Tarif Efektif Rata-rata) method from PMK 168/2023 — not the old progressive bracket method. Check: (a) monthly gross income → annual equivalence → TER bracket lookup → monthly tax = annual_tax/12. Verify TER table values match PMK 168/2023 Lampiran A (TK/0, TK/1, K/0, K/1, K/2, K/3).
**95/100 target:** TER method correctly implemented. TER rates match PMK 168/2023. PTKP values match: TK/0=54jt, TK/1=58.5jt, K/0=58.5jt, K/1=63jt, K/2=67.5jt, K/3=72jt. Annual equivalence calculation is correct (monthly gross × 12).
**Fix:** If TER values are wrong, update the TER lookup table constants to match PMK 168/2023. Add unit test comments inline documenting expected output for edge cases.

---

### 32. BPJS JHT Calculation
**Audit:** JHT employee = 2% of gross salary (gapok + tunjangan tetap). JHT employer = 3.7%. Check the calculation in the slip engine. Verify: (a) base salary for BPJS calculation includes fixed allowances, (b) there is no upper salary cap applied incorrectly for JHT.
**95/100 target:** `jht_employee = (gapok + tunjangan_tetap) * 0.02` with no incorrect cap. Result matches Indonesian BPJS TK regulation.
**Fix:** If calculation uses wrong base or wrong rate, fix the constant and formula in the calculation engine file.

---

### 33. BPJS JP Calculation
**Audit:** JP employee = 1% of gross salary, capped at max salary of IDR 9,559,600/month (2026 cap). JP employer = 2%. Check: (a) cap is applied, (b) max JP employee = IDR 95,596/month, (c) salary above the cap does not result in proportionally higher JP.
**95/100 target:** `jp_employee = min(gross_salary, JP_SALARY_CAP) * 0.01`. `JP_SALARY_CAP` constant defined and equals IDR 9,559,600 for 2026.
**Fix:** If cap is missing or wrong, add `const JP_SALARY_CAP_2026 = 9_559_600` and apply in the calculation.

---

### 34. BPJS Kesehatan Calculation
**Audit:** BPJS Kesehatan employee = 1% of gross salary, capped at salary IDR 12,000,000/month (2026). Max employee contribution = IDR 120,000/month. Employer = 4%. Check these values.
**95/100 target:** `bpjs_kes_employee = min(gross_salary, BPJS_KES_CAP) * 0.01`. Cap applied correctly.
**Fix:** Verify the cap constant value is correct for 2026 and applied in both the calculation and the violation check.

---

### 35. UMK 2026 Database Accuracy
**Audit:** Query or check the UMK data file/database for at least 5 major cities: Jakarta (IDR 5,396,761), Bekasi (IDR 5,690,752), Surabaya (IDR 4,786,940), Bandung (IDR 4,482,914), Tangerang Kota (IDR 4,906,102). If there is a static file or DB table with UMK values, spot-check these 5.
**95/100 target:** UMK values are accurate for 2026. Database/file is sourced from official government data. If values are wrong, flag them for correction.
**Fix:** Update any incorrect UMK values to match the 2026 Penetapan UMK official values.

---

### 36. V06 UMK Comparison Logic
**Audit:** Violation V06 fires when `gapok < UMK` for the employee's city. Check: (a) it compares base salary only (gapok), not total income, (b) it uses the correct UMK for the selected city+year, (c) it correctly handles cities without a specific UMK (falls back to UMP/provincial minimum).
**95/100 target:** V06 correctly fires only when gapok < UMK. Does not fire when total income (gapok + tunjangan) is above UMK but gapok alone is below. Fallback to UMP works.
**Fix:** If V06 fires on total income instead of gapok, fix the comparison. If no UMP fallback exists, add it.

---

### 37. Bayesian Salary Blending
**Audit:** Review `BlendedP50 = (n/(n+k)) * Sample + (k/(n+k)) * Prior` where k=15. Check: (a) formula is implemented, (b) k=15, (c) Prior is from BPS/JobStreet scrape data, (d) result displays correctly when n=0 (new city/job with no crowdsourced data).
**95/100 target:** Blending formula correct. When n=0, blended = Prior (k/k = 1 × Prior). When n>>k, blended ≈ Sample. Result is always a valid positive number.
**Fix:** If n=0 edge case is unhandled (division by zero or undefined), add guard: `if (n === 0) return prior`.

---

### 38. Property IQR Verdict
**Audit:** Review the property price verdict algorithm. Verdict should be: MURAH = below P25, WAJAR = P25–P75, MAHAL = P75–upperFence (P75 + 1.5×IQR), SANGAT_MAHAL = above upperFence. Check: (a) IQR is calculated as P75–P25, (b) upperFence formula is correct, (c) verdict enum values match what the UI renders.
**95/100 target:** IQR formula correct. Verdict thresholds match the spec. Edge case: if only 1 data point exists (n=1), verdict should return "DATA_TERBATAS" or similar, not crash.
**Fix:** If IQR formula is wrong, fix. Add n<5 guard that returns a "data terbatas" state instead of a potentially misleading verdict.

---

### 39. PPP Calculation Accuracy
**Audit:** Review Wajar Kabur PPP calculation. It should use World Bank PPP conversion factor for the target country. Check: (a) the formula converts IDR salary to PPP-adjusted local currency equivalent, (b) exchange rates come from Frankfurter.app (free), (c) the result makes intuitive sense (e.g., IDR 10M to Singapore should show a realistic SGD equivalent).
**95/100 target:** PPP formula produces results within ±10% of World Bank PPP benchmarks. Exchange rate data is fetched fresh (not stale hardcoded). Result shown as both nominal and PPP-adjusted.
**Fix:** If exchange rates are hardcoded, replace with a fetch to Frankfurter.app API. If PPP factors are stale, add a comment with the data source URL and last-updated date.

---

### 40. COL Category Weights
**Audit:** Review the cost-of-living comparison for Wajar Hidup. Check the category breakdown weights: Rent (30–40%), Food (20–25%), Transport (10–15%), Utilities (5–10%), Entertainment (5–10%), Healthcare (5%), Other (5%). Are the weights reasonable and sourced?
**95/100 target:** COL category weights are documented with source. Weights differ by city tier (Jakarta tier 1 vs Malang tier 3). Total weights sum to 100%.
**Fix:** If weights are undocumented, add a comment block above the constants explaining the source and methodology. If weights don't sum to 100%, fix the arithmetic.

---

### 41. Rounding & Precision
**Audit:** Check all IDR amounts displayed in the UI. IDR should always be rounded to the nearest IDR (no decimal). Percentages should be displayed to 1 decimal place (18.5%). Bayesian blended salary should be rounded to nearest IDR 500,000 for P25/P50/P75 display.
**95/100 target:** All IDR amounts use `Math.round()` before display. All percentage displays use `.toFixed(1)`. No "Rp 1,234,567.89" displayed anywhere.
**Fix:** Add `Math.round()` to all IDR calculations before they reach the display layer. Add `.toFixed(1)` to all percentage displays.

---

### 42. Edge Case — Zero Salary Input
**Audit:** What happens if user inputs 0 as gapok in Wajar Slip? Does the app crash? Show division-by-zero errors? Or gracefully validate and show an error message?
**95/100 target:** Zod validation (or similar) prevents form submission with gapok = 0. Error message: "Gaji pokok tidak boleh 0." Displayed inline below the field.
**Fix:** Add `.min(1, "Gaji pokok tidak boleh 0")` to the Zod schema for the gapok field. Ensure the error message displays inline (not as a toast).

---

## CLUSTER D — PSYCHOLOGY & CONVERSION (Dimensions 43–60)

### 43. Loss Aversion Messaging
**Audit:** Does any copy on the site invoke loss aversion — the fear of losing money they're already entitled to? "Kamu mungkin sudah kelebihan bayar pajak" is more motivating than "Cek pajak kamu".
**95/100 target:** The homepage hero and Wajar Slip page prominently mention the possibility of finding overcharges/violations. Loss framing ("Temukan berapa yang kurang dibayar") is more prominent than neutral framing ("Cek slip gaji").
**Fix:** Update homepage h1 to loss-aversion framing: "Slip Gaji Kamu Dipotong Sesuai Aturan Nggak?" Update Wajar Slip hero subtext to: "AI temukan berapa yang kurang atau lebih dipotong dari gajimu."

---

### 44. Social Proof — Audit Counter
**Audit:** Is there a live or recent audit count displayed anywhere? "Sudah 1,247 slip dicek minggu ini" is more convincing than any feature list.
**95/100 target:** Homepage shows a real-time or cached audit count. Counter is specific (not rounded to nearest 100). Updates from Supabase query. Falls back to a non-zero string ("ratusan") if DB is unavailable.
**Fix:** Add `AuditCounter` component to homepage hero. Add `/api/stats/audit-count` API route. See `02_information_architecture.md` Tasks 2–3.

---

### 45. Trust Badges
**Audit:** Before users upload their payslip (sensitive document), do they see any security/trust indicators? Or do they just see the upload button with no reassurance?
**95/100 target:** TrustBadges component appears above the form on all 5 tool pages showing: 🔒 Enkripsi TLS 1.3 / 🗑️ Hapus Otomatis 30 Hari / 👤 Tanpa Nama Tersimpan / 📋 Berbasis PMK 168/2023.
**Fix:** Add `TrustBadges` component above each tool form. See `05_trust_credibility.md` Task 1 for full implementation.

---

### 46. Founder Authenticity
**Audit:** Is there any human presence behind the product? Indonesian users trust products where they can see "siapa yang bikin" (who built it). Check Kontak/About page.
**95/100 target:** About/Kontak page has a founder section with name, photo (or avatar initials), and a first-person paragraph explaining why they built cekwajar.id. Not a corporate "about us" paragraph.
**Fix:** Add `FounderSection` component to homepage (bottom) and Kontak page (top). See `05_trust_credibility.md` Task 4 for component code.

---

### 47. Disclaimer Framing
**Audit:** Find the DisclaimerBanner content. Does it lead with "kami tidak bertanggung jawab atas kerugian" (liability-avoidance) or does it lead with informative, positive framing?
**95/100 target:** Disclaimer reads: "Hasil audit berdasarkan regulasi PMK 168/2023. Untuk kepastian hukum, konsultasikan dengan konsultan pajak bersertifikat." No "tidak bertanggung jawab" language visible above the fold.
**Fix:** Rewrite the DisclaimerBanner text per `05_trust_credibility.md` Task 2. Keep legal accuracy, change the tone from defensive to informative.

---

### 48. PremiumGate Design — Partial Reveal
**Audit:** Check `PremiumGate.tsx`. Does it blur all content (full blur gate) or show partial content with just the specific sensitive data obscured? Full blur is psychologically less compelling than showing a number as "Rp ██.███".
**95/100 target:** PremiumGate shows the violation row clearly but obscures the IDR amount with a block character. Gate overlay message is personalized to the specific data hidden ("Selisih PPh21 kamu tersembunyi"). Not a generic "upgrade" message.
**Fix:** Rebuild `PremiumGate.tsx` per `08_conversion_design.md` Task 1. Pass `hiddenLabel` and `benefit` props contextually from the violation context.

---

### 49. Upgrade CTA Specificity
**Audit:** Find all upgrade CTAs in the app. Do they say "Upgrade" (generic) or something specific like "Lihat selisih PPh21 kamu — Rp 29K"?
**95/100 target:** Every upgrade CTA references what specifically will be unlocked. Pricing page CTA leads with outcome: "Cari tahu persis berapa yang kurang dibayar perusahaanmu."
**Fix:** Replace generic "Upgrade" button text with specific outcome-framed text. See `08_conversion_design.md` for updated button copy.

---

### 50. Price Value Framing
**Audit:** Where the IDR 29K/month price appears, is there a value frame nearby? "Rp 29K/bulan" alone communicates cost. "Rp 29K/bulan — kurang dari 1 kopi per hari" communicates value.
**95/100 target:** Every price display has a sub-label: "Kurang dari 1 kopi per hari" or "Jika selisih PPh21 Rp 50K/bulan, BEP 2 minggu."
**Fix:** Add value frame text below every price instance. Create `UPGRADE_COPY` constants in `src/lib/upgrade-copy.ts`. See `08_conversion_design.md` Task 4.

---

### 51. Post-Payment Celebration
**Audit:** After Midtrans payment succeeds, where does the user land? Dashboard? Or a dedicated success page with confetti and clear next steps?
**95/100 target:** Successful payment redirects to `/upgrade/success` which shows: confetti, "Paket Basic Aktif! 🎉", what was unlocked, and a CTA to return to the audit in progress.
**Fix:** Create `src/app/upgrade/success/page.tsx`. Update Midtrans success redirect URL. See `08_conversion_design.md` Task 3.

---

### 52. Sample Paid Result on Pricing Page
**Audit:** Can users see exactly what they're buying before paying? Or do they have to pay to find out if the paid features are worth it?
**95/100 target:** Pricing page has a "Lihat contoh hasil lengkap →" link that opens a modal showing a full paid-tier result with real IDR amounts visible.
**Fix:** Add `SamplePaidResultModal` component to pricing page. See `08_conversion_design.md` Task 5.

---

### 53. Urgency Without Manipulation
**Audit:** Is there any honest urgency in the upgrade flow? Urgency based on real facts (payroll is monthly, violations compound over time) is ethical. Fake countdown timers are not.
**95/100 target:** Gate message on violation result mentions: "Slip baru keluar tiap bulan — temukan selisih sebelum periode berikutnya." No fake countdown timers or false scarcity.
**Fix:** Add the payroll urgency copy to the PremiumGate overlay message where violations are found. Only mention time-based urgency if factually grounded.

---

### 54. Free Tier Value Delivery
**Audit:** What does a free user actually get from completing a Wajar Slip audit? Do they see enough to understand the product's value? Or is everything gated?
**95/100 target:** Free users see: (a) SESUAI or PELANGGARAN verdict, (b) violation codes and descriptions (V01, V02, etc.), (c) severity ratings (CRITICAL/HIGH/MEDIUM/LOW). Only the IDR amounts and calculation table are gated.
**Fix:** Ensure violation codes, titles, descriptions, and severity levels are visible to free users. Only `violation.slipAmount`, `violation.correctAmount`, `violation.diff` are behind the gate.

---

### 55. Reciprocity — Free Value First
**Audit:** Does the app give genuine value before asking for money? Or does it gate everything immediately? The free tier should feel generous, not crippled.
**95/100 target:** The free tier clearly identifies violations (type and severity) which is 80% of the value. The paid tier adds specificity (exact IDR amounts). A user who sees "2 violations found" on free tier understands the product is working.
**Fix:** Review the PremiumGate placement. Make sure it appears only on the IDR details section, not on the violation list itself.

---

### 56. WhatsApp as Viral Loop
**Audit:** After seeing their verdict, can users easily share it to WhatsApp? WhatsApp is the primary social channel for Indonesian workers. A share button takes 5 lines of code.
**95/100 target:** Every verdict result has "Bagikan ke WhatsApp" button generating a pre-filled `wa.me/?text=` URL with the verdict summary.
**Fix:** Add `ShareVerdictButton` to all 5 tool result sections. See `07_verdict_results.md` Task 4.

---

### 57. Re-engagement After SESUAI Result
**Audit:** When a user gets a SESUAI (all clear) verdict, is there a next step? Or does it feel like a dead end? "Your result is fine. Goodbye."
**95/100 target:** SESUAI result shows a cross-sell suggestion: "Gajimu sudah benar dipotong — apakah gajimu juga wajar di pasaran?" → Wajar Gaji link.
**Fix:** Add `CrossToolSuggestion fromTool="wajar-slip"` below the SESUAI verdict card.

---

### 58. First-Visit Activation Banner
**Audit:** For first-time visitors, is there any activation nudge? Or do they land cold with no guidance?
**95/100 target:** First-time visitors (detected via `localStorage`) see a dismissable banner: "Baru di cekwajar.id? Cek slip gaji butuh 30 detik. Gratis." Shown only once, never again after dismiss.
**Fix:** Add `FirstVisitBanner` component. See `04_onboarding_empty_states.md` Task 5 for localStorage-based implementation.

---

### 59. Dashboard as Re-engagement Tool
**Audit:** When a returning user opens the dashboard, do they see their audit history and stats? Or hardcoded zeros and generic cards?
**95/100 target:** Dashboard shows real Supabase-queried stats: total audits, violations found, last audit date. Audit history lists recent audits with date, tool used, and verdict badge. No hardcoded zeros.
**Fix:** Replace hardcoded zeros with Supabase queries in `dashboard/page.tsx`. See Fix 12 in `00_audit_fixes.md`.

---

### 60. Notification Copy
**Audit:** Check email notification templates (if any exist via Resend). Check any toast notification text. Are they specific and action-oriented or generic?
**95/100 target:** All email subject lines and toast messages are specific. "Audit slip gaji berhasil — 2 pelanggaran ditemukan" not "Audit selesai". Toasts include next action when relevant.
**Fix:** Find all `toast({ title: ..., description: ... })` calls. Ensure descriptions are specific and include a next step where relevant.

---

## CLUSTER E — COPY & VOICE (Dimensions 61–70)

### 61. Brand Voice Consistency
**Audit:** Read 10 random user-facing strings across the app (loading states, error messages, empty states, violation descriptions). Do they all sound like the same brand voice? Or do some sound corporate and others casual?
**95/100 target:** All copy sounds like: "Smart friend who knows labor law. Speaks up for the employee. Warm but direct." No passive voice ("terjadi kesalahan") and no corporate hedging ("kami tidak dapat memproses").
**Fix:** Apply `COPY` constants from `src/lib/copy.ts` (create this file if it doesn't exist). See `09_copy_voice.md` Task 1 for the full constants file.

---

### 62. Loading State Microcopy
**Audit:** Find all loading state strings. "Menghitung..." is generic. "Lagi ngitung PPh21 kamu... ⚡" is specific and personality-forward.
**95/100 target:** Every loading state has a tool-specific message. Wajar Slip: "Lagi ngitung PPh21 kamu... ⚡". Wajar Gaji: "Cari data gaji untuk posisi ini...". Wajar Tanah: "Cek harga properti di area tersebut...".
**Fix:** Replace all loading strings. See `09_copy_voice.md` Task 2 for the replacement map.

---

### 63. Error Message Quality
**Audit:** Find all error messages in API routes, catch blocks, and validation schemas. Do they tell users what went wrong AND what to do next?
**95/100 target:** Every error message has: (a) what happened in plain language, (b) a specific next action. "Kota ini belum ada di database UMK kami. Coba kota terdekat, atau pilih dari daftar." not "Kota tidak ditemukan."
**Fix:** Apply COPY.error constants. See `09_copy_voice.md` Task 3.

---

### 64. Violation Description Advocacy
**Audit:** Read the violation descriptions for V01–V07. Do they explain what happened neutrally ("PPh21 tidak dipotong sesuai regulasi") or do they advocate for the user ("HRD kamu tidak motong PPh21 bulan ini — kamu yang bayar lebih di akhir tahun")?
**95/100 target:** V02 through V07 descriptions are advocacy-forward, explaining the real-world impact on the user, not just the regulatory fact. V06 specifically mentions it is a legal violation.
**Fix:** Apply COPY.violations constants to ViolationItem component. See `09_copy_voice.md` Task 4.

---

### 65. FAQ Content Quality
**Audit:** Check the FAQ section on the pricing page or help pages. Check specifically for the typo: "PTKP yang適用 untuk semua级别 karyawan" (corrupted Japanese characters). Check that all answers are in plain Bahasa Indonesia.
**95/100 target:** No corrupted characters. All FAQ answers are in correct Bahasa Indonesia. Answers are max 3 sentences (not essays).
**Fix:** Fix the specific typo: "PTKP yang適用 untuk semua级別" → "PTKP yang berlaku untuk semua level". See Fix 8 in `00_audit_fixes.md`.

---

### 66. UMK vs UMR Terminology
**Audit:** The app uses "UMK" (Upah Minimum Kota/Kabupaten). Many Indonesian users know this as "UMR" (Upah Minimum Regional — older term). Check where UMK is displayed and whether both terms are mentioned.
**95/100 target:** Where UMK appears in the verdict, it shows "UMK/UMR" with a brief explanation tooltip: "UMK (dikenal juga sebagai UMR) — upah minimum yang berlaku di kota/kabupaten kamu."
**Fix:** Replace standalone "UMK" display with "UMK/UMR" where it appears as a label. Add tooltip with explanation.

---

### 67. Placeholder Text Quality
**Audit:** Check all form `placeholder` attributes. Generic "Masukkan nilai..." is useless. "7.500.000" (concrete example) is useful.
**95/100 target:** All numeric inputs show a realistic example value as placeholder. All text inputs show a realistic example (job title: "Software Engineer", city: "Bekasi"). No "Enter value here" or "Masukkan...".
**Fix:** Audit every input's placeholder prop. Replace vague placeholders with realistic examples.

---

### 68. Button Label Clarity
**Audit:** All primary CTA buttons should be action-specific. "Submit" is useless. "Cek Slip Gaji Sekarang" is specific.
**95/100 target:** Every primary button uses a verb + object: "Cek Slip Gaji", "Lihat Benchmark Gaji", "Cek Harga Properti". No bare "Submit", "Send", or "Lanjut" without context.
**Fix:** Replace generic button labels. "Submit" → "Cek Sekarang". "Lanjut" → "Lanjut ke Potongan →". "Kirim" → "Kirim Data Gaji". See COPY.form constants in `09_copy_voice.md`.

---

### 69. Success State Celebration
**Audit:** When a SESUAI verdict appears, does the copy celebrate with the user? Or just report a neutral fact?
**95/100 target:** SESUAI verdict copy: "Slip Gaji Kamu SESUAI ✓ — Semua komponen PPh21 dan BPJS sudah benar. HRD-mu taat regulasi bulan ini. 🎉"
**Fix:** Update SESUAI verdict text using COPY.verdict.sesuai constants. See `09_copy_voice.md` Task 5.

---

### 70. About Page Voice
**Audit:** Read the About/Kontak page. Is it a corporate "we are a platform" description? Or a human founder letter?
**95/100 target:** Kontak page opens with a first-person founder statement explaining why cekwajar.id was built. Ends with contact email or form. Feels human, not corporate.
**Fix:** Rewrite the About page intro per `09_copy_voice.md` Task 8.

---

## CLUSTER F — ACCESSIBILITY (Dimensions 71–80)

### 71. Skip-to-Content Link
**Audit:** Press Tab on the homepage. Does the first focusable element offer a "skip to main content" link? Without this, keyboard users must tab through the entire navigation before reaching page content.
**95/100 target:** First focusable element is a visually hidden "Langsung ke konten utama" link that becomes visible on focus. Links to `#main-content`. Main content container has `id="main-content"`.
**Fix:** Add skip link to `layout.tsx`. Add `id="main-content"` to `<main>`. See `00_audit_fixes.md` Fix 13.

---

### 72. Keyboard Navigation — GlobalNav Dropdown
**Audit:** Open the user dropdown in GlobalNav using keyboard (Tab to reach the trigger, Enter to open). Can you navigate dropdown items with arrow keys? Can you close it with Escape?
**95/100 target:** Dropdown uses shadcn/ui `DropdownMenu` (Radix UI) which provides arrow key navigation and Escape to close out of the box.
**Fix:** Ensure GlobalNav user menu uses `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuTrigger`, `DropdownMenuItem` from shadcn/ui. See `00_audit_fixes.md` Fix 6.

---

### 73. Focus Rings — Interactive Elements
**Audit:** Tab through the homepage. Do interactive cards, buttons, and links show a visible focus ring? Check specifically: tool cards on homepage, nav links, form inputs, buttons.
**95/100 target:** All interactive elements show `ring-2 ring-emerald-500 ring-offset-2` when focused with keyboard. No focus ring suppression with `outline-none` without a replacement.
**Fix:** Add `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2` to all interactive card links and nav items. See `00_audit_fixes.md` Fix 15.

---

### 74. ARIA Labels — Icon-Only Buttons
**Audit:** Find all buttons that only contain an icon (no visible text). Examples: theme toggle, hamburger menu, close buttons. These must have `aria-label`.
**95/100 target:** Every icon-only button has `aria-label`. Theme toggle: `aria-label="Ganti tema"`. Mobile menu: `aria-label="Buka menu navigasi"`. Close: `aria-label="Tutup"`.
**Fix:** Audit all `<button>` elements with only icon children. Add descriptive `aria-label` to each. See `00_audit_fixes.md` Fix 16.

---

### 75. Form Field Semantic HTML
**Audit:** Check radio groups in Wajar Slip (NPWP yes/no). Are they wrapped in `<fieldset>` with `<legend>`? Check all checkbox groups too.
**95/100 target:** All radio groups wrapped in `<fieldset>` with `<legend>` text. All `<label>` elements are properly associated with their `<input>` via `htmlFor` / `id` pairs.
**Fix:** Add `<fieldset><legend>` around NPWP radio group. See `00_audit_fixes.md` Fix 3.

---

### 76. Color Contrast — WCAG AA
**Audit:** Check text-on-background contrast ratios. Critical areas: `text-slate-400` on white or light bg (likely fails 4.5:1), small text on colored badges, pricing page category labels (`text-xs text-slate-700 on bg-slate-50`).
**95/100 target:** All body text ≥4.5:1 contrast ratio. All large text (≥18px normal or ≥14px bold) ≥3:1. No `text-slate-400` used as body or label text.
**Fix:** Replace `text-slate-400` used as body/label text with `text-slate-600` or `text-muted-foreground`. See `00_audit_fixes.md` Fix 17.

---

### 77. ARIA Live Regions — Dynamic Content
**Audit:** When the Wajar Slip verdict appears (replacing the form), is there an `aria-live` announcement so screen readers know the content changed?
**95/100 target:** The verdict result container has `aria-live="polite" aria-atomic="true"`. The form has `aria-busy={isCalculating}` during loading.
**Fix:** Add `aria-live` and `aria-busy` attributes. See `00_audit_fixes.md` Fix 14.

---

### 78. Interactive Card ARIA
**Audit:** Homepage tool cards are `<Link>` wrappers around card content. Do they have `aria-label` describing the destination?
**95/100 target:** Each tool card link has `aria-label`: "Wajar Slip — audit PPh21 dan BPJS slip gaji kamu". Screen readers announce the full purpose, not just the link text.
**Fix:** Add `aria-label` to each tool card `<Link>`. See `00_audit_fixes.md` Fix 15.

---

### 79. Reduced Motion Support
**Audit:** Check all animation implementations. Do they check `prefers-reduced-motion: reduce`? Framer Motion components should use `useReducedMotion()`. CSS animations should use `@media (prefers-reduced-motion: reduce)`.
**95/100 target:** All Framer Motion components use `useReducedMotion()`. Confetti effect passes `disableForReducedMotion: true`. CSS animations have reduced-motion override in `globals.css`.
**Fix:** Verify `globals.css` has `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; } }`. Check Framer components use `useReducedMotion`.

---

### 80. Semantic Heading Hierarchy
**Audit:** Check h1/h2/h3 hierarchy on each page. Each page should have exactly one h1. Sections should use h2. Card titles should use h3. No heading levels skipped (h1 → h3 without h2).
**95/100 target:** Each page has exactly one `<h1>`. Section headings are `<h2>`. Card/subsection headings are `<h3>`. No `<h4>` or deeper unless absolutely necessary.
**Fix:** Audit heading elements. Rename elements that are styled as headings but use wrong semantic tag (e.g., `<p className="text-xl font-bold">` used as a section heading should be `<h2 className="text-xl font-bold">`).

---

## CLUSTER G — MOBILE EXPERIENCE (Dimensions 81–90)

### 81. Bottom Navigation Bar
**Audit:** On mobile (375px), is there a persistent bottom navigation bar with the 5 tool shortcuts? Or does a user have to open a hamburger menu to switch tools?
**95/100 target:** `MobileBottomNav` component exists and renders on all pages on `<768px` screens. Shows Home + 5 tools. Hidden on desktop and auth pages. Active tool has accent color.
**Fix:** Create `MobileBottomNav` component and add to `layout.tsx`. Add 72px bottom padding to main content. See `06_mobile_ux.md` Task 1.

---

### 82. Mobile Form Input Heights
**Audit:** Check all form inputs on a 375px viewport. Are touch targets at least 48px tall? Standard shadcn/ui inputs default to `h-10` (40px) — below the recommended 44px minimum.
**95/100 target:** All form inputs on mobile are minimum `h-12` (48px). All submit buttons are minimum `h-12`. Font size on inputs is `16px` minimum (prevents iOS zoom on focus).
**Fix:** Add global CSS rule for mobile: `@media (max-width: 640px) { input, select, textarea { min-height: 52px; font-size: 16px; } }`. See `06_mobile_ux.md` Task 4.

---

### 83. Mobile Table Layouts
**Audit:** Check the pricing page feature comparison table and any data tables in tool results on 375px. Do they overflow horizontally? Is there a scroll indicator?
**95/100 target:** Tables that can't reflow wrap in `overflow-x-auto`. A "← Geser untuk lihat semua fitur →" text hint appears below the table on mobile.
**Fix:** Add `overflow-x-auto` wrapper to pricing table. Add mobile scroll hint text. See `00_audit_fixes.md` Fix 4.

---

### 84. Mobile City Picker
**Audit:** City selection on mobile — does it open a bottom sheet with search, or a tiny native select dropdown with 514 items?
**95/100 target:** On mobile, city field opens a bottom `Sheet` with full-height search input and popular cities pinned at top.
**Fix:** Create `MobileCitySheet` and `useIsMobile` hook. Apply responsively to all city fields. See `06_mobile_ux.md` Tasks 2–3.

---

### 85. Tap Highlight & Active States
**Audit:** On mobile, when tapping a button or card, is there a visual press state? iOS tap highlight (`-webkit-tap-highlight-color`) can make taps feel unresponsive if not styled.
**95/100 target:** `-webkit-tap-highlight-color: transparent` on interactive elements. Active press state via `active:scale-[0.97]` on buttons and cards.
**Fix:** Add to `globals.css`: `a, button, [role="button"] { -webkit-tap-highlight-color: transparent; }` and `@media (hover: none) { button:active { transform: scale(0.97); } }`.

---

### 86. Viewport Meta & Zoom
**Audit:** Check `src/app/layout.tsx` metadata for viewport meta tag. Is `user-scalable=no` or `maximum-scale=1.0` set? These are accessibility violations. Pinch-to-zoom must be allowed.
**95/100 target:** No `user-scalable=no` or `maximum-scale=1.0`. If the viewport meta exists, it should only set `width=device-width, initial-scale=1`.
**Fix:** In `layout.tsx`, if viewport metadata includes `user-scalable=no`, remove it.

---

### 87. Content Below Fixed Nav
**Audit:** The nav is `sticky top-0`. Does any page content get hidden behind the nav when scrolling to an anchor or when content loads below the fold?
**95/100 target:** All pages have enough top padding/margin to not have content hidden behind the 64px sticky nav. If using `scroll-mt-*`, it accounts for the nav height.
**Fix:** Add `scroll-margin-top: 80px` to `#main-content` or any anchor targets. Add `pt-4` to the top of main content sections if they start too high.

---

### 88. Mobile Overflow Prevention
**Audit:** Check all pages at 375px for any element that causes horizontal scrollbar. Common culprits: fixed-width elements, `min-w-*` without responsive overrides, long strings without `break-words`.
**95/100 target:** Zero horizontal scroll at 375px on any page. All text wraps properly. All fixed-width elements have responsive overrides.
**Fix:** On any element causing overflow: add `overflow-hidden` to container, `break-words` or `overflow-wrap: break-word` to text containers, `max-w-full` to images.

---

### 89. Country/Destination Picker (Wajar Kabur)
**Audit:** How are countries selected in Wajar Kabur on mobile? A grid of 30+ country buttons compresses badly on mobile.
**95/100 target:** On mobile, country selection uses the same bottom-sheet pattern as city selection. Top countries pinned: SG, AU, MY, US, JP, GB, DE, NL, KR, CA.
**Fix:** Apply `MobileCitySheet`-style component to Wajar Kabur country picker on mobile. Customize with country list.

---

### 90. Mobile Auth Flow
**Audit:** Check the login page on 375px. Is the Google OAuth button full-width and appropriately sized? Is there proper keyboard handling when the soft keyboard appears (does it push the form up correctly)?
**95/100 target:** OAuth button is full-width on mobile with `h-12` height. Email input shows `type="email"` to trigger correct mobile keyboard. No content gets hidden behind the mobile keyboard.
**Fix:** Ensure login inputs have correct `type` attributes. Make OAuth button full-width: `className="w-full h-12"`.

---

## CLUSTER H — TECHNICAL & PERFORMANCE (Dimensions 91–100)

### 91. Broken Navigation Links
**Audit:** Search entire codebase for `href="/privacy"`. The correct route is `/privacy-policy`. Also check any other links that may reference routes that don't exist (404s).
**95/100 target:** Zero broken links. Every `href` in nav, footer, auth pages, and tool pages points to an existing route. Privacy link goes to `/privacy-policy`.
**Fix:** Replace all `href="/privacy"` with `href="/privacy-policy"` in: `Footer.tsx` (line ~59), `login/page.tsx` (line ~142), and any other file. See `00_audit_fixes.md` Fix 1.

---

### 92. 404 Page
**Audit:** Navigate to `/does-not-exist`. Does Next.js show a custom 404 page or the generic "404 | This page could not be found" default?
**95/100 target:** Custom `not-found.tsx` exists at `src/app/not-found.tsx` with brand styling, clear message in Bahasa Indonesia, and a CTA to go home or to Wajar Slip.
**Fix:** Create `src/app/not-found.tsx`. See `00_audit_fixes.md` Fix 18.

---

### 93. TypeScript Strict Mode
**Audit:** Check `tsconfig.json`. Is `strict: true` enabled? Run `npx tsc --noEmit` and count TypeScript errors. Check for `any` type escapes in critical calculation files.
**95/100 target:** `strict: true` in tsconfig. Zero TypeScript errors on `npx tsc --noEmit`. No `any` types in calculation engine files (`/lib/calculations/`).
**Fix:** If `strict: false`, change to `strict: true` and fix resulting errors. Replace `any` types in calculation files with proper typed interfaces.

---

### 94. Build Optimization — Bundle Size
**Audit:** Run `npm run build` and check the `.next/analyze/` output (if Bundle Analyzer is configured) or note the build output sizes. Check for any route that shows `>200kB first load JS` in the build output.
**95/100 target:** Homepage first load JS <150kB. Tool pages <100kB (excluding shared bundle). No single route >250kB first load.
**Fix:** If any route is oversized: (a) add `dynamic` imports for heavy components (Recharts, Framer Motion), (b) move large constants (UMK table, TER table) to a separate file imported only where needed.

---

### 95. Image Optimization
**Audit:** Check all `<img>` tags. Are they using Next.js `<Image>` component? Any `<img src="...">` without Next.js Image will not have automatic optimization, lazy loading, or WebP conversion.
**95/100 target:** All images use Next.js `<Image>` component with `width`, `height`, and `alt` props. No bare `<img>` tags except in SVG content.
**Fix:** Replace any bare `<img>` with `import Image from 'next/image'` and `<Image>` component with appropriate dimensions.

---

### 96. API Error Handling
**Audit:** Check all API routes in `src/app/api/`. Do they handle errors with try/catch and return appropriate HTTP status codes? A 200 response with `{ error: "..." }` is an anti-pattern. Errors should return 4xx/5xx.
**95/100 target:** All API routes return `NextResponse.json(data, { status: 200 })` on success and `NextResponse.json({ error: message }, { status: 400/500 })` on failure. Errors are caught and logged.
**Fix:** Audit each API route. Add try/catch if missing. Return proper status codes. Add `console.error(error)` before returning 500 responses.

---

### 97. Rate Limiting Coverage
**Audit:** Check which API routes have rate limiting via Vercel KV. At minimum, these routes must be rate-limited: `/api/wajar-slip/audit`, `/api/wajar-gaji/benchmark`, `/api/wajar-tanah/verdict`, `/api/auth/[...route]`.
**95/100 target:** All tool calculation routes and auth routes have rate limiting. Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`) are returned.
**Fix:** If any calculation API route lacks rate limiting, add it using the same Vercel KV rate limiter pattern used in the existing rate-limited routes.

---

### 98. Environment Variable Safety
**Audit:** Check all references to `process.env.SUPABASE_SERVICE_ROLE_KEY`, `process.env.MIDTRANS_SERVER_KEY`, `process.env.GOOGLE_VISION_API_KEY`. Are they only accessed in server-side code? No client component should import these.
**95/100 target:** All secret env vars accessed only in API routes, server components, or server-only lib files. No `NEXT_PUBLIC_` prefix on any secret. `process.env.SUPABASE_SERVICE_ROLE_KEY` only appears in server contexts.
**Fix:** If any secret env var is exposed in client-side code, move the logic to an API route. The client should call the API route, not access secrets directly.

---

### 99. Supabase RLS Coverage
**Audit:** Check Supabase dashboard or migration files for Row Level Security policies. Every table with user data should have RLS enabled with policies that restrict access to the owning user. Tables to verify: `payslip_audits`, `salary_submissions`, `property_queries`, `user_subscriptions`.
**95/100 target:** RLS enabled on all user-data tables. Policy: `auth.uid() = user_id` for SELECT, INSERT, UPDATE. No table with user data has RLS disabled.
**Fix:** If any table lacks RLS, add the missing policy in a Supabase migration file or directly via the dashboard.

---

### 100. Production Readiness Checklist
**Audit:** Check the following final production readiness items:
(a) `console.log` statements in production code — should be removed or replaced with `console.error` for actual errors only.
(b) `TODO` and `FIXME` comments in client-visible code — review and resolve.
(c) Hardcoded test/demo credentials or API keys in any source file.
(d) `src/app/` — any page that renders `undefined` or `null` without a fallback.
(e) Error boundaries — is there a `global-error.tsx` or `error.tsx` at the root level?

**95/100 target:** Zero `console.log` in production paths (API routes, server components). Zero hardcoded secrets. All pages render a valid UI even when data is null/undefined. Root `error.tsx` exists.
**Fix:**
- Remove `console.log` from API routes and server components (leave only `console.error`).
- Create `src/app/error.tsx` with a branded error UI and "Coba lagi" button.
- Create `src/app/global-error.tsx` for root-level errors.
- For any component that renders `{data?.value}` without null check, add a fallback: `{data?.value ?? '—'}`.

---

## OUTPUT FORMAT

After completing all audits and fixes, output a final score table:

```
FINAL AUDIT SCORES — cekwajar.id
=================================
Dimension 1:  Brand Color Consistency           ___/100
Dimension 2:  CSS Variable Discipline           ___/100
Dimension 3:  Dark Mode Completeness            ___/100
[... all 100 ...]
Dimension 100: Production Readiness             ___/100

CLUSTER AVERAGES:
A — Visual Design (1–15):      ___/100
B — User Experience (16–30):   ___/100
C — Logic & Calculations (31–42): ___/100
D — Psychology & Conversion (43–60): ___/100
E — Copy & Voice (61–70):      ___/100
F — Accessibility (71–80):     ___/100
G — Mobile Experience (81–90): ___/100
H — Technical & Performance (91–100): ___/100

OVERALL SCORE: ___/100
DIMENSIONS BELOW 95: [list any remaining]
```

If any dimension is still below 95 after fixes, explain why and what the blocker is.
