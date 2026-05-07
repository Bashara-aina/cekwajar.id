# cekwajar.id — Gap Audit: What's Built vs What's Planned & How to Achieve Goals

> Last audited: 2026-04-27 | Live site: https://cekwajarid.vercel.app
> Compared: local codebase (cekwajar.id/ + cekwajar.id-main/ + slip_cekwajar_id/) vs planning docs vs live deployment

---

## CRITICAL FINDING: Deployment Gap

The local codebase (cekwajar.id/ directory) contains complete source code for ALL 5 tools, 18 API routes, auth, payments, and components. However, the LIVE Vercel deployment at cekwajarid.vercel.app is severely incomplete:

| Route | Local Code | Live Status |
|---|---|---|
| / (homepage) | EXISTS | 200 OK — working |
| /api/health | EXISTS | 200 OK — working |
| /wajar-slip | EXISTS (page.tsx + layout.tsx) | 404 — NOT DEPLOYED |
| /wajar-gaji | EXISTS | 404 — NOT DEPLOYED |
| /wajar-tanah | EXISTS | 404 — NOT DEPLOYED |
| /wajar-kabur | EXISTS | 404 — NOT DEPLOYED |
| /wajar-hidup | EXISTS | 404 — NOT DEPLOYED |
| /api/audit-payslip | EXISTS | 404 — NOT DEPLOYED |
| /api/cities | EXISTS | 404 — NOT DEPLOYED |
| /api/salary/* | EXISTS | 404 — NOT DEPLOYED |
| /api/property/* | EXISTS | 404 — NOT DEPLOYED |
| /api/ocr/* | EXISTS | 404 — NOT DEPLOYED |
| /pricing | EXISTS | Redirect (blocked) |
| /dashboard | EXISTS | Unknown (likely auth redirect) |

Root cause: The GitHub repo (Bashara-aina/cekwajar.id) likely deploys from a branch or commit that only includes the homepage. The full feature code exists locally but has NOT been pushed or the Vercel build is failing/misconfigured.

ACTION REQUIRED: Verify which branch Vercel deploys from. Push the complete cekwajar.id/ directory and ensure a successful build.

---

## Feature Completeness Matrix

### Wajar Slip

| Feature | Planned (from docs) | In Local Code | Live | Gap |
|---|---|---|---|---|
| Manual payslip form | Yes (req_09) | YES — ManualForm + IDRInput + PTKPSelector | NO | Deployment only |
| OCR upload (Google Vision) | Yes (build_guide_01) | YES — /api/ocr/upload + google-vision.ts | NO | Deployment + env vars |
| OCR fallback (Tesseract.js) | Yes (build_guide_01) | YES — tesseract-client.ts | NO | Deployment only |
| PPh21 TER calculation | Yes (req_07) | YES — pph21.ts with full TER lookup | NO | Deployment only |
| PPh21 December true-up | Yes (req_07) | YES — progressive Pasal 17 brackets | NO | Deployment only |
| BPJS 6-component calc | Yes (req_07) | YES — bpjs.ts (JHT, JP, JKK, JKM, Kes, total) | NO | Deployment only |
| Violation detection V01-V07 | Yes (block_01) | YES — violations.ts | NO | Deployment only |
| UMK validation | Yes (block_01) | YES — fetches from umk_2026 table | NO | Need to verify DB data exists |
| Freemium gate (IDR amounts) | Yes (block_05) | YES — gating in audit-payslip route | NO | Deployment only |
| OCR quota management | Yes | YES — 950/month global counter | NO | Deployment only |
| Surat Keberatan (objection letter) | Yes (slip standalone) | ONLY in slip_cekwajar_id/ (Groq API) | NO | NEEDS MIGRATION to main app |
| WhatsApp templates | Yes (slip standalone) | ONLY in slip_cekwajar_id/ | NO | NEEDS MIGRATION |
| Year-aware JP caps | Yes (slip standalone has it) | PARTIAL — main app uses hardcoded cap | NO | Main app needs 2024/2025/2026 caps + March rule |
| Illegal JKK/JKM detection | Yes (slip standalone) | ONLY in slip_cekwajar_id/ | NO | NEEDS MIGRATION (critical violations) |
| Total deduction >50% check | Yes (slip standalone) | ONLY in slip_cekwajar_id/ | NO | NEEDS MIGRATION |
| Unit tests (audit engine) | Yes | 127+ tests in slip_cekwajar_id/ | N/A | Test suite needs to be adapted for main app |
| Rate limiting | Yes (req_10) | YES — but in-memory Map (not persistent) | NO | NEEDS FIX: Use Vercel KV or Upstash Redis |
| Audit history (per user) | Yes (req_09) | PARTIAL — data logged to payslip_audits but NO UI to view history | NO | UI needed |
| Share card | Yes (ux_improvement/07) | YES — ShareVerdictButton.tsx | NO | Deployment only |

### Wajar Gaji

| Feature | Planned | In Local Code | Live | Gap |
|---|---|---|---|---|
| Job title autocomplete | Yes (build_guide_02) | YES — benchmark-search route + fuzzy RPC | NO | Deployment + DB data |
| Bayesian salary blending | Yes (block_01) | YES — weight = n/(n+15) formula | NO | Deployment + DB data |
| City/Province/BPS data tiers | Yes | YES — CITY_LEVEL/LIMITED/PROVINCE/BPS_PRIOR | NO | Deployment + DB data |
| User salary comparison | Yes | YES — above/below/within P50 | NO | Deployment only |
| Crowdsource submission | Yes (build_guide_02) | YES — /api/salary/submit with fingerprinting | NO | Deployment only |
| Anti-spam (fingerprint + outlier) | Yes | YES — SHA256 fingerprint + 0.5x-30x UMK check | NO | Deployment only |
| BPS Sakernas seed data | Yes (Day 1) | DB schema exists | NO | NEED TO VERIFY: Is umk_2026 + salary_benchmarks seeded? |
| Licensed survey data (Mercer/KF) | Deferred Month 6-8 | NO | NO | NOT STARTED — requires licensing contract |

### Wajar Tanah

| Feature | Planned | In Local Code | Live | Gap |
|---|---|---|---|---|
| Province/City/District selection | Yes (build_guide_03) | YES — property/districts route | NO | Deployment + DB data |
| Property type selection | Yes | YES — RUMAH/TANAH/APARTEMEN/RUKO | NO | Deployment only |
| IQR verdict algorithm | Yes (block_01) | YES — P25/P50/P75 with IQR thresholds | NO | Deployment + DB data |
| Size band classification | Yes | YES — KECIL/SEDANG/BESAR/SANGAT_BESAR | NO | Deployment only |
| District → City fallback | Yes | YES — falls back when <5 samples | NO | Deployment only |
| Price bar visualization | Yes | YES — PropertyPriceBar.tsx | NO | Deployment only |
| KJPP disclaimer | Yes (block_04) | YES — in verdict display | NO | Deployment only |
| NJOP integration | Planned (future) | NO | NO | NOT STARTED |
| Property listing scraper | Planned (future) | NO (script reference exists but not validated) | NO | NOT STARTED |

### Wajar Hidup (COL)

| Feature | Planned | In Local Code | Live | Gap |
|---|---|---|---|---|
| City-to-city comparison | Yes (build_guide_05) | YES — col/compare route | NO | Deployment + DB data |
| Lifestyle tier adjustment | Yes | YES — HEMAT/STANDAR/NYAMAN multipliers | NO | Deployment only |
| Category breakdown | Yes | YES — weighted by col_categories | NO | Deployment + DB data |
| COL chart visualization | Yes | YES — COLComparisonChart.tsx | NO | Deployment only |
| BPS CPI pipeline | Planned | DB schema exists | NO | NEED TO VERIFY: Is col_indices seeded? |
| Numbeo integration | Deferred Month 6-9 | NO | NO | NOT STARTED (USD 149/mo) |

### Wajar Kabur (PPP)

| Feature | Planned | In Local Code | Live | Gap |
|---|---|---|---|---|
| PPP comparison engine | Yes (build_guide_04) | YES — abroad/compare route | NO | Deployment + DB data |
| World Bank PPP fetch | Yes | YES — worldbank.ts with 30-day cache | NO | Deployment + env vars |
| Exchange rate fetch | Yes | YES — exchangerates.ts via Frankfurter | NO | Deployment only |
| Free tier country gating | Yes | YES — is_free_tier flag in ppp_reference | NO | Deployment + DB data |
| Basket comparison visual | Yes | YES — PPPBasketComparison.tsx | NO | Deployment only |
| Offer salary comparison | Yes | YES — optional offerSalary param | NO | Deployment only |

---

## Monetization Gap

| Item | Planned (master_analysis Section 7) | Built | Live | Gap |
|---|---|---|---|---|
| Midtrans Snap integration | Yes | YES — create-transaction route + webhook | NO | Deployment + Midtrans merchant verification |
| Basic tier (29K/mo, 278.4K/yr) | Yes | YES — hardcoded pricing in route | NO | Deployment only |
| Pro tier (79K/mo, 758.4K/yr) | Yes | YES — hardcoded pricing in route | NO | Deployment only |
| Webhook signature verification | Yes | YES — HMAC-SHA512 in webhook handler | NO | Needs production server key |
| Subscription management | Yes | YES — upsert subscriptions table | NO | Deployment only |
| Tier gating (free/basic/pro) | Yes | YES — in API routes | NO | Deployment only |
| Confirmation email (Resend) | Yes | YES — in webhook handler | NO | Needs Resend API key |
| Midtrans merchant account | Yes | UNKNOWN | NO | NEED TO VERIFY: KTP + NPWP submitted? |
| Revenue tracking | Planned | PARTIAL — transactions table | NO | No analytics dashboard |

Master analysis target: 200-360 paying subscribers by Month 12, MRR IDR 10-18M.
Current revenue: IDR 0 (nothing is deployed or accepting payments).

---

## Legal & Compliance Gap

| Requirement | Source Doc | Status | Risk Level |
|---|---|---|---|
| PPh21 engine audit by licensed PKP | master_analysis 4.3 | NOT DONE | EXISTENTIAL — if calculation goes wrong and goes viral, brand is destroyed |
| UU PDP Pasal 20/22 consent flow | master_analysis 5.2 | NOT BUILT — no explicit consent UI for sensitive payslip data | CRITICAL — Kominfo enforcement |
| Supabase region ap-southeast-1 | vc_evaluation Red Flag | UNKNOWN — check Supabase dashboard | HIGH — cross-border PDP violation if US |
| Privacy Policy (Bahasa Indonesia) | block_04 | EXISTS in code (privacy-policy/page.tsx) but content is placeholder-level | MEDIUM |
| Terms of Service (Bahasa Indonesia) | block_04 | EXISTS in code (terms/page.tsx) but needs legal review | MEDIUM |
| Verdict language (non-binary) | vc_evaluation Red Flag 10 | PARTIAL — uses SESUAI/ADA_PELANGGARAN (not binary WAJAR/TIDAK WAJAR) | LOW — current language is softer |
| PSE Kominfo registration | block_08 | UNKNOWN | MEDIUM — enforcement risk |
| 30-day payslip auto-delete | master_analysis 5.2 | NOT IMPLEMENTED — no pg_cron job | HIGH — data retention violation |
| Data subject rights (deletion, access) | UU PDP Pasal 22-27 | NOT IMPLEMENTED | MEDIUM — required before commercial launch |
| KJPP property disclaimer | block_04 | YES — implemented in verdict display | LOW — covered |
| Cookie consent | GDPR/UU PDP | YES — CookieConsent.tsx with opt-in | LOW — covered |

---

## Technical Debt & Code Issues

### Critical Issues

1. **Rate limiting is in-memory** — The payslip audit rate limiter uses a JavaScript Map that resets on every server restart/cold start. On Vercel's serverless architecture, this means rate limiting is essentially non-functional.
   - Fix: Replace with Vercel KV, Upstash Redis, or Supabase-based counter.

2. **JP salary cap is hardcoded** — Main app hardcodes 9,559,600 in bpjs.ts. The standalone has year-aware caps (2024/2025/2026) with March boundary rule.
   - Fix: Migrate year-aware logic from slip_cekwajar_id/ to main app, or move caps to bpjs_rates DB table.

3. **KESEHATAN_SALARY_CAP hardcoded** — 12,000,000 in code, should be DB-driven.
   - Fix: Add to bpjs_rates table.

4. **No user audit history UI** — Data is logged to payslip_audits but there's no way for users to view their past audits in the dashboard.
   - Fix: Add audit history component to /dashboard.

5. **OCR quota is global** — All users share the 950/month Google Vision quota. A few heavy users could exhaust it for everyone.
   - Fix: Consider per-user quotas or increase Vision budget.

### Missing Features from Standalone

These exist in slip_cekwajar_id/ and should be migrated:

1. **Surat Keberatan generator** — Premium feature generating formal objection letters. Uses Groq API. Migration effort: ~4 hours.

2. **Illegal JKK/JKM employee deduction check** — Critical violation detection missing from main app's violations.ts. Migration effort: ~1 hour.

3. **Total deduction >50% check** — PP 36/2021 Pasal 65 compliance. Migration effort: ~1 hour.

4. **Year-aware JP cap with March boundary** — The standalone correctly handles JP cap transitions in January/February. Migration effort: ~2 hours.

5. **127+ unit tests** — Comprehensive test suite for the audit engine. Adaptation effort: ~4 hours.

### Hardcoded Values That Should Be DB-Driven

```
bpjs.ts:    JP_SALARY_CAP = 9,559,600        → bpjs_rates table
bpjs.ts:    KESEHATAN_SALARY_CAP = 12,000,000 → bpjs_rates table
pph21.ts:   PTKP_VALUES (all 13 statuses)     → Could be DB table for future updates
constants:  LIFESTYLE_MULTIPLIER (0.70/1.00/1.30) → col_categories or config table
payment:    PRICING (29K/79K/278K/758K)        → pricing_plans table or env vars
ocr:        VISION_MONTHLY_LIMIT = 950         → env var
```

---

## Database Data Verification Needed

The code references these tables, but we cannot verify from the live site that data has been seeded:

| Table | Expected Data | Verification Method |
|---|---|---|
| umk_2026 | All Indonesian cities + UMK values | Query: SELECT COUNT(*) FROM umk_2026 (expect 500+) |
| pph21_ter_rates | TER brackets for categories A/B/C | Query: SELECT COUNT(*) FROM pph21_ter_rates (expect 120+) |
| bpjs_rates | 5 components × 2 parties | Query: SELECT COUNT(*) FROM bpjs_rates (expect 10) |
| salary_benchmarks | BPS province-level seed data | Query: SELECT COUNT(*) FROM salary_benchmarks (expect 1000+) |
| job_categories | Normalized job titles | Query: SELECT COUNT(*) FROM job_categories (expect 500+) |
| property_benchmarks | Property price data by district | Query: SELECT COUNT(*) FROM property_benchmarks (expect 5000+) |
| col_indices | City COL indices | Query: SELECT COUNT(*) FROM col_indices (expect 50+) |
| ppp_reference | Country PPP factors | Query: SELECT COUNT(*) FROM ppp_reference (expect 50+) |

If any of these tables are empty, the corresponding tool will NOT work even after deployment.

---

## Roadmap: How to Achieve Launch Goals

### Phase 0: Fix Deployment (Day 1-2)

1. Verify Vercel deployment config — ensure it points to correct branch with full cekwajar.id/ code.
2. Push all source code to GitHub main branch if not already done.
3. Set ALL environment variables in Vercel dashboard (Supabase, Vision, Midtrans, Resend, Sentry).
4. Trigger fresh deployment and verify ALL routes return 200 (not 404).
5. Test /api/health, /api/cities, /wajar-slip, /wajar-gaji, /wajar-tanah, /wajar-kabur, /wajar-hidup.

### Phase 1: Data Verification (Day 2-3)

1. Connect to Supabase dashboard and verify all tables exist with correct schemas.
2. Check row counts for all seed data tables (umk_2026, pph21_ter_rates, bpjs_rates, salary_benchmarks, job_categories, property_benchmarks, col_indices, ppp_reference).
3. If empty, run seed scripts: scripts/seed-job-categories.ts and create migration scripts for other tables.
4. Verify pph21_ter_rates match PMK 168/2023 official gazette.
5. Verify umk_2026 values against Kemnaker official data.

### Phase 2: Critical Bug Fixes (Day 3-5)

1. Migrate year-aware JP cap from standalone to main app's bpjs.ts.
2. Add illegal JKK/JKM detection to violations.ts.
3. Add total deduction >50% check to violations.ts.
4. Replace in-memory rate limiter with Upstash Redis or Vercel KV.
5. Move hardcoded BPJS caps to database table.

### Phase 3: Standalone Feature Migration (Day 5-8)

1. Migrate Surat Keberatan generator (Groq API) to main app as premium feature.
2. Migrate WhatsApp templates feature.
3. Adapt 127+ unit tests from standalone to main app's test framework.
4. Add December PPh21 skip logic (month 12 reconciliation handling).

### Phase 4: Legal Compliance (Day 8-14)

1. Commission PPh21 engine audit by licensed tax consultant (PKP). Budget: IDR 15-30M.
2. Verify Supabase region is ap-southeast-1. If not, migrate (1 hour).
3. Build UU PDP consent flow: Explicit consent before payslip upload, consent stored in user_consents.
4. Review and finalize Privacy Policy + Terms of Service in Bahasa Indonesia.
5. Implement 30-day payslip auto-delete cron job (pg_cron or Vercel Cron).
6. Add data subject deletion endpoint.

### Phase 5: Monetization Go-Live (Day 14-18)

1. Verify Midtrans merchant account (individual: KTP + NPWP).
2. Switch Midtrans from sandbox to production mode.
3. Test full payment flow: create-transaction → Snap popup → webhook → subscription activation.
4. Verify email confirmation (Resend) works in production.
5. Test freemium gate across all 5 tools.

### Phase 6: Beta Launch (Day 18-25)

1. Invite 100 closed beta users.
2. Monitor Sentry for errors.
3. Collect feedback on OCR accuracy (target: 200 real payslip uploads).
4. Track conversion: free → basic → pro.
5. Fix any calculation errors found in beta.

### Phase 7: Public Launch (Day 25-30)

1. Launch gate criteria (from master_analysis):
   - 500+ audits completed without critical calculation error.
   - 50+ paying subscribers.
   - Zero tax miscalculation reports.
   - OCR accuracy >80% on varied payslip formats.
2. SEO optimization (meta tags already in place, need backlinks).
3. Social proof: testimonials, audit counter on homepage.
4. Content marketing: blog posts about PPh21/BPJS rights.

---

## Summary: Current State vs Goal

| Dimension | Goal | Current State | Gap Size |
|---|---|---|---|
| Deployment | Full app live on Vercel | Only homepage deployed | LARGE — code exists, deployment broken |
| Wajar Slip | Fully functional audit engine | Code complete, not deployed | MEDIUM — deploy + verify data |
| Wajar Gaji | Salary benchmarking with Bayesian blending | Code complete, not deployed | MEDIUM — deploy + verify seed data |
| Wajar Tanah | Property valuation with IQR verdicts | Code complete, not deployed | MEDIUM — deploy + verify data |
| Wajar Hidup | City-to-city COL comparison | Code complete, not deployed | MEDIUM — deploy + verify data |
| Wajar Kabur | International PPP comparison | Code complete, not deployed | MEDIUM — deploy + verify data + API keys |
| Payments | Midtrans accepting real money | Code complete, not deployed | MEDIUM — deploy + merchant verification |
| Legal | UU PDP compliant, tax-audited engine | Not started | LARGE — requires external professionals |
| Data | All reference tables seeded | Unknown | UNKNOWN — needs DB verification |
| Tests | Full test coverage | 127+ tests in standalone only | MEDIUM — needs migration |
| Revenue | IDR 10-18M MRR by Month 12 | IDR 0 | LARGE — nothing is monetizable yet |

The code is largely built. The primary blocker is deployment configuration and data verification. Once those are resolved, the path to beta launch is 2-3 weeks of focused work on compliance, migration, and testing.
