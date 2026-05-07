# cekwajar.id — Backend Architecture & Data Flow

> Last audited: 2026-04-27 | Codebase: `cekwajar.id/` directory (latest)
> Live site: https://cekwajarid.vercel.app (PARTIAL deployment — only homepage + /api/health live)

---

## Tech Stack

Next.js 16.2.3 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4 + Supabase (Auth + PostgreSQL + Storage) + Midtrans (payments) + Google Cloud Vision (OCR) + Tesseract.js (client-side fallback) + React Query + Zod validation.

Deployed on Vercel with Supabase PostgreSQL backend. Secrets in Vercel environment variables.

---

## Database Schema (Supabase PostgreSQL)

### Core Tables

**user_profiles** — User accounts and subscription tier tracking.
Columns: id (uuid, PK, linked to auth.users), email, full_name, subscription_tier (free/basic/pro), created_at, updated_at.

**subscriptions** — Active subscriptions managed by payment webhook.
Columns: id, user_id (FK), plan_type (basic/pro), status (active/cancelled/expired), starts_at, ends_at, last_payment_order_id, created_at, updated_at.

**transactions** — Payment records for Midtrans.
Columns: id, user_id (FK), midtrans_order_id (unique), plan_type, billing_period (monthly/annual), gross_amount, status (pending/settlement/expire/cancel/deny), fraud_status, is_webhook_processed (boolean), webhook_received_at, created_at.

### Wajar Slip Tables

**payslip_audits** — Every audit result stored.
Columns: id, user_id, session_id, gross_salary, ptkp_status, city, month_number, year, has_npwp, reported_pph21, reported_jht, reported_jp, reported_jkk, reported_jkm, reported_kesehatan, reported_take_home, calculated_pph21, calculated_jht, calculated_jp, calculated_kesehatan, city_umk, violations (JSONB), verdict (SESUAI/ADA_PELANGGARAN), is_paid_result, subscription_tier_at_time, created_at.

**umk_2026** — UMK (Upah Minimum Kota/Kabupaten) data.
Columns: id, city, province, monthly_minimum_idr, effective_date.

**pph21_ter_rates** — TER bracket lookup table (PMK 168/2023).
Columns: id, category (A/B/C), min_salary, max_salary, monthly_rate_percent.

**bpjs_rates** — BPJS contribution rates and caps.
Columns: id, component (JHT/JP/JKK/JKM/KESEHATAN), party (employee/employer), rate_percent, salary_cap_idr, notes.

**ocr_quota_counter** — Global monthly Google Vision usage.
Columns: month_key (YYYY-MM), month_count, updated_at.

### Wajar Gaji Tables

**job_categories** — Normalized job titles.
Columns: id, title, industry, is_active.

**salary_benchmarks** — Benchmark data per city/province/experience.
Columns: id, job_category_id (FK), city, province, experience_bucket (0-2/3-5/6-10/10+), data_source (bps/crowdsource/survey), sample_count, p25, p50, p75, updated_at.

**salary_submissions** — Crowdsourced salary data.
Columns: id, job_category_id (FK), job_title_raw, city, province, gross_salary, experience_bucket, industry, submission_fingerprint (SHA256), is_validated, is_outlier, submission_date.

### Wajar Tanah Tables

**property_benchmarks** — Property price reference data.
Columns: id, province, city, district, property_type (RUMAH/TANAH/APARTEMEN/RUKO), price_per_sqm, land_area_sqm, source, is_outlier.

### Wajar Hidup (COL) Tables

**col_indices** — Cost of Living index per city.
Columns: id, city_code, city_name, province, col_index (float), data_year, data_quarter.

**col_categories** — Category weights by lifestyle.
Columns: id, category_code, label_id, hemat_weight, standar_weight, nyaman_weight.

### Wajar Kabur (PPP) Tables

**ppp_reference** — PPP factor data from World Bank.
Columns: id, country_code, country_name, currency_code, currency_symbol, flag_emoji, ppp_factor, ppp_year, is_free_tier (boolean), display_order, fetched_at.

### Legal/Compliance Tables

**user_consents** — GDPR/UU PDP consent tracking.
Columns: id, user_id, policy_version, privacy_policy_accepted, terms_accepted, marketing_accepted, accepted_at, ip_hash.

### Database Functions (RPC)

`search_job_categories_fuzzy(search_term text, threshold float)` — pg_trgm fuzzy matching for job title autocomplete. Returns ranked matches above threshold.

`get_property_benchmark_stats(p_province, p_city, p_district, p_property_type, p_size_band)` — Returns P25/P50/P75 statistics for property benchmarks at district or city level.

`increment_ocr_counter()` — Atomically increments the monthly OCR quota counter.

---

## API Routes (18 endpoints)

### Authentication

**GET /api/auth/me** — Returns current user tier, email, full_name. No auth required (returns null/free for unauthenticated). Calls: user_profiles table.

### Payslip Audit (Core Engine)

**POST /api/audit-payslip** — The main slip audit engine.
- Input: grossSalary (500K–1B), ptkpStatus, city, monthNumber, year, hasNPWP, reportedDeductions (pph21, jht, jp, jkk, jkm, kesehatan, takeHome), sessionId, ocrSource, payslipFilePath.
- Rate limit: 5 requests/hour per IP (in-memory Map — NOT persistent across restarts).
- Flow: (1) Fetch UMK from umk_2026 via ilike city match → (2) Lookup TER rate from pph21_ter_rates for PTKP category + gross → (3) Calculate PPh21 monthly (TER method) or December true-up (progressive Pasal 17) → (4) Calculate all BPJS components with caps → (5) Run violation detection V01–V07 → (6) Gate IDR details for free tier → (7) Insert to payslip_audits.
- Output: verdict (SESUAI/ADA_PELANGGARAN), violations[], gated calculations, upsell message.

### OCR Pipeline

**GET /api/ocr/quota** — Returns monthly Google Vision usage count, available source. Reads: ocr_quota_counter.

**POST /api/ocr/upload** — File upload + OCR extraction.
- Input: FormData (file: JPEG/PNG/WebP/PDF, max 5MB), sessionId.
- Flow: (1) Upload to Supabase Storage (payslips/{userId}/{uuid}.ext) → (2) Check quota (limit: 950/month) → (3) If available, call Google Vision DOCUMENT_TEXT_DETECTION → (4) Extract fields via regex patterns → (5) Calculate per-field confidence → (6) Route decision: AUTO_ACCEPT (≥92%), SOFT_CHECK (80–92%), MANUAL_REQUIRED (<80%).
- Fallback: Quota exceeded → returns tesseract flag for client-side processing.

### City & Location Data

**GET /api/cities** — All UMK cities + provinces. Cached 24h via Cache-Control headers. Reads: umk_2026.

**GET /api/col/cities** — COL comparison cities. Reads: col_indices.

**GET /api/property/districts** — Districts for a given province+city. Reads: property_benchmarks (distinct districts).

### Salary Benchmarking

**GET /api/salary/benchmark-search** — Job title autocomplete with exact + fuzzy matching. Calls: search_job_categories_fuzzy RPC.

**GET /api/salary/benchmark** — Main salary benchmark engine.
- Input: jobTitle, city, province, experienceBucket, userSalary (optional).
- Flow: (1) Normalize job title via fuzzy match → (2) Query salary_benchmarks for city-level data → (3) If samples ≥30: CITY_LEVEL, <30: CITY_LEVEL_LIMITED → (4) Apply Bayesian blending: `blended = weight × sampleP50 + (1-weight) × bpsPriorP50` where `weight = n/(n+15)` → (5) Fallback: Province level → BPS prior only → (6) Get UMK for city → (7) Compare userSalary if provided.
- Output: matchedTitle, dataTier, P25/P50/P75, sampleCount, blendWeight.

**POST /api/salary/submit** — Crowdsource salary data submission.
- Validation: Normalize title, create fingerprint SHA256(IP:jobTitle:city:salaryBucket)[:16], check 24h duplicate, check outlier (0.5x–30x UMK).
- Writes: salary_submissions.

### Property Valuation

**GET /api/property/benchmark** — Property price verdict.
- Input: province, city, district, propertyType, landAreaSqm, askingPriceTotal.
- Flow: Calculate price/sqm → Query get_property_benchmark_stats RPC → IQR verdict calculation → Estimate percentile.
- IQR Thresholds: MURAH (< P25−0.5×IQR), WAJAR (P25−0.5×IQR to P75), MAHAL (P75 to P75+1.5×IQR), SANGAT_MAHAL (> P75+1.5×IQR).
- Output: verdict, percentile (5–99), P25/P50/P75, sampleCount, KJPP disclaimer.

### Cost of Living Comparison

**GET /api/col/compare** — City-to-city COL adjustment.
- Input: fromCity, toCity, currentSalary, lifestyleTier (HEMAT/STANDAR/NYAMAN).
- Flow: Fetch COL indices → baselineRatio = toIndex/fromIndex → lifestyleMultiplier (HEMAT=0.70, STANDAR=1.00, NYAMAN=1.30) → adjustedRatio = 1 + (ratio−1) × multiplier → requiredSalary = currentSalary × adjustedRatio.
- Output: requiredSalary, difference, verdict (LEBIH_MURAH/SAMA/LEBIH_MAHAL), percentChange, categoryBreakdown.

### International PPP Comparison

**GET /api/abroad/compare** — PPP-based salary comparison.
- Input: currentIDRSalary, targetCountry, offerSalary (optional), tier.
- Flow: Check free tier gating → Fetch PPP factors (World Bank, cached 30 days in DB) → Get exchange rate (Frankfurter.app, cached 24h in memory) → Calculate nominal equivalent + purchasing power ratio.
- Output: PPP comparison, nominal equivalent, real ratio, isPPPBetter.

**GET /api/abroad/countries** — List countries from ppp_reference with free tier flags.

### Payments

**POST /api/payment/create-transaction** — Initiate Midtrans payment.
- Pricing: Basic 29K/mo or 278.4K/yr, Pro 79K/mo or 758.4K/yr.
- Flow: Generate order ID (CW-{userId[:8]}-{timestamp}-{plan}-{period}) → Insert to transactions → Call Midtrans Snap API → Return snapToken.
- Payment methods: GoPay, ShopeePay, DANA, OVO, BCA/BNI/BRI VA, Mandiri Bill, Indomaret, Alfamart, credit card.

**POST /api/webhooks/midtrans** — Payment settlement webhook.
- Security: HMAC-SHA512 signature verification: SHA512(order_id + status_code + gross_amount + serverKey).
- Flow: Verify signature → Find transaction → Verify amount → Idempotency check → On settlement: Upsert subscriptions, update user_profiles.subscription_tier, send confirmation email (Resend).

### Health & Stats

**GET /api/health** — Returns `{"status":"ok","timestamp":"..."}`. Checks DB connectivity, Vision quota, Midtrans mode.

**GET /api/stats/audit-count** — Payslip audits in last 7 days, cached 5 min.

---

## External Services Integration

| Service | Purpose | Auth Method | Endpoint | Caching |
|---|---|---|---|---|
| Supabase | DB + Auth + Storage + RLS | Service Role Key | https://{project}.supabase.co | N/A |
| Google Cloud Vision | Payslip OCR | API Key | https://vision.googleapis.com/v1/images:annotate | 950/month quota |
| Midtrans | Payment gateway (Indonesia) | Server Key (Basic auth) | Sandbox: app.sandbox.midtrans.com | N/A |
| World Bank | PPP reference data | None (free API) | https://api.worldbank.org/v2/country/ | 30 days in DB |
| Frankfurter | Exchange rates | None (free API) | https://api.frankfurter.app/latest | 24h in-memory Map |
| Resend | Confirmation emails | API Key | resend.emails.send | N/A |
| Sentry | Error tracking | DSN | via SDK | N/A |

---

## Authentication & Authorization Flow

1. User signs up via Supabase Auth (Google OAuth or email/password).
2. On signup, a row is created in user_profiles with subscription_tier = 'free'.
3. Middleware (src/middleware.ts) refreshes Supabase session on every request.
4. Protected routes: /dashboard redirects unauthenticated users to /auth/login.
5. API routes call getCurrentUser() which queries user_profiles.subscription_tier.
6. Tier gating happens at API level: free users get null IDR amounts, limited countries, province-only salary data.

Tier permissions:
- free: 3 audits/day, no IDR violation details, province-level salary only, 3 free PPP countries.
- basic (29K/mo): Unlimited audits, full IDR details, city-level P25/P75, 20 COL cities, 15 PPP countries.
- pro (79K/mo): All basic features + 50 PPP countries + priority support.

---

## Security Architecture

- Zod schema validation on all API inputs (strict min/max, enum enforcement).
- In-memory rate limiting on audit-payslip (5/hr per IP) — needs persistent KV for production.
- File type + size validation on OCR upload (5MB, JPEG/PNG/WebP/PDF only).
- Midtrans webhook HMAC-SHA512 signature verification before any DB mutation.
- Supabase Row-Level Security (RLS) on sensitive tables.
- Service role client isolated to webhook handlers only.
- Salary submission fingerprinting (SHA256 of IP+title+city+bucket) prevents spam.
- Security headers in next.config.ts: HSTS, CSP, X-Frame-Options, X-Content-Type-Options.
- CSP whitelist: Midtrans, Google Vision, Supabase, Frankfurter, CDN.

---

## Deployment Architecture

```
User Browser
    ↓
Vercel Edge Network (CDN + SSR)
    ↓
Next.js App Router (API Routes + Server Components)
    ↓
┌─────────────────────────────────────────┐
│  Supabase (ap-southeast-1 REQUIRED)     │
│  ├─ PostgreSQL (all tables + RPC)       │
│  ├─ Auth (sessions, OAuth)              │
│  ├─ Storage (payslip file uploads)      │
│  └─ RLS (row-level security)            │
└─────────────────────────────────────────┘
    ↓
External APIs: Vision, Midtrans, WorldBank, Frankfurter, Resend
```

---

## Caching Strategy

| Resource | Method | TTL | Notes |
|---|---|---|---|
| /api/cities | HTTP Cache-Control | 24h + 1h stale-while-revalidate | UMK data changes annually |
| World Bank PPP | DB (ppp_reference.fetched_at) | 30 days | Fallback to cached on API failure |
| Exchange rates | In-memory Map | 24h | Keyed by currency pair |
| OCR quota | DB (ocr_quota_counter) | Per-month atomic increment | Global, not per-user |
| /api/stats/audit-count | Server cache | 5 min | Landing page social proof |

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_VISION_API_KEY
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
MIDTRANS_IS_PRODUCTION (true/false)
RESEND_API_KEY
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_APP_URL
```
