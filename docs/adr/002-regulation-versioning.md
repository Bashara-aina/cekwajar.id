# ADR-002: Regulation Versioning System

## Status
Proposed

## Context

Indonesian labor and tax regulations change frequently without warning:

- **BPJS JP cap**: Adjusts annually (e.g., Rp 10,547,400 in 2025 → Rp 11,086,300 in 2026) based on average wage growth. The March boundary rule (SE BPJS B/1226/022026) complicates this further.
- **UMR/UMK**: Revises annually at year-start (January), varies by province/kabupaten.
- **PTKP thresholds**: Changed in 2023 under PMK 168/2023 — may change again.
- **PPh21 TER rates**: Fully enumerated in PMK 168/2023 Lampiran — stable, but if changed requires full re-enumeration.
- **KHL basket**: Permenaker 18/2022 — updated periodically, not annually on a fixed schedule.

Currently, regulation constants are hardcoded in two places with no synchronization:

1. **Code constants** — `lib/regulations.ts`, `lib/pph21-ter.ts`: JP cap 11,086,300 (2026), TER slabs, etc.
2. **Database seeds** — `supabase/migrations/`: bpjs_rules table has stale 2025 JP cap (10,547,400)

The stale DB seed was identified in the engineering analysis: the DB row for JP cap is never actually used at runtime (the code-level constant overrides it), but as more features read from DB, code/DB drift will cause silent incorrect calculations.

There is no mechanism to audit historical slips with the regulation version that was active at the time of the payslip date.

## Decision

Implement a versioned regulation storage system with the following structure:

### Directory Structure

```
lib/
  regulations/
    pph21/
      PMK168_2023/
        constants.ts      # TER rate slabs, PTKP values
        index.ts         # exports all constants
    bpjs/
      2025/
        constants.ts     # JP cap 10,547,400, JHT rates
      2026/
        constants.ts     # JP cap 11,086,300, JKK/JKM rates
      latest -> 2026     # symlink or exported alias
    umk/
      2025/
        jakarta.ts
        surabaya.ts
        ...
      2026/
        jakarta.ts
        ...
```

### Regulation Version Identifier

Each regulation package is tagged with a version string derived from the regulating document:

| Regulation | Version String | Source |
|-----------|----------------|--------|
| PPh21 TER | `PMK168_2023` | PMK 168/2023 |
| BPJS JP cap 2026 | `BPJS_JP_2026` | SE BPJS B/1226/022026 |
| BPJS JHT rates | `PP44_2015` | PP 44/2015 |
| UMK Jakarta 2026 | `UMK_2026_JAKARTA` | Gubernur DKI SK |
| KHL basket | `PERMENAKER18_2022` | Permenaker 18/2022 |

### Engine Signature Change

All calculation engines accept an optional `regulationVersion` parameter:

```typescript
interface CalculationInput {
  // ... feature-specific fields
  regulationVersion?: {
    pph21?: string;   // e.g., 'PMK168_2023'
    bpjs?: string;    // e.g., 'BPJS_JP_2026'
    umk?: string;     // e.g., 'UMK_2026_JAKARTA'
    khl?: string;     // e.g., 'PERMENAKER18_2022'
  };
  payPeriodDate: Date;  // used to infer default regulation version if not specified
}
```

When `regulationVersion` is omitted, the engine defaults to the version effective on `payPeriodDate`. This enables historical auditing — a payslip from March 2025 uses 2025 JP caps automatically.

### Database Seed Tagging

All seeded regulation rows include a `version_tag` column:

```sql
ALTER TABLE bpjs_rules ADD COLUMN version_tag TEXT NOT NULL DEFAULT 'BPJS_JP_2026';
ALTER TABLE pph21_ter_rates ADD COLUMN version_tag TEXT NOT NULL DEFAULT 'PMK168_2023';
ALTER TABLE umk_regions ADD COLUMN version_tag TEXT NOT NULL;
```

Views filter by version:

```sql
CREATE VIEW v_current_bpjs_rules AS
SELECT * FROM bpjs_rules
WHERE version_tag = (
  SELECT MAX(version_tag) FROM bpjs_rules
  WHERE effective_from <= CURRENT_DATE
);
```

### Annual Refresh Process

1. **January–February**: Monitor for new UMK announcements (governor decrees published in late previous year)
2. **March**: SE BPJS confirmation of new JP cap for current year
3. **Q1**: Check for PMK updates to PPh21/PTKP
4. **When new regulation drops**:
   - Create new version subdirectory (e.g., `lib/regulations/bpjs/2027/`)
   - Copy previous year constants as baseline
   - Diff with new regulation text — update changed values only
   - Add database migration with new `version_tag`
   - Run full test suite against new version
   - Tag release in Git

### Engine Resolution Order

```typescript
function resolveRegulationVersion(requested: string | undefined, payPeriodDate: Date): RegulationVersion {
  if (requested) {
    const resolved = tryLoadRegulation(requested);
    if (!resolved) throw new Error(`Unknown regulation version: ${requested}`);
    return resolved;
  }
  // Infer from pay period date
  const year = payPeriodDate.getFullYear();
  return loadRegulationForYear(year);
}
```

## Consequences

### Easier
- Historical auditing works correctly — 2025 slip uses 2025 caps automatically
- Annual updates are isolated to a single directory version — no search/replace across codebase
- DB seeds are self-documenting — `version_tag` shows which regulation each row implements
- Testing regulation change impact: compare test snapshots between version directories

### More Difficult
- Migration of existing payslip records to new version format needed for historical dashboard
- Engine functions now require `payPeriodDate` parameter — existing callers need update
- Staging environment needs mechanism to simulate prior-year regulation for QA
- Additional review burden: each new regulation version requires sign-off that constants match official text

### Implementation Files

- `lib/regulations/` — new directory structure
- `lib/engines/` — all engines update signatures to accept `regulationVersion`
- `supabase/migrations/` — add `version_tag` columns, create new seeds for each regulation version
- `scripts/seed-regulations.ts` — update to accept `--year` flag for targeted seeding
- `__tests__/engines/` — add regulation version boundary tests (2025 vs 2026 JP cap)

### MVP Scope

For the initial Wajar Slip launch, implement only:
1. `lib/regulations/bpjs/2026/` with current JP cap (11,086,300)
2. `payPeriodDate`-inferred version resolution (no manual `regulationVersion` parameter yet)
3. Database `version_tag` column on `bpjs_rules`

Full versioned engine signature and historical audit support deferred to Phase 2.

## References

- Engineering Analysis: `docs/reviews/ENGINEERING_ANALYSIS.md` §1.3 (JP Cap Boundary Logic)
- Current regulations: `lib/regulations.ts`
- Current DB schema: `supabase/migrations/001_wajar_slip.sql`
- JP cap March boundary: `lib/pph21-ter.ts` `getJpCap()`
- Stale seed issue: Engineering Analysis §1.4 — bpjs_rules JP cap seed is 2025 value
