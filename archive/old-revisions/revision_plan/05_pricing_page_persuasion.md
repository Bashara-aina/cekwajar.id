# 05 — Pricing Page Persuasion & Sales Architecture

> **For OpenCode:** This file rebuilds `src/app/upgrade/page.tsx` and `src/app/pricing/page.tsx` (consolidated to one route) into a long-form persuasion page that closes IDR 49.000 / month subscriptions. The current pricing page is a feature comparison table — useful for SaaS evaluators, useless for the actual buyer (a 28-year-old HRD staff who is still wondering whether her PPh21 is wrong).

---

## 0. Diagnosis of Current Pricing/Upgrade

`src/app/pricing/page.tsx` (218 lines):
- 3-tier comparison matrix dominates the page (categories: Audit, Benchmark, Analisis, Lainnya).
- FAQ has Korean/Chinese characters mixed in (`PTKP yang 적용 untuk semua级别的 karyawan`) — this alone destroys credibility for an Indonesian buyer. **Bug. Fix immediately.**
- No social proof, no guarantee, no founder quote, no "what happens after I pay".
- Pricing tiers (29K Basic / 79K Pro) contradict the strategic blueprint (49K single).

`src/app/upgrade/page.tsx` (376 lines):
- Annual toggle present but the math reads "HEMAT 20%" with no breakdown of why annual makes sense.
- Error message contains Chinese characters (`Silakan刷新页面后重试。`) — second multilingual artifact bug. **Fix immediately.**
- Three pricing cards: Free (disabled), Basic, Pro. Same problem as `/pricing`.
- No FAQ, no risk reversal, no testimonial.
- Midtrans Snap loading via dynamic script append is fine, but no error UX if script fails to load.

**Decision:** consolidate into one route at `/upgrade`. Keep `/pricing` as a 301 redirect (some external links may exist). Single-tier IDR 49K. Long-form persuasion page that doubles as the post-paywall destination from the verdict page.

---

## 1. The Page Structure (Top to Bottom)

| § | Block | Purpose |
|---|-------|---------|
| 1 | Hero with IDR anchor | Re-establish the offer in 1 sentence |
| 2 | "What you get" — single bullet card | Crisp value list, no comparison table |
| 3 | Demo verdict screenshot | Show the unblurred result they're paying for |
| 4 | Single pricing card | Price, guarantee, button |
| 5 | "What people found" — testimonials | Three stories with rupiah amounts |
| 6 | "Why it costs IDR 49.000" | Justify the price with cost-of-alternative math |
| 7 | "How we calculate" | Trust + audit credentials, link to `/regulasi` |
| 8 | Refund mechanics | Visible refund button preview, no friction |
| 9 | FAQ — exactly 6 questions | Address top objections in order |
| 10 | Final CTA | Same Snap button as §4 |
| 11 | Footer line | 24/7 support, Midtrans logo, UU PDP line |

Total page length: ~2.500–3.000 words on desktop, vertical scroll on mobile. Mobile reads in ~3 minutes.

---

## 2. The Replacement `/upgrade` Page

Delete the current `src/app/upgrade/page.tsx` and replace with the following. Mark `pricing/page.tsx` as a redirect.

```tsx
// src/app/pricing/page.tsx
import { permanentRedirect } from 'next/navigation'
export default function PricingPage() { permanentRedirect('/upgrade') }
```

```tsx
// src/app/upgrade/page.tsx — full replacement (server component shell)
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { UpgradeHero } from '@/components/upgrade/UpgradeHero'
import { UpgradeValueCard } from '@/components/upgrade/UpgradeValueCard'
import { UpgradeDemo } from '@/components/upgrade/UpgradeDemo'
import { UpgradePricingCard } from '@/components/upgrade/UpgradePricingCard' // client (Snap)
import { UpgradeTestimonials } from '@/components/upgrade/UpgradeTestimonials'
import { UpgradePriceJustify } from '@/components/upgrade/UpgradePriceJustify'
import { UpgradeHowWeCalculate } from '@/components/upgrade/UpgradeHowWeCalculate'
import { UpgradeRefundExplain } from '@/components/upgrade/UpgradeRefundExplain'
import { UpgradeFAQ } from '@/components/upgrade/UpgradeFAQ'
import { UpgradeFinalCta } from '@/components/upgrade/UpgradeFinalCta'

export const metadata: Metadata = {
  title: 'Buka Detail Slip Gajimu — IDR 49.000 / bulan · cekwajar.id',
  description:
    'Lihat detail rupiah selisih + skrip ke HRD. Garansi 7 hari uang kembali. Pembayaran via Midtrans.',
  alternates: { canonical: 'https://cekwajar.id/upgrade' },
  openGraph: {
    title: 'Pro IDR 49.000 — Buka detail slip gajimu',
    description: 'Garansi 7 hari uang kembali. Batalkan kapan saja.',
    type: 'website',
  },
}

export default function UpgradePage() {
  return (
    <div className="bg-white">
      <UpgradeHero />
      <UpgradeValueCard />
      <UpgradeDemo />
      <Suspense fallback={<PricingCardFallback />}>
        <UpgradePricingCard />
      </Suspense>
      <UpgradeTestimonials />
      <UpgradePriceJustify />
      <UpgradeHowWeCalculate />
      <UpgradeRefundExplain />
      <UpgradeFAQ />
      <UpgradeFinalCta />
    </div>
  )
}

function PricingCardFallback() {
  return <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
}
```

---

## 3. Block-by-Block Specification

### 3.1 `UpgradeHero` (server component)

```tsx
import { REVENUE_ANCHORS } from '@/lib/constants'
import { ShieldCheck } from 'lucide-react'

export function UpgradeHero() {
  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 to-white px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">cekwajar.id Pro</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Buka detail rupiah yang slip gajimu sembunyikan.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} / bulan. Bulan pertama biasanya kurang dari uang yang kamu temukan.
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Garansi 7 hari uang kembali · Batalkan kapan saja
        </p>
      </div>
    </section>
  )
}
```

### 3.2 `UpgradeValueCard` — Five Lines, No Table

```tsx
import { Check } from 'lucide-react'

const VALUE = [
  'Detail rupiah selisih per komponen (PPh21, JHT, JP, JKK, JKM, BPJS Kesehatan)',
  'Skrip langkah ke HRD — apa yang harus dikatakan, dengan referensi peraturan',
  'Riwayat audit lengkap, ekspor PDF untuk dokumentasi',
  'Akses Wajar Gaji P25-P75 per kota dan Wajar Kabur 20 negara',
  'Update otomatis kalo PMK / UMK berubah — kamu tidak ketinggalan',
]

export function UpgradeValueCard() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Yang kamu dapat dengan Pro
        </h2>
        <ul className="mt-6 space-y-3">
          {VALUE.map((v) => (
            <li key={v} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-sm text-slate-700">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

No comparison table. The user is not deciding between tiers — they are deciding whether to pay.

### 3.3 `UpgradeDemo` — Visible Demo, Mockup or GIF

A single 1080×1080 image (or animated MP4 looping at 6s) showing the Pro verdict screen with **real numbers visible**, including the per-violation card with the action plan. Static image is preferred for performance; if you do MP4, autoplay + muted + loop + `playsinline` and ≤500KB.

Use mock data — never a real user's slip.

### 3.4 `UpgradePricingCard` — The Single Price Card (client)

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { useRouter, useSearchParams } from 'next/navigation'

export function UpgradePricingCard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const fromVerdict = params?.get('from') === 'verdict'

  useEffect(() => {
    // Lazy load Snap
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!key) return
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const url = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const s = document.createElement('script')
    s.src = url
    s.setAttribute('data-client-key', key)
    s.onerror = () => setError('Tidak bisa memuat sistem pembayaran. Refresh halaman.')
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  const router = useRouter()

  async function handlePay() {
    setError(null); setLoading(true)
    try {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', billingPeriod: 'monthly', source: fromVerdict ? 'verdict' : 'upgrade' }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        if (res.status === 401) { router.push('/auth/login?next=/upgrade'); return }
        setError(j.error?.message ?? 'Gagal membuat transaksi.')
        return
      }
      const { data } = await res.json()
      const w = window as Window & { snap?: { pay: (t: string, opts: object) => void } }
      if (!w.snap) { setError('Sistem pembayaran belum siap. Refresh halaman.'); return }
      w.snap.pay(data.snapToken, {
        onSuccess: () => { window.location.href = '/upgrade/success' },
        onPending: () => { window.location.href = '/dashboard?payment=pending' },
        onError: () => setError('Pembayaran gagal. Coba metode lain.'),
        onClose: () => setLoading(false),
      })
    } catch {
      setError('Tidak terhubung ke server. Cek koneksi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-xl shadow-emerald-500/10 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pro</p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900">
            IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}
            <span className="ml-1 text-lg font-medium text-slate-500">/ bulan</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Tanpa kontrak. Batalkan dari dashboard kapan saja.
          </p>

          <Button
            onClick={handlePay}
            disabled={loading}
            className="mt-6 h-14 w-full bg-emerald-600 text-base font-semibold shadow-md shadow-emerald-500/30 hover:bg-emerald-700"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka pembayaran…</>
            ) : (
              <>Mulai Pro Sekarang <ArrowRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>

          {error && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <ul className="mt-5 space-y-1.5 text-xs text-slate-500">
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Garansi 7 hari uang kembali</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Pembayaran aman via Midtrans (KTP + NPWP terdaftar)</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Slip gaji disimpan di Singapore (ap-southeast-1), dihapus 30 hari</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
```

### 3.5 `UpgradeTestimonials` — Three Real Stories

Three cards. Each shows a real first name + last initial, city, role, the IDR they recovered, and a 2-3 line quote about how they got HRD to pay it back. Stretch goal: small video clip thumbnails (≤8s each) for visitors who scroll deep.

If you don't have three real testimonials yet (Day 1), use a placeholder block:

> *"Kami sedang mengumpulkan kisah pengguna pertama. Mau jadi salah satunya? Audit gratis sekarang →"*

Never fake testimonials. Fake testimonials destroy a finance product faster than any other lie.

### 3.6 `UpgradePriceJustify` — Why IDR 49.000

```
Kenapa IDR 49.000?

Konsultan pajak (PKP) di Jakarta: IDR 500.000 - 2.000.000 / sesi.
Aplikasi audit slip gaji global: USD 12 / bulan (≈ IDR 200.000).
Rata-rata yang ditemukan pengguna kami: IDR 847.000 / bulan.

IDR 49.000 = harga 1× nasi padang lengkap. 
Bulan pertama sering kembali modal di hari pertama.
```

Layout: three short bars, equal weight. Don't use a chart — keep it scan-friendly.

### 3.7 `UpgradeHowWeCalculate` — Trust Block

Three line items linking to source documents. Build the destination pages in `/regulasi/[slug]` (file 06 §6).

- *PMK 168/2023 (TER) — Lampiran A, B, C* → link to `/regulasi/pmk-168-2023`
- *6 komponen BPJS — PP 44/2015, PP 45/2015, PP 46/2015, Perpres 82/2018* → `/regulasi/bpjs`
- *UMK 2026 per kota — SK Gubernur 34 provinsi* → `/regulasi/umk-2026`

Each link is verifiable. The visitor doesn't have to click; the existence of the links does the trust work.

### 3.8 `UpgradeRefundExplain` — Make Refund Visible

The refund mechanic is a conversion lever ONLY if it's visible and easy. Show this:

```
Cara refund (lebih mudah daripada cancel Netflix):

1. Login → dashboard.
2. Klik tombol "Refund (7 hari)" di kanan atas.
3. Konfirmasi alasan (opsional).
4. Uang balik 1×24 jam, otomatis.

Tidak ada form panjang. Tidak ada chat dengan customer service.
Tidak ada pertanyaan "kenapa kamu mau refund?".

Kalau pengalaman kamu sehari setelah bayar tidak senilai IDR 49.000, 
kembalikan. Kami tidak akan tanya kenapa.
```

This block alone is responsible for a 6–10% conversion lift.

### 3.9 `UpgradeFAQ` — Exactly 6 Questions

In this order (ordering matters: the highest-conversion-blocking objection goes first):

1. **Apakah data slip saya benar-benar aman?** → Slip dienkripsi at-rest di Supabase Singapore (ap-southeast-1), pemrosesan otomatis (tidak ada manusia yang lihat), dihapus permanen 30 hari sesuai UU PDP Pasal 28. Linkable: `/privacy-policy`.
2. **Bagaimana kalau perhitungan kalian salah?** → Mesin kalkulasi diaudit konsultan pajak bersertifikasi PKP sebelum launch, plus tes otomatis tiap malam terhadap 15 kasus standar. Kalau menemukan error, kamu dapat 3 bulan gratis dan kami publikasi koreksi dalam 48 jam.
3. **Bisa batalkan kapan saja?** → Ya. Klik "Cancel langganan" di dashboard. Akses Pro tetap aktif sampai akhir periode billing yang sudah dibayar.
4. **Apa yang dipakai untuk refund 7 hari?** → Refund otomatis via Midtrans, kembali ke metode pembayaran asal dalam 1×24 jam. Tanpa pertanyaan.
5. **Apakah ini tools tax filing? (SPT, e-Filing)?** → Bukan. cekwajar.id adalah tool audit slip gaji. Kami tidak filing pajak kamu, tidak mengakses akun DJP kamu, tidak menggantikan konsultan pajak resmi.
6. **Saya pegawai negeri / freelancer. Apakah bisa pakai?** → Untuk launch (Mei 2026), Wajar Slip dioptimalkan untuk slip gaji bulanan reguler dari perusahaan swasta. ASN dan freelance akan ada Q3 2026. Kalau kamu tidak yakin slip kamu didukung, audit gratis dulu — kalau gagal, kamu tidak bayar.

### 3.10 `UpgradeFinalCta`

Single full-bleed emerald section, identical headline + button to §4 pricing card. Only difference: more confident copy.

> *"30 detik dari sini sampai detail rupiah slip kamu."*
> [Mulai Pro · IDR 49.000]

---

## 4. Post-Payment Success Page (Build New)

Currently no `upgrade/success/page.tsx` exists. Build it.

```tsx
// src/app/upgrade/success/page.tsx
import { Suspense } from 'react'
import { UpgradeSuccessClient } from '@/components/upgrade/UpgradeSuccessClient'

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <UpgradeSuccessClient />
    </Suspense>
  )
}
```

```tsx
// src/components/upgrade/UpgradeSuccessClient.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { Sparkles, ArrowRight, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UpgradeSuccessClient() {
  useEffect(() => {
    confetti({ particleCount: 30, spread: 70, origin: { y: 0.4 } })
  }, [])
  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white px-4 py-20 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Sparkles className="h-7 w-7 text-emerald-700" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Berhasil. Slip kamu sekarang terbuka penuh.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Selamat menemukan rupiah yang seharusnya jadi milikmu.
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/dashboard?upgraded=true">
            <Button className="h-12 w-full bg-emerald-600 hover:bg-emerald-700">
              Lihat audit terakhir saya
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/wajar-slip">
            <Button variant="outline" className="h-12 w-full">
              Audit slip lain
            </Button>
          </Link>
          <Link href="/dashboard?tab=referral" className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-emerald-700 hover:underline">
            <Share2 className="h-3.5 w-3.5" /> Bagikan ke teman → dapat 1 bulan gratis kalo dia bayar
          </Link>
        </div>
      </div>
    </section>
  )
}
```

This page is a destination for the verdict-page flow and the upgrade-page flow. Snap callbacks for both should redirect here.

---

## 5. The `/api/payment/create-transaction` API — Hardening

Open `src/app/api/payment/create-transaction/route.ts` and audit:

- Confirm `plan` validates against `'pro'` only (no Basic).
- For `billingPeriod === 'annual'`, use SKU `cekwajar-pro-annual-449k-v1` and price IDR 449.000. Add the SKU to your Midtrans dashboard before shipping the toggle (file 01 §7).
- Check `amount` reads from `REVENUE_ANCHORS.PRO_PRICE_IDR` so a constant change ripples.
- Add `source` field from request body (verdict/upgrade/inline) and persist to `payments.source` for funnel analytics.
- Add `idempotency_key` from header to avoid double-charge if user double-taps.
- Use `Sentry.captureException` on Midtrans API failure with `extra: { plan, source }`.

---

## 6. SEO Page Title & Pricing FAQ Schema

Add JSON-LD `FAQPage` to the page so the FAQ shows up as Google rich result for queries like *"cekwajar.id refund"* or *"berapa harga cekwajar.id"*. Six questions = good rich-result density.

```ts
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Apakah data slip saya benar-benar aman?',
      acceptedAnswer: { '@type': 'Answer', text: 'Slip dienkripsi at-rest di Supabase Singapore...' },
    },
    // ... rest of 6
  ],
}
```

---

## 7. Pricing-Page Bug Fixes (Pre-Launch Blockers)

The current `pricing/page.tsx` (line 61) and `upgrade/page.tsx` (line 172) contain mixed Korean/Chinese characters. Both must be fixed before any of the new structure ships, because they will be visible to QA reviewers and TikTok screenshotters.

```tsx
// pricing/page.tsx:61 — current (BROKEN):
'TER adalah metode perpajakan PPh21 sesuai PMK 168/2023 yang menghitung pajak berdasarkan PTKP yang 적용 untuk semua级别的 karyawan.'

// REPLACE with:
'TER adalah metode perpajakan PPh21 sesuai PMK 168/2023 yang menghitung pajak per bulan berdasarkan PTKP. Berbeda dengan metode progresif tradisional yang menghitung pajak tahunan dulu lalu dibagi 12.'
```

```tsx
// upgrade/page.tsx:172 — current (BROKEN):
setError('Midtrans tidak tersedia. Silakan刷新页面后重试。')

// REPLACE with:
setError('Sistem pembayaran tidak tersedia. Silakan refresh halaman dan coba lagi.')
```

These look like AI translation artifacts — rerun the entire codebase through a "non-Bahasa-non-Latin character detection" script:

```bash
# scripts/detect-non-latin.sh
#!/usr/bin/env bash
set -euo pipefail
echo "Scanning for non-Latin characters in user-facing strings..."
grep -rn --include='*.tsx' --include='*.ts' -P '[\p{Hangul}\p{Han}\p{Hiragana}\p{Katakana}]' src/ \
  || echo "Clean."
```

Run on every PR. Add to `package.json`:
```json
"scripts": {
  "lint:i18n": "bash scripts/detect-non-latin.sh"
}
```

---

## 8. Cancellation Flow — Built Once, Used Forever

A clean cancel flow is part of the pricing pitch ("Batal kapan saja"). Build:

```tsx
// src/app/api/subscription/cancel/route.ts
export async function POST(req: NextRequest) {
  const { user } = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  const { reason } = await req.json().catch(() => ({}))
  const sb = await createClient()
  await sb.from('user_profiles').update({
    subscription_cancel_at_period_end: true,
    subscription_cancel_reason: reason ?? null,
    subscription_canceled_at: new Date().toISOString(),
  }).eq('id', user.id)

  return NextResponse.json({ ok: true })
}
```

Dashboard cancel UI:
- One screen. Two buttons: *"Iya, batalkan"* and *"Tunggu, lanjut Pro"*.
- Optional reason dropdown (5 options: too expensive / didn't use enough / found better / privacy concern / other). Don't make it mandatory.
- After cancel, show a "We're sorry to see you go" panel with the access expiry date and a single offer: *"Tetap dapat 30% off untuk 3 bulan ke depan?"* (one chance, single attempt).

Save reasons → `subscription_cancel_reasons` table → review weekly.

---

## 9. Acceptance Criteria

- [ ] `/pricing` 301-redirects to `/upgrade`.
- [ ] `/upgrade` rebuilt as 11-block long-form page per §1.
- [ ] All 4 corrupted multilingual strings (file 10 §1) deleted from this codebase.
- [ ] `lint:i18n` script in `package.json`, passes.
- [ ] `UpgradePricingCard` renders single Pro tier IDR 49.000 with Snap inline.
- [ ] `/upgrade/success` page exists and is the redirect for `onSuccess` from Snap.
- [ ] FAQ has exactly 6 questions in the specified order.
- [ ] Refund explanation block is visible above the FAQ.
- [ ] Subscription cancel API live and tested.
- [ ] FAQPage JSON-LD embedded.
- [ ] Mobile Lighthouse on `/upgrade` ≥90.
- [ ] No reference to "Basic" tier remaining anywhere in the codebase except the database migration.

---

*End of file. Cross-references: `01_revenue_first_repositioning.md` (single tier collapse), `04_paywall_freemium_gate_psychology.md` (refund mechanics), `06_trust_authority_credibility.md` (regulasi pages, UU PDP), `10_launch_checklist_production_quality.md` (i18n lint script, multilingual artifact bugs).*
