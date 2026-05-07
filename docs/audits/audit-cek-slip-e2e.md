# End-to-end audit: Cek Slip / Wajar Slip (`/wajar-slip`)

**Date:** 2026-05-07  
**Canonical app root:** `cekwajar.id-main/cekwajar.id/`  
**Method:** Five parallel read-only explore agents were dispatched for UI, API, engines, data, and integration scopes; this document consolidates findings with **direct verification** of the paths below.  
**Duplicate-tree risk:** The same routes/components also appear under `cekwajar.id-main/src/` (without `cekwajar.id/`). CI must build exactly one tree or drift will break production behavior.

---

## Executive summary

The Wajar Slip flow is **substantially implemented**: OCR upload → confirm → form → `POST /api/audit-payslip` → verdict UI with freemium gating. Core calculations (`calculatePPh21`, `calculateBPJS`, `detectViolations`) are wired and persisted to `payslip_audits`.

**Blocking “really working” polish** is mostly **contract consistency**, **telemetry of OCR confidence**, **audit payload completeness** (storage path), **error handling** on the API route, and **client data-fetching conventions** (TanStack Query vs `useEffect` + `fetch`).

---

## Agent 1 — UI / client journey

### User journey (intended)

1. **`IDLE`**: Landing + `PayslipUploader` or “isi manual”.
2. **Upload**: XHR to `POST /api/ocr/upload` with progress.
3. **`CONFIRM`**: User confirms/edits extracted fields (`ConfirmExtractedFields`).
4. **Manual path**: Full form (`react-hook-form` + Zod).
5. **`CALCULATING`**: `POST /api/audit-payslip`.
6. **`VERDICT`**: Violations, paywall blur for free tier, share CTA.

### What works

- Explicit **state machine** in `_state.ts` (`SlipPhase` / `slipReducer`) — clear phases and Indonesian error copy (`ERROR_MESSAGES`).
- **Form validation**: `formSchema` + `apiSchema` with `safeParse` before API call (`page.tsx`).
- **OCR fallback UX**: Low confidence / empty fields routes to manual entry (`page.tsx` CONFIRM branch).
- **Paywall / gating**: Uses `Paywall`, `BlurredHeroNumber`, `RevealOnPaid`; API sets `isGated` and hides `differenceIDR` for free tier (`audit-payslip/route.ts`).

### Gaps / bugs

| Severity | Finding |
|----------|---------|
| **P1** | **`useEffect` + `fetch`** for `/api/cities` and `/api/auth/me` (`page.tsx` ~193–203). Project rule (`cekwajar.id/.cursor/rules/ui.mdc`) requires **TanStack Query** for data fetching; no loading/error UI for cities failure (silent `[]`). |
| **P1** | **Hard-coded OCR confidence**: `handleFieldsExtracted` dispatches `OCR_FIELDS_EXTRACTED` with `confidence: 0.85` always (`page.tsx` ~276–280), ignoring real Vision/Tesseract confidence — breaks trust and CONFIRM thresholds. |
| **P2** | **`setConfirmData` state is unused** (`page.tsx` ~149–155) — dead state / incomplete wiring. |
| **P2** | Privacy CTA is a **non-functional button** (no dialog/route) (`page.tsx` ~408–412). |
| **P2** | `_handleManualMode` resets but **`onManualMode` from `PayslipUploader` calls `SHOW_FORM`** — verify both paths reset OCR state consistently (avoid stale phase). |

### Touch targets / a11y

- Uses shadcn `Button` / `Input` — spot-check icon-only controls in `PayslipUploader` against **44×44px** rule (`ui-ux-pro-max`); not fully audited line-by-line in this pass.

---

## Agent 2 — API boundary (`/api/audit-payslip`)

### What works

- **Zod** `AuditPayslipSchema` validates numeric ranges and enums (`route.ts`).
- **Rate limit**: 5 req/hour/IP via Upstash with in-memory fallback; fails open on Redis error (`route.ts` ~29–81).
- **UMK lookup** via `umk_2026` + `ilike` on city; returns `INVALID_CITY` when missing (`route.ts` ~153–168).
- **Success shape** matches convention: `{ success: true, data: … }` (`route.ts` ~273–297).

### Gaps / bugs

| Severity | Finding |
|----------|---------|
| **P1** | **Error responses** use `{ code, message }` without `success: false` (`route.ts` ~129–136, 429, 400 city) — inconsistent with workspace API standard `{ success, data?, error? }`. Client maps `json.code` manually (`page.tsx` ~361–364). |
| **P1** | **No top-level `try/catch`** around `calculatePPh21`, `calculateBPJS`, `detectViolations` — thrown errors become **500** with stack leakage risk vs typed `CALC_FAILED`. |
| **P2** | **`getCurrentUser()` called twice** (`route.ts` ~149 and ~227) — wasteful and harder to reason about for auth snapshots. |
| **P2** | **Insert failure**: `insertError` only logged; response still **`success: true`** with `auditId: null` (`route.ts` ~260–268) — user thinks audit persisted when it did not. |

### Payload gap (E2E traceability)

- Client **`onSubmit` does not send `payslipFilePath` or `sessionId`** (`page.tsx` ~336–356) even though API accepts them (`route.ts` ~107–109). Audits from OCR **lose linkage** to Supabase storage path.

---

## Agent 3 — Calculations & violations

### Pipeline

1. `calculatePPh21` (TER, DB-backed rates, `ratesVersionId`).
2. `refreshBpjsCapsCache` (non-blocking).
3. `calculateBPJS` — JP cap with **March boundary** rule (`bpjs.ts`).
4. `detectViolations` — V01–V12 (`violations.ts`).

### What works

- **V08/V09** correctly flag **employee-side JKK/JKM** deductions (`violations.ts` ~172–197).
- **V06** UMK below minimum is **CRITICAL**.
- **Freemium**: `differenceIDR` nulled for free tier at API layer (`route.ts` ~215–220).

### Gaps / risks

| Severity | Finding |
|----------|---------|
| **P2** | **Manual submit hard-codes** `jkkEmployee: 0`, `jkmEmployee: 0` (`page.tsx` ~346–352). Legitimate slips showing employer-only lines are OK, but **OCR-confirmed path** must populate these if slip shows illegal employee deductions — confirm `ConfirmExtractedFields` maps JKK/JKM into form defaults before submit. |
| **P2** | **`detectViolations` input** names fields `calculated.jkkEmployee` / `calculated.jkmEmployee` but route passes **`bpjsResult.jkkEmployer` / `jkmEmployer`** (`route.ts` ~207–211). V08/V09 only inspect **reported** employee deductions, so this mismatch may be **benign today** but is a **footgun** if future detectors compare calculated vs reported for JKK/JKM. |
| **P2** | **V01** triggers when `reported.jhtEmployee === 0` (`violations.ts` ~62–73) — potential **false positives** if slip omits line items but fund exists (product decision / UX copy needed). |
| **P3** | **V11** is explicitly a **proxy** heuristic (`violations.ts` ~223–227) — document limitations in UI disclaimer (already partially covered). |

---

## Agent 4 — OCR upload & field extraction

*(Aligned with dedicated OCR review of `POST /api/ocr/upload` + `lib/ocr/*`.)*

### What works

- Magic-byte validation, size cap, Vision vs Tesseract routing, shared `field-extractor` routing decisions.
- Client-side Tesseract path for quota bypass (`PayslipUploader.tsx`).

### Known systemic risks

| Severity | Finding |
|----------|---------|
| **P1** | **Quota increment race** (read-modify-write on `ocr_quota_counter`) — concurrent uploads can exceed Vision quota window (see detailed write-up in any `audit-slip-ocr.md` if present). |
| **P1** | **Scanned PDFs**: Vision may return empty text — user gets generic failure unless messaging distinguishes “PDF tanpa teks” vs OCR error. |
| **P2** |Uploader parses `{ success, data }` but some server errors may not match — unify shapes (`PayslipUploader.tsx` ~143–160). |

---

## Agent 5 — Data model, tests, CI ambiguity

### Persistence

- Inserts into **`payslip_audits`** with violations JSON and tier snapshot (`route.ts` ~260–264).
- **Follow-up:** confirm migrations + RLS match integration tests expectations (`src/lib/__tests__/audit-payslip.integration.test.ts`).

### Tests

- Integration test file exists for **audit-payslip + RLS** — run `pnpm test` filtered to this spec in CI.
- **Gap:** No substitute for **manual E2E** (Playwright) covering upload → confirm → paywall verdict.

### Duplicate source trees

- Files exist in **both** `cekwajar.id-main/cekwajar.id/src/...` and `cekwajar.id-main/src/...`.  
**Action:** Make CI `cwd` and Vercel root explicit in docs; delete or symlink duplicate to stop drift.

---

## Consolidated priority backlog

### P0 — correctness / trust

1. Pass **real OCR confidence** into `OCR_FIELDS_EXTRACTED` (from upload response), not `0.85` constant.  
2. Send **`payslipFilePath`** (and optional **`sessionId`**) on audit submit when OCR produced a file.  
3. Wrap **`POST /api/audit-payslip` handler** in `try/catch`; return typed `{ success: false, error }` + **500** only when appropriate.

### P1 — product & conventions

4. Migrate cities/auth bootstrap to **TanStack Query** with loading/error UI.  
5. Normalize **error JSON** to `{ success: false, error: string, meta?: { code } }` (or document intentional divergence).  
6. On **DB insert failure**, return **`success: false`** or include **`persisted: false`** — never silent null `auditId`.  
7. Clarify **PDF scan** failure messaging in OCR upload response.

### P2 — maintainability

8. Deduplicate **`getCurrentUser`** calls; align **`calculated` JKK/JKM field naming** with employer vs employee semantics.  
9. Remove dead **`setConfirmData`** or wire it properly.  
10. Resolve **duplicate folder** `cekwajar.id-main/src` vs `cekwajar.id-main/cekwajar.id/src`.

---

## Minimal E2E checklist (“really working”)

1. **Manual path**: Fill form with known-good numbers → expect **SESUAI** or expected violations; free tier sees gated amounts.  
2. **Rate limit**: Fire 6 audits in <1h from same IP → **429** with Indonesian message.  
3. **Invalid city**: Random string → **INVALID_CITY**.  
4. **OCR path**: Upload clear JPG → fields populate → confirm → verdict; verify DB row contains **`payslip_file_path`** after fix (currently likely **null**).  
5. **Paid tier**: `differenceIDR` visible when violations exist.  
6. **Regression**: Run **`audit-payslip.integration.test.ts`** on CI against Supabase test project.

---

## Files cited (highest signal)

| Area | Path |
|------|------|
| Page + submit | `cekwajar.id-main/cekwajar.id/src/app/wajar-slip/page.tsx` |
| State machine | `cekwajar.id-main/cekwajar.id/src/app/wajar-slip/_state.ts` |
| API | `cekwajar.id-main/cekwajar.id/src/app/api/audit-payslip/route.ts` |
| Violations | `cekwajar.id-main/cekwajar.id/src/lib/calculations/violations.ts` |
| BPJS | `cekwajar.id-main/cekwajar.id/src/lib/calculations/bpjs.ts` |
| Upload UX | `cekwajar.id-main/cekwajar.id/src/components/wajar-slip/PayslipUploader.tsx` |

---

## What was NOT changed

- No runtime fixes applied — audit-only deliverable per request.  
- No migration or RLS edits — needs DB review in Supabase dashboard / migrations folder.

## Recommended follow-ups

1. Implement P0 items, then add one **Playwright** spec: `wajar-slip-happy-path.spec.ts`.  
2. Single-source the Next app: **one** `src/` root for CI and Vercel.  
3. Optional: split this doc into `audit-slip-ui.md`, `audit-slip-api.md`, etc., if you want per-domain ownership.
