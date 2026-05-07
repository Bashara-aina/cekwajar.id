-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 021_bpjs_year_aware_caps.sql
-- Add year-aware JP salary caps for March-boundary rule
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Add year column to bpjs_rates
ALTER TABLE bpjs_rates ADD COLUMN IF NOT EXISTS year INTEGER;

-- 2. Add composite index for year-aware lookups
CREATE INDEX IF NOT EXISTS bpjs_rates_component_year_idx
  ON bpjs_rates(component, year)
  WHERE year IS NOT NULL;

-- 3. Add year-specific JP caps (JP has the only salary cap that changes annually)
-- March boundary: months 1-2 use prior year cap
-- Source: BPJS SE B/1226/022026 (25 Feb 2026) for 2026 values

INSERT INTO bpjs_rates (component, party, rate_percent, salary_cap_idr, notes, effective_from, year)
VALUES
  -- 2024 JP caps (effective 1 Mar 2024)
  ('JP', 'employee', 1.000, 10_042_300, 'JP cap 2024 — SE BPJS No.3/2024', '2024-03-01', 2024),
  ('JP', 'employer', 2.000, 10_042_300, 'JP cap 2024 — SE BPJS No.3/2024', '2024-03-01', 2024),
  -- 2025 JP caps (effective 1 Mar 2025)
  ('JP', 'employee', 1.000, 10_547_400, 'JP cap 2025 — SE BPJS B/0501/022025', '2025-03-01', 2025),
  ('JP', 'employer', 2.000, 10_547_400, 'JP cap 2025 — SE BPJS B/0501/022025', '2025-03-01', 2025),
  -- 2026 JP caps (effective 1 Mar 2026)
  ('JP', 'employee', 1.000, 11_086_300, 'JP cap 2026 — SE BPJS B/1226/022026', '2026-03-01', 2026),
  ('JP', 'employer', 2.000, 11_086_300, 'JP cap 2026 — SE BPJS B/1226/022026', '2026-03-01', 2026)
ON CONFLICT (id) DO NOTHING;

-- 4. Mark existing generic JP rows as year 2023 (for backward compat)
-- These are the old 9,559,600 rows from before year-aware migration
UPDATE bpjs_rates
SET year = 2023
WHERE component = 'JP'
  AND year IS NULL;

-- 5. Keep KESEHATAN caps static (12M has been unchanged since 2022)
-- KESEHATAN rows already have salary_cap_idr = 12,000,000 — no update needed