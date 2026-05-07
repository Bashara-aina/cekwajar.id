-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 028_wajar_kabur_runway.sql
-- runway_simulations: saved user resignation scenarios
-- severance_rules: PP 35/2021 reference table by reason + masa kerja bracket
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS runway_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Input parameters
  monthly_salary BIGINT NOT NULL,
  monthly_expenses BIGINT NOT NULL,
  savings BIGINT NOT NULL,
  masa_kerja_years INTEGER NOT NULL,
  masa_kerja_months INTEGER NOT NULL DEFAULT 0,
  resignation_type TEXT NOT NULL, -- 'resign' | 'phk' | 'pkwt_expire'
  dependents_count INTEGER NOT NULL DEFAULT 0,
  has_npwp BOOLEAN NOT NULL DEFAULT false,
  jht_balance BIGINT,
  outstanding_debt BIGINT,
  investment_value BIGINT,
  -- Computed result
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user's simulation history
CREATE INDEX IF NOT EXISTS idx_runway_simulations_user_id ON runway_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_runway_simulations_created_at ON runway_simulations(created_at DESC);

-- ══════════════════════════════════════════════════════════════════════════════
-- severance_rules: PP 35/2021 reference table
-- Populated via seed script; used for audit/compliance verification
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS severance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL, -- 'resign' | 'phk' | 'pkwt_expire'
  masa_kerja_min INTEGER NOT NULL, -- minimum years (inclusive)
  masa_kerja_max INTEGER NOT NULL, -- maximum years (exclusive), use 999 for no cap
  pesangon_months NUMERIC NOT NULL,
  upmk_months NUMERIC NOT NULL,
  regulation TEXT NOT NULL, -- e.g. 'PP 35/2021 Pasal 40'
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL = currently active
  UNIQUE(reason, masa_kerja_min, effective_from)
);

-- Index for rule lookup by reason + masa kerja
CREATE INDEX IF NOT EXISTS idx_severance_rules_reason_masa_kerja
  ON severance_rules(reason, masa_kerja_min, masa_kerja_max)
  WHERE effective_to IS NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- Seed initial severance rules for PP 35/2021
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO severance_rules (reason, masa_kerja_min, masa_kerja_max, pesangon_months, upmk_months, regulation, effective_from)
VALUES
  -- PHK pesangon scale (masa kerja thresholds)
  ('phk', 0, 1, 1, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 1, 2, 2, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 2, 3, 3, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 3, 4, 4, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 4, 5, 5, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 5, 6, 6, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 6, 7, 7, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 7, 8, 8, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('phk', 8, 999, 9, 0, 'PP 35/2021 Pasal 40 ayat (2) — capped at 9', '2021-02-01'),
  -- PKWT expire uses same table as PHK
  ('pkwt_expire', 0, 1, 1, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 1, 2, 2, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 2, 3, 3, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 3, 4, 4, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 4, 5, 5, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 5, 6, 6, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 6, 7, 7, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 7, 8, 8, 0, 'PP 35/2021 Pasal 40 ayat (2)', '2021-02-01'),
  ('pkwt_expire', 8, 999, 9, 0, 'PP 35/2021 Pasal 40 ayat (2) — capped at 9', '2021-02-01'),
  -- UPMK for masa kerja > 3 years (PHK)
  ('phk', 3, 4, 0, 2, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('phk', 4, 5, 0, 3, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('phk', 5, 6, 0, 4, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('phk', 6, 7, 0, 5, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('phk', 7, 8, 0, 6, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('phk', 8, 10, 0, 7, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('phk', 10, 999, 0, 10, 'PP 35/2021 Pasal 40 ayat (4) — capped at 10', '2021-02-01'),
  -- UPMK for masa kerja > 3 years (PKWT expire)
  ('pkwt_expire', 3, 4, 0, 2, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('pkwt_expire', 4, 5, 0, 3, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('pkwt_expire', 5, 6, 0, 4, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('pkwt_expire', 6, 7, 0, 5, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('pkwt_expire', 7, 8, 0, 6, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('pkwt_expire', 8, 10, 0, 7, 'PP 35/2021 Pasal 40 ayat (4)', '2021-02-01'),
  ('pkwt_expire', 10, 999, 0, 10, 'PP 35/2021 Pasal 40 ayat (4) — capped at 10', '2021-02-01')
ON CONFLICT (reason, masa_kerja_min, effective_from) DO NOTHING;