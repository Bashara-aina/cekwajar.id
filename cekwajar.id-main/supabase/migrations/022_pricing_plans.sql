-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 022_pricing_plans.sql
-- Database-driven pricing for payment transactions
-- Replaces hardcoded PRICING constant in payment route
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,                    -- 'pro_monthly', 'pro_annual'
  price_idr BIGINT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed current pro plan pricing
INSERT INTO pricing_plans (id, price_idr, display_name, description, features)
VALUES
  (
    'pro_monthly',
    49000,
    'Pro — Bulanan',
    'Langganan Pro bulanan',
    '{"billing": "monthly", "interval_count": 1, "annual_multiplier": null}'
  ),
  (
    'pro_annual',
    470400,
    'Pro — Tahunan',
    'Langganan Pro tahunan (diskon 20%)',
    '{"billing": "annual", "interval_count": 12, "annual_multiplier": 0.80}'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Add pricing lookup function
CREATE OR REPLACE FUNCTION get_pricing_plan(plan_id TEXT)
RETURNS TABLE(
  id TEXT,
  price_idr BIGINT,
  display_name TEXT,
  features JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id,
    pp.price_idr,
    pp.display_name,
    pp.features
  FROM pricing_plans pp
  WHERE pp.id = plan_id
    AND pp.is_active = true;
END;
$$;

-- 4. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pricing_plans_updated_at ON pricing_plans;
CREATE TRIGGER pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();