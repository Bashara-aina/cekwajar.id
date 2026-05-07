# ADR-004: Shared Calculation Test Harness

## Status
Proposed

## Context

The Wajar platform has 5 calculation engines:

| Feature | Engine File | Status |
|---------|------------|--------|
| Wajar Slip | `lib/pph21-ter.ts` | Implemented, partial tests |
| Wajar Gaji | `lib/engines/salary-benchmark.ts` | No code exists |
| Wajar Tanah | `lib/engines/land-valuation.ts` | No code exists |
| Wajar Kabur | `lib/engines/resignation-calc.ts` | No code exists |
| Wajar Hidup | `lib/engines/cost-of-living.ts` | No code exists |

Current state for Wajar Slip:
- Test files exist: `__tests__/audit.test.ts`, `lib/__tests__/pph21-ter.test.ts`
- **Coverage gap**: JP cap March boundary test expects 11,004,000 but code returns 11,086,300 — test will FAIL
- No shared fixtures — each test re-implements hardcoded salary values, PTKP constants
- No threshold boundary test matrix

The engineering analysis identified "no shared calculation test harness" as critical technical debt (#1 in cross-feature debt list).

Without a shared harness:
- Wajar Gaji (when built) will copy-paste test patterns from Slip with no standardization
- Threshold changes in one feature won't propagate to corresponding tests in other features
- Edge cases unique to each domain (pro-rata salary, December reconciliation, JP cap March boundary) get discovered in production, not in tests

## Decision

### Directory Structure

All calculation engines live in `lib/engines/` with co-located tests:

```
lib/
  engines/
    pph21-ter/              # Wajar Slip — rename from current lib/pph21-ter.ts
      constants.ts          # TER slabs, PTKP values, biaya jabatan
      index.ts              # exports calculateSlip(), types
      __tests__/
        unit.test.ts        # Individual function tests
        threshold-boundaries.test.ts  # Delta boundary tests
        edge-cases.test.ts  # December, pro-rata, mid-year join
        regulation-versions.test.ts  # 2025 vs 2026 JP cap
    salary-benchmark/        # Wajar Gaji
      __tests__/
    land-valuation/        # Wajar Tanah
      __tests__/
    resignation-calc/      # Wajar Kabur
      __tests__/
    cost-of-living/        # Wajar Hidup
      __tests__/
  fixtures/                 # Shared test fixtures
    umk-2026.ts           # All 514 UMK values for 2026
    bpjs-caps-2026.ts     # JP, JHT, JKK, JKM current caps
    pph21-ter-slabs.ts    # All 125 TER slabs (PMK 168/2023)
    khl-basket-2022.ts    # 64 KHL items from Permenaker 18/2022
```

### Test Categories

Each engine must implement these four test suites:

#### 1. Unit Tests (`*.unit.test.ts`)

Test each pure function in isolation with deterministic inputs.

```typescript
describe('getTERRate', () => {
  it('returns correct rate for TER_A at lowest bracket', () => {
    expect(getTERRate('A', 5_000_000)).toBe(0.05);
  });
  it('returns correct rate for TER_B at highest bracket', () => {
    expect(getTERRate('B', 50_000_000)).toBe(0.30);
  });
});
```

#### 2. Threshold Boundary Tests (`*.threshold-boundaries.test.ts`)

Test verdict transitions at exact threshold boundaries. Critical for preventing regression when thresholds change.

```typescript
describe('SlipVerdict thresholds', () => {
  const testCases = [
    { delta: 10_000, expected: 'WAJAR' },
    { delta: 10_001, expected: 'PERLU_PERHATIAN' },
    { delta: 50_000, expected: 'PERLU_PERHATIAN' },
    { delta: 50_001, expected: 'TIDAK_WAJAR' },
  ];

  testCases.forEach(({ delta, expected }) => {
    it(`delta ${delta} → ${expected}`, () => {
      const result = calculateSlip({ ..., deductions: { delta } });
      expect(result.verdict).toBe(expected);
    });
  });
});
```

#### 3. Edge Case Tests (`*.edge-cases.test.ts`)

Domain-specific edge cases identified in engineering analysis:

| Feature | Edge Cases |
|---------|-----------|
| Slip | December annual reconciliation, pro-rata month, mid-year JP cap transition, employer-only JKK/JKM violation |
| Gaji | Salary below PTKP, multiple employers, contract vs permanent |
| Tanah | NJOP = 0 (sengketa), asking price < 50% NJOP |
| Kabur | Masa kerja < 12 months, PHK vs resign distinction, JHT partial withdrawal eligibility |
| Hidup | Income = exactly KHL (boundary), household size = 0 |

```typescript
describe('December annual reconciliation', () => {
  it('detects omitted biaya jabatan', () => {
    const result = calculateSlip({
      isDecember: true,
      totalBrutoAnnual: 120_000_000,
      // ... user omits biaya jabatan calculation
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'BIAYA_JABATAN_OMITTED' })
    );
  });
});
```

#### 4. Regulation Version Tests (`*.regulation-versions.test.ts`)

Test same inputs produce different outputs under different regulation versions.

```typescript
describe('JP Cap March boundary', () => {
  it('uses 2025 cap for Feb 2025 pay period', () => {
    const result = calculateSlip({
      payPeriodDate: new Date('2025-02-15'),
      // ...
    }, { bpjs: 'BPJS_JP_2025' });
    expect(result.bpjs.jp.cappedAt).toBe(10_547_400);
  });

  it('uses 2026 cap for March 2025 pay period', () => {
    const result = calculateSlip({
      payPeriodDate: new Date('2026-03-01'),
      // ...
    }, { bpjs: 'BPJS_JP_2026' });
    expect(result.bpjs.jp.cappedAt).toBe(11_086_300);
  });
});
```

### Shared Fixtures

```typescript
// lib/fixtures/umk-2026.ts
export const UMK_2026 = {
  jakarta: 5_065_115,
  surabaya: 4_725_479,
  bandung: 4_812_844,
  // ... all 514 regions
} as const;

export type UMKRegion = keyof typeof UMK_2026;

// lib/fixtures/pph21-ter-slabs.ts
export const TER_SLABS_PMK168_2023 = {
  A: [
    { lower: 0, upper: 60_000_000, rate: 0.05 },
    { lower: 60_000_000, upper: 250_000_000, rate: 0.15 },
    { lower: 250_000_000, upper: 500_000_000, rate: 0.25 },
    { lower: 500_000_000, upper: 5_000_000_000, rate: 0.30 },
    { lower: 5_000_000_000, upper: Infinity, rate: 0.35 },
  ],
  B: [/* ... 41 slabs */],
  C: [/* ... 40 slabs */],
} as const;
```

### Coverage Requirement

- **Minimum coverage per engine: 80% line coverage**
- Enforced via Vitest coverage threshold in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        functions: 80,
        branches: 80,
        lines: 80,
        '**/engines/**/*.ts': 80,
      },
    },
  },
});
```

Coverage reports generated on every `pnpm test`. PR blocked if coverage drops below threshold.

### Test Runner Commands

```bash
# Run all engine tests
pnpm test:engines

# Run specific engine
pnpm test:engines --filter=pph21-ter

# Run with coverage
pnpm test:coverage

# Run threshold boundary tests only (fast)
pnpm test:engines -- --testPathPattern=threshold-boundaries
```

### Implementation Files

- `lib/engines/pph21-ter/` — refactor `lib/pph21-ter.ts` into directory structure
- `lib/engines/salary-benchmark/` — Wajar Gaji engine (when built)
- `lib/engines/land-valuation/` — Wajar Tanah engine (when built)
- `lib/engines/resignation-calc/` — Wajar Kabur engine (when built)
- `lib/engines/cost-of-living/` — Wajar Hidup engine (when built)
- `lib/fixtures/` — shared fixture directory
- `__tests__/engines/` — test directory (Vitest default)
- `vitest.config.ts` — add coverage thresholds
- `package.json` — add `test:engines` script

### Immediate Fix: Wajar Slip JP Cap Test

The current JP cap test has wrong expected value. Fix before ADR-002 implementation:

```typescript
// Current (WRONG):
expect(getJpCap(2026, 3)).toBe(11_004_000); // ❌ off by 82,300

// Correct (2026 cap per SE BPJS B/1226/022026):
expect(getJpCap(2026, 3)).toBe(11_086_300); // ✅
```

## Consequences

### Easier
- New engine tests follow established pattern — no reinventing test structure
- Shared fixtures eliminate copy-pasted magic numbers across test files
- Coverage threshold prevents test coverage rot as engines evolve
- Boundary tests catch threshold regressions before production
- Fixtures serve as living documentation of regulation constants

### More Difficult
- Existing Wajar Slip tests must be migrated to new directory structure
- Each new feature requires test scaffolding setup (can be automated with generator script)
- Boundary test maintenance — updating threshold values requires updating expected values in test matrix
- Regulation version tests require implementing ADR-002 first (test uses version parameter)

### MVP Scope

For initial Wajar Kabur implementation:
1. Create `lib/engines/resignation-calc/` with directory structure
2. Create `__tests__/engines/resignation-calc/` with all 4 test suite types
3. Add `lib/fixtures/bpjs-caps-2026.ts` with current JP/JHT/JKK/JKM caps
4. Set coverage threshold to 80%
5. Fix Wajar Slip JP cap test (immediate bug fix)

## References

- Engineering Analysis: `docs/reviews/ENGINEERING_ANALYSIS.md` §"No shared calculation test harness"
- Current test files: `__tests__/audit.test.ts`, `lib/__tests__/pph21-ter.test.ts`
- Vitest coverage config: `vitest.config.ts` (create if not exists)
- ADR-001: Unified verdict taxonomy (threshold values source)
- ADR-002: Regulation versioning (version parameter source)
- JP cap March boundary: `lib/pph21-ter.ts` `getJpCap()`
