-- cekwajar.id Initial Schema
-- Generated: 2026-04-27

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro')),
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  last_payment_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  midtrans_order_id TEXT UNIQUE NOT NULL,
  plan_type TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  gross_amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settlement', 'expire', 'cancel', 'deny')),
  fraud_status TEXT,
  is_webhook_processed BOOLEAN DEFAULT FALSE,
  webhook_received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payslip audits
CREATE TABLE IF NOT EXISTS public.payslip_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  gross_salary BIGINT NOT NULL,
  ptkp_status TEXT NOT NULL,
  city TEXT,
  month_number SMALLINT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  year SMALLINT NOT NULL,
  has_npwp BOOLEAN DEFAULT FALSE,
  reported_pph21 BIGINT DEFAULT 0,
  reported_jht BIGINT DEFAULT 0,
  reported_jp BIGINT DEFAULT 0,
  reported_jkk BIGINT DEFAULT 0,
  reported_jkm BIGINT DEFAULT 0,
  reported_kesehatan BIGINT DEFAULT 0,
  reported_take_home BIGINT DEFAULT 0,
  calculated_pph21 BIGINT,
  calculated_jht BIGINT,
  calculated_jp BIGINT,
  calculated_kesehatan BIGINT,
  calculated_jkk BIGINT,
  calculated_jkm BIGINT,
  violations JSONB DEFAULT '[]',
  verdict TEXT CHECK (verdict IN ('SESUAI', 'ADA_PELANGGARAN')),
  is_paid_result BOOLEAN DEFAULT FALSE,
  subscription_tier_at_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UMK 2026
CREATE TABLE IF NOT EXISTS public.umk_2026 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  monthly_minimum_idr BIGINT NOT NULL,
  effective_date DATE DEFAULT '2026-01-01'
);

-- PPh21 TER rates (PMK 168/2023)
CREATE TABLE IF NOT EXISTS public.pph21_ter_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C')),
  min_salary BIGINT NOT NULL,
  max_salary BIGINT NOT NULL,
  monthly_rate_percent DECIMAL(5, 3) NOT NULL
);

-- BPJS rates
CREATE TABLE IF NOT EXISTS public.bpjs_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL CHECK (component IN ('JHT', 'JP', 'KK', 'JKM', 'KESEHATAN')),
  party TEXT NOT NULL CHECK (party IN ('employee', 'employer')),
  rate_percent DECIMAL(5, 3) NOT NULL,
  salary_cap_idr BIGINT,
  notes TEXT
);

-- OCR quota counter
CREATE TABLE IF NOT EXISTS public.ocr_quota_counter (
  month_key TEXT PRIMARY KEY,
  month_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job categories
CREATE TABLE IF NOT EXISTS public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  industry TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Salary benchmarks
CREATE TABLE IF NOT EXISTS public.salary_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_category_id UUID REFERENCES job_categories(id),
  city TEXT,
  province TEXT,
  experience_bucket TEXT CHECK (experience_bucket IN ('0-2', '3-5', '6-10', '10+')),
  data_source TEXT DEFAULT 'bps',
  sample_count INTEGER DEFAULT 0,
  p25 BIGINT,
  p50 BIGINT,
  p75 BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salary submissions (crowdsource)
CREATE TABLE IF NOT EXISTS public.salary_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_category_id UUID REFERENCES job_categories(id),
  job_title_raw TEXT,
  city TEXT,
  province TEXT,
  gross_salary BIGINT,
  experience_bucket TEXT,
  industry TEXT,
  submission_fingerprint TEXT,
  is_validated BOOLEAN DEFAULT FALSE,
  is_outlier BOOLEAN DEFAULT FALSE,
  submission_date TIMESTAMPTZ DEFAULT NOW()
);

-- Property benchmarks
CREATE TABLE IF NOT EXISTS public.property_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province TEXT,
  city TEXT,
  district TEXT,
  property_type TEXT CHECK (property_type IN ('RUMAH', 'TANAH', 'APARTEMEN', 'RUKO')),
  price_per_sqm BIGINT,
  land_area_sqm INTEGER,
  source TEXT,
  is_outlier BOOLEAN DEFAULT FALSE
);

-- COL indices
CREATE TABLE IF NOT EXISTS public.col_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_code TEXT,
  city_name TEXT NOT NULL,
  province TEXT,
  col_index DECIMAL(10, 4),
  data_year INTEGER,
  data_quarter INTEGER
);

-- COL categories
CREATE TABLE IF NOT EXISTS public.col_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code TEXT,
  label_id TEXT,
  hemat_weight DECIMAL(5, 3),
  standar_weight DECIMAL(5, 3),
  nyaman_weight DECIMAL(5, 3)
);

-- PPP reference
CREATE TABLE IF NOT EXISTS public.ppp_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  currency_code TEXT,
  currency_symbol TEXT,
  flag_emoji TEXT,
  ppp_factor DECIMAL(10, 4),
  ppp_year INTEGER,
  is_free_tier BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- User consents (UU PDP)
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version TEXT,
  privacy_policy_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  marketing_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT
);

-- Refund requests
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES transactions(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_paid_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  fraud_flag BOOLEAN DEFAULT FALSE,
  UNIQUE (referrer_id, referred_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payslip_audits_user_id ON payslip_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_payslip_audits_created_at ON payslip_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(midtrans_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_fingerprint ON salary_submissions(submission_fingerprint);
CREATE INDEX IF NOT EXISTS idx_job_categories_title_trgm ON job_categories USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_umk_city ON umk_2026(city);

-- RPC Functions
CREATE OR REPLACE FUNCTION public.search_job_categories_fuzzy(search_term TEXT, threshold FLOAT DEFAULT 0.3)
RETURNS TABLE(id UUID, title TEXT, industry TEXT, similarity REAL) AS $$
BEGIN
  RETURN QUERY
  SELECT jc.id, jc.title, jc.industry, similarity(jc.title, search_term) AS similarity
  FROM job_categories jc
  WHERE similarity(jc.title, search_term) >= threshold
  ORDER BY similarity DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.get_property_benchmark_stats(
  p_province TEXT,
  p_city TEXT,
  p_district TEXT DEFAULT NULL,
  p_property_type TEXT,
  p_size_band TEXT
)
RETURNS TABLE(p25 BIGINT, p50 BIGINT, p75 BIGINT, sample_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY pb.price_per_sqm)::BIGINT AS p25,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY pb.price_per_sqm)::BIGINT AS p50,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pb.price_per_sqm)::BIGINT AS p75,
    COUNT(*)::INTEGER AS sample_count
  FROM property_benchmarks pb
  WHERE pb.province = p_province
    AND pb.city = p_city
    AND pb.property_type = p_property_type
    AND (p_district IS NULL OR pb.district = p_district);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_ocr_counter()
RETURNS INTEGER AS $$
DECLARE
  current_month TEXT;
  new_count INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  INSERT INTO ocr_quota_counter (month_key, month_count, updated_at)
  VALUES (current_month, 1, NOW())
  ON CONFLICT (month_key) 
  DO UPDATE SET month_count = ocr_quota_counter.month_count + 1, updated_at = NOW()
  RETURNING month_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- View for public recent audits
CREATE OR REPLACE VIEW public.recent_audits_public AS
SELECT
  id,
  created_at,
  CASE
    WHEN verdict = 'SESUAI' THEN 'tidak ada selisih signifikan'
    ELSE format('IDR %s', (violations->0->>'difference')::TEXT)
  END AS shortfall_display,
  split_part(COALESCE(full_name, 'User'), ' ', 1) AS first_name_only,
  city
FROM payslip_audits
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 50;

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can manage subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can manage transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can insert audits" ON payslip_audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own audits" ON payslip_audits FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own consents" ON user_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consents" ON user_consents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC: Migrate anonymous audit data to authenticated user
CREATE OR REPLACE FUNCTION public.migrate_anon_data(
  p_anon_session_id TEXT,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.payslip_audits
  SET user_id = p_user_id
  WHERE session_id = p_anon_session_id
    AND user_id IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Run calculation smoke test
CREATE OR REPLACE FUNCTION public.run_calc_smoke_test()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  result := jsonb_build_object(
    'pph21_ter',
    (SELECT COUNT(*) > 0 FROM public.pph21_ter_rates LIMIT 1),
    'umk_data',
    (SELECT COUNT(*) > 0 FROM public.umk_2026 LIMIT 1),
    'bpjs_rates',
    (SELECT COUNT(*) > 0 FROM public.bpjs_rates LIMIT 1),
    'timestamp',
    NOW()
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RPC: Get user's cumulative shortfall
CREATE OR REPLACE FUNCTION public.user_cumulative_shortfall(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COALESCE(SUM(v->>'difference'::text)::BIGINT, 0)
  INTO total
  FROM payslip_audits,
       jsonb_array_elements(violations) v
  WHERE payslip_audits.user_id = p_user_id
    AND verdict = 'ADA_PELANGGARAN';
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Grants
GRANT SELECT ON recent_audits_public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_anon_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_calc_smoke_test TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_cumulative_shortfall TO authenticated;