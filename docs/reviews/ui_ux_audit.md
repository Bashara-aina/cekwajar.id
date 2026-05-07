# cekwajar.id — UI/UX Audit (10 Perspectives)

**Status:** Post-build audit. All 10 stages complete, build passes. Current state: functional but visually generic.  
**Stack confirmed:** Next.js 15, Tailwind, shadcn/ui, Plus Jakarta Sans, emerald primary color, dark mode support, animation system exists.

---

## Perspective 1: Visual Identity & Brand Differentiation

**Problem:** The emerald primary color and slate-900 foreground are technically correct but anonymous. Tokopedia uses green. Gojek uses green. BCA uses blue. cekwajar.id looks like every other Indonesian fintech tool. Nothing in the visual language communicates the core brand idea: *keadilan finansial* (financial fairness).

**What the code has:** Tool-specific badge colors are defined (wajar-slip=emerald, wajar-gaji=blue, wajar-tanah=amber, wajar-kabur=indigo, wajar-hidup=rose). This is a good foundation but it only appears on small badges — it doesn't shape the overall page identity.

**Fixes:**

1. Give each tool page a distinct background tint. The hero section of Wajar Slip gets an amber-50 top gradient (warning = payslip risk). Wajar Gaji gets a blue-50 tint (data = credibility). Wajar Tanah gets stone-50 (property = grounded). Wajar Kabur gets indigo-50 (ambition = purple). Wajar Hidup gets teal-50 (balance = calm). These are one CSS class per page — tiny change, enormous visual differentiation.

2. The logo "cekwajar.id" should have typographic weight variation: "cek" in regular weight, "wajar" in bold + emerald color. This makes the brand word (wajar = fair) visually dominant. Add as a custom component replacing the current text node.

3. Add a "fairness" visual motif to the hero section of the homepage: a simple SVG of a balance scale (scales of justice), very clean line art, placed behind the headline text at low opacity. This takes 20 minutes and immediately communicates the brand concept without a word.

4. The current favicon is almost certainly just the default Next.js icon or a plain letter. Create a proper favicon: the balance scale icon in emerald on white background. It will stand out in crowded browser tabs.

---

## Perspective 2: Information Architecture & Homepage

**Problem:** The homepage presents 5 equal tool cards in a grid. No hierarchy, no recommended path, no "start here." A first-time visitor from TikTok sees 5 options and has to figure out which one to pick. Decision fatigue increases dropout rate.

**What the code has:** GlobalNav lists all tools. Homepage is a hero + 5-card grid. No featured/recommended tool logic.

**Fixes:**

1. Redesign the homepage hero to feature Wajar Slip as the primary acquisition tool. Instead of a generic "cek kewajaranmu" headline, make it specific: "Upload Slip Gaji Kamu — AI Cek PPh21 & BPJS Gratis." This is what TikTok traffic expects based on the content they watched.

2. Move the 4 secondary tools below the fold as "Juga tersedia:" with smaller cards (not the same size as the hero tool). Visual hierarchy drives behavior.

3. Add cross-tool suggestions after every result. After Wajar Slip verdict, show: "Mau tahu gajimu wajar di pasaran? → Cek dengan Wajar Gaji." This is a one-line `<Link>` at the bottom of the result card — costs nothing, extends session depth.

4. Add a `use client` "Mulai dari mana?" routing helper above the tool grid: 3 buttons ("Mau cek slip gaji", "Mau tahu standar gaji di posisiku", "Mau pindah kota/negara") that scroll or navigate to the relevant tool. Takes 15 minutes to build, guides confused users.

---

## Perspective 3: Form UX & Progressive Disclosure

**Problem:** All 5 tools use single-page forms. Wajar Slip has ~10 fields visible simultaneously: PTKP status, city dropdown (514 cities), month, NPWP toggle, plus 6 BPJS/deduction fields. On a 375px mobile screen this is a wall of inputs. First-time users don't know what "JP Karyawan" means and there are no inline explanations.

**What the code has:** React Hook Form + Zod, IDRInput component, state machine with IDLE → MANUAL_FORM → CALCULATING → VERDICT. The state machine is the right architecture — it just needs to drive a multi-step UI.

**Fixes:**

1. Split Wajar Slip into 3 steps using the existing state machine. Step 1: Gaji pokok + Kota + Bulan + PTKP (4 fields — the essentials). Step 2: Tunjangan & potongan (the 6 deduction fields — shown only after Step 1 is valid). Step 3: Review summary before submit. Add a `<Progress value={step/3*100}/>` bar at the top — shadcn/ui `Progress` component is already installed.

2. Add `ⓘ` tooltip triggers next to every technical field. "PTKP" → "Status pajak kamu: TK = belum menikah, K = menikah. Angka = jumlah anak tanggungan." "JP Karyawan" → "Jaminan Pensiun — 1% dari gaji, maks Rp 95.596/bulan." Use shadcn/ui `Tooltip` which is already installed.

3. Replace the 514-city dropdown with a `<Command>` component (shadcn/ui, already installed). It renders as a searchable input with results list. User types "Bek" → shows "Bekasi", "Bekasi Barat", "Bekasi Selatan", etc. Dramatically faster than scrolling 514 items.

4. Smart defaults: pre-fill month with the current month, year with current year, NPWP with "Ya" (most formal employees have it). Saves 3 taps.

5. For unknown field values: add a small "Tidak tahu?" link below each BPJS field that sets the value to 0 and adds a note to the result: "Nilai JP tidak diisi — dihitung asumsi nol."

---

## Perspective 4: Onboarding & Empty States

**Problem:** No onboarding exists. A first-time user lands on `/wajar-slip` and sees a form. No explanation of what they'll get, no sample result, no indication of how long it takes. The OCR upload has no guidance on what makes a good payslip photo.

**What the code has:** PayslipUploader component, LoadingSpinner, shimmer skeletons. No onboarding sequence, no sample result component, no empty-state copy.

**Fixes:**

1. Add a "Bagaimana cara kerjanya?" (How it works) section directly above the form — 3 icon+text steps. Icon: Upload → Text: "Upload foto slip gajimu atau isi manual." Icon: Brain → Text: "AI hitung PPh21, BPJS, dan UMK." Icon: CheckCircle → Text: "Lihat apakah ada pelanggaran." Three rows, mobile-friendly. Copy-paste 3 `<div>` elements — 10 minutes to build.

2. Add a sample/demo result below the how-it-works section. A screenshot or static React component showing a verdict card with blurred numbers and a "Contoh hasil →" label. This sets expectations and increases form completion rates.

3. In PayslipUploader, add a "Contoh foto yang baik" toggle. When clicked, shows a simple split image: left = blurry (❌), right = clear and well-lit (✅). This reduces OCR failure rate from user error.

4. Empty state for audit history in dashboard: currently likely blank space. Add: "Belum ada riwayat audit. Mulai cek slip gaji pertama kamu →" with a direct CTA button. Never show an empty page.

5. First-session banner: detect `localStorage.getItem('hasVisited')` — if null, show a dismissable top banner: "Baru di sini? Cek slip gaji butuh 2 menit, gratis." Set the flag on dismiss. One banner, shown once, zero annoyance.

---

## Perspective 5: Trust & Credibility Signals

**Problem:** The DisclaimerBanner component leads with legal hedging ("cekwajar.id tidak bertanggung jawab..."). There are no visible security indicators, no user count, no testimonials, no press mentions. Indonesians share sensitive documents (payslips, property prices) only with trusted platforms.

**What the code has:** DisclaimerBanner, KJPP_DISCLAIMER constant, CookieConsent. No trust badge components.

**Fixes:**

1. Add a 4-item trust badge row just above the form on Wajar Slip (and adapt per tool). Using Lucide icons already in the project:
   - 🔒 Shield → "Data Terenkripsi TLS 1.3"
   - 🗑️ Trash2 → "Otomatis Dihapus 30 Hari"
   - 👤 UserX → "Tanpa Nama Tersimpan"
   - 📋 FileCheck → "Berbasis PMK 168/2023"
   All of these are already true. Show them prominently. This is a 20-line component.

2. Add a real-time audit counter near the hero CTA: fetch `SELECT COUNT(*) FROM payslip_audits WHERE created_at > now() - interval '7 days'` via a simple API route. Display as "Sudah X.XXX slip dicek minggu ini." Seed an honest starting number from day 1. Social proof is strongest when specific.

3. Reframe the DisclaimerBanner from defensive to informative. Current: "kami tidak bertanggung jawab atas kerugian." Better: "Data ini berdasarkan regulasi resmi. Untuk kepastian hukum, konsultasikan dengan konsultan pajak bersertifikat." Same legal coverage, completely different emotional tone.

4. Add a "Dibuat oleh" section on the About/Kontak page. One paragraph with founder name + photo + a single sentence: "Saya bikin cekwajar.id karena pernah kena underpay BPJS setahun penuh sebelum sadar." A human face behind the product is the most powerful trust signal for Indonesian users.

5. After beta testing generates real feedback: add 3 testimonials with avatar (initials only for privacy), name+city, and one-sentence quote. Positioned on the homepage and on the Wajar Slip page.

---

## Perspective 6: Mobile UX (Primary Platform)

**Problem:** Target users — Rina (Samsung Galaxy) and Sari (iPhone) — arrive from TikTok on mobile. The current mobile experience compresses desktop patterns to 375px: a long scrolling form, a standard `<Select>` for 514 cities, and result tables that require horizontal scrolling.

**What the code has:** Mobile hamburger sheet nav (shadcn/ui Sheet), responsive grid (grid-cols-1 on mobile), but no bottom nav, no bottom-sheet city picker, no mobile-optimized touch targets beyond standard Tailwind sizing.

**Fixes:**

1. Add a bottom navigation bar for mobile only (`md:hidden`). Five icons for the 5 tools + one for home/dashboard. Fixed positioning at the bottom. This is how OVO, GoPay, and Tokopedia work — Indonesian mobile users expect it. The hamburger sheet becomes desktop-only.

2. Replace the `<Select>` city dropdown on mobile with a `<Sheet>` bottom modal (shadcn/ui Sheet, already installed). User taps city field → sheet slides up from bottom with full-height search + list. Top 5 cities pinned: Jakarta, Bekasi, Surabaya, Bandung, Tangerang. Below that: alphabetical with search.

3. Increase all input heights on mobile from the default 40px to `h-14 (56px)` for text fields. This is a one-word Tailwind class change per input. Fat thumbs need bigger targets.

4. Verdict cards at 375px: any side-by-side comparison elements (`flex-row`) must switch to `flex-col` at mobile. The IDR amounts in comparison boxes must not be compressed — they're the core data. Audit every result card for `flex-row` at mobile and apply `sm:flex-row flex-col`.

5. For Wajar Kabur country selector on mobile: instead of the 3-column grid, use the same bottom-sheet pattern. Countries sorted by TikTok demand: SG, AU, MY, US, JP, UK first.

---

## Perspective 7: Verdict & Results Design (The Product Moment)

**Problem:** The verdict card uses a colored background (emerald for pass, red for fail) with an icon and text. This is correct but underwhelming. The verdict screen is the culmination of the user's entire journey — the moment they've been building toward. It's currently treated like a data readout, not an experience.

**What the code has:** VerdictBadge component, ViolationItem cards with severity badges, PremiumGate blur overlay. The `scale-in` animation keyframe exists in the animation system but may not be applied to the verdict reveal.

**Fixes:**

1. Apply `animate-scale-in` (already defined in animations.css) to the main verdict badge when it renders. A 0.5s scale-in on "ADA PELANGGARAN" or "SESUAI REGULASI" makes the result feel earned. One className addition.

2. For the SESUAI result: add a confetti burst using a lightweight library (canvas-confetti, 3KB). Only fires on the first time a user sees a passing result. It's a celebration, not a gimmick. Indonesian apps like Tokopedia and SeaBank do this for successful moments.

3. For violations, don't just list them — lead with the count. Large number, centered, bold: "3 Pelanggaran Ditemukan" in a full-width banner before the individual violation cards. The number should be large enough to scan from a distance. Currently violations are listed immediately without a summary moment.

4. For V06 (UMK violation = illegal wages), add a pulsing red border on the violation card. The pulse-soft animation already exists — apply it to the border. V06 is the most serious violation; it needs to look different from V01 (rounding error).

5. Add a "Bagikan Hasil" (Share Result) button on every verdict. Opens a pre-filled WhatsApp link: `https://wa.me/?text=Saya baru cek slip gaji di cekwajar.id — [verdict]. Cek slip gaji kamu juga di cekwajar.id`. No image generation needed. This is your primary viral loop and it's 5 lines of code.

6. After SESUAI verdict: cross-sell immediately. "Slip gajimu benar ✓ — Apakah gajinya juga wajar di pasaran?" → Wajar Gaji CTA. After PELANGGARAN verdict: "Temukan juga standar gaji di posisimu untuk referensi saat negosiasi." → Wajar Gaji CTA. One `<Link>` per verdict state.

---

## Perspective 8: Conversion Design (Free → Paid)

**Problem:** The PremiumGate uses blur + overlay + lock icon + "Upgrade" button. This is the standard pattern and it works, but it's not maximizing conversion at IDR 29K/month. The pricing page looks like a generic SaaS template. At this price point, the barrier is perceived value, not price.

**What the code has:** PremiumGate with `filter blur-sm`, SubscriptionBadge, pricing page with tier comparison table. The upgrade flow goes to Midtrans Snap.

**Fixes:**

1. Change the gate from full-blur to partial-reveal. Instead of blurring everything behind the gate, show the first violation detail clearly and blur only the IDR amounts. User sees: "V02 — PPh21 Tidak Dipotong — Selisih: Rp ██.███ / bulan" where the number is covered by a block. The user knows the number exists — they just can't read it. This psychological tension drives upgrades better than "you have hidden content."

2. Personalize every gate message. Instead of "Upgrade untuk akses fitur lengkap," use data from the current audit: "Upgrade untuk lihat selisih PPh21 dan berapa yang seharusnya dipotong bulan ini." The gate message must be specific to what THIS user's audit found.

3. On the pricing page, lead with the outcome not the feature list. Current pattern: Feature list comparison table. Better pattern: Hero headline = "Cari tahu persis berapa yang kurang dibayar perusahaanmu." Then the feature table below as supporting detail.

4. Add a "Lihat contoh hasil lengkap" (See full example result) link on the pricing page. Opens a modal with a sample paid result showing all the data that's normally gated. Users should know exactly what they're buying before they pay.

5. Post-payment: add a full-screen success moment after Midtrans redirects back. A dedicated `/upgrade/success` page with: large checkmark animation, "Paket Basic Aktif! 🎉", and an immediate CTA to re-run the audit they were in the middle of. Don't just redirect to dashboard — return the user to their interrupted journey.

6. For the IDR 29K price: add a value framing line below the price. "Kalau selisih PPh21 kamu Rp 50K/bulan, BEP-nya 2 minggu." This is honest math and makes the price feel like an investment with ROI, not a cost.

---

## Perspective 9: Copy & Voice

**Problem:** The current copy is functional Bahasa Indonesia — accurate but emotionally flat. Error messages are informational. Loading states say "Menghitung...". The entire app communicates like a government tax portal. The target users (24–32 year olds from TikTok) expect tools with personality.

**What the code has:** Indonesian error messages, loading states, violation descriptions. No defined brand voice guide.

**Fixes:**

1. Define the voice in a comment at the top of a new `src/lib/copy.ts` constants file: **Teman finansial yang tahu hukum. Berpihak pada karyawan. Bicara seperti teman pintar, bukan portal pemerintah.** Every string touched afterward should pass this test.

2. Update loading states:
   - "Menghitung..." → "Lagi ngitung PPh21 kamu... ⚡"
   - "Memuat data..." → "Ambil data dari database... 🗺️"
   - "Menganalisis..." → "AI lagi baca slip gaji kamu..."

3. Update error messages from informational to action-oriented:
   - "Kota tidak ditemukan" → "Kota ini belum ada di database UMK kami. Coba kota terdekat?"
   - "Nilai tidak valid" → "Angka ini keliatan kurang pas — coba cek lagi?"
   - "Gagal mengunggah" → "Upload gagal. File terlalu besar atau bukan gambar? Coba lagi."

4. Update violation descriptions to be advocacy-forward, not neutral:
   - "PPh21 tidak dipotong sesuai regulasi" → "HRD kamu tidak motong PPh21 bulan ini. Ini artinya kamu yang bayar lebih besar di akhir tahun — bukan perusahaan."
   - "JP tidak dipotong" → "Jaminan Pensiun kamu tidak dipotong. Hak BPJS-mu tidak terpenuhi bulan ini."

5. Verdict copy:
   - SESUAI: "Slip gaji kamu 100% sesuai regulasi ✓ — HRD-mu taat aturan." (positive framing — good for sharing)
   - PELANGGARAN: "Ada [N] temuan di slip gajimu. Kamu berhak tahu ini." (empowering, not alarmist)

6. The Kontak/About page should open with a founder paragraph, not a company description. Written in first person. This is not just a UX choice — in the Indonesian market, the founder's story IS the trust signal.

---

## Perspective 10: Data Visualization

**Problem:** All data visualizations are basic: a div with colored background sections for the salary bar, text with numbers for property comparison, percentages for COL differences. The data is rich — the presentation is not. A user who sees "Gajimu di P38" as text versus as a visual percentile bar has a completely different emotional experience.

**What the code has:** PropertyPriceBar component (exists but implementation TBD), PremiumGate wrapping most visualizations. Recharts is available as a dependency.

**Fixes:**

1. **Wajar Gaji salary bar** — upgrade from plain div to an SVG-based percentile bar. Three zones: P25–P75 in emerald (the "wajar" zone), below P25 in red, above P75 in blue. User's salary marked with a circle and arrow label. Animate the marker sliding into position using a CSS translate transition (0.8s ease-out). This is one component, ~60 lines.

2. **Wajar Tanah property bar** — horizontal bar showing P25–P50–P75 with the user's price marked. Color coding: below P25 = green MURAH, P25–P75 = blue WAJAR, P75–P75+1.5IQR = orange MAHAL, above = red SANGAT MAHAL. Already has the VerdictBadge component — the bar makes the verdict visual, not just textual.

3. **Wajar Hidup COL comparison** — two stacked bars side by side (fromCity vs toCity) colored by category. Use Recharts `BarChart` with 10 category segments. Free users see the total bars only. Paid users see the category breakdown. This is 40 lines of Recharts.

4. **Wajar Kabur purchasing power** — don't just show "Rp 8.5M = SGD 730 nominal / SGD 450 PPP." Show a "basket comparison": what the IDR salary buys in Jakarta (months of avg rent, meals, transport) vs what the foreign salary buys in the target city. Even rough estimates from static data make PPP tangible. This is content, not just a chart — 3–4 bullet points per city.

5. **Wajar Slip violation visualization** — a simplified payslip diagram (3 rows: Gaji Pokok, Tunjangan, Potongan) with violation indicators (red ⚠️ badges) pointing at specific line items. This mirrors the physical payslip experience and makes it immediately clear which line is wrong. One SVG component, works with any violation combination.

6. **Accessibility:** All charts must include `aria-label` attributes and text alternatives. Color-blind users (8% of males) can't distinguish red/green — add pattern fills or icon encoding as secondary signals alongside color.

---

## Implementation Priority

### Do Now (1–2 days, minimal code):
- Trust badge row above each form (4 icons, 20 lines)
- Loading state copy upgrades (find-and-replace strings)
- Violation description copy (more advocacy-forward)
- WhatsApp share button on verdict (5 lines of code)
- Smart form defaults (month, NPWP, year pre-filled)
- Cross-tool suggestions after verdict
- `scale-in` animation on verdict badge (one className)
- City `<Command>` searchable dropdown (replace `<Select>`)
- Homepage hierarchy (Wajar Slip featured, others secondary)

### Do This Week (2–5 days, moderate effort):
- 3-step form wizard for Wajar Slip
- Inline tooltips for all BPJS/PTKP fields
- Tool-specific page tints (hero background per tool)
- Bottom navigation for mobile
- "How it works" section above each form
- Partial-reveal PremiumGate (block numbers, don't blur all)
- Personalized gate message using audit data
- Post-payment success page at `/upgrade/success`
- Founder paragraph on Kontak page

### Do Next Month (higher effort, after validation):
- Animated percentile bar (Wajar Gaji)
- Recharts stacked bar for Wajar Hidup
- Property price bar with zone coloring (Wajar Tanah)
- Payslip audit diagram with violation flags (Wajar Slip)
- Purchasing power basket comparison (Wajar Kabur)
- Real-time audit counter from database
- Sample/demo result for onboarding
- Testimonials after beta feedback collected
- Balance scale SVG motif on homepage hero
