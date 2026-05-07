# ADR-003: Feature Flag System

## Status
Proposed

## Context

The Wajar platform has 5 features at different maturity stages:

| Feature | Status |
|---------|--------|
| Wajar Slip | Production (MVP complete) |
| Wajar Gaji | Design only — no code |
| Wajar Tanah | Design only — no code |
| Wajar Kabur | Design only — no code |
| Wajar Hidup | Design only — no code |

As new features move from design to implementation to rollout, the team needs:

1. **Gradual rollout** — enable Wajar Kabur for internal team first, then 10% of users, then full GA
2. **Kill switch** — if Wajar Gaji calculation has a bug, disable it without deploying
3. **A/B testing** — test different verdict threshold calibrations on a subset of users
4. **Regional rollout** — enable features by region (e.g., Wajar Tanah initial focus on Jakarta only)

The engineering analysis identified "no feature flag system" as critical technical debt (#3 in cross-feature debt list).

Currently, feature availability is controlled by:
- Route existence (`app/slip/` always accessible)
- Environment variable presence (no pattern established)
- Code comments marking "TODO: feature flag"

No unified approach exists.

## Decision

### Phase 1: MVP — Environment Variables (Current)

For launch of Wajar Kabur (first new feature), use Next.js environment variables:

```bash
# .env.local (local development)
NEXT_PUBLIC_FLAG_WAJAR_KABUR_ENABLED=true
NEXT_PUBLIC_FLAG_WAJAR_GAJI_ENABLED=false
NEXT_PUBLIC_FLAG_WAJAR_TANAH_ENABLED=false
NEXT_PUBLIC_FLAG_WAJAR_HIDUP_ENABLED=false

# For beta: NEXT_PUBLIC_FLAG_WAJAR_KABUR_ENABLED=beta
# For internal: NEXT_PUBLIC_FLAG_WAJAR_KABUR_ENABLED=internal
```

Feature structure:

```typescript
// lib/flags.ts
interface FeatureConfig {
  enabled: boolean | 'internal' | 'beta';
  rolloutPercentage?: number; // 0-100, applies only when enabled=true
}

const features = {
  wajar_kabur: {
    enabled: process.env.NEXT_PUBLIC_FLAG_WAJAR_KABUR_ENABLED ?? false,
  },
  wajar_gaji: {
    enabled: process.env.NEXT_PUBLIC_FLAG_WAJAR_GAJI_ENABLED ?? false,
  },
  wajar_tanah: {
    enabled: process.env.NEXT_PUBLIC_FLAG_WAJAR_TANAH_ENABLED ?? false,
  },
  wajar_hidup: {
    enabled: process.env.NEXT_PUBLIC_FLAG_WAJAR_HIDUP ?? false,
  },
} as const;
```

Gate components behind flag check:

```tsx
// components/layout/GlobalNav.tsx
const wajarKaburEnabled = useFlag('wajar_kabur');

{wajarKaburEnabled && (
  <NavLink href="/kabur">Wajar Kabur</NavLink>
)}
```

### Phase 2: Production — LaunchDarkly or Unleash

Environment variables require redeployment to toggle features. For production, migrate to a dedicated feature flag service.

**Preferred: LaunchDarkly**
- Generous free tier (10 users, unlimited flags)
- Excellent Next.js SDK
- Built-in A/B testing and percentage rollouts
- Audit log for flag changes

**Alternative: Unleash**
- Self-hostable (if data sovereignty required)
- Open source
- More complex setup

Migration path:

```typescript
// lib/flags.ts — unified interface
import { getLaunchDarklyClient } from 'lib/launchdarkly';

export async function isFeatureEnabled(
  flag: string,
  context: { userId?: string; region?: string }
): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_FLAG_SYSTEM === 'launchdarkly') {
    const client = getLaunchDarklyClient();
    return client.variation(flag, context, false);
  }
  // Fallback to env var
  return process.env[`NEXT_PUBLIC_FLAG_${flag.toUpperCase()}_ENABLED`] === 'true';
}
```

### Flag Naming Convention

All flags follow the pattern: `features.wajar_[name].[property]`

| Flag | Type | Description |
|------|------|-------------|
| `features.wajar_slip.calculator.enabled` | boolean | Full slip calculator access |
| `features.wajar_slip.ocr.enabled` | boolean | OCR upload feature |
| `features.wajar_slip.premium.enabled` | boolean | Premium paywall |
| `features.wajar_kabur.enabled` | boolean | Feature visibility in nav |
| `features.wajar_kabur.calculator_v1.enabled` | boolean | Specific calculator version |
| `features.wajar_gaji.enabled` | boolean | Feature visibility |
| `features.verdict.unified.enabled` | boolean | ADR-001 unified verdict system |

### Phased Rollout Strategy

```
Stage       │ Environment         │ Flag Value     │ Who Can Access
────────────┼────────────────────┼────────────────┼──────────────────
Development │ .env.local         │ true           │ All devs
Internal    │ Vercel env (prod)  │ 'internal'     │ Team only (auth check)
Beta        │ Vercel env (prod)  │ 'beta'         │ 10% of users
GA          │ Vercel env (prod)  │ true           │ All users
```

Rollout sequence for Wajar Kabur:
1. `enabled: true` in `.env.local` — dev testing
2. `enabled: 'internal'` in Vercel production — team dogfood
3. `enabled: 'beta'` in Vercel production — 10% rollout, monitor error rate
4. `enabled: true` in Vercel production — full GA

### Per-Feature Flag Documentation

Each feature must document its flags in its ADR:

```markdown
## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `features.wajar_[name].enabled` | false | Master kill switch |
| `features.wajar_[name].v1.enabled` | true | Version-gates specific engine version |
```

## Consequences

### Easier
- Kill switch for Wajar Gaji if it ships with bad data — flip flag, no deploy needed
- Gradual rollout catches bugs before full user exposure
- A/B test verdict thresholds without code changes
- Disable broken features without comment-out code archaeology

### More Difficult
- Must keep flag documentation in sync with implementation — flags without docs become invisible debt
- Flag proliferation — each sub-feature needs its own flag or it can't be independently controlled
- Testing: tests must run against both flag-on and flag-off states
- LaunchDarkly adds external dependency — SDK initialization, network latency on flag fetch

### Implementation Files

- `lib/flags.ts` — unified flag interface (env var + LaunchDarkly stub)
- `components/layout/GlobalNav.tsx` — gate nav items behind `wajar_[name].enabled`
- `app/kabur/page.tsx` — gate entire route behind `wajar_kabur.enabled`
- `app/api/feature-flags/route.ts` — server-side flag evaluation endpoint (for edge/middleware)

### MVP Scope

For Phase 1 (MVP), only implement:
- `lib/flags.ts` with env var fallback
- Gates on GlobalNav links for each feature
- No LaunchDarkly integration yet

LaunchDarkly integration deferred until second feature ships and the team has demonstrated need for dynamic toggling without redeployment.

## References

- Engineering Analysis: `docs/reviews/ENGINEERING_ANALYSIS.md` §"No feature flag system"
- Next.js environment variables: `NEXT_PUBLIC_FLAG_*` prefix required for client-side access
- LaunchDarkly React SDK: https://docs.launchdarkly.com/sdk/client-side/react
- Unleash Node.js SDK: https://docs.getunleash.io/sdks/node_sdk
