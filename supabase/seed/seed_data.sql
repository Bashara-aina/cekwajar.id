-- Seed TER rates (PMK 168/2023) - Category A
INSERT INTO pph21_ter_rates (category, min_salary, max_salary, monthly_rate_percent) VALUES
('A', 0, 5400000, 0),
('A', 5400000, 5500000, 0.25),
('A', 5500000, 6000000, 0.25),
('A', 6000000, 6500000, 0.25),
('A', 6500000, 7000000, 0.25),
('A', 7000000, 8000000, 0.25),
('A', 8000000, 9000000, 0.25),
('A', 9000000, 10000000, 0.35),
('A', 10000000, 15000000, 0.35),
('A', 15000000, 20000000, 0.35),
('A', 20000000, 25000000, 0.35),
('A', 25000000, 30000000, 0.35),
('A', 30000000, 35000000, 0.45),
('A', 35000000, 40000000, 0.45),
('A', 40000000, 45000000, 0.45),
('A', 45000000, 50000000, 0.45),
('A', 50000000, 55000000, 0.45),
('A', 55000000, 999999999999, 0.50);

-- Seed BPJS rates
INSERT INTO bpjs_rates (component, party, rate_percent, salary_cap_idr, notes) VALUES
('JHT', 'employee', 2.0, NULL, 'No cap'),
('JHT', 'employer', 3.7, NULL, 'No cap'),
('JP', 'employee', 1.0, 11086300, '2026 cap'),
('JP', 'employer', 2.0, 11086300, '2026 cap'),
('KESEHATAN', 'employee', 1.0, 12000000, 'Cap 120K/month'),
('KESEHATAN', 'employer', 4.0, 12000000, 'Cap 480K/month'),
('JKK', 'employer', 0.24, NULL, 'Risk rate varies'),
('JKM', 'employer', 0.30, NULL, 'No cap');

-- Seed sample UMK cities
INSERT INTO umk_2026 (city, province, monthly_minimum_idr) VALUES
('Jakarta Barat', 'DKI Jakarta', 5500000),
('Jakarta Pusat', 'DKI Jakarta', 5500000),
('Jakarta Selatan', 'DKI Jakarta', 5500000),
('Jakarta Timur', 'DKI Jakarta', 5500000),
('Jakarta Utara', 'DKI Jakarta', 5500000),
('Bandung', 'Jawa Barat', 5200000),
('Bekasi', 'Jawa Barat', 5300000),
('Surabaya', 'Jawa Timur', 5400000),
('Medan', 'Sumatera Utara', 2800000),
('Makassar', 'Sulawesi Selatan', 3500000),
('Palembang', 'Sumatera Selatan', 3300000),
('Semarang', 'Jawa Tengah', 4000000),
('Yogyakarta', 'DI Yogyakarta', 2700000),
('Denpasar', 'Bali', 3100000),
('Manado', 'Sulawesi Utara', 3900000),
('Pontianak', 'Kalimantan Barat', 2700000),
('Samarinda', 'Kalimantan Timur', 3200000),
('Banjarmasin', 'Kalimantan Selatan', 3100000),
('Kupang', 'Nusa Tenggara Timur', 2400000),
('Jayapura', 'Papua', 3800000);

-- Seed PPP reference countries
INSERT INTO ppp_reference (country_code, country_name, currency_code, flag_emoji, ppp_factor, ppp_year, is_free_tier) VALUES
('IDN', 'Indonesia', 'IDR', '🇮🇩', 5200, 2024, TRUE),
('USA', 'United States', 'USD', '🇺🇸', 1, 2024, TRUE),
('SGP', 'Singapore', 'SGD', '🇸🇬', 0.85, 2024, TRUE),
('MYS', 'Malaysia', 'MYR', '🇲🇾', 1.5, 2024, TRUE),
('THA', 'Thailand', 'THB', '🇹🇭', 12, 2024, FALSE),
('VNM', 'Vietnam', 'VND', '🇻🇳', 8000, 2024, FALSE),
('PHL', 'Philippines', 'PHP', '🇵🇭', 18, 2024, FALSE),
('HKG', 'Hong Kong', 'HKD', '🇭🇰', 5.5, 2024, FALSE),
('JPN', 'Japan', 'JPY', '🇯🇵', 95, 2024, FALSE),
('KOR', 'South Korea', 'KRW', '🇰🇷', 850, 2024, FALSE),
('CHN', 'China', 'CNY', '🇨🇳', 2.5, 2024, FALSE),
('AUS', 'Australia', 'AUD', '🇦🇺', 1.3, 2024, FALSE),
('GBR', 'United Kingdom', 'GBP', '🇬🇧', 0.65, 2024, FALSE),
('DEU', 'Germany', 'EUR', '🇩🇪', 0.75, 2024, FALSE),
('NLD', 'Netherlands', 'EUR', '🇳🇱', 0.75, 2024, FALSE);

-- Seed COL indices
INSERT INTO col_indices (city_name, province, col_index, data_year, data_quarter) VALUES
('Jakarta', 'DKI Jakarta', 100.0, 2024, 4),
('Bandung', 'Jawa Barat', 92.0, 2024, 4),
('Surabaya', 'Jawa Timur', 95.0, 2024, 4),
('Bekasi', 'Jawa Barat', 88.0, 2024, 4),
('Medan', 'Sumatera Utara', 85.0, 2024, 4),
('Semarang', 'Jawa Tengah', 82.0, 2024, 4),
('Makassar', 'Sulawesi Selatan', 87.0, 2024, 4),
('Palembang', 'Sumatera Selatan', 84.0, 2024, 4),
('Yogyakarta', 'DI Yogyakarta', 78.0, 2024, 4),
('Denpasar', 'Bali', 90.0, 2024, 4);

-- Seed job categories
INSERT INTO job_categories (title, industry) VALUES
('Software Engineer', 'Technology'),
('Frontend Developer', 'Technology'),
('Backend Developer', 'Technology'),
('Full Stack Developer', 'Technology'),
('Data Analyst', 'Technology'),
('Product Manager', 'Technology'),
('UX Designer', 'Technology'),
('Digital Marketing', 'Marketing'),
('Account Manager', 'Sales'),
('HR Manager', 'Human Resources'),
('Financial Analyst', 'Finance'),
('Accountant', 'Finance'),
('Project Manager', 'Management'),
('Business Analyst', 'Business'),
('DevOps Engineer', 'Technology'),
('QA Engineer', 'Technology'),
('Mobile Developer', 'Technology'),
('Security Engineer', 'Technology'),
('Network Engineer', 'Technology'),
('Database Administrator', 'Technology');