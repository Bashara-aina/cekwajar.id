-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 027_wajar_tanah_njop.sql
-- NJOP reference tables for Phase 1 tanah valuation
-- ══════════════════════════════════════════════════════════════════════════════

-- NJOP values by location (seeded from public SPPT PBB data)
CREATE TABLE IF NOT EXISTS njop_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nop TEXT UNIQUE,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  land_area_m2 DECIMAL,
  building_area_m2 DECIMAL,
  land_njop_per_m2 BIGINT NOT NULL,
  building_njop_per_m2 BIGINT,
  effective_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crowdsourced transaction data
CREATE TABLE IF NOT EXISTS property_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('tanah_kosong', 'rumah', 'ruko', 'apartemen')),
  land_area_m2 INTEGER NOT NULL,
  building_area_m2 INTEGER,
  transaction_price BIGINT NOT NULL,
  price_per_m2 BIGINT,
  transaction_date DATE,
  is_verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'user_submission',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Location risk and premium factors
CREATE TABLE IF NOT EXISTS location_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT UNIQUE NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  flood_risk BOOLEAN DEFAULT false,
  coastal_risk BOOLEAN DEFAULT false,
  toll_access_km DECIMAL,
  mrt_closest_km DECIMAL,
  risk_premium_multiplier DECIMAL DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_njop_reference_district ON njop_reference(province, city, district);
CREATE INDEX IF NOT EXISTS idx_njop_reference_effective_year ON njop_reference(effective_year DESC);
CREATE INDEX IF NOT EXISTS idx_property_transactions_location ON property_transactions(province, city, district, property_type);
CREATE INDEX IF NOT EXISTS idx_property_transactions_date ON property_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_location_factors_district ON location_factors(province, city, district);

-- Seed function for NJOP data (Phase 1: 20 Jakarta locations)
CREATE OR REPLACE FUNCTION seed_njop_jakarta_2024()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO njop_reference (nop, province, city, district, village, land_area_m2, building_area_m2, land_njop_per_m2, building_njop_per_m2, effective_year)
  VALUES
    -- Jakarta Selatan
    ('01.31.010.001.001.0000.0', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', 'Senayan', 1000, 500, 15000000, 8500000, 2024),
    ('01.31.010.002.001.0000.0', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', 'Guntur', 800, 400, 14000000, 8000000, 2024),
    ('01.31.020.001.001.0000.0', 'DKI Jakarta', 'Jakarta Selatan', 'Pesanggrahan', 'Pesanggrahan', 500, 250, 8000000, 5500000, 2024),
    ('01.31.030.001.001.0000.0', 'DKI Jakarta', 'Jakarta Selatan', 'Cilandak', 'Lebak Bulus', 1200, 600, 9000000, 6000000, 2024),
    ('01.31.040.001.001.0000.0', 'DKI Jakarta', 'Jakarta Selatan', 'Tebet', 'Tebet', 600, 300, 10000000, 7000000, 2024),
    -- Jakarta Pusat
    ('01.21.010.001.001.0000.0', 'DKI Jakarta', 'Jakarta Pusat', 'Gambir', 'Gambir', 800, 400, 18000000, 10000000, 2024),
    ('01.21.020.001.001.0000.0', 'DKI Jakarta', 'Jakarta Pusat', 'Tanah Abang', 'Tanah Abang', 700, 350, 12000000, 7500000, 2024),
    ('01.21.030.001.001.0000.0', 'DKI Jakarta', 'Jakarta Pusat', 'Menteng', 'Menteng', 900, 450, 20000000, 12000000, 2024),
    ('01.21.040.001.001.0000.0', 'DKI Jakarta', 'Jakarta Pusat', 'Cempaka Putih', 'Cempaka Putih', 650, 320, 11000000, 7000000, 2024),
    -- Jakarta Barat
    ('01.41.010.001.001.0000.0', 'DKI Jakarta', 'Jakarta Barat', 'Grogol Petamburan', 'Grogol', 750, 380, 13000000, 8000000, 2024),
    ('01.41.020.001.001.0000.0', 'DKI Jakarta', 'Jakarta Barat', 'Taman Sari', 'Tamansari', 500, 250, 9000000, 5500000, 2024),
    ('01.41.030.001.001.0000.0', 'DKI Jakarta', 'Jakarta Barat', 'Kebon Jeruk', 'Kebon Jeruk', 850, 420, 11000000, 6500000, 2024),
    ('01.41.040.001.001.0000.0', 'DKI Jakarta', 'Jakarta Barat', 'Kalideres', 'Kalideres', 1000, 500, 7000000, 4500000, 2024),
    -- Jakarta Timur
    ('01.51.010.001.001.0000.0', 'DKI Jakarta', 'Jakarta Timur', 'Pasar Rebo', 'Pasar Rebo', 900, 450, 6000000, 4000000, 2024),
    ('01.51.020.001.001.0000.0', 'DKI Jakarta', 'Jakarta Timur', 'Cipayung', 'Cipayung', 1100, 550, 6500000, 4200000, 2024),
    ('01.51.030.001.001.0000.0', 'DKI Jakarta', 'Jakarta Timur', 'Jatinegara', 'Jatinegara', 700, 350, 7500000, 5000000, 2024),
    ('01.51.040.001.001.0000.0', 'DKI Jakarta', 'Jakarta Timur', 'Kramat Jati', 'Kramat Jati', 800, 400, 5500000, 3800000, 2024),
    -- Jakarta Utara
    ('01.61.010.001.001.0000.0', 'DKI Jakarta', 'Jakarta Utara', 'Tanjung Priok', 'Tanjung Priok', 950, 470, 5500000, 3600000, 2024),
    ('01.61.020.001.001.0000.0', 'DKI Jakarta', 'Jakarta Utara', 'Koja', 'Koja', 850, 420, 4800000, 3200000, 2024),
    ('01.61.030.001.001.0000.0', 'DKI Jakarta', 'Jakarta Utara', 'Pademangan', 'Pademangan', 900, 450, 5000000, 3400000, 2024)
  ON CONFLICT (nop) DO UPDATE SET
    land_njop_per_m2 = EXCLUDED.land_njop_per_m2,
    building_njop_per_m2 = EXCLUDED.building_njop_per_m2,
    effective_year = EXCLUDED.effective_year;
END;
$$;

SELECT seed_njop_jakarta_2024();