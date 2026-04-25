-- cekwajar.id — Supabase Schema
-- Generated from: block_02_database_schema.md + req_01_master_prd.md
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ─── 1. users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE,
  phone           TEXT,
  auth_provider   TEXT CHECK (auth_provider IN ('google', 'anonymous')) DEFAULT 'anonymous',
  ptkp_status    TEXT CHECK (ptkp_status IN ('TK0','K0','K1','K2','K3')),
  city            TEXT,
  subscription_tier TEXT TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free','basic','pro')),
  subscription_end TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  last_active_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. salary_benchmarks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.salary_benchmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title       TEXT    NOT NULL,
  city            TEXT,
  province        TEXT,
  industry         TEXT,
  experience_years INT,
  p50_idr         BIGINT  NOT NULL,
  sample_count    INT     DEFAULT 0,
  data_source     TEXT    CHECK (data_source IN ('bps', 'crowdsource', 'blended')),
  confidence_badge TEXT  CHECK (confidence_badge IN ('low','cukup','terverifikasi')),
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_city ON public.salary_benchmarks(city);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_job ON public.salary_benchmarks(job_title);

-- k-anonymity: RLS — show only if sample_count >= 10
ALTER TABLE public.salary_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "show_verified_benchmarks" ON public.salary_benchmarks
  FOR SELECT USING (sample_count >= 10);

-- ─── 3. land_prices ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.land_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province        TEXT    NOT NULL,
  city            TEXT    NOT NULL,
  kecamatan       TEXT,
  kelurahan       TEXT,
  property_type   TEXT    CHECK (property_type IN ('rumah','tanah','apartemen','ruko')),
  price_per_m2    BIGINT,
  sample_count    INT     DEFAULT 0,
  scraped_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_land_prices_city ON public.land_prices(city);
CREATE INDEX IF NOT EXISTS idx_land_prices_prop_type ON public.land_prices(property_type);

-- ─── 4. verdict_logs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.verdict_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tool_name       TEXT    CHECK (tool_name IN ('slip','gaji','tanah','kabur','hidup')),
  input_hash      TEXT,   -- anonymized SHA-256(input)[:16] — no PII
  verdict_code    TEXT,   -- V01-V07 for slip, MURAH/WAJAR/MAHAMAL for tanah
  idr_shortfall   BIGINT, -- NULL for free tier
  is_paid         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verdict_logs_user ON public.verdict_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verdict_logs_tool ON public.verdict_logs(tool_name);
CREATE INDEX IF NOT EXISTS idx_verdict_logs_created ON public.verdict_logs(created_at DESC);

ALTER TABLE public.verdict_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verdict_own" ON public.verdict_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "verdict_insert" ON public.verdict_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ─── 5. tax_rules ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tax_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type       TEXT    CHECK (rule_type IN ('pph21','bpjs','ptkp','umk')),
  version         INT     NOT NULL,
  effective_from  DATE    NOT NULL,
  effective_to    DATE,
  rule_data       JSONB   NOT NULL,  -- PTKP values, TER tables, bracket rates
  source_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tax_rules_type ON public.tax_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_tax_rules_effective ON public.tax_rules(effective_from, effective_to);

-- ─── RLS for users ───────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- ─── RPC: upgrade_subscription ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.upgrade_subscription(
  p_user_id UUID,
  p_tier TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
  SET subscription_tier = p_tier,
      subscription_end  = now() + INTERVAL '30 days'
  WHERE id = p_user_id;
END;
$$;

-- ─── RPC: log_verdict ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_verdict(
  p_tool_name TEXT,
  p_input_hash TEXT,
  p_verdict_code TEXT,
  p_idr_shortfall BIGINT DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.verdict_logs (user_id, tool_name, input_hash, verdict_code, idr_shortfall)
  VALUES (auth.uid(), p_tool_name, p_input_hash, p_verdict_code, p_idr_shortfall);
END;
$$;

-- ─── Seed: default PTKP 2024 ─────────────────────────────────────────────────
INSERT INTO public.tax_rules (rule_type, version, effective_from, rule_data, source_url)
VALUES (
  'ptkp', 1, '2024-01-01',
  '{"TK0":54000000,"K0":58500000,"K1":63000000,"K2":67500000,"K3":72000000}',
  'https://pajak.go.id'
) ON CONFLICT DO NOTHING;
