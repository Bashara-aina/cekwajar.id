# CekWajar.id - Indonesian Wage Fairness Platform

> **⚠️ CANONICAL VERSION** — This is the active development codebase.
> Previous `src/` version (Pages Router): archived at `/home/newadmin/swarm-bot/ARCHIVE_cekwajar-src-version/`
>
> GitHub: https://github.com/Bashara-aina/cekwajar.id

Platform untuk memverifikasi keadilan gaji dan harga properti di Indonesia.

## Tech Stack

- **Framework**: Next.js 16.2.3 (App Router)
- **UI**: React 19.2.4, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript 5
- **Testing**: Vitest 4.1.5
- **Validation**: Zod 4.3.6
- **Error Tracking**: Sentry

## Project Structure

```
cekwajar.id/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── salary-benchmark/   # Salary benchmark API
│   │   ├── property/            # Property price API
│   │   ├── bpjs/               # BPJS calculator
│   │   ├── pph21/              # PPh21 calculator
│   │   └── midtrans/           # Payment integration
│   └── page.tsx           # Landing page
├── components/            # React components
├── lib/                   # Core utilities
│   ├── calculators.ts     # PPh21, BPJS calculation logic
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts      # Browser client factory
│   │   └── server.ts      # Admin client
│   └── validators/        # Zod schemas
├── types/                 # TypeScript types
└── supabase_schema.sql    # Database schema
```

## Key Features

1. **Salary Benchmark** - Bandingkan gaji dengan data pasar berdasarkan judul pekerjaan dan kota
2. **Property Price Check** - Verifikasi harga properti terhadap harga pasar
3. **BPJS Calculator** - Hitung kontribusi BPJS kesehatan dan ketenagakerjaan
4. **PPh21 Calculator** - Hitung pajak penghasilan dengan metode TER (PMK 168/2023)

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sentry (optional)
SENTRY_DSN=

# Midtrans (optional)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Database

Tabel utama:
- `salary_benchmarks` - Data gaji pasar (job_title, city, gross_p50/p75/p90, sample_count)
- `land_prices` - Data harga properti (city, property_type, price_per_m2, sample_count)
- `salary_submissions` - Kontribusi data gaji dari pengguna
