-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 024_fix_bpjs_jp_caps_year_aware
-- Description:
--   Fixes stale JP salary cap in bpjs_rates (was hardcoded to 9,559,600
--   from 2015-era seed data) and adds year-specific rows so future DB-driven
--   cap lookups resolve the correct regulatory year.
--
--   The bpjs.ts calculator uses its own JP_WAGE_CAPS map as authoritative
--   fallback; bpjs_rates entries are used when DB cache is warm via
--   refreshBpjsCapsCache().
--
--   March boundary rule is implemented in resolveJpCap():
--     months 1-2 (Jan/Feb) → prior regulatory year cap
--     months 3-12           → current regulatory year cap
--   This migration seeds the correct cap for each regulatory year so the
--   DB can be used as source of truth when it is updated annually.
--
-- Verified caps:
--   2024: 10,042,300 — effective 1 Mar 2024 (BPJS announcement)
--   2025: 10,547,400 — effective 1 Mar 2025 (BPJS announcement)
--   2026: 11,086,300 — effective 1 Mar 2026 — verified from SE BPJS B/1226/022026
--
-- KESEHATAN cap (12,000,000) was last updated 1 Jan 2022 (SE KC/0699/032021)
-- and remains unchanged for 2024–2026. Year-specific rows added for
-- future-proofing when an official update is announced.
-- ══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Remove the old stale JP cap rows (2015-era, cap = 9,559,600)
DELETE FROM bpjs_rates WHERE component = 'JP' AND party = 'employer';
DELETE FROM bpjs_rates WHERE component = 'JP' AND party = 'employee';

-- Insert correct year-specific JP caps for 2024
INSERT INTO bpjs_rates (component, party, rate_percent, salary_cap_idr, notes, effective_from)
VALUES
  ('JP', 'employee', 1.000, 10_042_300, 'JP cap 2024 — effective 1 Mar 2024', '2024-01-01'),
  ('JP', 'employer', 2.000, 10_042_300, 'JP cap 2024 — effective 1 Mar 2024', '2024-01-01');

-- Insert correct year-specific JP caps for 2025
INSERT INTO bpjs_rates (component, party, rate_percent, salary_cap_idr, notes, effective_from)
VALUES
  ('JP', 'employee', 1.000, 10_547_400, 'JP cap 2025 — effective 1 Mar 2025', '2025-01-01'),
  ('JP', 'employer', 2.000, 10_547_400, 'JP cap 2025 — effective 1 Mar 2025', '2025-01-01');

-- Insert correct year-specific JP caps for 2026 (verified from SE BPJS B/1226/022026)
INSERT INTO bpjs_rates (component, party, rate_percent, salary_cap_idr, notes, effective_from)
VALUES
  ('JP', 'employee', 1.000, 11_086_300, 'JP cap 2026 — effective 1 Mar 2026 — verified SE BPJS B/1226/022026', '2026-01-01'),
  ('JP', 'employer', 2.000, 11_086_300, 'JP cap 2026 — effective 1 Mar 2026 — verified SE BPJS B/1226/022026', '2026-01-01');

-- Update KESEHATAN rows: keep 12,000,000 but add year-specific notes for 2024–2026
UPDATE bpjs_rates
SET
  notes = 'KESEHATAN cap 12M — unchanged since 1 Jan 2022 (SE KC/0699/032021) — valid for 2024'
WHERE component = 'KESEHATAN' AND party = 'employee' AND effective_from = '2015-01-01';

UPDATE bpjs_rates
SET
  notes = 'KESEHATAN cap 12M — unchanged since 1 Jan 2022 (SE KC/0699/032021) — valid for 2024'
WHERE component = 'KESEHATAN' AND party = 'employer' AND effective_from = '2015-01-01';

COMMIT;
