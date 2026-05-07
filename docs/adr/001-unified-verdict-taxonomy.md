# ADR-001: Unified Verdict Taxonomy Across All Wajar Features

## Status
Accepted

## Context

Wajar Slip currently operates two incompatible verdict systems simultaneously:

- **Client-side** (`lib/pph21-ter.ts`): `WAJAR` / `PERLU_DICEK` / `TIDAK_WAJAR`
- **Server-side** (`lib/slip/audit.ts`): `WAJAR` / `ADA_YANG_ANEH` / `POTONGAN_SALAH`

These differ not only in name but in threshold logic. Client uses delta-based thresholds (≤ Rp 10k = WAJAR, 10k–50k = PERLU_DICEK, > 50k = TIDAK_WAJAR). Server uses the same delta ranges but maps to different labels and adds an illegality detection layer (JKK/JKM deductions from employee salary = automatic TIDAK_WAJAR with legal basis).

As the platform expands to Wajar Gaji, Wajar Tanah, Wajar Kabur, and Wajar Hidup, each feature will need its own verdict system. Without a unified taxonomy, every new feature reinvents verdict naming and color conventions, and cross-feature UX becomes incoherent.

## Decision

Adopt a unified 4-tier verdict taxonomy across all five Wajar features:

### Tier Definitions

| Verdict | Color | Meaning |
|---------|-------|---------|
| `WAJAR` | Green (#16a34a) | Within acceptable bounds — no action needed |
| `PERLU_PERHATIAN` | Yellow (#ca8a04) | Borderline — worth investigating but not necessarily wrong |
| `TIDAK_WAJAR` | Red (#dc2626) | Clearly outside acceptable range — needs correction |
| `CURIGA` | Red + Alert Flag (#dc2626 + 🔴) | Potentially illegal or fraudulent — requires immediate attention |

### Per-Feature Verdict Mapping

#### Wajar Slip (Payslip Audit)

| Existing Verdict | → Unified Verdict | Trigger |
|-----------------|-------------------|---------|
| WAJAR | `WAJAR` | Delta ≤ Rp 10,000 |
| PERLU_DICEK / ADA_YANG_ANEH | `PERLU_PERHATIAN` | Delta Rp 10,001–50,000 |
| TIDAK_WAJAR / POTONGAN_SALAH | `TIDAK_WAJAR` | Delta > Rp 50,000 |
| (new) JKK/JKM deducted from employee | `CURIGA` | PP 44/2015 Pasal 19 violation detected |

#### Wajar Gaji (Salary Benchmarking)

| Verdict | Trigger |
|---------|---------|
| `WAJAR` | Compensation at P40–P75 for role/region/industry |
| `PERLU_PERHATIAN` | Compensation at P25–P40 or P75–P90 |
| `TIDAK_WAJAR` | Compensation below P25 (UNDERPAID) or above P95 (UNUSUAL) |
| `CURIGA` | Salary suspiciously above P99 — potential fraud indicator |

#### Wajar Tanah (Property Valuation)

| Verdict | Trigger |
|---------|---------|
| `WAJAR` | Asking price within 1.0–1.5x NJOP, no red flags |
| `PERLU_PERHATIAN` | Asking price 1.5–2.0x NJOP or minor red flags |
| `TIDAK_WAJAR` | Asking price > 2.0x NJOP or major red flags |
| `CURIGA` | Price < 0.5x NJOP (sengketa risk) or > 5x NJOP (fraud indicator) |

#### Wajar Kabur (Resignation Feasibility)

| Verdict | Trigger |
|---------|---------|
| `WAJAR` | Runway ≥ 12 months, severance entitled |
| `PERLU_PERHATIAN` | Runway 6–12 months, severance partial |
| `TIDAK_WAJAR` | Runway < 6 months, no severance |
| `CURIGA` | Employer not depositing BPJS JHT (potential fund seizure) |

#### Wajar Hidup (Cost of Living)

| Verdict | Trigger |
|---------|---------|
| `WAJAR` | Income ≥ 1.5x KHL for household size |
| `PERLU_PERHATIAN` | Income 1.0–1.5x KHL |
| `TIDAK_WAJAR` | Income < KHL for household |
| `CURIGA` | Reported expenses suspiciously low (potential hidden income) |

### Client vs. Server Mapping

The client engine performs calculations without server round-trip. The server engine persists audits for premium features.

```
Client Calculation Result
        │
        ▼
[Map to Unified Verdict]
        │
        ├─→ Display (client-rendered VerdictCard)
        │
        └─→ Server Persist (POST /api/slip/audit)
                    │
                    ▼
            [Store raw values + unified verdict label]
```

Mapping function signature:
```typescript
mapToUnifiedVerdict(delta: number, feature: 'slip' | 'gaji' | 'tanah' | 'kabur' | 'hidup', rawVerdict?: string): UnifiedVerdict
```

### Color Coding Standard

All verdict cards, badges, and UI indicators must use these exact tokens:

```typescript
const VERDICT_COLORS = {
  WAJAR: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: 'CheckCircle' },
  PERLU_PERHATIAN: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700', icon: 'AlertTriangle' },
  TIDAK_WAJAR: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', icon: 'XCircle' },
  CURIGA: { bg: 'bg-red-100', border: 'border-red-700', text: 'text-red-900', icon: 'AlertOctagon' },
} as const;
```

### CURIGA vs TIDAK_WAJAR Decision Tree

```
Is the issue potentially illegal?
    YES → CURIGA
    NO
      └→ Is the deviation extreme (e.g., >5x threshold)?
          YES → CURIGA (suspicious)
          NO
            └→ Is it clearly wrong mathematically?
                YES → TIDAK_WAJAR
                NO → PERLU_PERHATIAN
```

## Consequences

### Easier
- Single `<VerdictCard>` component works across all features with consistent color/token props
- User learns verdict system once, applies to all 5 features
- Cross-feature verdicts can be aggregated in a unified dashboard
- A/B testing verdict thresholds becomes feasible with shared infrastructure

### More Difficult
- Wajar Slip existing data has legacy verdict labels — migration or dual-label display needed
- Threshold calibration for non-slip features requires fresh user research
- CURIGA flag requires legal review for each new feature domain before deployment

### New Components Required

- `lib/verdict.ts` — shared mapping functions and color constants
- `components/ui/VerdictBadge.tsx` — reusable verdict badge (green/yellow/red + icon)
- `components/shared/VerdictCard.tsx` — unify existing Slip-specific VerdictCard

## References

- Engineering Analysis: `docs/reviews/ENGINEERING_ANALYSIS.md` §"Verdict Type Unification"
- Client engine: `lib/pph21-ter.ts`
- Server engine: `lib/slip/audit.ts`
- Client verdict component: `components/VerdictCard.tsx`
- PMK 168/2023 TER rates: `lib/regulations.ts`
- PP 44/2015 Pasal 19: JKK/JKM employer-only prohibition
