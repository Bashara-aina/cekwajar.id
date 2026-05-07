# Master Deep Test Prompt — cekwajar.id
**Purpose:** Send this entire prompt to Claude Code to run a comprehensive, feature-by-feature test of every component across all 10 stages.  
**When to use:** After all 10 stages are complete and `pnpm build` passes.  
**Expected runtime:** 45–90 minutes of automated testing.

---

## HOW TO USE THIS FILE

1. Open Claude Code: `cd cekwajar-id && claude`
2. Start your dev server in a separate terminal: `pnpm dev`
3. Copy everything between `===MASTER TEST START===` and `===MASTER TEST END===`
4. Paste into Claude Code as a single message
5. Claude Code will execute every test automatically and report results

---

```
===MASTER TEST START===

You are the QA engineer for cekwajar.id — an Indonesian consumer data intelligence platform.
All 10 development stages are complete. Your job is to run a DEEP, COMPREHENSIVE test of 
EVERY feature, one by one, and report a detailed pass/fail result for each.

The dev server is running at http://localhost:3000.
You have access to Bash, Read, and all file tools.

TESTING PHILOSOPHY:
- Test the ACTUAL behavior, not just "does the endpoint exist"
- For each test: run it, check the output, verify against expected result, mark PASS or FAIL
- If a test FAILS: diagnose the root cause, attempt a fix, then re-test
- Report every result honestly — do not skip tests that are hard to run

FORMAT your final report as:
  ✅ PASS — [Test Name] — [1-line explanation of what was verified]
  ❌ FAIL — [Test Name] — [Root cause] — [Fix applied? Y/N]
  ⚠️  WARN — [Test Name] — [Works but degraded/partial]

At the end, output:
  TOTAL: [X] PASS / [Y] FAIL / [Z] WARN
  LAUNCH READY: YES / NO / CONDITIONAL

════════════════════════════════════════════════════════════════════
SECTION 1: ENVIRONMENT & INFRASTRUCTURE
════════════════════════════════════════════════════════════════════

TEST 1.1 — TypeScript Compilation
  Run: pnpm tsc --noEmit
  Expected: Exit code 0, zero errors, zero warnings
  Fail if: Any TypeScript error appears

TEST 1.2 — ESLint Clean
  Run: pnpm lint
  Expected: Exit code 0, "No ESLint warnings or errors"
  Fail if: Any error. Warnings are acceptable.

TEST 1.3 — Production Build
  Run: pnpm build
  Expected: "✓ Compiled successfully", exit code 0
  Fail if: Build error, missing env var, or broken import
  Note: Some tests may fail if MIDTRANS_IS_PRODUCTION is set to production
  before Stage 9 completion — that is expected and acceptable.

TEST 1.4 — Health Check Endpoint
  Run: curl -s http://localhost:3000/api/health | jq .
  Expected: 
    { "status": "ok", "checks": { "database": "ok", ... } }
  Fail if: status is not "ok" OR database check fails
  Note: If database shows error, check SUPABASE_URL in .env.local

TEST 1.5 — Environment Variables Present
  Check: cat .env.local | grep -E "^[A-Z]" | cut -d= -f1 | sort
  Expected: These keys must ALL be present:
    GOOGLE_VISION_API_KEY
    MIDTRANS_SERVER_KEY
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SENTRY_DSN
    SUPABASE_SERVICE_ROLE_KEY
  Fail if: Any of the above is missing

TEST 1.6 — No Secrets in Source Code
  Run: grep -r "service_role" src/ --include="*.ts" --include="*.tsx" | grep -v "getServiceClient\|SUPABASE_SERVICE_ROLE\|process.env"
  Expected: Zero matches
  Fail if: Any match (means service_role key is hardcoded — CRITICAL SECURITY FAILURE)
  
  Run: grep -rn "SB-Mid-server\|Mid-server-" src/ --include="*.ts" --include="*.tsx"
  Expected: Zero matches
  Fail if: Any match (Midtrans key hardcoded)

TEST 1.7 — Service Worker / MCP Status
  Run: ls -la supabase/migrations/ | wc -l
  Expected: At least 20 migration files (migrations + 1 for directory listing line)
  Fail if: Less than 20 lines

════════════════════════════════════════════════════════════════════
SECTION 2: DATABASE INTEGRITY
════════════════════════════════════════════════════════════════════

TEST 2.1 — All Tables Exist
  For each table, run a quick count query via the health check or Supabase CLI.
  Method: Read src/types/database.types.ts — verify these tables appear as types:
    user_profiles, subscriptions, transactions, payslip_audits, 
    salary_submissions, salary_benchmarks, job_categories, umk_2026,
    property_benchmarks, property_submissions, ppp_reference, col_cities,
    col_indices, col_categories, pph21_ter_rates, bpjs_rates, ptkp_values,
    ocr_quota_counter, user_consents
  Expected: All 19 tables present in types file
  Fail if: Any table missing from generated types

TEST 2.2 — Seed Data Volumes
  Call GET http://localhost:3000/api/health (or create a test-db endpoint).
  
  Method: Create a temporary test endpoint and immediately delete after use:
  1. Create file src/app/api/test-db/route.ts (TEMPORARY — delete after test):
  
  import { getServiceClient } from '@/lib/auth/getServiceClient'
  import { NextResponse } from 'next/server'
  
  export async function GET() {
    const supabase = getServiceClient()
    const counts: Record<string, number> = {}
    
    const tables = ['pph21_ter_rates', 'bpjs_rates', 'ptkp_values', 'umk_2026', 'col_indices', 'ppp_reference', 'job_categories']
    
    for (const table of tables) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      counts[table] = count ?? 0
    }
    
    return NextResponse.json(counts)
  }
  
  2. Call: curl -s http://localhost:3000/api/test-db | jq .
  3. IMMEDIATELY delete the file after test (do not leave test endpoints in production)
  
  Expected minimums:
    pph21_ter_rates: >= 30
    bpjs_rates: >= 12
    ptkp_values: >= 12
    umk_2026: >= 50
    col_indices: >= 20
    ppp_reference: >= 15
    job_categories: >= 30
  Fail if: Any count below minimum

TEST 2.3 — UMK Data Correctness
  Method: Create temp test endpoint, query:
    SELECT * FROM umk_2026 WHERE city ILIKE 'Jakarta'
  Expected: 
    city = 'Jakarta'
    monthly_minimum_idr >= 5000000 (at least IDR 5M — Jakarta UMK 2026)
    monthly_minimum_idr <= 8000000 (sanity upper bound)
  Fail if: Jakarta not found OR value out of range

TEST 2.4 — TER Rate Correctness (Critical for PPh21 calculation)
  Query pph21_ter_rates for TER A, salary IDR 7,500,000:
    SELECT monthly_rate_percent FROM pph21_ter_rates 
    WHERE category='A' AND min_salary <= 7500000 AND max_salary >= 7500000
  Expected: 1.50 (per PMK 168/2023 — salary 7.5M falls in 7,500,001-8,550,000 bracket at 1.50%)
  Fail if: Rate is not 1.50 OR no row returned

TEST 2.5 — BPJS Rates Correctness
  Query: SELECT rate_percent FROM bpjs_rates WHERE component='JP' AND party='employee'
  Expected: 1.000 (1% JP employee contribution)
  
  Query: SELECT salary_cap_idr FROM bpjs_rates WHERE component='JP' AND party='employee'
  Expected: 9559600 (JP salary cap 2024)
  Fail if: Wrong rate or wrong cap

TEST 2.6 — RLS Policies Verification
  Method: Use anonymous Supabase client (anon key) to attempt unauthorized access:
  
  Create temporary test: try to SELECT from payslip_audits without auth:
    curl -s "https://[YOUR_PROJECT].supabase.co/rest/v1/payslip_audits?select=*" \
      -H "apikey: [ANON_KEY]" \
      -H "Authorization: Bearer [ANON_KEY]"
  Expected: Empty array [] (RLS blocks unauthenticated SELECT, not an error — empty result)
  
  Try to SELECT from pph21_ter_rates without auth:
    curl -s "https://[YOUR_PROJECT].supabase.co/rest/v1/pph21_ter_rates?select=*" \
      -H "apikey: [ANON_KEY]" \
      -H "Authorization: Bearer [ANON_KEY]"
  Expected: Returns data (public read policy)
  
  Fail if: payslip_audits returns data unauthenticated, OR pph21_ter_rates returns empty

TEST 2.7 — OCR Quota Counter Function
  Method: Call the increment_ocr_counter() RPC via API.
  Read src/lib/db/queries.ts — verify incrementOCRCounter function exists.
  Read supabase/migrations/005_wajar_slip_tables.sql — verify function definition.
  Expected: Function exists and handles UPSERT correctly.

════════════════════════════════════════════════════════════════════
SECTION 3: AUTHENTICATION TESTS
════════════════════════════════════════════════════════════════════

TEST 3.1 — Login Page Renders
  Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/login
  Expected: 200

TEST 3.2 — Protected Route Redirects
  Run: curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/dashboard
  Expected: Final status 200 (after redirect), AND the redirect chain should pass through /auth/login
  
  Run: curl -s -v http://localhost:3000/dashboard 2>&1 | grep "location:"
  Expected: Contains "/auth/login"
  Fail if: Dashboard loads without auth (no redirect)

TEST 3.3 — Auth Callback Route Exists
  Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/callback
  Expected: 307 or 302 (redirect — no code param = redirect away)
  Fail if: 404

TEST 3.4 — getCurrentUser Helper
  Read src/lib/auth/getUser.ts
  Verify it:
    - Uses createServerClient with cookies()
    - Calls supabase.auth.getUser()
    - Queries user_profiles.subscription_tier
    - Returns { user, tier, supabase }
    - Defaults tier to 'free' if no profile found
  Fail if: File doesn't exist OR queries auth.getSession() instead of auth.getUser() 
  (getSession() is insecure — must use getUser() for server-side auth)

TEST 3.5 — PremiumGate Component Logic
  Read src/components/shared/PremiumGate.tsx
  Verify TIER_RANK logic:
    free = 0, basic = 1, pro = 2
  Verify: tier comparison is TIER_RANK[currentTier] >= TIER_RANK[requiredTier]
  
  Simulate:
    currentTier='free', requiredTier='basic' → isAllowed should be FALSE → blur shown
    currentTier='basic', requiredTier='basic' → isAllowed should be TRUE → content shown
    currentTier='pro', requiredTier='basic' → isAllowed should be TRUE → content shown
    currentTier='free', requiredTier='pro' → isAllowed should be FALSE → blur shown
  Fail if: Logic is inverted or comparison is wrong

TEST 3.6 — Middleware Protects /dashboard Only
  Read src/middleware.ts
  Verify: Only /dashboard is protected (NOT /wajar-slip, /wajar-gaji, etc.)
  Verify: supabase.auth.getUser() is used (not getSession)
  Verify: cookies are properly handled with SSR createServerClient
  Fail if: Tool pages are also protected, or wrong auth method used

════════════════════════════════════════════════════════════════════
SECTION 4: WAJAR SLIP — CALCULATION ENGINE TESTS
════════════════════════════════════════════════════════════════════

These are the most critical tests. Wrong calculations = direct user harm.

TEST 4.1 — TER Category Assignment
  Read src/lib/calculations/pph21.ts
  Verify getTERCategory() function:
    'TK/0' → 'A'
    'TK/1' → 'A'
    'K/0' → 'B'
    'K/1' → 'B'
    'TK/2' → 'B'
    'TK/3' → 'B'
    'K/2' → 'C'
    'K/3' → 'C'
    'K/I/0' → 'C'
    'K/I/3' → 'C'
  Fail if: Any mapping is wrong

TEST 4.2 — PPh21 TER Calculation (Standard Case)
  API Test: POST http://localhost:3000/api/audit-payslip
  Body:
    {
      "grossSalary": 7500000,
      "ptkpStatus": "TK/0",
      "city": "Jakarta",
      "monthNumber": 10,
      "year": 2025,
      "hasNPWP": true,
      "reportedDeductions": {
        "pph21": 112500,
        "jhtEmployee": 150000,
        "jpEmployee": 75000,
        "jkkEmployee": 0,
        "jkmEmployee": 0,
        "kesehatanEmployee": 75000,
        "takeHome": 7087500
      }
    }
  
  Calculation to verify manually:
    Gross: 7,500,000
    TER Category: A (TK/0)
    TER Rate for 7,500,001-8,550,000 TER A: 1.50%
    Expected PPh21: 7,500,000 × 1.50% = 112,500 ✓
    JHT employee: 7,500,000 × 2% = 150,000 ✓
    JP employee: min(7,500,000, 9,559,600) × 1% = 75,000 ✓
    Kesehatan: min(7,500,000, 12,000,000) × 1% = 75,000 ✓
  
  Expected API response:
    verdict: "SESUAI"
    violationCount: 0
    violations: []
  
  Fail if: Verdict is not SESUAI OR violation count > 0

TEST 4.3 — V06 UMK Critical Violation
  POST http://localhost:3000/api/audit-payslip
  Body:
    {
      "grossSalary": 3000000,
      "ptkpStatus": "TK/0",
      "city": "Kota Bekasi",
      "monthNumber": 5,
      "year": 2025,
      "hasNPWP": true,
      "reportedDeductions": {
        "pph21": 0, "jhtEmployee": 60000, "jpEmployee": 30000,
        "jkkEmployee": 0, "jkmEmployee": 0, "kesehatanEmployee": 30000,
        "takeHome": 2880000
      }
    }
  
  Expected:
    verdict: "ADA_PELANGGARAN"
    violations: contains item with code "V06"
    violations[V06].severity: "CRITICAL"
  
  Why: Bekasi UMK 2026 is ~IDR 5,331,680. Salary IDR 3,000,000 is below UMK.
  Fail if: V06 not detected OR severity is not CRITICAL

TEST 4.4 — V04 PPh21 Underpaid
  POST http://localhost:3000/api/audit-payslip
  Body: same as 4.2 but "pph21": 0 (not withholding when should be 112,500)
  
  Expected violations:
    V03 (PPh21 not withheld — 0 when >10K calculated)
    OR V04 depending on implementation
  
  Fail if: No PPh21 violation detected

TEST 4.5 — V01 JHT Missing
  POST with jhtEmployee: 0, all other values correct
  Expected: violations contains V01
  Fail if: V01 not detected

TEST 4.6 — December True-up (Month 12)
  POST http://localhost:3000/api/audit-payslip
  Body:
    {
      "grossSalary": 8500000,
      "ptkpStatus": "TK/0",
      "city": "Jakarta",
      "monthNumber": 12,
      "year": 2025,
      "hasNPWP": true,
      "reportedDeductions": { ... any values ... }
    }
  
  Verify in response OR in calculation logs:
    Method used: PROGRESSIVE (not TER for December)
    Annual gross: 8,500,000 × 12 = 102,000,000
    PTKP TK/0 annual: 54,000,000
    PKP: 102,000,000 - 54,000,000 = 48,000,000
    Annual PPh21: 48,000,000 × 5% = 2,400,000
    TER paid months 1-11: 8,500,000 × 1.75% × 11 = 1,631,250
    December PPh21: 2,400,000 - 1,631,250 = 768,750
  
  Read src/lib/calculations/pph21.ts — verify month === 12 triggers progressive method.
  Fail if: December uses TER rate instead of progressive

TEST 4.7 — No NPWP 20% Surcharge
  POST same as 4.2 but "hasNPWP": false
  Expected: calculated_pph21 = 112,500 × 1.20 = 135,000
  Verify: If reported pph21 = 112,500 (no surcharge applied) → V04 violation detected
  Fail if: Surcharge not applied

TEST 4.8 — BPJS JP Salary Cap
  POST with grossSalary: 20,000,000 (above JP cap of 9,559,600)
  Expected: JP employee = 9,559,600 × 1% = 95,596 (NOT 200,000)
  Verify in response: calculations.correctJp = 95596
  Fail if: JP calculated on full 20M salary (200,000) instead of capped value

TEST 4.9 — Kesehatan Salary Cap
  POST with grossSalary: 15,000,000 (above Kesehatan cap of 12,000,000)
  Expected: Kesehatan = 12,000,000 × 1% = 120,000 (NOT 150,000)
  Fail if: Kesehatan calculated on 15M instead of 12M cap

TEST 4.10 — Audit Saved to Database
  After any successful POST, check:
    Read src/app/api/audit-payslip/route.ts
    Verify: INSERT into payslip_audits happens for every successful calculation
    Verify: is_paid_result is set correctly based on user tier
    Verify: violations stored as JSONB array
  Fail if: No DB insert in the audit route code

TEST 4.11 — Rate Limiting (5/IP/hour for anonymous)
  This test requires the rate limiter to be implemented.
  Read src/lib/ratelimit.ts OR src/middleware.ts
  Verify: Rate limit logic exists for /api/audit-payslip with windowSeconds=3600, maxRequests=5
  
  If Vercel KV is not available locally, verify the in-memory fallback exists.
  Fail if: No rate limiting code found

TEST 4.12 — Invalid City Returns 400
  POST http://localhost:3000/api/audit-payslip
  Body: same as 4.2 but "city": "Atlantis Tidak Ada"
  Expected: HTTP 400, error.code = "INVALID_CITY"
  Fail if: Returns 200 or 500 instead of 400

TEST 4.13 — Freemium Gate on Violation IDR Amounts
  POST as unauthenticated (no auth header/cookie) with violations present (use Test 4.3 input)
  Expected response:
    isGated: true (free tier)
    violations[*].differenceIDR: null (hidden for free tier)
    violations[*].code: visible (codes shown to all)
  
  Read the API route — verify gate logic: isPaidResult = tier !== 'free'
  Fail if: IDR amounts visible without payment

════════════════════════════════════════════════════════════════════
SECTION 5: WAJAR SLIP — OCR PIPELINE TESTS
════════════════════════════════════════════════════════════════════

TEST 5.1 — Upload Endpoint Exists
  Run: curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/ocr/upload
  Expected: 400 (no file = validation error, but endpoint exists)
  Fail if: 404 (endpoint doesn't exist)

TEST 5.2 — File Type Validation
  Create a test text file: echo "test" > /tmp/test.txt
  Upload it:
    curl -s -X POST http://localhost:3000/api/ocr/upload \
      -F "file=@/tmp/test.txt" \
      -F "sessionId=550e8400-e29b-41d4-a716-446655440000" | jq .
  Expected: error.code = "INVALID_FILE_TYPE"
  Fail if: Text file accepted as valid payslip

TEST 5.3 — File Size Validation
  Create a fake large file: dd if=/dev/urandom of=/tmp/large.jpg bs=1M count=6
  Upload it (6MB > 5MB limit):
    curl -s -X POST http://localhost:3000/api/ocr/upload \
      -F "file=@/tmp/large.jpg" \
      -F "sessionId=550e8400-e29b-41d4-a716-446655440000" | jq .
  Expected: error.code = "FILE_TOO_LARGE"
  Fail if: Large file accepted

TEST 5.4 — Quota Check Endpoint
  Run: curl -s http://localhost:3000/api/ocr/quota | jq .
  Expected: { "monthlyCount": <number>, "isQuotaAvailable": true|false, "source": "google_vision"|"tesseract" }
  Fail if: Endpoint missing or response malformed

TEST 5.5 — Google Vision Integration Code Review
  Read src/lib/ocr/google-vision.ts (or wherever Vision is implemented)
  Verify these field patterns exist:
    Pattern for "gaji bruto" or "gaji pokok"
    Pattern for "pph21" or "pph 21" or "pajak penghasilan"
    Pattern for "jht" or "jaminan hari tua"
    Pattern for "jp" or "jaminan pensiun"
    Pattern for "kesehatan" or "bpjs kes"
    Pattern for "take home" or "gaji diterima"
  Verify: parseIDR() handles Indonesian dot-formatted numbers ("1.234.567" → 1234567)
  Fail if: Any critical pattern missing OR parseIDR doesn't handle Indonesian format

TEST 5.6 — OCR Routing Decision Logic
  Read the OCR processing code
  Verify routing thresholds:
    confidence >= 0.92 → AUTO_ACCEPT
    0.80 <= confidence < 0.92 → SOFT_CHECK
    confidence < 0.80 → MANUAL_REQUIRED
  Fail if: Wrong thresholds OR routing logic inverted

TEST 5.7 — Storage Bucket Configuration
  Read src/app/api/ocr/upload/route.ts
  Verify: Files uploaded to 'payslips' bucket (not public bucket)
  Verify: File path includes userId or session-based prefix
  Verify: serviceClient (not anonKey client) used for storage upload
  Fail if: Using public bucket, or anon client for storage

TEST 5.8 — Tesseract.js Lazy Loading
  Run: pnpm build (if not already done)
  Check .next/static/ for tesseract-related files
  Verify: Tesseract is NOT in the main bundle (it's lazy-loaded)
  Alternatively: Read the import statement — must use dynamic import()
  
  Read src/lib/ocr/tesseract-client.ts
  Verify: const { createWorker } = await import('tesseract.js') — lazy import
  Fail if: import tesseract from 'tesseract.js' at top of file (eager import)

════════════════════════════════════════════════════════════════════
SECTION 6: WAJAR GAJI — SALARY BENCHMARK TESTS
════════════════════════════════════════════════════════════════════

TEST 6.1 — Benchmark API Basic Call
  Run: curl -s "http://localhost:3000/api/salary/benchmark?jobTitle=Software+Engineer&city=Jakarta&province=DKI+Jakarta&experienceBucket=3-5" | jq .
  Expected:
    success: true
    data.matchedTitle: "Software Engineer" (or similar)
    data.matchType: "EXACT" or "FUZZY"
    data.provinceP50: > 0 (some salary value)
    data.umk: > 0 (Jakarta UMK)
  Fail if: success=false OR provinceP50 is null/0

TEST 6.2 — Fuzzy Title Match
  Run: curl -s "http://localhost:3000/api/salary/benchmark?jobTitle=software+eng&city=Jakarta&province=DKI+Jakarta&experienceBucket=3-5" | jq .
  Expected:
    data.matchType: "FUZZY" (not EXACT, not NO_MATCH)
    data.matchedTitle: some title containing "Engineer" or "Developer"
  Fail if: Returns NO_MATCH for "software eng" (fuzzy should catch this)

TEST 6.3 — UMK Always Returned
  Any benchmark call must include UMK:
  Run: curl -s "http://localhost:3000/api/salary/benchmark?jobTitle=HRD+Officer&city=Kota+Bekasi&province=Jawa+Barat&experienceBucket=0-2" | jq .data.umk
  Expected: A number > 5000000 (Bekasi UMK 2026 is ~5.3M)
  Fail if: UMK is null or 0

TEST 6.4 — Confidence Badge Logic
  Read src/lib/calculations/ or the benchmark API route
  Verify assignConfidenceBadge() function:
    n >= 30 AND data < 6 months old → level: 'HIGH', label: 'Terverifikasi'
    n >= 10 → level: 'MEDIUM', label: 'Cukup'
    BPS prior only → level: 'LOW', label: 'Estimasi berdasarkan data BPS'
  Fail if: Logic inverted or labels wrong

TEST 6.5 — Bayesian Blending Math
  Read the blendBayesian function (likely in src/lib/calculations/ or the API route)
  
  Simulate with n=8, k=15, sampleP50=12500000, priorP50=9800000:
    Expected: (8/23) × 12500000 + (15/23) × 9800000
           = 4347826 + 6389130
           = ~10,736,956
  
  Verify the formula matches: weight = n/(n+k), result = weight*sample + (1-weight)*prior
  Fail if: Formula is wrong OR k constant is not ~15

TEST 6.6 — Crowdsource Submission Accepted
  Run: curl -s -X POST http://localhost:3000/api/salary/submit \
    -H "Content-Type: application/json" \
    -d '{"jobTitle":"Software Engineer","city":"Jakarta","province":"DKI Jakarta","grossSalary":12000000,"experienceBucket":"3-5"}' | jq .
  Expected: { "success": true, "data": { "accepted": true, "isDuplicate": false } }
  Fail if: Not accepted OR unexpected error

TEST 6.7 — Duplicate Submission Detection
  Run the same curl from 6.6 again immediately (same IP, same data):
  Expected: { "data": { "isDuplicate": true } } OR accepted=false
  Fail if: Duplicate accepted without flagging

TEST 6.8 — Outlier Rejection
  Submit an absurdly high salary:
  curl -s -X POST http://localhost:3000/api/salary/submit \
    -H "Content-Type: application/json" \
    -d '{"jobTitle":"Software Engineer","city":"Jakarta","province":"DKI Jakarta","grossSalary":999999999999,"experienceBucket":"3-5"}' | jq .
  Expected: violatesOutlierRule: true OR accepted: false
  Fail if: IDR 999 billion salary accepted as valid

TEST 6.9 — City Dropdown Data Available
  Run: curl -s http://localhost:3000/api/cities | jq 'length'
  Expected: >= 50 cities returned
  Fail if: Less than 50 cities or endpoint missing

TEST 6.10 — Free Tier Gates P25/P75
  Benchmark call without auth:
  curl -s "http://localhost:3000/api/salary/benchmark?jobTitle=Software+Engineer&city=Jakarta&province=DKI+Jakarta&experienceBucket=3-5" | jq .data
  Expected:
    isGated: true
    cityP25: undefined/null (gated)
    cityP75: undefined/null (gated)
    provinceP50: present (always shown)
  Fail if: cityP25/cityP75 present for free tier

════════════════════════════════════════════════════════════════════
SECTION 7: WAJAR TANAH — PROPERTY TESTS
════════════════════════════════════════════════════════════════════

TEST 7.1 — Property Benchmark API
  Check if property data exists first:
    curl -s "http://localhost:3000/api/property/districts?province=DKI+Jakarta&city=Jakarta+Selatan" | jq 'length'
  If 0 districts → scraper hasn't been run yet → WARN (not FAIL for now)
  If > 0 districts → proceed with full test:
    curl -s "http://localhost:3000/api/property/benchmark?province=DKI+Jakarta&city=Jakarta+Selatan&district=Kebayoran+Baru&propertyType=RUMAH&landAreaSqm=100&askingPriceTotal=2000000000" | jq .
  Expected: verdict (MURAH/WAJAR/MAHAL/SANGAT_MAHAL), p50 value, kjppDisclaimer

TEST 7.2 — Price Per Sqm Calculation
  Input: askingPriceTotal=2,000,000,000, landAreaSqm=100
  Expected: askingPricePerSqm = 20,000,000 (IDR 20M/m²)
  Verify the calculation happens correctly in the API route.
  Read src/app/api/property/benchmark/route.ts
  Verify: pricePerSqm = askingPriceTotal / landAreaSqm
  Fail if: Division is wrong or inverted

TEST 7.3 — Verdict Algorithm Correctness
  Read src/lib/calculations/property.ts (or wherever calculatePropertyVerdict is)
  
  Test with p25=8000000, p50=10000000, p75=12000000 (IQR=4000000):
    askingPrice=6000000 (below p25-0.5*iqr = 8M-2M = 6M → boundary case): MURAH
    askingPrice=11000000 (between p25 and p75): WAJAR
    askingPrice=16000000 (p75+1.5*iqr = 12M+6M = 18M threshold): MAHAL
    askingPrice=20000000 (above p75+1.5*iqr=18M): SANGAT_MAHAL
  
  Verify verdict thresholds match these expected outputs.
  Fail if: Any verdict is wrong

TEST 7.4 — No Data State
  curl -s "http://localhost:3000/api/property/benchmark?province=Papua&city=Kota+Jayapura&district=Abepura&propertyType=RUMAH&landAreaSqm=100&askingPriceTotal=1000000000" | jq .data.hasData
  Expected: false (likely no data for Papua in seed)
  Fail if: Error instead of graceful hasData:false response

TEST 7.5 — KJPP Disclaimer Present
  Read src/app/api/property/benchmark/route.ts
  Verify: KJPP_DISCLAIMER constant is included in every response
  Read the disclaimer text — must include "KJPP" and "tidak bertanggung jawab"
  Fail if: Disclaimer missing from response

TEST 7.6 — Python Scraper Code Review
  Read agents/scrapers/property_99co.py
  Verify these safety controls:
    1. CAPTCHA detection → immediately stops (never bypasses)
    2. Rate limiting: MIN_DELAY >= 4.0 seconds
    3. Random delay: uses random.uniform (not fixed delay)
    4. User-agent header set (basic stealth)
  
  Verify legal notice comment is at top of file.
  Fail if: CAPTCHA bypass code present, OR no rate limiting, OR delay < 2 seconds

TEST 7.7 — Outlier Detection in Scraper
  Read agents/scrapers/property_99co.py — flag_outliers() method
  Verify: Uses IQR 1.5× fence (q1 - 1.5*iqr, q3 + 1.5*iqr)
  Verify: is_outlier=True for outlier records (not deleted, just flagged)
  Verify: Property benchmarks query uses WHERE is_outlier=false
  Fail if: Outliers deleted instead of flagged, OR benchmark includes outliers

════════════════════════════════════════════════════════════════════
SECTION 8: WAJAR KABUR — ABROAD COMPARISON TESTS
════════════════════════════════════════════════════════════════════

TEST 8.1 — PPP API for Free Country (Singapore)
  Run: curl -s "http://localhost:3000/api/abroad/compare?currentIDRSalary=8500000&targetCountry=SG" | jq .
  Expected:
    success: true
    data.isGated: false (SG is free tier)
    data.nominalEquivalent: ~730 (IDR 8.5M / ~11,644 exchange rate)
    data.nominalCurrency: "SGD"
    data.pppFactor: > 0
    data.pppYear: >= 2022
  Fail if: isGated=true for SG OR missing PPP data

TEST 8.2 — PPP Calculation Math
  From test 8.1 response, verify:
    data.userPowerIntlUSD ≈ 8,500,000 / 4,790 ≈ 1,775 international dollars
  (Indonesia PPP factor ~4,790 IDR per international dollar, 2023)
  Allow ±20% for PPP factor variation by year.
  Fail if: userPowerIntlUSD < 1000 OR > 4000 (would indicate wrong formula)

TEST 8.3 — Non-Free Country Gated for Free Users
  Run: curl -s "http://localhost:3000/api/abroad/compare?currentIDRSalary=8500000&targetCountry=JP" | jq .data.isGated
  Expected: true (Japan is not in free tier)
  Fail if: Japan available without auth for free tier

TEST 8.4 — All 15 Countries Present
  Run: curl -s http://localhost:3000/api/abroad/countries | jq 'length'
  Expected: 15
  Fail if: Less than 15 countries returned

TEST 8.5 — Free Tier Countries (5 correct ones)
  Run: curl -s http://localhost:3000/api/abroad/countries | jq '[.[] | select(.is_free_tier==true) | .country_code]'
  Expected: ["SG","MY","AU","US","GB"] (order may vary)
  Fail if: Wrong countries or wrong count in free tier

TEST 8.6 — World Bank PPP Caching
  Read src/lib/external/worldbank.ts
  Verify: Cache check happens before API call
  Verify: Cache lifetime is 30 days (not 1 day — PPP data is annual)
  Verify: Stale cache is used as fallback if API fails
  Fail if: No caching implemented (would exhaust World Bank requests)

TEST 8.7 — Exchange Rate (Frankfurter.app)
  Read src/lib/external/exchangerates.ts
  Verify: Uses https://api.frankfurter.app (not forex.com or paid APIs)
  Verify: 24-hour cache
  Verify: Graceful null return on failure (not throw)
  Run: curl -s https://api.frankfurter.app/latest?from=IDR&to=SGD
  Expected: { rates: { SGD: <number> } } — if this returns 200, integration is correct

════════════════════════════════════════════════════════════════════
SECTION 9: WAJAR HIDUP — COL COMPARISON TESTS
════════════════════════════════════════════════════════════════════

TEST 9.1 — COL Compare API
  Run: curl -s "http://localhost:3000/api/col/compare?fromCity=JKT&toCity=SBY&currentSalary=12000000&lifestyleTier=STANDAR" | jq .
  Expected:
    data.fromCOLIndex: 100.0 (Jakarta baseline)
    data.toCOLIndex: 78.5 (Surabaya from seed data)
    data.adjustedRatio: ~0.785
    data.requiredSalary: ~9420000 (12,000,000 × 0.785)
    data.verdict: "LEBIH_MURAH"
  Fail if: Wrong indices, wrong ratio, wrong verdict

TEST 9.2 — Same City Error
  Run: curl -s "http://localhost:3000/api/col/compare?fromCity=JKT&toCity=JKT&currentSalary=10000000&lifestyleTier=STANDAR" | jq .
  Expected: HTTP 400, error.code contains "SAME_CITY"
  Fail if: Returns calculation result instead of error

TEST 9.3 — Lifestyle Tier Multiplier
  Compare HEMAT vs NYAMAN for same city pair:
  curl -s "http://localhost:3000/api/col/compare?fromCity=JKT&toCity=SBY&currentSalary=12000000&lifestyleTier=HEMAT" | jq .data.adjustedRatio
  curl -s "http://localhost:3000/api/col/compare?fromCity=JKT&toCity=SBY&currentSalary=12000000&lifestyleTier=NYAMAN" | jq .data.adjustedRatio
  
  Expected: NYAMAN ratio shows bigger savings (lower number) than HEMAT
  Because: Nyaman multiplier=1.30 amplifies cheaper-city benefit more
  
  For JKT→SBY (toIndex=78.5, fromIndex=100):
    baseRatio = 0.785
    HEMAT: 1 + (0.785-1) × 0.70 = 1 + (-0.1505) = 0.8495
    STANDAR: 1 + (0.785-1) × 1.00 = 0.785
    NYAMAN: 1 + (0.785-1) × 1.30 = 1 + (-0.2795) = 0.7205
  
  Expected: NYAMAN adjustedRatio < STANDAR < HEMAT (all < 1.0)
  Fail if: HEMAT ratio < NYAMAN ratio (lifestyle math is inverted)

TEST 9.4 — COL Cities Endpoint
  Run: curl -s http://localhost:3000/api/col/cities | jq 'length'
  Expected: 20 (seed data has 20 cities)
  Fail if: Less than 20 cities

TEST 9.5 — Jakarta COL Index Is 100
  Run: curl -s http://localhost:3000/api/col/cities | jq '.[] | select(.cityCode=="JKT") | .colIndex'
  Expected: 100 (Jakarta is the baseline)
  Fail if: Jakarta index is not 100.0

════════════════════════════════════════════════════════════════════
SECTION 10: PAYMENT & MONETIZATION TESTS
════════════════════════════════════════════════════════════════════

TEST 10.1 — Create Transaction Requires Auth
  Run: curl -s -X POST http://localhost:3000/api/payment/create-transaction \
    -H "Content-Type: application/json" \
    -d '{"plan":"basic","billingPeriod":"monthly"}' | jq .
  Expected: HTTP 401 (unauthorized — must be logged in)
  Fail if: Transaction created without auth

TEST 10.2 — Webhook Signature Verification
  Test with invalid signature:
    Read src/app/api/webhooks/midtrans/route.ts
    Verify: crypto.timingSafeEqual is used (not === comparison)
    Verify: SHA512 hash = order_id + status_code + gross_amount + server_key
  
  Actually test with wrong signature:
  curl -s -X POST http://localhost:3000/api/webhooks/midtrans \
    -H "Content-Type: application/json" \
    -d '{"order_id":"CW-test-1234","status_code":"200","gross_amount":"29000","signature_key":"wrong_signature","transaction_status":"settlement"}' | jq .
  Expected: HTTP 401 { "error": "Invalid signature" }
  Fail if: Webhook accepted with wrong signature (CRITICAL SECURITY FAILURE)

TEST 10.3 — Webhook Idempotency
  Read src/app/api/webhooks/midtrans/route.ts
  Verify: is_webhook_processed flag check exists
  Verify: If is_webhook_processed=true AND status=settlement → returns "already_processed" without re-activating
  Fail if: No idempotency check (double-payment could double-activate)

TEST 10.4 — Amount Verification in Webhook
  Read the webhook handler
  Verify: gross_amount from webhook is compared against DB stored amount
  Verify: Mismatch returns 400 error, not silent acceptance
  Fail if: Amount not verified (attacker could modify gross_amount in webhook)

TEST 10.5 — Pricing Constants
  Read src/app/upgrade/page.tsx OR src/app/api/payment/create-transaction/route.ts
  Verify pricing:
    basic monthly: 29,000 IDR
    basic annual: 278,400 IDR (= 29,000 × 12 × 0.80)
    pro monthly: 79,000 IDR
    pro annual: 758,400 IDR (= 79,000 × 12 × 0.80)
  Fail if: Any price is wrong

TEST 10.6 — Subscription Tier Update After Payment
  Read the activateSubscription function in webhook route
  Verify:
    1. subscriptions table is upserted (not inserted — prevents duplicate rows)
    2. user_profiles.subscription_tier is updated
    3. BOTH updates happen (if only one, user won't see tier change)
  Fail if: user_profiles not updated (features would still be gated even after payment)

TEST 10.7 — Order ID Format
  Read create-transaction route
  Verify order ID format: CW-{userId[:8]}-{timestamp}-{plan}-{period}
  This format is parsed in activateSubscription to extract plan+period.
  
  Verify parsing logic: parts = orderId.split('-'), plan = parts[parts.length-2], period = parts[last]
  
  Test with "CW-a1b2c3d4-1704067200000-basic-monthly":
    parts = ['CW', 'a1b2c3d4', '1704067200000', 'basic', 'monthly']
    plan = parts[3] = 'basic' ✓
    period = parts[4] = 'monthly' ✓
  Fail if: Parsing would fail with this format

TEST 10.8 — Midtrans Snap Script Loading
  Read src/app/upgrade/page.tsx
  Verify: Script src changes based on MIDTRANS_IS_PRODUCTION:
    false → https://app.sandbox.midtrans.com/snap/snap.js
    true → https://app.midtrans.com/snap/snap.js
  Fail if: Always loads sandbox or always loads production

TEST 10.9 — Legal Pages Exist and Have Content
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/privacy-policy
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/terms
  Expected: Both return 200
  
  Read src/app/privacy-policy/page.tsx — verify content length > 500 characters
  Verify mentions: UU PDP, "30 hari" (payslip retention), "privacy@cekwajar.id"
  Fail if: Either page returns 404 OR content is placeholder text only

TEST 10.10 — Cookie Consent Component
  Read src/components/layout/CookieConsent.tsx
  Verify: Shows when localStorage.getItem('cookie_consent') === null
  Verify: Sets localStorage on accept/reject
  Verify: Has Indonesian text ("setuju", "tolak", or similar)
  Fail if: Component missing OR uses cookies() server-side instead of localStorage

════════════════════════════════════════════════════════════════════
SECTION 11: SECURITY DEEP AUDIT
════════════════════════════════════════════════════════════════════

TEST 11.1 — Security Headers Configured
  Read next.config.ts
  Verify these headers are configured in async headers():
    X-Frame-Options: SAMEORIGIN
    X-Content-Type-Options: nosniff
    Strict-Transport-Security: includes max-age
    Content-Security-Policy: present and restrictive
  Fail if: Any header missing

TEST 11.2 — CSP Allows Required Domains
  Read the CSP header value
  Verify connect-src includes:
    *.supabase.co (for DB calls)
    api.worldbank.org (for PPP data)
    api.frankfurter.app (for exchange rates)
    vision.googleapis.com (for OCR)
    app.sandbox.midtrans.com OR app.midtrans.com (for payments)
  Fail if: Required domains not in connect-src (would break functionality)

TEST 11.3 — No SQL Injection Possible
  All Supabase queries must use parameterized queries or the ORM, never string concatenation.
  
  Search for dangerous patterns:
    grep -r "\.query(\`" src/ --include="*.ts" --include="*.tsx"
    grep -r "sql\`" src/ --include="*.ts" --include="*.tsx"
  
  If raw SQL found, verify it uses parameterized values ($1, $2 style), not string interpolation.
  
  Check the benchmark API for city input (common injection point):
    Read src/app/api/salary/benchmark/route.ts
    Verify city is passed as parameter, not interpolated into SQL string
  Fail if: Any raw string interpolation in SQL queries

TEST 11.4 — Service Role Key Never in Client Bundle
  Run: pnpm build (if not already done)
  Run: grep -r "service_role" .next/static/ 2>/dev/null
  Expected: Zero matches (service_role key not in browser bundle)
  Fail if: service_role found in static files

TEST 11.5 — User Can't Self-Promote Tier
  Read src/lib/auth/getUser.ts
  Verify: subscription_tier is ALWAYS read from DB (user_profiles table)
  Verify: NEVER read from JWT claims or request headers
  
  Look for any code that reads tier from request:
    grep -r "headers.get.*tier\|query.*tier\|body.*tier" src/app/api/ --include="*.ts"
  Expected: Zero matches for tier-from-client patterns
  Fail if: Tier can be set by client headers or query params

TEST 11.6 — Webhook Uses Service Role (Bypasses RLS)
  Read src/app/api/webhooks/midtrans/route.ts
  Verify: getServiceClient() is used (not createBrowserClient or regular server client)
  This is CORRECT — webhook needs to update subscriptions/user_profiles which requires service_role
  Fail if: Using anon client in webhook (would fail RLS)

TEST 11.7 — Anonymous Payslip Audit Data Isolation
  Read src/app/api/audit-payslip/route.ts AND supabase/migrations/011_rls_all_tools.sql
  Verify RLS policy for anonymous SELECT:
    "anon_select_recent": created_at > now() - INTERVAL '2 hours'
  This means anonymous users can only see audits from the last 2 hours.
  Fail if: Anonymous policy allows SELECT without time restriction (privacy risk on shared devices)

TEST 11.8 — PaySlip Files Use Signed URLs (Not Public)
  Read storage-related code in OCR upload
  Verify: Files are in 'payslips' bucket (private, not 'public' bucket)
  Verify: When creating download URLs: createSignedUrl() used, not getPublicUrl()
  Fail if: Using public URLs for payslip files

TEST 11.9 — validateEnvVars() Prevents Misconfigured Launch
  Read src/lib/config/validate.ts (or wherever env validation is)
  Verify: Checks all required env vars at startup
  Verify: Throws Error (not just console.warn) if any missing
  Fail if: Missing or only warns instead of throws

════════════════════════════════════════════════════════════════════
SECTION 12: MOBILE & UX TESTS
════════════════════════════════════════════════════════════════════

TEST 12.1 — Input Font Size (iOS Zoom Prevention)
  Read all form input components
  Verify: No input has font-size less than 16px
  Common issue: text-sm (14px) in Tailwind → triggers iOS Safari zoom
  
  Search for: grep -r "text-sm\|text-xs" src/components/ --include="*.tsx" | grep "input\|Input"
  If found: Check if these are label elements (OK) or input elements (FAIL)
  Fail if: Input elements have font-size < 16px

TEST 12.2 — Touch Target Sizes
  Read the CTA button components
  Verify: Main CTA buttons have min-height: 56px on mobile (h-14 in Tailwind = 56px)
  Verify: Nav links on mobile have min-height: 44px
  Read src/components/layout/GlobalNav.tsx
  Fail if: Buttons or nav links clearly too small for touch (< h-10 = 40px)

TEST 12.3 — Error Messages in Indonesian
  Read src/app/api/audit-payslip/route.ts — all error messages
  Verify: error.message is in Bahasa Indonesia for user-facing errors
  Examples: "Kota tidak ditemukan", "Gaji tidak valid", "Terlalu banyak permintaan"
  Fail if: English error messages returned to Indonesian users

TEST 12.4 — Disclaimer Banners Present
  Read src/app/wajar-slip/page.tsx — verify DisclaimerBanner with PMK 168/2023 text
  Read src/app/wajar-tanah/page.tsx — verify KJPP disclaimer
  Read src/app/wajar-kabur/page.tsx — verify PPP accuracy disclaimer
  Fail if: Any critical disclaimer missing

TEST 12.5 — Loading States (No Flash of Content)
  Read each tool page
  Verify: Loading spinner or skeleton shown while API call is in-flight
  Verify: State machine includes CALCULATING state with loading UI
  Fail if: No loading state (user sees nothing during 2-8 second API calls)

TEST 12.6 — Error Recovery Actions
  Read src/lib/constants.ts or wherever error messages are defined
  Verify: Each error includes a recovery action for the user (not just "error occurred")
  Example: 
    INVALID_CITY → suggest nearest city dropdown
    RATE_LIMIT_EXCEEDED → "Coba lagi dalam 1 jam"
    NO_DATA → "Coba kecamatan terdekat"
  Fail if: Generic "something went wrong" without recovery guidance

════════════════════════════════════════════════════════════════════
SECTION 13: INTEGRATION FLOW TESTS
════════════════════════════════════════════════════════════════════

TEST 13.1 — Full Wajar Slip Flow (E2E)
  Simulate the complete user journey via API:
  
  Step 1: Check city data
    GET /api/cities → find "Jakarta" in response
  
  Step 2: Submit audit
    POST /api/audit-payslip with Jakarta data (Test 4.2 values)
  
  Step 3: Verify response
    verdict: "SESUAI"
    auditId: present (UUID format)
    isGated: true (anonymous user)
  
  Step 4: Simulate same audit with violations
    POST with PPh21=0 → V03 or V04 detected
    violations[0].differenceIDR: null (gated for anonymous)
  
  Pass: All 4 steps succeed correctly

TEST 13.2 — Full Wajar Gaji Flow (E2E)
  Step 1: GET /api/cities → find a city
  Step 2: GET /api/salary/benchmark-search?q=software → returns results
  Step 3: GET /api/salary/benchmark?jobTitle=...&city=...&province=...&experienceBucket=...
  Step 4: POST /api/salary/submit (crowdsource)
  
  Pass: All steps succeed, benchmark shows data

TEST 13.3 — Full Abroad Comparison Flow (E2E)
  Step 1: GET /api/abroad/countries → returns 15 countries
  Step 2: Verify Singapore (SG) is_free_tier=true
  Step 3: GET /api/abroad/compare?currentIDRSalary=8500000&targetCountry=SG
  Step 4: Verify: nominalEquivalent and userPowerIntlUSD both present and > 0
  
  Pass: All steps return valid data

TEST 13.4 — COL Comparison Bidirectional
  Test that the formula works in both directions:
  
  JKT → SBY (cheaper destination):
    GET /api/col/compare?fromCity=JKT&toCity=SBY&currentSalary=10000000&lifestyleTier=STANDAR
    Expected: verdict=LEBIH_MURAH, requiredSalary < 10000000
  
  SBY → JKT (more expensive destination):
    GET /api/col/compare?fromCity=SBY&toCity=JKT&currentSalary=8000000&lifestyleTier=STANDAR
    Expected: verdict=LEBIH_MAHAL, requiredSalary > 8000000
  
  Fail if: Either direction gives wrong verdict

TEST 13.5 — Auth Flow Integration
  Read src/middleware.ts — verify protected route logic
  Read src/app/auth/callback/route.ts — verify code exchange logic
  Read src/lib/auth/getUser.ts — verify getCurrentUser helper
  
  Verify the chain:
    1. User hits /dashboard unauthenticated → 307 to /auth/login
    2. User logs in → /auth/callback?code=X
    3. Callback exchanges code → sets session cookie
    4. User redirected to /dashboard
    5. getCurrentUser() reads session from cookie → returns user + tier
  
  Fail if: Any step in the chain is missing or broken

════════════════════════════════════════════════════════════════════
SECTION 14: PYTHON AGENTS CODE REVIEW
════════════════════════════════════════════════════════════════════

TEST 14.1 — Agent Files Exist
  Verify these files exist:
    agents/loaders/bps_loader.py
    agents/scrapers/property_99co.py
    agents/scrapers/property_rumah123.py
    agents/scrapers/jobstreet_scraper.py
  Also check: agents/requirements.txt OR agents/pyproject.toml (dependencies documented)
  
  If files exist but no requirements.txt: WARN
  If files missing: FAIL

TEST 14.2 — Python Dependencies Installable
  Run: cd agents && pip install -r requirements.txt --dry-run 2>&1 | tail -5
  OR: cd agents && python -c "import swarms, playwright, supabase; print('OK')" 2>&1
  Expected: No import errors
  Fail if: Critical imports fail

TEST 14.3 — Scraper Rate Limiting Compliance
  Read agents/scrapers/property_99co.py
  Verify: MIN_DELAY >= 4.0 (4 seconds minimum between requests)
  Verify: random.uniform(MIN_DELAY, MAX_DELAY) used (not just time.sleep(MIN_DELAY))
  
  Read agents/scrapers/jobstreet_scraper.py
  Verify: Same rate limiting pattern
  Fail if: delay < 2.0 seconds (too aggressive)

TEST 14.4 — CAPTCHA Detection Never Bypasses
  Read all scraper files
  Search for patterns that might bypass CAPTCHAs:
    grep -r "captcha\|CAPTCHA\|bypass" agents/ --include="*.py"
  
  Expected: "CAPTCHA detected" → return [] or raise exception (never solve it)
  Fail if: Any code attempts to solve/bypass CAPTCHA (UU ITE Pasal 30 risk)

TEST 14.5 — Legal Notice in Scraper Files
  Read the first 20 lines of each scraper file
  Verify: Comment explaining legal posture exists
  Key statements that should be present:
    "No authentication bypassed"
    "No CAPTCHA bypassed"
    "Rate limited"
    "ToS risk: IP ban"
  Fail if: No legal notice comment

════════════════════════════════════════════════════════════════════
SECTION 15: EDGE CASES & BOUNDARY TESTS
════════════════════════════════════════════════════════════════════

TEST 15.1 — Salary = Exactly UMK (Boundary)
  POST /api/audit-payslip with grossSalary = exact UMK value for that city
  Example: Jakarta, grossSalary=5396761 (exact UMK 2026)
  Expected: V06 NOT triggered (salary equals UMK, not below)
  Fail if: V06 triggered for salary = UMK (should be strict <, not <=)

TEST 15.2 — Maximum Salary (IDR 1 Billion)
  POST /api/audit-payslip with grossSalary=1000000000
  Expected: Valid calculation, no error
  Verify: TER rate applies at 25% (highest bracket)
  Fail if: Error or unexpected behavior at high salary

TEST 15.3 — Minimum Valid Salary
  POST /api/audit-payslip with grossSalary=500000
  Expected: Valid calculation (IDR 500K is minimum)
  POST with grossSalary=499999
  Expected: 400 error (below minimum)

TEST 15.4 — K/I PTKP (Both Spouses Working, Highest PTKP)
  POST /api/audit-payslip with ptkpStatus="K/I/3", grossSalary=15000000
  Expected calculation:
    PTKP K/I/3: IDR 126,000,000 annually = IDR 10,500,000/month
    PKP = 15,000,000 - 10,500,000 = 4,500,000/month annual equivalent: 54,000,000
    TER Category: C (K/I/3 maps to C)
    TER rate for TER C at 15M: check table
  Verify: TER category C is used, not A or B
  Fail if: Wrong TER category for K/I status

TEST 15.5 — Property Price Exactly at P50
  If property data exists, test asking price = exact P50:
  Expected: verdict = "WAJAR" (P50 is within WAJAR range since P50 <= P75)
  Fail if: P50 returns MAHAL or MURAH

TEST 15.6 — PPP Comparison for Cheapest Country
  Run: curl -s "http://localhost:3000/api/abroad/compare?currentIDRSalary=5000000&targetCountry=TH" | jq .
  (Thailand has lower PPP-adjusted cost of living)
  Expected: Calculation shows TH purchasing power may be close to or lower than ID
  Verify: No division by zero if PPP factor is very small
  Fail if: Server error (500) for any valid country

TEST 15.7 — Crowdsource Salary = Exactly 0.5× UMK (Boundary)
  POST /api/salary/submit with grossSalary = UMK × 0.5 (exactly on boundary)
  Example: Jakarta UMK 5,396,761 → grossSalary = 2,698,380 (exactly 0.5×)
  Expected: Likely accepted (boundary check is strictly < 0.5×, not <=)
  POST with grossSalary = 2,698,379 (just below 0.5×)
  Expected: violatesOutlierRule: true
  Fail if: Boundary logic is wrong direction

TEST 15.8 — December 12 + No NPWP (Combined Edge Case)
  POST /api/audit-payslip with monthNumber=12 AND hasNPWP=false AND grossSalary=8000000
  Expected:
    Method: PROGRESSIVE (December)
    Surcharge: ×1.20 applied to progressive result
  Verify: Both conditions applied correctly
  Fail if: Either condition not applied when both present

════════════════════════════════════════════════════════════════════
FINAL INSTRUCTIONS
════════════════════════════════════════════════════════════════════

After running ALL tests above:

1. For every FAIL: 
   - Show the exact failure (what was returned vs what was expected)
   - Identify the root cause (wrong code, missing data, config issue)
   - Attempt a fix if possible
   - Re-run the specific test to confirm fix
   - Update the result to PASS or leave as FAIL with status "Fixed: needs verification"

2. Generate the final report:
   - List every test result: ✅ PASS / ❌ FAIL / ⚠️ WARN
   - Group by section
   - Summary: X PASS / Y FAIL / Z WARN
   - LAUNCH READY determination:
     * YES: Zero FAIL results
     * CONDITIONAL: 1-3 FAIL on non-critical paths (e.g., property data not scraped yet)
     * NO: Any FAIL on: auth, payment security, calculation engine, or data exposure

3. If any test in these categories FAILS, it is a LAUNCH BLOCKER:
   - Section 11 (Security) — any failure
   - Test 4.2–4.13 (PPh21/BPJS calculations) — any failure
   - Test 10.1–10.4 (Payment security) — any failure
   - Test 3.2 (Unauthenticated dashboard access) — any failure

Run all tests now. Be thorough. Be honest. Fix what you can.

===MASTER TEST END===
```

---

## What This Test Covers

| Section | Tests | Critical? |
|---------|-------|-----------|
| 1. Environment | 7 tests | Yes |
| 2. Database integrity | 7 tests | Yes |
| 3. Authentication | 6 tests | Yes |
| 4. Wajar Slip engine | 13 tests | **LAUNCH BLOCKER** |
| 5. Wajar Slip OCR | 8 tests | Yes |
| 6. Wajar Gaji | 10 tests | Yes |
| 7. Wajar Tanah | 7 tests | Yes |
| 8. Wajar Kabur | 7 tests | Yes |
| 9. Wajar Hidup | 5 tests | Yes |
| 10. Payment system | 10 tests | **LAUNCH BLOCKER** |
| 11. Security audit | 9 tests | **LAUNCH BLOCKER** |
| 12. Mobile/UX | 6 tests | Yes |
| 13. Integration flows | 5 tests | Yes |
| 14. Python agents | 5 tests | Moderate |
| 15. Edge cases | 8 tests | Yes |
| **Total** | **113 tests** | |

---

## Expected Run Time

Claude Code will execute these tests sequentially. Expect:
- Pure code review tests: ~30 seconds each
- API call tests: ~2–5 seconds each
- Full build tests: ~2–3 minutes
- Python import verification: ~30 seconds

Total: approximately **45–90 minutes** for a full run with fixes.
