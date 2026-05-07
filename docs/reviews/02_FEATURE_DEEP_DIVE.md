# cekwajar.id — Feature Deep Dive: How Every Feature Works

> Last audited: 2026-04-27 | Every calculation, regex, threshold, and data flow documented.

---

## 1. WAJAR SLIP — Payslip Audit Engine

### What It Does
User uploads or manually enters their payslip data. The engine calculates what PPh21 and BPJS deductions SHOULD be according to Indonesian law (PMK 168/2023, UU HPP, PP 36/2021), then compares against what the employer actually deducted. Returns a verdict: SESUAI (compliant) or ADA_PELANGGARAN (violation found).

### User Flow
```
User arrives at /wajar-slip
    → Option A: Upload payslip image/PDF (OCR path)
    ��� Option B: Manual entry form (direct input)
    ↓
OCR Path: POST /api/ocr/upload → extract fields → user confirms/edits → submit
Manual Path: Fill form with gross salary, PTKP status, city, month, deductions → submit
    ↓
POST /api/audit-payslip
    ↓
Engine calculates expected deductions → compares with reported → detects violations
    ↓
Verdict displayed: green (SESUAI) or red (ADA_PELANGGARAN) with violation details
    ↓
Free tier: sees verdict + violation codes but NOT IDR amounts
Paid tier: sees full IDR breakdown + recommended actions
```

### PPh21 Calculation (PMK 168/2023 TER Method)

Step 1 — Determine TER Category from PTKP status:
- Category A: TK/0, TK/1 (single, 0-1 dependents)
- Category B: TK/2, TK/3, K/1, K/2 (single 2-3 deps, married 1-2 deps)
- Category C: K/3, K/I/0, K/I/1, K/I/2, K/I/3 (married 3 deps, combined income)

Step 2 — For months 1-11 (TER method):
```
terRate = lookup(category, grossSalary) from pph21_ter_rates table
         (slab-based: find row where grossSalary >= min_salary AND grossSalary <= max_salary)
monthlyTax = grossSalary × (terRate / 100)
pph21 = hasNPWP ? monthlyTax : monthlyTax × 1.20  (20% surcharge without NPWP)
```

Step 3 — For month 12 (December annual true-up):
```
annualGross = grossSalary × 12  (assumes same salary all year)
biayaJabatan = min(annualGross × 0.05, 6_000_000)  (5% max 6M/year)
ptkpAnnual = lookup PTKP value for status (e.g., TK/0 = 54,000,000)
pkp = max(0, annualGross - biayaJabatan - ptkpAnnual)  (Penghasilan Kena Pajak)

// Progressive brackets (UU HPP Pasal 17):
annualTax = 0
if (pkp > 0)         annualTax += min(pkp, 60M) × 0.05
if (pkp > 60M)       annualTax += min(pkp - 60M, 190M) × 0.15
if (pkp > 250M)      annualTax += min(pkp - 250M, 250M) × 0.25
if (pkp > 500M)      annualTax += min(pkp - 500M, 4.5B) × 0.30
if (pkp > 5B)        annualTax += (pkp - 5B) × 0.35

terMonthsTotal = monthlyTER × 11  (sum of months 1-11)
decemberTax = max(0, annualTax - terMonthsTotal)
pph21_dec = hasNPWP ? decemberTax : decemberTax × 1.20
```

PTKP Annual Values (PMK 101/2016):
- TK/0: 54,000,000 | TK/1: 58,500,000 | TK/2: 63,000,000 | TK/3: 67,500,000
- K/0: 58,500,000 | K/1: 63,000,000 | K/2: 67,500,000 | K/3: 72,000,000
- K/I/0: 112,500,000 | K/I/1: 117,000,000 | K/I/2: 121,500,000 | K/I/3: 126,000,000

### BPJS Calculation

```
JP_SALARY_CAP = 9,559,600      (hardcoded — should be DB-driven for annual updates)
KESEHATAN_SALARY_CAP = 12,000,000

// Employee contributions:
jhtEmployee = round(grossSalary × 0.02)                         // 2%, no cap
jpEmployee  = round(min(grossSalary, JP_SALARY_CAP) × 0.01)     // 1%, capped
kesehatanEmployee = round(min(grossSalary, KESEHATAN_SALARY_CAP) × 0.01)  // 1%, capped

// Employer contributions (for reference, not deducted from employee):
jhtEmployer = round(grossSalary × 0.037)                        // 3.7%
jpEmployer  = round(min(grossSalary, JP_SALARY_CAP) × 0.02)     // 2%, capped
kesehatanEmployer = round(min(grossSalary, KESEHATAN_SALARY_CAP) × 0.04) // 4%, capped
jkkEmployer = round(grossSalary × riskRate)  // 0.24%-1.74% by industry risk
jkmEmployer = round(grossSalary × 0.003)     // 0.3%
```

Note: JKK and JKM are employer-only. If any amount is deducted from employee, it's a CRITICAL violation.

### Violation Detection (V01–V07)

| Code | Name | Severity | Trigger Condition | Legal Basis | Recommended Action |
|---|---|---|---|---|---|
| V01 | Missing JHT | HIGH | reported jhtEmployee = 0 | PP 46/2015 | Register to BPJS Ketenagakerjaan |
| V02 | JP Underpaid | MEDIUM | jp difference > 5,000 IDR | PP 45/2015 | Correct JP deduction with payroll |
| V03 | Missing PPh21 | HIGH | reported pph21 = 0 but calculated > 10,000 | PMK 168/2023 | Consult tax advisor |
| V04 | PPh21 Overpaid | MEDIUM | pph21 overpaid > 50,000 IDR | PMK 168/2023 | Review with HR |
| V05 | Missing Kesehatan | HIGH | reported kesehatan = 0 | Perpres 82/2018 | Register to BPJS Kesehatan |
| V06 | Below UMK | CRITICAL | grossSalary < city UMK | PP 36/2021 Pasal 23 | Report to Disnaker (ILLEGAL) |
| V07 | Missing JP | MEDIUM | reported jpEmployee = 0 | PP 45/2015 | Register to JP program |

### OCR Pipeline (Upload Path)

Step 1 — File validation: JPEG/PNG/WebP/PDF, max 5MB.

Step 2 — Upload to Supabase Storage: `payslips/{userId}/{uuid}.{ext}`.

Step 3 — Google Vision API call:
```
POST https://vision.googleapis.com/v1/images:annotate?key={API_KEY}
Body: { requests: [{ image: { content: base64 }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }], imageContext: { languageHints: ['id', 'en'] } }] }
```

Step 4 — Field extraction via regex patterns:
```
grossSalary:  /gaji\s*(?:bruto|pokok|dasar)/i, /total\s*(?:gaji|penghasilan)/i, /bruto/i, /basic\s*salary/i
pph21:        /pph\s*21/i, /pajak\s*penghasilan\s*pasal\s*21/i, /income\s*tax/i
jhtEmployee:  /jht\s*(?:karyawan|pekerja)/i, /jaminan\s*hari\s*tua/i, /jht\s*2%/i
jpEmployee:   /jp\s*(?:karyawan|pekerja)/i, /jaminan\s*pensiun/i, /jp\s*1%/i
kesehatan:    /bpjs\s*kes(?:ehatan)?/i, /jkn/i, /kesehatan/i, /potongan\s*kesehatan/i
takeHome:     /take\s*home\s*pay/i, /thp/i, /gaji\s*(?:diterima|bersih|nett?)/i
```

IDR parsing: Removes dots (thousands separator), handles "1.234.567" → 1234567 and "1234567" → 1234567.

Step 5 — Confidence scoring:
- grossSalary: 0.90 if 500K–1B, else 0.40
- pph21: 0.85 if 0–499M, else 0.40
- BPJS fields: 0.80 if ≥0
- takeHome: 0.75 if >0

Step 6 — Routing decision:
```
Google Vision:
  Overall ≥92% confidence → AUTO_ACCEPT (go straight to audit)
  80-92% → SOFT_CHECK (show confirmation UI)
  <80% → MANUAL_REQUIRED (user must edit all fields)

Tesseract (fallback when Vision quota exhausted):
  All fields ≥0.80 AND overall ≥70% → SOFT_CHECK
  Otherwise → MANUAL_REQUIRED
```

Google Vision quota: 950 requests/month (global, all users).

### Standalone Slip Prototype (slip_cekwajar_id/)

The older standalone prototype has additional features NOT yet in the main app:

**Surat Keberatan (Objection Letter):** Auto-generates a formal Indonesian objection letter using Groq API (llama-3.3-70b-versatile). Includes 3 WhatsApp follow-up templates. This is a premium feature that could be migrated.

**OpenRouter OCR:** Uses Claude 3.5 Sonnet via OpenRouter for OCR extraction with per-field confidence scores. Different from the main app's Google Vision approach.

**Enhanced Audit Engine:** Has 11 checks (vs 7 violations in main app), including: illegal JKK/JKM deduction from employee, total deductions >50% of gross (PP 36/2021 Pasal 65), and December-specific reconciliation handling.

**JP Cap Versioning:** Year-aware JP salary caps:
- 2024: 10,042,300 | 2025: 10,547,400 | 2026: 11,086,300
- Uses March boundary rule (months 1-2 use previous year's cap).

---

## 2. WAJAR GAJI — Salary Benchmarking

### What It Does
User enters their job title, city, experience level, and (optionally) their salary. The engine finds matching salary benchmarks and tells them if their salary is below, within, or above the market P25-P75 range.

### User Flow
```
User arrives at /wajar-gaji
    → Enter job title (autocomplete via fuzzy search)
    → Select city + province
    → Select experience bucket (0-2, 3-5, 6-10, 10+ years)
    → Optionally enter their salary
    ↓
GET /api/salary/benchmark-search?q={query} → autocomplete suggestions
GET /api/salary/benchmark?jobTitle=...&city=...&province=...&experienceBucket=...&userSalary=...
    ↓
Results: matched title, data tier, P25/P50/P75, user position vs market
    ↓
Optional: POST /api/salary/submit to crowdsource their own salary
```

### Salary Benchmark Algorithm (Bayesian Blending)

Data tier hierarchy:
1. CITY_LEVEL: ≥30 samples for exact city + title + experience → highest confidence
2. CITY_LEVEL_LIMITED: <30 samples → blended with BPS prior
3. PROVINCE_LEVEL: No city data, province aggregation available
4. BPS_PRIOR: Only BPS (Sakernas) province-level data available
5. NO_DATA: No match found

Bayesian blending formula (for CITY_LEVEL_LIMITED):
```
K = 15  (prior strength constant — hardcoded)
weight = sampleCount / (sampleCount + K)
blendedP50 = weight × sampleP50 + (1 - weight) × bpsPriorP50
```

Example: 10 samples → weight = 10/25 = 0.40 → 40% sample data, 60% BPS prior.
30+ samples → weight ≥ 0.67 → sample dominates.

Job title matching:
1. Exact match in job_categories table
2. Fuzzy match via pg_trgm (search_job_categories_fuzzy RPC)
3. Return top candidates ranked by similarity score

### Crowdsource Submission Anti-Spam

Fingerprint: `SHA256(IP + ":" + normalizedJobTitle + ":" + city + ":" + salaryBucket)[:16]`
- Same fingerprint within 24 hours → rejected as duplicate.
- Salary outside 0.5x–30x city UMK → rejected as outlier.
- Valid submissions saved to salary_submissions with is_validated=false, is_outlier=false.

### Data Sources

Primary (Day 1): BPS Sakernas province-level wage data seeded into salary_benchmarks.
Secondary (crowdsource): salary_submissions validated and merged over time.
Planned (future): Licensed survey data (Mercer/Korn Ferry) — not yet integrated.

---

## 3. WAJAR TANAH — Property Price Valuation

### What It Does
User enters property details (location, type, area, asking price). The engine compares against benchmark data for that district/city and returns a verdict: MURAH (cheap), WAJAR (fair), MAHAL (expensive), or SANGAT_MAHAL (very expensive).

### User Flow
```
User arrives at /wajar-tanah
    → Select province
    → Select city
    → Select district (fetched from /api/property/districts)
    → Select property type (RUMAH/TANAH/APARTEMEN/RUKO)
    → Enter land area (sqm)
    → Enter asking price (IDR total)
    ↓
GET /api/property/benchmark?province=...&city=...&district=...&propertyType=...&landAreaSqm=...&askingPriceTotal=...
    ↓
Verdict displayed with price bar chart showing P25/P50/P75 range and user's position
```

### Property Verdict Algorithm (IQR Method)

```
userPricePerSqm = askingPriceTotal / landAreaSqm

// Size band classification:
if (landAreaSqm ≤ 50)   → KECIL
if (landAreaSqm ≤ 100)  → SEDANG
if (landAreaSqm ≤ 200)  → BESAR
if (landAreaSqm > 200)  → SANGAT_BESAR

// Fetch benchmark stats via RPC (district level first, fallback to city):
stats = get_property_benchmark_stats(province, city, district, propertyType, sizeBand)
if (stats.sampleCount < 5) → fall back to city-level stats

// Calculate IQR verdicts:
IQR = stats.P75 - stats.P25

MURAH:         userPricePerSqm < P25 - 0.5 × IQR
WAJAR:         P25 - 0.5 × IQR ≤ userPricePerSqm ≤ P75
MAHAL:         P75 < userPricePerSqm ≤ P75 + 1.5 × IQR
SANGAT_MAHAL:  userPricePerSqm > P75 + 1.5 × IQR

// Percentile estimation (linear interpolation):
percentile = estimated position (5-99) based on where userPrice falls in distribution
```

Components: PropertyPriceBar.tsx (visual bar chart), VerdictBadge.tsx (color-coded verdict).
Legal disclaimer: "Bukan pengganti KJPP. Hasil ini bersifat indikatif."

### Data Sources

Primary: property_benchmarks table (seeded from scraped/collected data).
Planned (future): NJOP integration via ATR/BPN API, 99.co/Rumah123 scraper pipeline.

---

## 4. WAJAR HIDUP — Cost of Living Comparison

### What It Does
User selects two Indonesian cities and their lifestyle tier. The engine calculates the salary adjustment needed to maintain equivalent purchasing power in the target city.

### User Flow
```
User arrives at /wajar-hidup
    → Select origin city (from /api/col/cities)
    → Select destination city
    → Enter current salary
    → Select lifestyle tier (HEMAT/STANDAR/NYAMAN)
    ↓
GET /api/col/compare?fromCity=...&toCity=...&currentSalary=...&lifestyleTier=...
    ↓
Results: required salary, difference, verdict, category breakdown chart
```

### COL Comparison Algorithm

```
fromIndex = col_indices.col_index WHERE city_name = fromCity
toIndex   = col_indices.col_index WHERE city_name = toCity

baselineRatio = toIndex / fromIndex

lifestyleMultiplier:
  HEMAT   = 0.70  (budget lifestyle, essential spending only)
  STANDAR = 1.00  (average lifestyle)
  NYAMAN  = 1.30  (comfortable lifestyle, dining out, entertainment)

adjustedRatio = 1 + (baselineRatio - 1) × lifestyleMultiplier

requiredSalary = currentSalary × adjustedRatio
salaryDifference = requiredSalary - currentSalary
percentChange = ((adjustedRatio - 1) × 100)

verdict:
  if (adjustedRatio < 0.95) → LEBIH_MURAH (target city is cheaper)
  if (adjustedRatio > 1.05) → LEBIH_MAHAL (target city is more expensive)
  else → SAMA (roughly equivalent)
```

Category breakdown: Weighted by lifestyle tier using col_categories table (e.g., food has higher weight in HEMAT, entertainment higher in NYAMAN).

Component: COLComparisonChart.tsx — visual breakdown of spending categories.

### Data Sources

Primary: col_indices table (seeded data, likely from BPS CPI data).
Planned (future): Numbeo API integration (USD 149/month), real-time CPI updates.

---

## 5. WAJAR KABUR — International PPP Comparison

### What It Does
User enters their Indonesian salary and a target country. The engine compares purchasing power using PPP (Purchasing Power Parity) factors from the World Bank, accounting for exchange rates and real purchasing power differences.

### User Flow
```
User arrives at /wajar-kabur
    → Enter current IDR salary
    → Select target country (from /api/abroad/countries)
    → Optionally enter a foreign salary offer
    ↓
GET /api/abroad/compare?currentIDRSalary=...&targetCountry=...&offerSalary=...&tier=...
    ↓
Results: nominal equivalent, PPP-adjusted comparison, real purchasing power ratio
    ↓
Free tier: only US, SG, MY accessible
Paid tier: 15 (basic) or 50 (pro) countries
```

### PPP Comparison Algorithm

```
// Fetch PPP factors (cached 30 days in ppp_reference):
idPPPFactor = ppp_reference.ppp_factor WHERE country_code = 'IDN'
foreignPPPFactor = ppp_reference.ppp_factor WHERE country_code = targetCountry

// Fetch exchange rate (cached 24h in memory):
exchangeRate = Frankfurter.app: IDR → targetCurrency

// Calculations:
nominalEquivalent = currentIDRSalary / exchangeRate
  // "What your IDR salary looks like in foreign currency (ignoring purchasing power)"

userPurchasingPower = currentIDRSalary / idPPPFactor
  // "Your real purchasing power in international dollars"

if (offerSalary provided):
  offerPurchasingPower = offerSalary / foreignPPPFactor
  realRatio = offerPurchasingPower / userPurchasingPower
  isPPPBetter = realRatio > 1.0
  // "Does the offer give you MORE real purchasing power than your current salary?"
```

Free tier gating: Only countries with `ppp_reference.is_free_tier = true` are accessible. Others return a premium upsell message.

World Bank API call:
```
GET https://api.worldbank.org/v2/country/{countryCode}/indicator/PA.NUS.PPP?format=json&mrv=1
```
Cached in ppp_reference table for 30 days. If API fails, uses cached value as fallback.

Exchange rate API call:
```
GET https://api.frankfurter.app/latest?from={fromCurrency}&to={toCurrency}
```
Cached in-memory for 24 hours.

Component: PPPBasketComparison.tsx — visual basket comparison showing what you can buy in each country.

---

## Standalone Slip Project — Extra Features Not in Main App

The `slip_cekwajar_id/` directory contains an older standalone prototype with features that the main app doesn't have yet:

### Surat Keberatan Generator
Uses Groq API (llama-3.3-70b-versatile) to auto-generate:
- A formal Indonesian objection letter (max 4 paragraphs) citing specific violations, discrepancy amounts, and legal references.
- 3 WhatsApp message templates (max 200 chars each) for following up with HR.
- Fallback to hardcoded templates if API is unavailable.

### Enhanced Audit Checks (11 checks vs 7 in main app)
Additional checks not in main app:
- ILLEGAL_JKK_DEDUCTION: If employer deducts JKK from employee (critical violation).
- ILLEGAL_JKM_DEDUCTION: If employer deducts JKM from employee (critical violation).
- TOTAL_DEDUCTION_OVER_50_PERCENT: If total deductions exceed 50% of gross (PP 36/2021 Pasal 65).
- December PPh21 skip: Standalone correctly identifies December as a reconciliation month and skips TER check.

### Year-Aware JP Cap
The standalone has proper year-aware JP salary caps with March boundary rule:
- Months 1-2: Use previous year's cap (regulatory transition period).
- Months 3-12: Use current year's cap.
- 2024: 10,042,300 | 2025: 10,547,400 | 2026: 11,086,300 (verified SE BPJS B/1226/022026).

### Test Suite
127+ unit tests covering:
- TER rate lookups for all categories A/B/C at boundary values.
- BPJS caps (Kesehatan capped at 120K/month, JP with year-aware caps).
- JKK/JKM illegality detection.
- December progressive tax reconciliation with biaya jabatan.
- PTKP category mapping edge cases (K/2 → B, K/I/0 → C).
- Annual overcharge calculation with 6% interest formula.
- Comprehensive input validation.

These features should be migrated to the main cekwajar.id app.

---

## Freemium Gating Logic (Across All Tools)

Free tier sees:
- Wajar Slip: Verdict (pass/fail) + violation codes, but NO IDR difference amounts.
- Wajar Gaji: Province-level P50 only, no P25/P75 range.
- Wajar Tanah: Not accessible (requires basic tier).
- Wajar Hidup: Not accessible (requires basic tier).
- Wajar Kabur: Only 3 countries (US, SG, MY).

Basic tier (29K/mo) unlocks:
- Full IDR amounts in slip violations.
- City-level salary P25/P75.
- Property valuation access.
- 20 COL cities.
- 15 PPP countries.

Pro tier (79K/mo) unlocks:
- 50 PPP countries.
- Priority support.
- Advanced analytics (planned).
