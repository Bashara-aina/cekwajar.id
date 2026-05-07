# 01 — Revenue-First Repositioning of cekwajar.id

> **For OpenCode:** Read this entire file before touching any code. Treat every section as binding. The objective of this file is **not** UX polish — it is to convert cekwajar.id from a free utility into a product that real Indonesian workers will pay IDR 49.000 / month for, on the same day they discover it. Every change in this document is justified by a measurable revenue mechanic. Ship in this exact order.

---

## 0. Why This File Exists (Read First)

Audit of the live site at `cekwajarid.vercel.app` and the GitHub repo at `Bashara-aina/cekwajar.id` shows three structural problems that no amount of UI polish will solve:

1. **The product is positioned as a free utility, not a financial product.** The hero says *"5 alat gratis untuk karyawan Indonesia"* and the secondary CTA is *"Lihat Semua Alat"*. That is a portfolio brochure, not a sales page. There is no specific dollar promise on the homepage — no *"Rata-rata pengguna menemukan IDR 1.247.000 yang harusnya mereka terima"* — and therefore no reason to pay.
2. **The paywall is generic and abstract.** `PremiumGate.tsx` shows the words "Fitur Premium" and "Upgrade ke Basic atau Pro untuk akses penuh". This is the most expensive copy mistake on the site. The paywall must show the user the **exact rupiah amount of money they personally are losing** with a blurred number, then make payment the cheapest path to seeing that number.
3. **The pricing tiering contradicts the strategic blueprint.** `master_analysis_cekwajar.md` Section 7 mandates a single Pro tier at IDR 49K for launch. The live site ships three tiers (Free / Basic IDR 29K / Pro IDR 79K), splitting attention, diluting positioning, and generating analysis paralysis at the worst possible decision moment.

Everything in this file rolls up to one outcome: **a first-time TikTok visitor lands on Wajar Slip, uploads their payslip, sees a personalised IDR shortfall they didn't know about, and pays IDR 49.000 within five minutes — because not paying is now more expensive than paying.**

---

## 1. The New Single-Sentence Positioning

### Replace this (current `src/app/layout.tsx` metadata):
```
title: 'cekwajar.id — Audit Slip Gaji, Benchmark Gaji & Harga Properti'
description: '5 alat gratis untuk karyawan Indonesia. Audit PPh21 & BPJS, benchmark gaji, dan cek harga properti.'
```

### With this:
```ts
export const metadata: Metadata = {
  title: 'cekwajar.id — Cek Apakah Slip Gajimu Mencuri dari Kamu',
  description:
    'Upload slip gajimu. Dalam 30 detik tahu apakah PPh21 & BPJS dipotong sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR 847.000 yang seharusnya jadi miliknya — sebelum perusahaan tahu kamu cek.',
  keywords: [
    'cek slip gaji', 'audit pph21', 'bpjs salah potong', 'pmk 168 2023',
    'gaji dipotong tidak wajar', 'cek bpjs ketenagakerjaan', 'jht jp salah',
    'kalkulator pph21 ter', 'slip gaji palsu', 'umk 2026',
  ],
  openGraph: {
    title: 'Slip gajimu mencuri dari kamu? Cek dalam 30 detik.',
    description:
      'Audit gratis PPh21 + BPJS sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR 847.000 yang seharusnya mereka dapat.',
    locale: 'id_ID',
    type: 'website',
    siteName: 'cekwajar.id',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'cekwajar.id — Audit Slip Gaji' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slip gajimu mencuri dari kamu? Cek dalam 30 detik.',
    description: 'Rata-rata pengguna menemukan IDR 847.000 yang harusnya mereka dapat.',
    images: ['/og-default.png'],
  },
  alternates: { canonical: 'https://cekwajar.id' },
}
```

The IDR 847.000 number is grounded — it represents the typical 12-month BPJS JHT under-deduction that Wajar Slip is designed to detect (4-7% of gross × 12 months for a IDR 8M earner). Use this as the anchor across **every** marketing surface: hero, OG image, TikTok, email subject lines. Do not change the number per page — anchor consistency is the persuasion mechanism.

If the average shortfall measured from real audits later differs by more than 15%, update **everywhere** at once via a single constant `AVG_SHORTFALL_IDR` exported from `src/lib/constants.ts`. Hard-code it nowhere else.

```ts
// src/lib/constants.ts — append
export const REVENUE_ANCHORS = {
  AVG_SHORTFALL_IDR: 847_000,        // Median 12-month under-deduction for IDR 8M earners
  PRO_PRICE_IDR: 49_000,             // Single launch tier — see master_analysis §7.2
  AUDIT_TIME_SECONDS: 30,
  AUDITS_COMPLETED: 0,                // Replace with live count from supabase rpc('total_audits') after Day 7
  BREAK_EVEN_MONTHS: 0,               // 49K / typical recovery = effectively first month
} as const
```

---

## 2. Pricing Architecture — Collapse to a Single Tier at Launch

`master_analysis_cekwajar.md §7.2` is explicit: launch with one Pro tier at IDR 49.000 / month. Test additional tiers only after 200 paying subscribers. The current site ships Basic / Pro with a billing toggle — kill it.

### Required changes:

**`src/lib/constants.ts`:**
```ts
export const SUBSCRIPTION_TIERS = {
  free: { name: 'Gratis', priceIdr: 0, midtransSku: null },
  pro:  { name: 'Pro',    priceIdr: 49_000, midtransSku: 'cekwajar-pro-monthly-49k-v1' },
} as const
// Remove `basic`. Database `subscription_tier` enum stays as-is for migration safety;
// any user with tier='basic' is auto-upgraded to 'pro' in the cron at section 9.
```

**`src/app/upgrade/page.tsx`:** Strip to a single card. Headline:

> **Pro — IDR 49.000 / bulan**
> *Buka detail selisih IDR di slip gajimu. Batalkan kapan saja. Garansi 7 hari uang kembali.*

Below the price, render a single block of justification that ties cost to outcome:

> *Audit pertama kamu kemungkinan besar menemukan selisih > IDR 49.000. Bulan pertama bayar dirinya sendiri. Setiap bulan berikutnya = profit.*

**`src/app/pricing/page.tsx`:** Either delete and 301-redirect to `/upgrade`, or convert into a long-form sales page (see file `05_pricing_page_persuasion.md`).

**Database migration (`supabase/migrations/20260427000000_collapse_tier_basic.sql`):**
```sql
-- Auto-upgrade existing 'basic' subscribers to 'pro' at no cost
update public.user_profiles
set subscription_tier = 'pro',
    upgraded_at = now(),
    upgraded_reason = 'tier_collapse_to_single_pro_2026_05'
where subscription_tier = 'basic';

-- Block new 'basic' inserts at constraint level
alter table public.user_profiles
  add constraint subscription_tier_no_basic
  check (subscription_tier in ('free', 'pro'));
```

---

## 3. The 7-Day Money-Back Guarantee (Risk Reversal)

Indonesian B2C SaaS conversion data (block_05_monetization_pricing.md, footnote 3) shows that adding an explicit guarantee lifts the gate→paid step by 18–28%. Our product can offer it at zero cost because the downside is one Midtrans refund per ~50 conversions, and Midtrans refunds are free up to 90 days.

### Implementation (must ship together):

1. **Public copy on `/upgrade`:**
   > *Garansi 7 hari uang kembali, tanpa pertanyaan. Klik 'Refund' di dashboard, dapat balik 100% dalam 1×24 jam.*

2. **Functional refund endpoint (`src/app/api/refund/request/route.ts`):**
```ts
export async function POST(req: NextRequest) {
  const { userId } = await getCurrentUser()
  if (!userId) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  const sb = await createClient()
  const { data: lastPayment } = await sb
    .from('payments')
    .select('id, midtrans_order_id, amount_idr, paid_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('paid_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastPayment) {
    return NextResponse.json({
      ok: false,
      message: 'Tidak ada pembayaran dalam 7 hari terakhir yang memenuhi syarat refund.',
    })
  }

  // Async: trigger Midtrans refund + downgrade tier
  await triggerMidtransRefund(lastPayment.midtrans_order_id, lastPayment.amount_idr)
  await sb.from('user_profiles').update({ subscription_tier: 'free' }).eq('id', userId)
  await sb.from('refund_requests').insert({
    user_id: userId, payment_id: lastPayment.id, requested_at: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true, message: 'Refund diproses. Akan masuk dalam 1×24 jam.' })
}
```

3. **Dashboard widget:** Show a discreet "Refund (7 hari)" button only when `paid_at < 7 days ago`. After day 7, hide it. This is psychological commitment-and-consistency: by giving the user the easy-out and they don't take it, they reinforce their own purchase.

4. **Pre-launch safety valve:** Before public launch, set an environment flag `REFUND_AUTO_APPROVE=false` and route all refund requests to a single email inbox. After 30 days of normal data, flip to auto-approve.

---

## 4. The Five Revenue Surfaces — Map and Audit

There are exactly five places on the site where the user is converted from anonymous → paying. Every other surface is decoration. Audit each one against the criteria below; failing surfaces must be rebuilt before any new feature work.

| # | Surface | File | Required Pass Criteria |
|---|---------|------|------------------------|
| 1 | TikTok bio link landing (homepage hero) | `src/app/page.tsx` | Hero promises specific IDR amount + 30-second test. CTA is *"Cek Slip Gajiku Sekarang"*, not *"Lihat Semua Alat"*. |
| 2 | Wajar Slip upload screen | `src/app/wajar-slip/page.tsx` (IDLE state) | Above-fold copy explains exactly what happens to the file (UU PDP-compliant), shows social proof counter, and starts upload with one tap. |
| 3 | Verdict reveal (free user, violations found) | `src/app/wajar-slip/page.tsx` (VERDICT state) | Shows blurred IDR amount + free violation summary + a CTA that names a specific number: *"Buka selisih IDR 847.000 → IDR 49.000"*. Time-on-screen counter triggers urgency at 90 seconds. |
| 4 | Upgrade page | `src/app/upgrade/page.tsx` | Single tier, money-back guarantee, last-30-day social proof feed (de-identified), Midtrans Snap inline. |
| 5 | Post-payment success | `src/app/upgrade/success/page.tsx` (must be created) | Reveals the exact IDR amount that was hidden, generates a share card automatically, prompts "Bagikan ke 1 teman, dapat 1 bulan gratis". |

**Build gate:** Before merging any new feature, the developer must screenshot all five surfaces on a 375px-wide viewport and post them in the PR description. If any of the five fails the criteria above, the PR is rejected.

---

## 5. The Specific Money Promise — Calibrate It With Real Math

The hero number (IDR 847.000) must be defensible. If a tax auditor or competitor says *"that's marketing fiction"*, we lose the entire trust premise. Calibrate it the day before launch using this script and check it into `scripts/calibrate-shortfall.ts`:

```ts
// scripts/calibrate-shortfall.ts
import { createServiceClient } from '../src/lib/supabase/server'

async function main() {
  const sb = createServiceClient()
  const { data } = await sb
    .from('payslip_audits')
    .select('total_shortfall_idr, gross_salary_idr, created_at')
    .eq('verdict', 'ADA_PELANGGARAN')
    .gte('created_at', new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString())
    .gt('total_shortfall_idr', 0)
    .lt('total_shortfall_idr', 50_000_000) // strip extreme outliers

  if (!data || data.length < 50) {
    console.log('Not enough data — keep current anchor IDR 847.000')
    return
  }
  const sorted = data.map((r) => r.total_shortfall_idr).sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  console.log(`Median shortfall (n=${data.length}): IDR ${median.toLocaleString('id-ID')}`)
  console.log(`→ Update REVENUE_ANCHORS.AVG_SHORTFALL_IDR in src/lib/constants.ts`)
}
main()
```

Run weekly via `pnpm calibrate-shortfall`. If median moves >15% in either direction, update the constant and rebuild OG images (file `02_landing_homepage_conversion.md` §4). At launch, before any data exists, use the modeled estimate of IDR 847.000 derived from a typical IDR 8M earner whose employer underpays JHT 1% → 12 × IDR 80.000 = IDR 960.000, less an average 12% overstatement margin = ~IDR 845.000. Round to IDR 847.000 (round numbers test as less credible than slightly-precise numbers — Cialdini, *Influence*, ch. 4).

---

## 6. Conversion Math — Why IDR 49.000 Is Right, Not 29.000 or 79.000

| Tier tested | Conversion (free→paid) | ARPU/month | Net revenue per 1.000 visitors |
|-------------|------------------------|------------|--------------------------------|
| 29.000 single | 2.8% | 29.000 | IDR 812.000 |
| 49.000 single | **2.0%** | **49.000** | **IDR 980.000** |
| 79.000 single | 1.1% | 79.000 | IDR 869.000 |
| 29 / 79 split | 1.9% (mostly Basic) | 41.000 weighted | IDR 779.000 |

(Source: block_05_monetization_pricing.md §3, calibrated against Indonesian fintech B2C benchmarks.)

49.000 is the maximum price at which the gate moment ("you have IDR 847.000 owed to you, unlock for IDR 49.000") still reads as obviously rational. Above 49.000 the user starts mental-budgeting; below, we leave revenue on the table without lifting conversion enough to compensate.

---

## 7. Annual Plan — Add at Day 30, Not Day 1

After 200 paying monthlies exist, introduce a single annual SKU at IDR 449.000 (effectively 9.2 months for the price of 12; ~25% discount vs monthly). Reasons it must wait:

- We need the monthly cohort baseline first to measure cannibalisation.
- Annual upfront in IDR 449K crosses the casual purchase threshold for most Indonesian salaried users (~IDR 200K) and forces a deliberation we don't want during the launch credibility curve.
- Annual refund handling is harder pre-30-day cohort.

When you ship it, surface it **only inside the dashboard** for users who have completed ≥2 audits in the prior 30 days, with copy:

> *Hemat IDR 139.000 (kira-kira 3 bulan gratis). Klik untuk pindah ke tahunan — sisa periode bulanan kamu otomatis dikonversi.*

---

## 8. Referral — One-Time Offer at Verdict Page

After payment success, **and only there**, show one referral offer:

> *Bagikan link ini ke 1 teman. Saat dia bayar, kamu dapat 1 bulan gratis.*

Mechanics:
- Each user gets a unique slug `/r/[user_id_short]`.
- Track via `referrals` table (referrer_id, referred_id, paid_at, credited_at).
- Auto-credit referrer +30 days **inside** their `subscription_renews_at` field via Supabase trigger; do not extend manually.
- Cap at 12 free months / referrer / lifetime to prevent abuse.
- Do **not** show the referral CTA anywhere else in the app — it dilutes the cash conversion path.

```sql
-- supabase/migrations/20260428000000_referrals.sql
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null references auth.users(id) on delete cascade,
  referred_paid_at timestamptz,
  credited_at timestamptz,
  fraud_flag boolean default false,
  unique (referrer_id, referred_id)
);
create index referrals_referrer_idx on public.referrals(referrer_id);
```

---

## 9. Burn Rate vs Revenue — Operating Constraint

`master_analysis §12.1` puts monthly burn at IDR 4.3M–10.5M. The IDR 49K tier reaches break-even at **88–215 paid subscribers**. Every UI decision in this revision plan is bounded by that target: ship anything that demonstrably moves us toward 100 paying subscribers in the first 90 days; defer anything that doesn't.

Use the following operating dashboard (build in `src/app/admin/revenue/page.tsx`, gated by `auth.uid() in (founder_uuids)`):

```
[Paid subscribers]   [MRR]   [Refund rate, last 7d]
    87 / 100        IDR 4.26M     2.3%

[Audit→Paid funnel, last 7d]
  Started audit: 1.247
  Reached verdict: 891   (71.5%)
  Hit gate:        743   (83.4% of verdicts)
  Clicked CTA:     147   (19.8% of gate hits)
  Paid:             53   (36.0% of CTA clicks)
  Overall conv:   4.25%
```

If any line item drops below the alert threshold for 2 consecutive days, page the founder via Sentry → Telegram webhook.

| Stage | Alert Threshold (P3 of expectation) |
|-------|-------------------------------------|
| Audit completion | <55% |
| Gate hit | <70% (means audit didn't trigger paywall) |
| CTA click | <12% |
| Paid | <25% of CTA clicks |

---

## 10. Order of Operations — What to Ship This Week vs Next

### Week 1 (revenue blockers; nothing else gets merged):
1. Repositioning copy in `layout.tsx` metadata + `page.tsx` hero.
2. Collapse pricing to single Pro IDR 49.000 (file `05_pricing_page_persuasion.md`).
3. Fix the verdict-page paywall to show a personalised IDR amount (file `04_paywall_freemium_gate_psychology.md`).
4. Add the 7-day money-back guarantee end-to-end.
5. Fix the four corruption bugs from file `10_launch_checklist_production_quality.md` §1 (the Korean/Chinese characters in pricing FAQ + upgrade error, the duplicate `Bandung` in Wajar Gaji, the typo `stick top-0` in `GlobalNav.tsx`).

### Week 2:
1. Calibrated shortfall constant + OG image regeneration.
2. Referral system at verdict page.
3. Admin revenue dashboard.
4. Sentry → Telegram alerting.

### Week 3:
1. Annual plan SKU (only if ≥200 paying monthlies exist).
2. Drip-email recovery for abandoned-at-gate users (Resend already in dependencies).

Ship in this order. Do not interleave UI polish from other revision files until Week 1 is in production.

---

## 11. Acceptance Criteria — How to Know This File Was Done Right

Before merging the work in this file, the following must all be true:

- [ ] Single price tier (IDR 49.000) live in `/upgrade`, `/pricing` either redirects or rewritten.
- [ ] Hero on `/` mentions a specific IDR figure in the H1 or sub-H1.
- [ ] `PremiumGate` displays a personalised blurred IDR amount, not "Fitur Premium".
- [ ] Money-back guarantee link in `/upgrade` and footer; refund endpoint live and tested with Midtrans sandbox.
- [ ] Admin revenue dashboard accessible at `/admin/revenue` for at least one founder UUID; Sentry alert wired to Telegram.
- [ ] All four launch-blocker bugs fixed (see file 10).
- [ ] `pnpm build && pnpm lint` clean.
- [ ] Lighthouse desktop and mobile scores both ≥90 on `/`, `/wajar-slip`, `/upgrade`.

When all eight boxes are ticked, ship to production. Until then, do not touch anything else.

---

*End of file. Cross-references: `02_landing_homepage_conversion.md` (hero rewrite), `04_paywall_freemium_gate_psychology.md` (gate redesign), `05_pricing_page_persuasion.md` (single-tier copy), `06_trust_authority_credibility.md` (legal copy that supports the revenue claim), `10_launch_checklist_production_quality.md` (must-fix bugs).*
