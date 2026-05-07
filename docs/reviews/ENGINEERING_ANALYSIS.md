# cekwajar.id — Principal Engineering Analysis

**Author**: Engineering Analysis (automated)  
**Date**: 2026-05-07  
**Repo Commit Scope**: Full `slip_cekwajar_id/` subtree  
**Stack**: Next.js 14.2.5 / React 18.3.1 / TypeScript 5.5.4 / Supabase / Midtrans / OpenRouter / Groq

---

## FEATURE 1: WAJAR SLIP (Payslip Audit Engine)

### 1.1 Product Intent & Problem Domain

Wajar Slip solves a critical information asymmetry in Indonesian employment: most employees cannot verify whether their payslip deductions (PPh21, BPJS Kesehatan, JHT, JP, JKK, JKM) are correctly calculated. Employers routinely make errors — sometimes inadvertent (wrong TER category, stale JP cap), sometimes predatory (deducting employer-portion JKK/JKM from employees, which is explicitly illegal under PP 44/2015).

The feature performs a full statutory audit of a single month's payslip against PMK 168/2023 (TER-based PPh21), PP 44/2015 + Perpres 59/2024 (BPJS Ketenagakerjaan), and Perpres 82/2018 (BPJS Kesehatan). It produces a verdict (WAJAR / PERLU_DICEK / TIDAK_WAJAR on client-side; WAJAR / ADA_YANG_ANEH / POTONGAN_SALAH on server-side) with per-component breakdowns showing expected vs. actual values and the delta.

The privacy-first architecture performs all calculations client-side via `calculateSlip()` — no data leaves the browser for the primary flow. A secondary server-side path exists (`POST /api/slip/audit`) that persists results to Supabase for the premium content paywall (objection letter + WhatsApp templates generated via Groq).

### 1.2 User Flow & UX Architecture

**Step 1 — Input Collection** (`app/slip/page.tsx`):
Two-step animated form (Framer Motion transitions). Step 1 collects: gaji_pokok, tunjangan array, status_ptkp (TK/0 through K/3), masa_kerja_bulan. Step 2 collects: actual deductions from the slip (pph21_actual, bpjs_kes_actual, jht_actual, jp_actual, optional jkk_actual, jkm_actual). December mode (detected via `isDecemberInput()`) expands Step 1 with: total_penghasilan_bruto_setahun, total_pph_dipotong_jan_nov.

**Step 2 — Client Calculation**: `calculateSlip()` runs entirely in-browser. Returns `SlipCalculationResult` with per-component expected values, deltas, verdict, and explanation strings.

**Step 3 — Verdict Display** (`components/VerdictCard.tsx`): Color-coded card (green/yellow/red) with breakdown table, legal basis citations, collapsible regulation source links, and html2canvas screenshot sharing.

**Step 4 — Optional Server Audit** (via `hooks/useAudit.ts`): If user wants premium content, the audit is submitted server-side. Rate-limited to 10/hour/IP. JWT parsed manually for user_id binding.

**Step 5 — Premium Unlock** (`hooks/usePayment.ts`): Midtrans Snap.js popup, Rp 20,000 fixed price, 24h expiry. On webhook confirmation, premium_unlocked flag set, enabling Groq-generated objection letter and WhatsApp templates.

**Step 6 — Result Page** (`app/slip/result/[auditId]/page.tsx`): Server-rendered. Shows 1 issue free, rest paywalled. If premium_unlocked, calls `generatePremiumTexts()` (Groq Llama 3.3 70B) for surat keberatan + 3 WA templates.

### 1.3 Calculation Engine Deep-Dive

**File**: `lib/pph21-ter.ts` (client-side primary engine)

**TER Rate Resolution**:
1. `getTERCategory(status_ptkp, has_npwp)` maps PTKP status to TER_A/TER_B/TER_C per PMK 168/2023 Lampiran.
2. `getTERRate(category, gross_monthly)` performs binary-bounded linear scan on the rate table (44/40/41 slabs for A/B/C respectively). All slabs are fully populated in `lib/regulations.ts` — there are no stubs.
3. Expected PPh21 = gross_monthly * TER rate (non-December).

**December Annual Reconciliation**:
```
total_bruto_annual = total_penghasilan_bruto_setahun (user-provided, includes Dec)
biaya_jabatan = min(total_bruto_annual * 0.05, 6_000_000)
netto_annual = total_bruto_annual - biaya_jabatan
pkp = netto_annual - ptkp_annual
pph21_annual = applyPasal17(pkp)  // Progressive: 5%/15%/25%/30%/35%
pph21_december = pph21_annual - total_pph_dipotong_jan_nov
```
The engine detects if the employer omitted biaya jabatan (a common error that inflates December tax).

**JP Cap Boundary Logic** (`getJpCap(year, month)`):
- January-February: uses previous year's cap (10,547,400 for 2025)
- March onwards: uses current year's cap (11,086,300 for 2026)
- This implements the March boundary rule from SE BPJS B/1226/022026

**BPJS Calculations**:
- Kesehatan: 5% of gross (1% employee, 4% employer), capped at salary ceiling 12,000,000
- JHT: 5.7% total (2% employee, 3.7% employer)
- JP: 3% total (1% employee, 2% employer), subject to JP cap
- JKK: 0.24%-1.74% (employer-only, rate depends on risk class)
- JKM: 0.3% (employer-only)

**Illegality Detection**: If jkk_actual > 0 or jkm_actual > 0 in employee deductions, verdict is immediately TIDAK_WAJAR with legal basis PP 44/2015 Pasal 19.

**File**: `lib/slip/audit.ts` (server-side secondary engine)

Uses different verdict taxonomy (WAJAR/ADA_YANG_ANEH/POTONGAN_SALAH) and tolerance system:
- Delta <= 10,000: WAJAR
- 10,000 < Delta <= 50,000: ADA_YANG_ANEH
- Delta > 50,000: POTONGAN_SALAH

Critical difference: `getJpCapForAudit()` uses `new Date().getFullYear()` rather than accepting tax_year as parameter. This means auditing historical slips will use the wrong JP cap. This is a known architectural debt.

### 1.4 Data Model & Schema

**Database**: Supabase PostgreSQL with RLS (`supabase/migrations/001_wajar_slip.sql`)

**Tables**:

`pph21_ter_rates`: category (A/B/C), lower_bound, upper_bound, rate, effective_from, effective_to. Seeded with all 125 slabs.

`bpjs_rules`: rule_type (kes/jht/jp/jkk/jkm), component (employee/employer/cap), value, effective_from, effective_to. Note: JP cap seed value is 10,547,400 (2025 cap) — the code-level constant (11,086,300) overrides this, meaning the DB is stale and unused for JP cap lookups at runtime.

`slip_audits`: id (uuid), user_id (nullable, FK auth.users), input_data (jsonb), result (jsonb), verdict, issues (jsonb[]), premium_unlocked (boolean), created_at. RLS: owner can read own rows, service_role can insert.

`premium_unlocks`: id (uuid), audit_id (FK slip_audits), order_id (Midtrans ref), amount, status (pending/success/failed/expired), snap_token, created_at, updated_at. RLS: owner-based read.

**Views**: `v_current_ter_rates` (filters by effective_from/to), `v_current_bpjs_rules` (same temporal filter).

**Function**: `get_current_ter_rate(p_category, p_gross)` — PL/pgSQL function that performs the rate lookup server-side. Currently unused by application code (the app uses in-memory constants from regulations.ts).

### 1.5 Ingestion Pipeline (OCR)

**File**: `lib/slip/ocr.ts`

**Model**: OpenRouter API → `anthropic/claude-3.5-sonnet` (vision-capable)

**Flow**:
1. User uploads image via `POST /api/slip/ocr` (FormData, max 5MB, JPEG/PNG/PDF)
2. File stored in Supabase Storage bucket with 24h TTL metadata
3. `extractSlipData()` sends base64 image to OpenRouter with structured extraction prompt
4. LLM returns JSON matching `OcrExtractedData` shape: gaji_pokok, tunjangan[], potongan_pph21, potongan_bpjs_kes, potongan_jht, potongan_jp, potongan_jkk, potongan_jkm, company_name, employee_name, period
5. Each field has confidence score (0.0-1.0); fields below 0.8 threshold are flagged for manual review
6. Function never throws — returns default empty object on any error (resilient design for UX)

**Limitation**: No PDF text extraction fallback. PDF is sent as image (first page only), losing multi-page slips entirely. No preprocessing (rotation, deskew, contrast enhancement).

### 1.6 API Surface

| Endpoint | Method | Auth | Rate Limit | Purpose |
|----------|--------|------|------------|---------|
| `/api/slip/audit` | POST | Optional JWT | 10/hr/IP | Persist audit to DB |
| `/api/slip/ocr` | POST | Required JWT | Inherited | Extract slip data from image |
| `/api/payment/create-transaction` | POST | Required JWT | None | Create Midtrans Snap token |
| `/api/payment/notify` | POST | Midtrans signature | None | Webhook for payment status |

**Rate Limiting**: In-memory Map keyed by IP. Not distributed — breaks on multi-instance deployment. No Redis, no edge middleware rate limiting.

**Auth**: Manual JWT parsing via `jose` library. No middleware — each route handler repeats the pattern. No refresh token handling at API layer.

### 1.7 Validation & Edge Cases

**Input Validation** (`validateSlipInput()` in pph21-ter.ts):
- All monetary values must be >= 0 and finite
- status_ptkp must be valid enum member
- masa_kerja_bulan must be 1-12
- December fields required only when month === 12
- No Zod at calculation layer (Zod v4 used only in form schema via React Hook Form)

**Known Edge Cases**:
1. **Dual verdict systems**: Client returns WAJAR/PERLU_DICEK/TIDAK_WAJAR; server returns WAJAR/ADA_YANG_ANEH/POTONGAN_SALAH. No mapping exists between them. A PERLU_DICEK result on client becomes ADA_YANG_ANEH on server with different threshold logic.
2. **JP cap year mismatch**: Server audit uses current year from system clock, not the pay period year. Auditing a December 2025 slip in January 2026 would apply 2026 caps incorrectly.
3. **Pro-rata not handled**: Employee who joined mid-month gets full-month calculation. No partial-period logic exists.
4. **Multiple employer scenario**: No support for employees with >1 income source (which changes TER category per PMK 168/2023 Pasal 5).
5. **Non-taxable threshold**: No handling for gross below PTKP threshold (should result in 0% TER but code returns lowest bracket rate).

### 1.8 Tests & Telemetry

**Test Files**: `__tests__/audit.test.ts`, `lib/__tests__/pph21-ter.test.ts`

**Coverage Areas**:
- TER rate lookup correctness for all three categories
- JP cap March boundary (test expects 11,004,000 for month=3 but code returns 11,086,300 — **this test will FAIL**)
- BPJS calculation accuracy
- December reconciliation with biaya jabatan
- JKK/JKM illegality detection
- Verdict threshold boundaries

**Missing Test Coverage**:
- OCR extraction (no mocks for OpenRouter)
- Payment webhook signature verification
- Rate limiting behavior
- RLS policy enforcement
- Concurrent access patterns
- December edge case: total_pph_jan_nov exceeds annual liability (should result in refund/negative December PPh21)

**Telemetry**: None. No analytics, no error tracking (no Sentry), no performance monitoring. Client-side errors are silently caught. Server errors return generic 500s with no correlation IDs.

### 1.9 Feature Backlog (Inferred from Code Comments & Architecture)

1. **OCR accuracy improvement**: Add preprocessing pipeline (OpenCV deskew, contrast normalization) before LLM call
2. **PDF multi-page support**: Extract all pages, not just first
3. **Historical audit trail**: Allow user to track slips month-over-month and detect patterns
4. **Distributed rate limiting**: Replace in-memory Map with Redis or Upstash
5. **Unified verdict taxonomy**: Reconcile client/server verdict types into single system
6. **BPJS Kesehatan family tier**: Current code assumes single-person; family tiers (Grade 1/2/3) have different ceilings
7. **THR audit**: Tunjangan Hari Raya calculation verification (separate regulation)
8. **Notification on regulation change**: Alert users when TER tables or BPJS caps update
9. **Bulk slip upload**: Audit 12 months at once with annual reconciliation
10. **Export to PDF**: Generate formal audit report document

### 1.10 Implementation Roadmap

**Phase 1 (Current — Shipped)**:
- Single-month client-side audit with full TER/BPJS engine
- OCR-assisted input via Claude 3.5 Sonnet
- Premium paywall with Midtrans (objection letter + WA templates via Groq)
- Privacy-first: no server call for core calculation

**Phase 2 (Next)**:
- Fix JP cap year parameter bug in server audit
- Unify verdict taxonomy (client/server)
- Add Redis-backed rate limiting
- Implement proper error tracking (Sentry)
- Add analytics (PostHog or Mixpanel)

**Phase 3 (Growth)**:
- Multi-month batch upload with annual reconciliation
- Historical trend dashboard
- THR verification module
- Push notifications for regulation updates

---

## FEATURE 2: WAJAR GAJI (Salary Fairness Benchmarking)

### 2.1 Product Intent & Problem Domain

Wajar Gaji addresses the "am I being paid fairly?" question by benchmarking a user's total compensation against market data segmented by role, experience, industry, and geography within Indonesia. Unlike Wajar Slip (which verifies deduction correctness), Wajar Gaji evaluates whether the gross compensation itself is market-competitive.

**Implementation Status: NO CODE EXISTS.** The entire analysis below is based on the architectural intent described in the project brief and extrapolated from the existing Wajar Slip infrastructure.

### 2.2 User Flow (Designed, Not Implemented)

1. User inputs: job_title, years_of_experience, industry, city/region, education_level, company_size
2. Optional: upload offer letter for extraction
3. System returns: percentile placement (P25/P50/P75/P90), verdict (UNDERPAID/FAIR/ABOVE_MARKET), comparable roles, and suggested negotiation points

### 2.3 Calculation Engine (Proposed)

No calculation engine exists. The intended approach would likely:
- Source salary data from aggregated user submissions (crowd-sourced)
- Apply statistical normalization by region (Jakarta multiplier vs. Surabaya vs. Tier-3 cities)
- Use percentile bands rather than point estimates
- Account for total compensation (base + allowances + bonuses) vs. base-only comparisons

### 2.4 Data Model (Proposed)

No schema exists. Would require:
- `salary_submissions` table (anonymized crowd-sourced data)
- `market_benchmarks` table (curated/purchased data from sources like Kelly Services, Mercer, or Jobstreet aggregates)
- `industry_classifications` reference table (KBLI codes)
- `region_multipliers` for geographic normalization

### 2.5 Ingestion Pipeline

No implementation. Would need:
- Crowd-sourced submission flow with validation (outlier detection, duplicate prevention)
- Potential partnership with job platforms for aggregated anonymized data
- Periodic refresh cadence (quarterly minimum for market data)

### 2.6 API Surface

Not implemented. Expected endpoints:
- `POST /api/gaji/benchmark` — Submit salary for benchmarking
- `POST /api/gaji/submit` — Contribute anonymized salary data
- `GET /api/gaji/industries` — List available industry segments

### 2.7 Validation & Edge Cases

Not implemented. Key challenges:
- Self-reported salary data is notoriously unreliable (inflation bias ~15-20%)
- Currency of data: Indonesian salary inflation runs 5-8% annually; stale data quickly becomes useless
- Role title normalization: "Software Engineer" vs "Programmer" vs "Developer" are equivalent but would segment incorrectly without NLP normalization
- Contract vs. permanent employee comparison validity
- Regional cost-of-living adjustment methodology

### 2.8 Tests & Telemetry

None exist. Would need:
- Statistical validity tests for small sample sizes per segment
- Outlier detection test suite
- Regional multiplier accuracy validation

### 2.9 Feature Backlog

1. Build initial crowd-sourced data collection MVP
2. Partner with job platform for baseline data
3. Implement anonymization pipeline (k-anonymity minimum)
4. Role title NLP normalization
5. Compensation trend tracking (year-over-year)
6. Integration with Wajar Slip (auto-populate from audited slips)

### 2.10 Implementation Roadmap

**Phase 0**: No code exists. Requires full greenfield build.
**Phase 1**: Data collection MVP — crowd-sourced submissions with basic percentile output
**Phase 2**: Statistical rigor — outlier detection, confidence intervals, minimum sample thresholds
**Phase 3**: Partnership integrations for enriched market data

---

## FEATURE 3: WAJAR TANAH (Land/Property Price Fairness)

### 3.1 Product Intent & Problem Domain

Wajar Tanah evaluates whether a land or property asking price is fair relative to NJOP (Nilai Jual Objek Pajak — government-assessed property tax value), recent comparable transactions, and location-specific market dynamics. Indonesia's property market is opaque; NJOP is public but often 30-70% below market value, and transaction data is fragmented across notaris offices with no centralized MLS equivalent.

**Implementation Status: NO CODE EXISTS.**

### 3.2 User Flow (Designed, Not Implemented)

1. User inputs: location (kecamatan/kelurahan level), land_area_m2, building_area_m2 (optional), asking_price, property_type (tanah_kosong/rumah/ruko/apartemen)
2. Optional: input NOP (Nomor Objek Pajak) for automatic NJOP lookup
3. System returns: NJOP reference value, market price estimate with confidence band, comparable transactions, verdict (WAJAR/KEMAHALAN/MURAH_CURIGA), and red flags (sengketa indicators, flood zone, etc.)

### 3.3 Calculation Engine (Proposed)

No engine exists. Intended methodology:
- NJOP baseline from PBB (Pajak Bumi Bangunan) database per kelurahan
- Market multiplier derived from NJOP-to-transaction ratio in that area (typically 1.5x-4x depending on location tier)
- Comparable transaction analysis (if data available)
- Building depreciation model (usia bangunan, material quality)
- Location premium factors: access road width, proximity to toll/MRT, flood history

### 3.4 Data Model (Proposed)

No schema. Would require:
- `njop_reference` table (scraped/API'd from regional BKD)
- `property_transactions` (crowd-sourced or notaris-partnered)
- `location_factors` (flood zones, infrastructure proximity)
- `building_depreciation_rates` reference

### 3.5 Ingestion Pipeline

Not implemented. Key challenges:
- NJOP data is per-kelurahan and published by each Kabupaten/Kota independently (no national API)
- Transaction data is held by notaris offices and BPN — no public API
- Would likely require: web scraping of regional SPPT PBB sites, crowd-sourced transaction reporting, and potential BPN/ATR partnership

### 3.6 API Surface

Not implemented.

### 3.7 Validation & Edge Cases

- NJOP updates only annually (January) — stale for fast-moving markets
- Strata title (apartemen) vs. freehold (SHM) vs. leasehold (HGB) dramatically affects valuation
- Sengketa (disputed) land has near-zero practical value but may appear normal on paper
- Reclamation/conversion land (sawah to perumahan) has complex zoning legality
- Harga per meter varies 10-100x between Jakarta CBD and rural Java

### 3.8 Tests & Telemetry

None exist.

### 3.9 Feature Backlog

1. NJOP lookup via NOP number (per-region scraper)
2. Crowd-sourced transaction database
3. Flood zone overlay (BNPB data)
4. Sengketa risk indicator (via PTUN case database)
5. Integration with Google Maps for location factor calculation
6. Historical NJOP trend (year-over-year appreciation)

### 3.10 Implementation Roadmap

**Phase 0**: No code exists. Most data-intensive feature — requires significant data partnership or scraping infrastructure.
**Phase 1**: NJOP-based estimation with manual input (no auto-lookup)
**Phase 2**: Location factor enrichment via maps API
**Phase 3**: Transaction database build-out (crowd-sourced + partnerships)

---

## FEATURE 4: WAJAR KABUR (Resignation Feasibility Calculator)

### 4.1 Product Intent & Problem Domain

Wajar Kabur answers "can I afford to quit?" by modeling the financial runway after resignation, accounting for: severance entitlement (if applicable under UU Cipta Kerja / PP 35/2021), BPJS JHT withdrawal eligibility, monthly burn rate, emergency fund adequacy, and job market re-entry timeline estimates by industry/role.

**Implementation Status: NO CODE EXISTS.**

### 4.2 User Flow (Designed, Not Implemented)

1. User inputs: current_salary, monthly_expenses, savings, masa_kerja_tahun, resignation_type (resign/PHK/PKWT_expire), outstanding_debts, dependents_count
2. Optional: JHT balance, investment portfolio value
3. System returns: financial runway in months, severance entitlement calculation, JHT withdrawal timeline and amount, verdict (AMAN_KABUR/PIKIR_LAGI/BELUM_WAKTUNYA), and preparation checklist

### 4.3 Calculation Engine (Proposed)

No engine exists. Would implement:

**Severance Calculation** (PP 35/2021 Pasal 40):
- Uang Pesangon: 0-9 months salary (scaled by masa kerja)
- Uang Penghargaan Masa Kerja (UPMK): 0-10 months (3-year brackets)
- Uang Penggantian Hak: 15% of pesangon + UPMK
- Multiplier depends on reason: PHK = 1x, resign = 0x pesangon but gets UPMK if >3 years

**JHT Withdrawal**:
- Full withdrawal: only after 56 (pensiun), PHK with 1-month waiting, or leaving Indonesia
- 10% partial: for housing (after 10 years membership)
- 30% partial: other purposes (after 10 years)
- Rule changed multiple times (2022-2024 policy oscillations)

**Runway Calculation**:
```
total_liquid = savings + severance_net + jht_withdrawable
monthly_burn = expenses + debt_payments + bpjs_mandiri
runway_months = total_liquid / monthly_burn
```

### 4.4 Data Model (Proposed)

Simpler than other features — primarily computation, minimal persistence:
- `severance_rules` reference table (by reason and masa kerja bracket)
- `runway_simulations` for saved user scenarios (optional persistence)

### 4.5 Ingestion Pipeline

Minimal external data needs. Primarily static regulation data + user inputs. Possible enrichment:
- Average job search duration by industry (from job platform partnerships)
- BPJS JHT balance API (if BPJS provides partner access)

### 4.6 API Surface

Not implemented. Likely client-side only (mirrors Wajar Slip privacy model) with optional server persistence.

### 4.7 Validation & Edge Cases

- PKWT (contract) vs. PKWTT (permanent) have entirely different severance rules
- Masa kerja < 1 year: no pesangon entitlement
- Company bankruptcy: severance becomes unsecured creditor claim (effectively zero)
- Regional UMR as floor for severance calculation base
- Tax on severance (PP 68/2009): progressive 0%/5%/15%/25% on severance brackets
- JHT withdrawal processing time: 2-4 weeks (affects runway start)

### 4.8 Tests & Telemetry

None exist.

### 4.9 Feature Backlog

1. Severance calculator MVP (PP 35/2021 compliant)
2. JHT withdrawal eligibility checker
3. Monthly burn rate questionnaire with category breakdown
4. Job market re-entry timeline estimate
5. "What if" scenario modeling (different resignation timings)
6. Integration with Wajar Slip (auto-populate salary/deductions from audit history)
7. BPJS Mandiri cost projection post-resignation

### 4.10 Implementation Roadmap

**Phase 0**: No code exists.
**Phase 1**: Severance + runway calculator (client-side, mirrors Wajar Slip architecture)
**Phase 2**: JHT eligibility engine with policy version handling
**Phase 3**: Job market data integration for re-entry timeline estimates

---

## FEATURE 5: WAJAR HIDUP (Cost of Living Adequacy)

### 5.1 Product Intent & Problem Domain

Wajar Hidup evaluates whether a salary is adequate for a dignified life in a specific Indonesian city, benchmarked against KHL (Kebutuhan Hidup Layak — the government's "decent living needs" basket of 64 items per Permenaker 18/2022) and actual market prices. It bridges the gap between UMR/UMK (minimum wage) and real cost of living, helping users understand their purchasing power in context.

**Implementation Status: NO CODE EXISTS.**

### 5.2 User Flow (Designed, Not Implemented)

1. User inputs: net_monthly_income (take-home after deductions), city/kabupaten, household_size, housing_status (rent/own/family), transport_mode (motor/public/car)
2. System returns: KHL benchmark for that region, actual cost breakdown by category, surplus/deficit, verdict (LAYAK/PAS_PASAN/KURANG), and optimization suggestions

### 5.3 Calculation Engine (Proposed)

No engine exists. Would implement:

**KHL Basket** (64 items per Permenaker 18/2022):
- 11 food items (beras, protein, sayur, etc.)
- 13 clothing items
- 7 housing items (sewa, listrik, air)
- 10 education items
- 6 health items
- 8 transportation items
- 9 recreation items

**Regional Price Adjustment**:
- BPS (Badan Pusat Statistik) publishes regional price indices
- Jakarta = 100 baseline; other cities indexed relative
- Manual override for known outliers (e.g., Papua logistics premium)

**Adequacy Calculation**:
```
khl_monthly = sum(basket_items * regional_prices) * household_multiplier
adequacy_ratio = net_income / khl_monthly
verdict = ratio >= 1.5 ? LAYAK : ratio >= 1.0 ? PAS_PASAN : KURANG
```

### 5.4 Data Model (Proposed)

- `khl_basket_items` (64 items with unit quantities per Permenaker)
- `regional_prices` (per kabupaten/kota, refreshed quarterly from BPS)
- `umr_history` (UMK/UMP by region and year)
- `inflation_indices` (monthly CPI by region)

### 5.5 Ingestion Pipeline

Most data-pipeline-intensive feature alongside Wajar Tanah:
- BPS publishes monthly price surveys (accessible via BPS API or scraping)
- UMK/UMP announced annually by Governor decree (manual curation or news scraping)
- KHL basket updated periodically by Permenaker revision

### 5.6 API Surface

Not implemented.

### 5.7 Validation & Edge Cases

- KHL is designed for single worker — scaling to household is non-trivial (not linear)
- Housing cost variance: Jakarta rent can be 10-50x of small-city equivalent
- Informal economy workers: irregular income makes monthly comparison misleading
- BPS data publication lag: 1-2 months behind actual prices
- Inflation spikes (e.g., Ramadhan, hari raya) cause seasonal distortion
- Differing standards of "layak" across demographics and expectations

### 5.8 Tests & Telemetry

None exist.

### 5.9 Feature Backlog

1. KHL basket implementation with Permenaker 18/2022 items
2. Regional price database (start with 10 major cities)
3. Household size multiplier model
4. Inflation-adjusted trend tracking
5. UMR adequacy comparison (is UMR actually enough for KHL?)
6. Savings rate projection at current income
7. "What salary do I need?" reverse calculator
8. Integration with Wajar Kabur (post-resignation affordability projection)

### 5.10 Implementation Roadmap

**Phase 0**: No code exists.
**Phase 1**: Static KHL calculator with manual price inputs (user enters their actual spending)
**Phase 2**: BPS price data integration for automatic regional benchmarking
**Phase 3**: Full adequacy dashboard with trend tracking and savings projections

---

## CROSS-FEATURE ALIGNMENT

### Architectural Consistency

All five features share a design philosophy visible in the implemented Wajar Slip:
- **Privacy-first**: Core calculations run client-side. Server involvement only for persistence/premium.
- **Regulation-driven**: Constants extracted to `lib/regulations.ts` pattern (or equivalent per feature).
- **Paywall at insight layer**: Basic verdict is free; actionable output (letters, reports) is premium.
- **Progressive disclosure**: Simple input -> detailed breakdown -> premium content.

### Shared Infrastructure Needs (Not Yet Built)

| Component | Used By | Status |
|-----------|---------|--------|
| Auth (Supabase JWT) | All | Partial (Slip only) |
| Rate limiting (Redis) | All API routes | Not built (in-memory only) |
| Error tracking (Sentry) | All | Not built |
| Analytics (PostHog) | All | Not built |
| Regulation version management | Slip, Gaji, Kabur, Hidup | Partial (metadata in regulations.ts) |
| Regional data pipeline (BPS) | Tanah, Hidup | Not built |
| Crowd-sourced data collection | Gaji, Tanah | Not built |
| PDF generation | Slip (premium), Kabur | Not built |
| Notification system | All (regulation updates) | Not built |

### Verdict Type Unification

Current state (Wajar Slip has TWO systems):
- Client: WAJAR / PERLU_DICEK / TIDAK_WAJAR
- Server: WAJAR / ADA_YANG_ANEH / POTONGAN_SALAH

Proposed unified taxonomy across all features:
- WAJAR (green) — within acceptable bounds
- PERLU_PERHATIAN (yellow) — borderline, worth investigating
- TIDAK_WAJAR (red) — clearly outside acceptable range
- CURIGA (red+flag) — potentially illegal or fraudulent

### Data Flow Architecture

```
[User Input] → [Client Calculation Engine] → [Verdict + Breakdown]
                         ↓ (optional)
              [Server Persist] → [Supabase]
                         ↓ (premium)
              [LLM Generation] → [Groq/OpenRouter] → [Actionable Output]
                         ↓
              [Payment Gate] → [Midtrans] → [Unlock]
```

This pattern repeats for each feature with different calculation engines and LLM prompts.

### Critical Technical Debt (Cross-Feature)

1. **No shared calculation test harness**: Each feature will independently reimplement test patterns
2. **No regulation versioning system**: When BPJS caps change, multiple features need coordinated updates
3. **No feature flag system**: Can't gradually roll out new features or A/B test
4. **No API versioning**: Breaking changes to calculation logic have no migration path
5. **Single-region deployment**: No CDN, no edge compute for latency-sensitive client-side bundles
6. **No CI/CD pipeline visible**: No GitHub Actions, no deployment configuration in repo
7. **Stale DB seed data**: bpjs_rules table has 2025 JP cap while code uses 2026 — DB/code drift will worsen as more features add regulatory data

### Priority Ordering (Recommended Build Sequence)

1. **Wajar Slip** (DONE) — highest immediate user value, validates architecture
2. **Wajar Kabur** — lowest data dependency, pure computation, high emotional resonance
3. **Wajar Gaji** — requires crowd-sourced data (cold start problem), but high demand
4. **Wajar Hidup** — needs BPS data pipeline, moderate complexity
5. **Wajar Tanah** — most data-intensive, requires external partnerships or heavy scraping

---

*End of Engineering Analysis*
