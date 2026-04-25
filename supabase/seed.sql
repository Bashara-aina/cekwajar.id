-- cekwajar.id — Seed Data
-- Realistic Indonesian salary benchmarks and land price data
-- Run in Supabase SQL Editor or: psql $DATABASE_URL -f supabase/seed.sql

-- ─── Salary Benchmarks ─────────────────────────────────────────────────────────
-- 20+ job_title × city combinations with p50/p75/p90 IDR (k-anonymity: sample_count >= 10)
INSERT INTO public.salary_benchmarks (job_title, city, province, industry, experience_years, p50_idr, p75_idr, p90_idr, sample_count, data_source, confidence_badge)
VALUES
  -- Software Engineer — Jakarta
  ('Software Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 1,  8000000, 10000000, 13000000, 45, 'crowdsource', 'terverifikasi'),
  ('Software Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 2, 10000000, 13000000, 16500000, 60, 'crowdsource', 'terverifikasi'),
  ('Software Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 3, 12000000, 15500000, 20000000, 75, 'crowdsource', 'terverifikasi'),
  ('Software Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 4, 15000000, 19000000, 24500000, 65, 'crowdsource', 'terverifikasi'),
  ('Software Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 5, 18000000, 23000000, 30000000, 55, 'crowdsource', 'terverifikasi'),
  ('Software Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 6, 21000000, 27000000, 35000000, 40, 'crowdsource', 'terverifikasi'),

  -- Software Engineer — Surabaya
  ('Software Engineer', 'Surabaya', 'Jawa Timur', 'Technology', 2,  7500000,  9500000, 12000000, 25, 'crowdsource', 'cukup'),
  ('Software Engineer', 'Surabaya', 'Jawa Timur', 'Technology', 4, 11000000, 14000000, 18000000, 30, 'crowdsource', 'cukup'),
  ('Software Engineer', 'Surabaya', 'Jawa Timur', 'Technology', 6, 15000000, 19000000, 25000000, 18, 'crowdsource', 'cukup'),

  -- Software Engineer — Bandung
  ('Software Engineer', 'Bandung', 'Jawa Barat', 'Technology', 3,  8500000, 11000000, 14500000, 30, 'crowdsource', 'cukup'),
  ('Software Engineer', 'Bandung', 'Jawa Barat', 'Technology', 5, 12000000, 15500000, 20000000, 22, 'crowdsource', 'cukup'),

  -- Product Manager — Jakarta
  ('Product Manager', 'Jakarta', 'DKI Jakarta', 'Technology', 2, 15000000, 19500000, 26000000, 35, 'crowdsource', 'terverifikasi'),
  ('Product Manager', 'Jakarta', 'DKI Jakarta', 'Technology', 4, 20000000, 26500000, 35000000, 50, 'crowdsource', 'terverifikasi'),
  ('Product Manager', 'Jakarta', 'DKI Jakarta', 'Technology', 6, 28000000, 37000000, 48000000, 30, 'crowdsource', 'terverifikasi'),

  -- Data Scientist — Jakarta
  ('Data Scientist', 'Jakarta', 'DKI Jakarta', 'Technology', 2, 13000000, 17000000, 22000000, 30, 'crowdsource', 'terverifikasi'),
  ('Data Scientist', 'Jakarta', 'DKI Jakarta', 'Technology', 4, 18000000, 24000000, 32000000, 35, 'crowdsource', 'terverifikasi'),
  ('Data Scientist', 'Jakarta', 'DKI Jakarta', 'Technology', 6, 25000000, 33000000, 43000000, 20, 'crowdsource', 'cukup'),

  -- UX Designer — Jakarta
  ('UX Designer', 'Jakarta', 'DKI Jakarta', 'Technology', 2, 10000000, 13000000, 17000000, 35, 'crowdsource', 'terverifikasi'),
  ('UX Designer', 'Jakarta', 'DKI Jakarta', 'Technology', 4, 15000000, 19500000, 25500000, 28, 'crowdsource', 'terverifikasi'),
  ('UX Designer', 'Jakarta', 'DKI Jakarta', 'Technology', 6, 20000000, 26500000, 35000000, 18, 'crowdsource', 'cukup'),

  -- DevOps Engineer — Jakarta
  ('DevOps Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 3, 14000000, 18500000, 24000000, 25, 'crowdsource', 'terverifikasi'),
  ('DevOps Engineer', 'Jakarta', 'DKI Jakarta', 'Technology', 5, 20000000, 26500000, 35000000, 30, 'crowdsource', 'terverifikasi'),

  -- Digital Marketing — Jakarta
  ('Digital Marketing', 'Jakarta', 'DKI Jakarta', 'Marketing', 2,  7000000,  9000000, 12000000, 40, 'crowdsource', 'terverifikasi'),
  ('Digital Marketing', 'Jakarta', 'DKI Jakarta', 'Marketing', 4, 11000000, 14500000, 19000000, 32, 'crowdsource', 'terverifikasi'),

  -- Financial Analyst — Jakarta
  ('Financial Analyst', 'Jakarta', 'DKI Jakarta', 'Finance', 3, 12000000, 15500000, 20000000, 40, 'crowdsource', 'terverifikasi'),
  ('Financial Analyst', 'Jakarta', 'DKI Jakarta', 'Finance', 5, 18000000, 23500000, 31000000, 30, 'crowdsource', 'terverifikasi'),

  -- Accountancy / Finance — Surabaya
  ('Financial Analyst', 'Surabaya', 'Jawa Timur', 'Finance', 3,  8500000, 11000000, 14500000, 18, 'crowdsource', 'cukup'),
  ('Financial Analyst', 'Surabaya', 'Jawa Timur', 'Finance', 5, 13000000, 17000000, 22000000, 14, 'crowdsource', 'cukup'),

  -- Data Analyst — Bandung
  ('Data Analyst', 'Bandung', 'Jawa Barat', 'Technology', 2,  7000000,  9000000, 11500000, 22, 'crowdsource', 'cukup'),
  ('Data Analyst', 'Bandung', 'Jawa Barat', 'Technology', 4, 10000000, 13000000, 17000000, 17, 'crowdsource', 'cukup')
ON CONFLICT DO NOTHING;

-- ─── Land / Property Prices ───────────────────────────────────────────────────
-- 10+ city × property_type combinations (price_per_m2 in IDR)
INSERT INTO public.land_prices (province, city, property_type, price_per_m2, sample_count)
VALUES
  -- Jakarta areas
  ('DKI Jakarta', 'Jakarta Selatan', 'tanah', 35000000, 120),
  ('DKI Jakarta', 'Jakarta Selatan', 'rumah', 40000000,  85),
  ('DKI Jakarta', 'Jakarta Selatan', 'apartemen', 25000000, 150),
  ('DKI Jakarta', 'Jakarta Selatan', 'ruko', 45000000,  40),

  ('DKI Jakarta', 'Jakarta Barat', 'tanah', 28000000,  95),
  ('DKI Jakarta', 'Jakarta Barat', 'rumah', 25000000,  85),
  ('DKI Jakarta', 'Jakarta Barat', 'apartemen', 18000000, 110),
  ('DKI Jakarta', 'Jakarta Barat', 'ruko', 35000000,  55),

  ('DKI Jakarta', 'Jakarta Timur', 'tanah', 22000000,  80),
  ('DKI Jakarta', 'Jakarta Timur', 'rumah', 20000000,  90),
  ('DKI Jakarta', 'Jakarta Timur', 'apartemen', 15000000,  75),

  ('DKI Jakarta', 'Jakarta Utara', 'tanah', 25000000,  70),
  ('DKI Jakarta', 'Jakarta Utara', 'rumah', 22000000,  80),
  ('DKI Jakarta', 'Jakarta Utara', 'apartemen', 16000000,  60),

  ('DKI Jakarta', 'Jakarta Pusat', 'tanah', 40000000,  45),
  ('DKI Jakarta', 'Jakarta Pusat', 'rumah', 38000000,  35),
  ('DKI Jakarta', 'Jakarta Pusat', 'apartemen', 30000000,  90),

  -- Surabaya
  ('Jawa Timur', 'Surabaya', 'tanah', 18000000, 100),
  ('Jawa Timur', 'Surabaya', 'rumah', 15000000, 120),
  ('Jawa Timur', 'Surabaya', 'apartemen', 12000000,  80),
  ('Jawa Timur', 'Surabaya', 'ruko', 22000000,  45),

  -- Bandung
  ('Jawa Barat', 'Bandung', 'tanah', 12000000, 110),
  ('Jawa Barat', 'Bandung', 'rumah', 10000000, 130),
  ('Jawa Barat', 'Bandung', 'apartemen', 18000000,  60),

  -- Bekasi
  ('Jawa Barat', 'Bekasi', 'tanah',  8000000,  90),
  ('Jawa Barat', 'Bekasi', 'rumah',  7000000, 100),

  -- Tangerang
  ('Banten', 'Tangerang', 'tanah', 10000000,  85),
  ('Banten', 'Tangerang', 'rumah',  9000000,  95),
  ('Banten', 'Tangerang', 'apartemen', 14000000,  70),

  -- Bali / Denpasar
  ('Bali', 'Denpasar', 'tanah', 25000000,  60),
  ('Bali', 'Denpasar', 'rumah', 20000000,  75),
  ('Bali', 'Denpasar', 'apartemen', 22000000,  45),

  -- Yogyakarta
  ('DI Yogyakarta', 'Yogyakarta', 'tanah',  6000000,  80),
  ('DI Yogyakarta', 'Yogyakarta', 'rumah',  5000000,  90),

  -- Semarang
  ('Jawa Tengah', 'Semarang', 'tanah',  7000000,  70),
  ('Jawa Tengah', 'Semarang', 'rumah',  6000000,  85),

  -- Medan
  ('Sumatera Utara', 'Medan', 'tanah',  9000000,  65),
  ('Sumatera Utara', 'Medan', 'rumah',  8000000,  75),
  ('Sumatera Utara', 'Medan', 'apartemen', 11000000,  40)
ON CONFLICT DO NOTHING;

-- ─── Verify ────────────────────────────────────────────────────────────────────
SELECT 'salary_benchmarks count:' AS label, COUNT(*) AS count FROM public.salary_benchmarks;
SELECT 'land_prices count:'        AS label, COUNT(*) AS count FROM public.land_prices;
