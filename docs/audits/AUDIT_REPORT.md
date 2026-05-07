# cekwajar.id — Principal-Level Backend & Product Audit

**Auditor role:** Principal Backend Architect + Product Delivery Auditor  
**Date:** 2026-05-07  
**Codebase:** `cekwajar.id-main/` (Next.js 16 + React 19 + Supabase + Vercel)  
**Stack confirmed:** Next.js 16.2.3, React 19.2.4, Supabase (Postgres + Auth + Storage), Midtrans payments, Google Vision OCR, Tesseract.js fallback, Sentry monitoring, Vercel KV (Redis), Resend email, Groq AI (surat keberatan)

---

## 1. Product & Architecture Summary

cekwajar.id is an Indonesian consumer fintech platform that audits payslips for compliance (PPh21, BPJS, UMK violations), benchmarks salaries, compares property prices, and provides cost-of-living and abroad-comparison tools. The product handles **sensitive financial and tax data** for Indonesian workers and must be legally defensible under UU PDP No.27/2022.

**Actual architecture (as built):**

Client (React 19 SPA pages) -> Next.js API Routes (Node.js runtime) -> Supabase Postgres (RLS-enabled) -> External APIs (Google Vision, Midtrans, Groq, World Bank/Frankfurter). Auth via Supabase Auth (email + OAuth). File storage via Supabase Storage (`payslips` bucket). Rate limiting via Vercel KV. Error monitoring via Sentry. Email via Resend. Payments via Midtrans Snap.

**Key architectural observations:**
- The app is structured as a monolithic Next.js app with API routes acting as the backend. This is appropriate for a solo founder at this scale.
- Supabase is used correctly as the primary datastore with RLS for tenant isolation.
- All 5 verticals have frontend pages and backend API routes implemented.
- The calculation engines (PPh21, BPJS, violations) live in `src/lib/calculations/` with unit tests.
- Payment flow (Midtrans) is complete with signature verification and webhook handling.

**Major mismatches vs design docs:**
- `block_02_database_schema.md` specifies audit_log tables and formula versioning — neither exists in migrations.
- `req_05_architecture.md` describes immutable input snapshots for every verdict — `payslip_audits` stores inputs but doesn't version the formula/rate tables used at audit time.
- `block_03_pph21_bpjs_engine.md` specifies biaya jabatan (5% cap IDR 500K/month) deduction before PKP — **not implemented in `pph21.ts`**. This is a correctness bug.
- `req_07_calc_engines.md` specifies pgvector embedding similarity for job title matching — not implemented, only trigram fuzzy match exists.
- `master_analysis_cekwajar.md` says v1 should be Wajar Slip ONLY — but all 5 tools are shipped simultaneously, which dilutes quality.
- `req_10_security.md` specifies IP addresses are "never stored" — but rate limiting stores IP-keyed counters in Vercel KV.

---

## 2. Feature Delivery & Maturity Audit

### 2.1 Wajar Slip (Payslip Audit)

| Flow | Maturity | Key Files | Key Missing Pieces |
|---|---|---|---|
| Registration/Auth | 3 | `src/app/auth/`, `middleware.ts` | Works for both anon and auth users. Solid. |
| Payslip Upload (OCR) | 2 | `src/app/api/ocr/upload/route.ts`, `src/lib/ocr/` | Google Vision integration works, Tesseract fallback exists. No OCR accuracy test corpus (200 samples) as specified in `req_11_testing.md`. No virus/malware scanning on uploads. |
| Manual Field Entry | 3 | `src/app/wajar-slip/page.tsx` | Full form with Zod validation, PTKP selector, city dropdown. |
| OCR Field Confirmation | 2 | `ConfirmExtractedFields.tsx` | User can confirm/edit OCR results. No confidence-based auto-reject threshold implemented. |
| PPh21 Calculation | 2 | `src/lib/calculations/pph21.ts` | **CRITICAL: Missing biaya jabatan (5% of gross, cap 500K/mo) deduction before PKP.** December progressive true-up implemented. TER rates from DB. NPWP surcharge (1.2x) implemented. |
| BPJS Calculation | 3 | `src/lib/calculations/bpjs.ts` | All 6 components correct. Year-aware JP cap with March boundary rule. Kesehatan cap at 12M. DB-backed with static fallbacks. |
| Violation Detection | 3 | `src/lib/calculations/violations.ts` | V01-V11 all implemented. Severity ordering correct. JKK/JKM illegal deduction checks (V08/V09) are excellent. V10 (50% deduction limit) is a strong addition. |
| Verdict Display | 2 | `src/app/wajar-slip/page.tsx` | Freemium gating works (violation codes free, IDR amounts paid). But no "verdict reproducibility" — if TER rates change, old verdicts can't be recalculated. |
| Save/History | 2 | `src/app/api/audit-history/`, `dashboard/audit-history/` | Audit records saved to `payslip_audits`. No export/PDF. No immutable input snapshot versioning. |
| Share Card | 2 | `src/app/wajar-slip/share/[id]/opengraph-image.tsx` | OG image generation exists. |
| Paywall/Payment | 3 | `src/app/api/payment/`, `webhooks/midtrans/` | Midtrans Snap integration complete. Signature verification. Amount tampering check. Idempotency. |
| 30-day Auto-Delete | 1 | `supabase/migrations/012_pgcron_jobs.sql` | `delete_at` column exists but actual pg_cron job implementation not verified in code. |

**State of Wajar Slip:** This is the most mature vertical at Level 2 overall. The core flow works end-to-end: upload payslip -> OCR -> confirm fields -> calculate -> show violations -> paywall -> payment. The **critical blocker** is the missing biaya jabatan deduction in PPh21, which means every PPh21 calculation is wrong (over-estimating tax, under-detecting violations). This must be fixed before any real user touches the product. The violation detection logic is strong and well-structured. Rate limiting, idempotency, and Sentry error tracking are in place.

### 2.2 Wajar Gaji (Salary Benchmark)

| Flow | Maturity | Key Files | Key Missing Pieces |
|---|---|---|---|
| Job Title Search | 2 | `src/app/api/salary/benchmark/route.ts` | Trigram fuzzy match via pg_trgm RPC. No pgvector semantic fallback as specified. No autocomplete endpoint — page does full search on submit. |
| Geographic Lookup | 2 | Same route | City/province cascading. Data tier detection (CITY_LEVEL → BPS_PRIOR). |
| Bayesian Blending | 3 | Same route | Formula matches `req_07_calc_engines.md` exactly: `(n/(n+k))*sample + (k/(n+k))*prior` with k=15. Confidence scoring implemented. |
| Salary Submission | 2 | `src/app/api/salary/submit/route.ts` | Fingerprint-based dedup. Outlier detection stub. No actual validation pipeline (manual review queue mentioned in docs doesn't exist). |
| Verdict Display | 2 | `src/app/wajar-gaji/page.tsx` (852 lines) | Shows P25/P50/P75, data tier badge, UMK comparison. Percentile position visualization. |
| History/Export | 0 | — | No salary benchmark history saved per user. No export. |

**State of Wajar Gaji:** Level 2 MVP. The Bayesian blending is correctly implemented and matches the spec. The main weakness is data — there's likely very little crowdsourced data, so most queries will fall back to BPS province-level priors. The salary submission flow exists but lacks the outlier review queue and validation pipeline. No pgvector semantic search for job titles.

### 2.3 Wajar Tanah (Property Benchmark)

| Flow | Maturity | Key Files | Key Missing Pieces |
|---|---|---|---|
| Location Selection | 2 | `src/app/wajar-tanah/page.tsx` | Hardcoded province/city lists in frontend (not from DB). |
| Property Input | 2 | Same | Property type, area (sqm), asking price. |
| Benchmark Lookup | 2 | `src/app/api/property/benchmark/route.ts` | IQR-based verdict (MURAH/WAJAR/MAHAL/SANGAT_MAHAL). |
| Verdict Display | 2 | `VerdictBadge.tsx`, `PropertyPriceBar.tsx` | Visual price bar with IQR range. |
| Crowdsource Submission | 1 | `property_submissions` table exists | RLS allows public insert, but no validation, no review queue. |
| History/Export | 0 | — | Not implemented. |

**State of Wajar Tanah:** Level 1-2. The UI and API exist, but the data quality is the fundamental problem. As `master_analysis_cekwajar.md` correctly notes, there's no NJOP API and property scraping is illegal. This tool is essentially a shell waiting for data partnerships. Launching it risks showing users wrong/no data and damaging trust.

### 2.4 Wajar Kabur (Abroad Comparison)

| Flow | Maturity | Key Files | Key Missing Pieces |
|---|---|---|---|
| Country Selection | 2 | `src/app/wajar-kabur/page.tsx` | Fetches from `ppp_reference` table. Free/paid tier gating on countries. |
| PPP Comparison | 2 | `src/app/api/abroad/compare/route.ts` | World Bank PPP factors + Frankfurter exchange rates. Purchasing power parity calculation. |
| Verdict Display | 2 | Frontend page | Shows nominal vs PPP-adjusted comparison. |
| History/Export | 0 | — | Not implemented. |

**State of Wajar Kabur:** Level 2 MVP. The PPP calculation logic is sound. However, `master_analysis_cekwajar.md` explicitly says this should launch at Month 12-18 after 10K+ MAU. Shipping it now with sparse data is premature and dilutes focus from Wajar Slip.

### 2.5 Wajar Hidup (Cost of Living)

| Flow | Maturity | Key Files | Key Missing Pieces |
|---|---|---|---|
| City Selection | 2 | `src/app/wajar-hidup/page.tsx` | Fetches cities from `col_cities` table. |
| COL Comparison | 2 | `src/app/api/col/compare/route.ts` | COL index ratio calculation. Category breakdown. |
| Verdict Display | 2 | Frontend page | LEBIH_MURAH/SAMA/LEBIH_MAHAL verdict. |
| History/Export | 0 | — | Not implemented. |

**State of Wajar Hidup:** Level 2 MVP. Simple COL index comparison works. Same concern as Kabur — should have been deferred per the master analysis.

---

## 3. Backend Architecture, Data, and Auth Findings

### 3.1 Database & Schema Integrity

**Positive findings:**
- RLS is enabled on all tables (004, 011 migrations).
- `payslip_audits` uses BIGINT for IDR amounts (correct for Indonesian currency).
- Foreign keys exist between core tables.
- `delete_at` column for 30-day auto-deletion of payslip data (UU PDP compliance).
- `ocr_quota_counter` tracks Vision API usage.
- `umk_2026` table has city-level UMK data seeded.

**Critical issues:**

1. **DUPLICATE MIGRATION NUMBERS (CRITICAL):** Migrations 020, 021, 022, and 024 each have TWO files with the same prefix but different names. Example: `020_consent_and_cleanup.sql` AND `020_job_search_rpc.sql`. Supabase migrations run in alphabetical order within the same prefix, which means execution order is non-deterministic. This could cause schema corruption.

2. **No audit_log table:** `block_02_database_schema.md` and `req_10_security.md` both specify an immutable audit log for consent changes, subscription changes, and admin actions. Not implemented.

3. **No formula versioning:** When PPh21 TER rates or BPJS caps change (which they do annually), there's no way to know which rates were used for a historical audit. The `payslip_audits` table stores calculated results but not the rate table version. This means historical verdicts cannot be reproduced or legally defended.

4. **`payslip_audits.gross_salary` uses BIGINT but API accepts `z.number()`:** JavaScript numbers have 53-bit precision. For IDR amounts up to 1 billion (the Zod max), this is fine. But the Zod schema allows `grossSalary: z.number().min(500_000).max(1_000_000_000)` — worth being explicit that this is always in IDR (not sen/cents).

5. **`salary_submissions` has no user_id:** Anyone can insert (`anyone_insert_salary` RLS policy). No way to trace submissions back to users for abuse detection.

6. **`transactions` table missing `anon_session_id` column in migration 003:** The `create-transaction` API route inserts `anon_session_id` for guest checkout, but `003_subscription_tables.sql` doesn't define this column. This either was added in a later migration (not visible) or will cause insert failures for anonymous users.

7. **`umk_2026` uses `city_canonical` in queries but schema has `city`:** The API route queries `eq('city_canonical', ...)` but the migration only has `city TEXT NOT NULL`. There's likely an unlisted migration that adds `city_canonical`, but this is fragile.

8. **`ocr_quota_counter` has `count` column in migration but code queries `month_count`:** Migration 005 creates `count INTEGER DEFAULT 0` but `ocr/upload/route.ts` reads `month_count`. Schema mismatch.

### 3.2 Auth, Sessions, Multi-Tenancy

**Architecture:** Supabase Auth (email + OAuth) + JWT in httpOnly cookies. Middleware refreshes sessions on every request. `getCurrentUser()` helper reads user + profile + tier from DB.

**Positive:**
- Tier is ALWAYS read from DB, never from JWT claims or client headers (correctly follows `req_10_security.md`).
- RLS enforces `user_id = auth.uid()` for payslip_audits SELECT.
- Service role client only used in webhook handler (correct isolation).
- Midtrans webhook uses timing-safe signature comparison.

**Issues:**

1. **Anonymous users can create audits without any auth (HIGH):** The `anon_insert_payslip` RLS policy allows `INSERT WITH CHECK (user_id IS NULL AND session_id IS NOT NULL)`. The session_id comes from a client-side localStorage UUID. An attacker can generate unlimited session IDs and bypass per-session rate limits.

2. **Rate limiting has a race condition:** The audit-payslip route calls `checkRateLimitAnon(ip)` in middleware AND again inside the route handler. The middleware check uses IP, but the route handler also checks. This double-check could allow requests to slip through if the window between check and consume is long enough.

3. **`getServiceClient()` is exported from `src/lib/supabase/server.ts`:** This is correct placement, but the import path means any server-side code can import it. Should have a lint rule or code review check to ensure it's only used in webhook handlers.

4. **`.env.local` is committed to the repository:** I can see the file exists at `cekwajar.id-main/.env.local`. While `.gitignore` may have been added later, if this was ever committed, all secrets (Supabase service role key, Midtrans server key, Google Vision API key) are compromised. **Rotate ALL keys immediately.**

5. **No CSRF protection on form submissions:** The audit-payslip endpoint accepts JSON POST without any CSRF token. Since Supabase auth uses cookies, a malicious site could trigger audits on behalf of logged-in users.

### 3.3 Calculation Engine Correctness

#### PPh21 Engine (`src/lib/calculations/pph21.ts`)

**CRITICAL BUG: Missing Biaya Jabatan Deduction**

Per `block_03_pph21_bpjs_engine.md` Section A.1.2 (PMK 262/2010):
> "Biaya Jabatan (professional allowance/position cost): Fixed at 5% of gross monthly income, capped at IDR 500,000/month"

The current implementation calculates PKP as:
```
pkp = annualGross - ptkpAnnual
```

The CORRECT calculation should be:
```
biayaJabatan = min(grossMonthly * 0.05, 500_000) * 12
pkp = annualGross - biayaJabatan - ptkpAnnual
```

This means the current engine OVER-CALCULATES tax for every user. For a worker earning IDR 10M/month:
- Current: PKP = 120M - 54M = 66M
- Correct: PKP = 120M - 6M (biaya jabatan) - 54M = 60M
- Tax difference: ~IDR 900,000/year

This is a **legally actionable error** if users rely on these calculations to dispute with employers.

**Other PPh21 issues:**
- TER category mapping is correct (A/B/C by PTKP status).
- Progressive brackets match UU HPP 7/2021 (5/15/25/30/35%).
- NPWP surcharge (1.2x) is correctly applied.
- December true-up logic is correct (progressive annual calculation minus 11 months of TER).
- TER rates fetched from DB with fallback — correct approach.

#### BPJS Engine (`src/lib/calculations/bpjs.ts`)

**Status: CORRECT.** All 6 components match the regulatory references:
- JHT: 2% employee, 3.7% employer, uncapped. Correct.
- JP: 1% employee, 2% employer, capped with year-aware March boundary rule. Correct.
- JKK: employer-only (0.24% default Class I). Correct.
- JKM: employer-only (0.30%). Correct.
- Kesehatan: 1% employee, 4% employer, capped at IDR 12M. Correct.
- JP wage caps for 2024-2027 match BPJS SE B/1226/022026. Correct.
- March boundary rule (Jan-Feb use prior year cap) is correctly implemented.

#### Violation Detection (`src/lib/calculations/violations.ts`)

**Status: MOSTLY CORRECT.** V01-V11 are well-implemented. Key observations:
- V06 (Below UMK) is correctly marked CRITICAL — this is a criminal offense.
- V08/V09 (illegal JKK/JKM employee deductions) are excellent additions.
- V10 (50% total deduction limit per PP 36/2021) is correct.
- V11 (December TER method detection) uses clever heuristic: if reported PPh21 is closer to TER than progressive, flag it.

**Issue with V03/V04:** These use `calculated.pph21` which is WRONG due to the missing biaya jabatan. Fix PPh21 first, then violations will be correct.

**Missing violation:** No check for PPh21 OVER-payment (employer deducting more than legally required). This is also a violation — the employer is withholding money they shouldn't be.

#### Suggested Golden Test Cases

These MUST be encoded as automated tests:

```
Test 1: PPh21 with biaya jabatan
  Input: gross=10M, TK/0, month=6, hasNPWP=true
  Expected biaya jabatan: 500,000/mo (5% of 10M = 500K, at cap)
  Expected annual PKP: 120M - 6M - 54M = 60M
  Expected annual tax: 60M * 5% = 3M
  Expected monthly TER: use DB rate for category A, 10M bracket

Test 2: BPJS JP cap at March boundary
  Input: gross=15M, year=2026, month=2
  Expected JP cap: 10,547,400 (2025 cap, because Feb < March)
  Expected JP employee: 105,474

Test 3: Below UMK violation
  Input: gross=4M, city UMK=5M
  Expected: V06 CRITICAL, differenceIDR=1,000,000

Test 4: December true-up
  Input: gross=20M, TK/0, month=12, hasNPWP=true
  Expected method: PROGRESSIVE
  Expected: annual tax - (11 * monthly TER amount)
```

---

## 4. API, Security, and Privacy Findings

### 4.1 API Surface

| Route | Purpose | Auth? | Validation | Risks |
|---|---|---|---|---|
| POST /api/audit-payslip | Core payslip audit | Optional (anon+auth) | Zod schema | **PPh21 calculation is wrong (biaya jabatan)**. Otherwise solid. |
| POST /api/ocr/upload | File upload + OCR | Optional | File type + size check | No malware scan. Google Vision API key in URL query param (logged by Google). |
| GET /api/salary/benchmark | Salary lookup | None required | Zod query params | Public endpoint. N+1 query risk with fuzzy matching. |
| POST /api/salary/submit | Crowdsource salary | None required | Fingerprint dedup | No auth = easy to spam with fake data. Rate limit exists but IP-based only. |
| GET /api/property/benchmark | Property lookup | None required | Basic params | Public. Hardcoded province/city lists. |
| POST /api/payment/create-transaction | Midtrans checkout | Optional (guest OK) | Zod + rate limit | Guest checkout creates transaction without email verification — risky for fraud. |
| POST /api/webhooks/midtrans | Payment webhook | Signature verification | SHA512 + amount check | **GOOD: timing-safe compare, amount verification, idempotency.** |
| GET /api/audit-history | User's past audits | Required | Auth check | Correctly uses getCurrentUser(). |
| POST /api/surat-keberatan | AI objection letter | Auth implied | — | Uses Groq AI. No input sanitization shown. Could be prompt-injected. |
| GET /api/health | Health check | None | — | Returns 200. Minimal. |
| POST /api/cron/cleanup-payslips | Delete old payslips | Cron auth needed | — | Need to verify Vercel cron secret protection. |
| POST /api/consent | Record user consent | Optional | — | Required for UU PDP compliance. |
| GET /api/col/compare | COL comparison | None | Query params | Public. |
| GET /api/abroad/compare | PPP comparison | None | Query params | Public. Tier gating on countries. |

### 4.2 Security Issues (Prioritized)

**CRITICAL:**

1. **`.env.local` potentially committed to git.** If this file was ever committed, all secrets are compromised. Rotate Supabase service role key, Midtrans server key, Google Vision API key, Groq API key, Resend API key immediately. Add `.env.local` to `.gitignore` (currently missing from the gitignore!).

2. **PPh21 calculation is wrong.** Missing biaya jabatan means every verdict is incorrect. Users acting on these verdicts could make legally wrong claims against employers.

3. **No file content validation for uploads.** The OCR upload endpoint checks MIME type and size, but doesn't validate file magic bytes. An attacker could upload a malicious file with a spoofed MIME type. Add magic byte validation using the `file-type` package.

**HIGH:**

4. **Google Vision API key passed in URL.** The Vision API call uses `?key=${apiKey}` in the URL. This key appears in Google Cloud logs, Vercel function logs, and potentially browser network logs if the call were ever client-side. Use service account authentication instead.

5. **No CSRF protection.** Cookie-based auth + JSON POST without CSRF token = vulnerable to cross-origin request forgery.

6. **`salary_submissions` allows unlimited anonymous inserts.** RLS policy `anyone_insert_salary` with `WITH CHECK (true)` means anyone can flood the salary database with garbage data. This undermines the entire Wajar Gaji data quality.

7. **`property_submissions` same problem.** Public insert with no validation.

**MEDIUM:**

8. **Rate limiting fails open.** Both `rate-limit.ts` and middleware catch errors and allow requests through. An attacker who causes KV failures (e.g., by exhausting connections) bypasses all rate limiting.

9. **No Content-Security-Policy headers.** The Next.js config doesn't set CSP headers, allowing potential XSS payloads to execute.

10. **Anonymous session IDs stored in client localStorage.** These are user-controlled and can be forged. Don't use them for any trust decisions.

11. **Surat keberatan (AI letter) endpoint lacks prompt injection protection.** User input flows directly to Groq AI without sanitization. An attacker could manipulate the AI to generate harmful content.

**LOW:**

12. **IP address stored in Vercel KV for rate limiting.** `req_10_security.md` says IP addresses should "never be stored." The rate limit keys contain IP addresses with a TTL, which is technically storage.

13. **No request logging/audit trail for API calls.** Can't investigate security incidents without request logs.

### 4.3 UU PDP Compliance

- Consent flow exists (`user_consents` table, `/api/consent` endpoint, `ConsentBanner` component). Good.
- 30-day auto-delete for payslip files via `delete_at` column. Good intent, but pg_cron job needs verification.
- Payslip files stored in private Supabase Storage bucket. Good.
- Sentry configured to strip email from error events. Good.
- **Missing: Data Subject Access Request (DSAR) mechanism.** UU PDP requires ability for users to request all their data. No endpoint exists for this.
- **Missing: Right to deletion.** `/api/user/delete-account` exists but needs to cascade to all tables (payslip_audits, salary_submissions, transactions, subscriptions, consent records).

---

## 5. Reliability, Testing, and Operations Findings

### 5.1 Existing Test Coverage

Tests found in `src/lib/calculations/__tests__/`:
- `pph21.test.ts` — TER category mapping, PTKP values, December progressive. Uses mock Supabase. ~15 test cases.
- `bpjs.test.ts` — JP year-aware caps, Kesehatan caps, all 6 components. ~20 test cases.
- `violations.test.ts` — V01-V10 detection. ~25 test cases.

**What's covered:** Calculation unit tests are solid. The mock Supabase pattern works well for TER rate lookups.

**What's NOT covered:**
- No integration tests (DB + API routes).
- No end-to-end tests for any flow.
- No OCR accuracy tests (the 200-sample corpus specified in `req_11_testing.md` doesn't exist).
- No tests for payment flow (create-transaction, webhook).
- No tests for rate limiting behavior.
- No tests for RLS policies.
- PPh21 test doesn't test biaya jabatan (because it's not implemented).

### 5.2 Operational Readiness

**Monitoring:** Sentry is configured for server, client, and edge. Good error tracking foundation. `beforeSend` strips sensitive data. `tracesSampleRate: 0.2` is reasonable.

**Health checks:** `/api/health` exists but only returns 200. Doesn't check DB connectivity, Vision API availability, or Midtrans reachability.

**Alerting:** No alerting configured. When Sentry catches errors, there's no automated notification pipeline.

**Deployment:** Vercel auto-deploy from `main` branch. Standard and appropriate.

**Backup/Recovery:** Supabase managed Postgres includes point-in-time recovery. Good.

**Missing operational pieces:**
- No structured logging (just `console.error`). Can't query logs effectively.
- No SLO/SLA definition.
- No runbook for common incidents (e.g., Vision API quota exceeded, Midtrans webhook failures).
- The `calibrate-shortfall.ts` script in `scripts/` is an operational maintenance script — needs documentation and safety checks before running in production.
- No feature flags (all 5 tools are live simultaneously with no ability to disable one without a deploy).

### 5.3 Minimal Test Strategy Recommendation

**Unit tests (add immediately):**
- PPh21 with biaya jabatan (after fixing the bug).
- Golden test cases from Section 3.3.
- Salary benchmark Bayesian blending edge cases (n=0, n=10, n=30, n=100).
- Property verdict IQR calculation.

**Integration tests (add for launch):**
- Full audit-payslip flow: POST with valid input → verify DB record created → verify response shape.
- Payment flow: create-transaction → simulate webhook → verify subscription activated.
- RLS tests: verify user A cannot read user B's audits.

**E2E tests (add post-launch):**
- Sign up → upload payslip → confirm OCR → submit → see verdict → pay → see full results.

---

## 6. Global Maturity Assessment

| Dimension | Score (0-4) | Rationale |
|---|---|---|
| Architecture | 2.5 | Solid Next.js + Supabase foundation. RLS in place. But no audit logs, no formula versioning, duplicate migration numbers. |
| Core Feature (Wajar Slip) | 2 | End-to-end flow works, but PPh21 calculation is WRONG. This is the flagship product and it gives incorrect results. |
| Core Feature (Wajar Gaji) | 2 | Bayesian blending correct. Data quality is the blocker, not code quality. |
| Core Feature (Tanah/Kabur/Hidup) | 1.5 | Functional shells, but premature to ship. No meaningful data behind them. |
| Security/Privacy | 2 | RLS, signature verification, Sentry PII stripping are good. But .env.local exposure, no CSRF, no file validation, no CSP are serious gaps. |
| Reliability/Ops | 1.5 | Sentry exists. No structured logging, no alerting, no integration tests, no health checks beyond 200 OK. |

**Overall: The product is at Level 2 — suitable for internal demos and very early alpha testing with the founder's own data. It is NOT ready for real users due to the PPh21 correctness bug and security gaps.**

**Implications:**
- Internal demos: YES, with caveat that PPh21 numbers are wrong.
- Closed beta with friendly users: NO until PPh21 is fixed, .env.local secrets rotated, and basic security hardening done.
- Real production with paying customers: NO. Fix correctness, security, and add minimum test coverage first.

---

## 7. Prioritized Issues Backlog

### Bucket 1: Must Fix Before Real Users

| # | Area | Severity | Description | Fix Direction | Key Files |
|---|---|---|---|---|---|
| 1 | PPh21 Engine | CRITICAL | Missing biaya jabatan (5% cap 500K/mo) deduction before PKP calculation | Add `biayaJabatan = Math.min(grossSalary * 0.05, 500_000)` before PKP in both TER and progressive paths. Add to December true-up as `biayaJabatan * 12`. | `src/lib/calculations/pph21.ts` |
| 2 | Security | CRITICAL | `.env.local` potentially committed — all secrets compromised | Add `.env.local` to `.gitignore`. Rotate ALL API keys and secrets (Supabase service role, Midtrans server key, Google Vision, Groq, Resend). Verify git history with `git log --all --full-history -- .env.local`. | `.gitignore`, Vercel env vars |
| 3 | Database | CRITICAL | Duplicate migration numbers (020, 021, 022, 024) | Rename to unique sequential numbers. Test full migration from scratch. | `supabase/migrations/` |
| 4 | Schema | HIGH | `ocr_quota_counter` column name mismatch (`count` vs `month_count`) | Align migration and code. Add migration to rename or verify actual DB state. | `005_wajar_slip_tables.sql`, `ocr/upload/route.ts` |
| 5 | Security | HIGH | No file magic byte validation on payslip uploads | Add `file-type` package. Validate magic bytes match declared MIME type. | `src/app/api/ocr/upload/route.ts` |
| 6 | Security | HIGH | Google Vision API key in URL query string | Switch to service account authentication (JSON key file). | `src/lib/ocr/google-vision.ts` |
| 7 | Data Integrity | HIGH | `salary_submissions` allows unlimited anonymous inserts — data poisoning risk | Require auth OR implement Turnstile/reCAPTCHA for anonymous submissions. Add daily IP limit. | `011_rls_all_tools.sql`, `salary/submit/route.ts` |
| 8 | Correctness | HIGH | Formula versioning not implemented — historical verdicts cannot be reproduced | Add `rates_version_id` to `payslip_audits`. Create `rates_versions` table that snapshots TER + BPJS + UMK rates at each regulatory change. | `pph21.ts`, `bpjs.ts`, schema |
| 9 | Testing | HIGH | No golden test cases for PPh21 with biaya jabatan | Add test cases from Section 3.3 after fixing the bug. | `__tests__/pph21.test.ts` |
| 10 | Compliance | HIGH | No DSAR (Data Subject Access Request) endpoint for UU PDP | Create `/api/user/export-data` that returns all user data as JSON. | New file |

### Bucket 2: Important Hardening Steps

| # | Area | Severity | Description | Fix Direction | Key Files |
|---|---|---|---|---|---|
| 11 | Security | MEDIUM | No CSRF protection on POST endpoints | Add CSRF token generation (e.g., `csrf` package or custom double-submit cookie). | `middleware.ts` |
| 12 | Security | MEDIUM | No Content-Security-Policy headers | Add CSP headers in `next.config.ts` or middleware. | `next.config.ts` |
| 13 | Monitoring | MEDIUM | Health check doesn't test DB connectivity | Extend `/api/health` to ping Supabase, check Vision quota, verify Midtrans reachability. | `src/app/api/health/route.ts` |
| 14 | Testing | MEDIUM | No integration tests for audit-payslip flow | Add Vitest integration test that calls the API with test Supabase. | New test file |
| 15 | Testing | MEDIUM | No RLS policy tests | Add SQL-level tests that verify user A can't see user B's data. | New test file |
| 16 | Ops | MEDIUM | No structured logging | Replace `console.error` with a structured logger (e.g., `pino`). Include request_id, user_id, action. | All API routes |
| 17 | UX | MEDIUM | No clear error states when OCR fails completely | Add fallback UI flow when confidence < threshold. Show manual entry form immediately. | `wajar-slip/page.tsx` |
| 18 | Feature | MEDIUM | No PDF export of audit results | Add `/api/audit-history/[id]/export` that generates a PDF verdict report. | New file |
| 19 | Product | MEDIUM | 5 tools launched simultaneously — dilutes quality and confuses users | Add feature flags. Disable Wajar Tanah, Wajar Kabur, Wajar Hidup in production. Focus on Slip + Gaji only. | `src/lib/constants.ts` |
| 20 | Ops | MEDIUM | No alerting pipeline | Configure Sentry alert rules for: error rate spike, new error types, webhook failures. | Sentry dashboard |

### Bucket 3: Nice-to-Have Later

| # | Area | Severity | Description | Fix Direction |
|---|---|---|---|---|
| 21 | Performance | LOW | N+1 query risk in salary benchmark fuzzy matching | Pre-compute trigram indexes. Consider materialized view for common queries. |
| 22 | Feature | LOW | No pgvector semantic search for job titles | Add embedding column to `job_categories`. Use OpenAI embeddings for semantic fallback. |
| 23 | Feature | LOW | No AI narrative for payslip analysis | Add post-audit AI summary using Groq (deferred per `master_analysis_cekwajar.md`). |
| 24 | Testing | LOW | OCR accuracy corpus (200 samples) not built | Collect samples, build ground truth labels, run accuracy test per `req_11_testing.md`. |
| 25 | Compliance | LOW | PSE (Penyelenggara Sistem Elektronik) registration | Legal process, not code. Initiate with Kominfo. |
| 26 | Ops | LOW | Calibrate-shortfall script needs safety documentation | Add dry-run mode, require explicit confirmation, log all changes. |

---

## 8. Phase-by-Phase Roadmap to Mature Core Product

### Phase 1: Fix Critical Correctness & Security (1-2 weeks)

**Goal:** Make Wajar Slip calculations correct and close security holes.

**Definition of done:** All PPh21 calculations match `block_03_pph21_bpjs_engine.md`. All secrets rotated. No known critical or high-severity security issues.

Tasks:
1. Fix biaya jabatan in `pph21.ts` (add 5% deduction capped at 500K/mo before PKP). Update December true-up path too.
2. Add golden test cases (Section 3.3) and run them green.
3. Add `.env.local` to `.gitignore`. Audit git history. Rotate ALL secrets in Vercel and Supabase.
4. Fix duplicate migration numbers — rename to unique sequential IDs.
5. Fix `ocr_quota_counter` column name mismatch.
6. Add file magic byte validation to OCR upload.
7. Switch Google Vision to service account auth (remove API key from URL).
8. Add `rates_version_id` to `payslip_audits` table. Create `rates_versions` snapshot table.

### Phase 2: Harden Wajar Slip for Closed Beta (2-3 weeks)

**Goal:** Wajar Slip is safe for ~50 friendly beta testers. Wajar Gaji is accessible but clearly labeled as "beta data."

**Definition of done:** No silent data corruption possible. Users see correct verdicts. Basic monitoring catches errors.

Tasks:
1. Add CSRF protection to all POST endpoints.
2. Add CSP headers.
3. Extend health check to test DB + Vision quota.
4. Add structured logging (pino) to all API routes.
5. Configure Sentry alerting (error spike, new error types).
6. Add integration test for full audit-payslip flow.
7. Add RLS policy tests.
8. Implement feature flags in `constants.ts`. Disable Wajar Tanah, Kabur, Hidup in production.
9. Fix `salary_submissions` to require auth OR CAPTCHA.
10. Add DSAR export endpoint (`/api/user/export-data`).
11. Verify pg_cron job for 30-day payslip auto-delete is actually running.

### Phase 3: Launch Wajar Slip Publicly + Harden Wajar Gaji (3-4 weeks)

**Goal:** Wajar Slip is production-ready for paying customers. Wajar Gaji reaches Level 3.

**Definition of done:** 100+ audits completed with zero reported calculation errors. Payment flow tested end-to-end with real Midtrans transactions. Wajar Gaji shows data quality badges honestly.

Tasks:
1. Build OCR accuracy corpus (start with 50 samples, grow to 200).
2. Add PDF export for audit results.
3. Add PPh21 over-payment violation (V12: employer deducting more than required).
4. Add salary benchmark history per user.
5. Build outlier review queue for salary submissions.
6. Add Turnstile/reCAPTCHA to anonymous salary submission.
7. Switch Midtrans to production keys. Test with real payments.
8. Add E2E test for sign-up → audit → pay → full results flow.
9. Launch PSE registration process with Kominfo.

### Phase 4: Expand to Wajar Tanah/Kabur/Hidup + Monetization Hardening (4-6 weeks)

**Goal:** Secondary tools reach Level 2 MVP with honest data quality labels. Subscription management is robust.

Tasks:
1. Re-enable Wajar Tanah, Kabur, Hidup behind feature flags (gradual rollout).
2. Add subscription expiry checks and renewal reminders.
3. Add refund flow per UU Perlindungan Konsumen.
4. Build admin dashboard for operational visibility (audit counts, revenue, error rates).
5. Negotiate data partnerships for Wajar Tanah (ATR/BPN) and Wajar Gaji (Mercer/Korn Ferry).
6. Implement annual subscription plan with Midtrans recurring.
7. Add comprehensive monitoring dashboard (Grafana or Vercel Analytics).

### Phase 5: Scale and Deepen (Ongoing)

**Goal:** Platform handles 5K+ MAU with observability and defense-in-depth.

Tasks:
1. Add pgvector semantic search for job titles.
2. Add AI narrative summaries for audit results.
3. Build the 17-agent swarm architecture (per `build_guide_06`).
4. Add B2B API endpoints for enterprise customers.
5. Performance optimization: caching, connection pooling, query optimization.
6. Implement full audit log table for compliance.
7. Annual regulatory update process: PPh21 rates, BPJS caps, UMK data.

---

## Summary

cekwajar.id has a solid architectural foundation and impressive breadth for a solo founder project. The Supabase + Next.js + Vercel stack is appropriate. The calculation engines (BPJS, violations) are well-implemented with tests. The Midtrans payment integration is production-quality with proper signature verification.

**The single most important action is fixing the PPh21 biaya jabatan bug.** This affects every payslip audit and could expose users to legal risk if they act on incorrect calculations. Fix this, rotate the compromised secrets, and you have a strong foundation for a closed beta.

The product's biggest strategic risk is launching 5 tools simultaneously when only one (Wajar Slip) has enough data and implementation depth to deliver real value. The `master_analysis_cekwajar.md` was right: ship Wajar Slip alone, prove it works, then expand.
