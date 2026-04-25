# cekwajar.id

> Indonesian payroll compliance checker — detect V01–V07 violations in payslips instantly.

## What is this?

cekwajar.id helps Indonesian workers verify their payslip compliance. It checks for:
- **V01** — BPJS JHT not paid at all
- **V02** — BPJS components underpaid
- **V03** — PPh21 not withheld despite liability
- **V04** — PPh21 underpaid by more than Rp50,000
- **V05** — BPJS Kesehatan missing
- **V06** — Salary below UMK (illegal)
- **V07** — BPJS JP missing

Also includes salary benchmarking, property price analysis, and cost-of-living comparisons.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Cache/Rate Limit | Upstash Redis |
| Email | Resend |
| Payments | Midtrans |
| Error Tracking | Sentry |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Ruff (Python) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn / bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cekwajar.id.git
cd cekwajar.id

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your actual values
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables. Key ones:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxx

# Midtrans (Payment Gateway)
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_SERVER_KEY=your-server-key

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=cekwajar-id
```

### Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests

```bash
npm test
# Run tests in watch mode
npm test -- --watch
```

### Build for Production

```bash
npm run build
# Preview production build
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
cekwajar.id/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (BPJS, PPh21, salary-benchmark, etc.)
│   └── page.tsx           # Landing page
├── lib/                   # Shared business logic
│   ├── violations.ts      # V01-V07 violation detection
│   ├── supabase/          # Supabase client utilities
│   └── __tests__/         # lib unit tests
├── public/                # Static assets
├── .env.example           # Environment variable template
└── README.md
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bpjs` | POST | Calculate BPJS contributions |
| `/api/pph21` | POST | Calculate PPh21 tax withholding |
| `/api/salary-benchmark` | POST | Lookup salary benchmarks from Supabase |
| `/api/property` | POST | Property price analysis |
| `/api/worldbank` | GET | Cost-of-living comparison |
| `/api/midtrans/snap-token` | POST | Generate Midtrans payment token |
| `/api/midtrans/webhook` | POST | Midtrans payment webhook |
| `/api/health` | GET | Health check |

## Violation Codes

| Code | Severity | Description |
|------|----------|-------------|
| V01 | CRITICAL | BPJS JHT not paid at all |
| V02 | HIGH | BPJS component underpaid |
| V03 | CRITICAL | PPh21 not withheld despite liability |
| V04 | HIGH | PPh21 underpaid > Rp50,000 |
| V05 | CRITICAL | BPJS Kesehatan missing |
| V06 | CRITICAL | Salary below UMK (illegal) |
| V07 | CRITICAL | BPJS JP not paid |

## Deploy

Deploy to Vercel (recommended):

```bash
npm run build
vercel deploy
```

Or use Docker:

```bash
docker build -t cekwajar.id .
docker run -p 3000:3000 --env-file .env.local cekwajar.id
```

## License

MIT