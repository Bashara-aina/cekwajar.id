# 08 — Dashboard, Retention & Recurring Revenue

> **For OpenCode:** A subscription product lives or dies on Month 2. The first month is sales; every month after is retention. This file rebuilds the user dashboard, the audit-history experience, the cancel/refund interaction, and the engagement loops that pull a paying user back next month. Every block here is justified by the same rule: **does this make a paying user more likely to renew?**

---

## 0. Diagnosis: The Current Dashboard

Read `src/app/dashboard/page.tsx` (366 lines). Issues:

- **Ornamental over functional.** Bento grid with 5 tool cards repeated from homepage. The user already knows what tools exist; they need their data.
- **All zero-state.** "Audit Hari Ini 0/3", "Total Audit 0", "Gaji Ditemukan 0", "Minggu Ini 0" — these are **always zero** because the dashboard never reads from Supabase. They're hardcoded placeholders.
- **No way to see prior audits.** The "Riwayat Audit" card is empty-state-only. Nothing renders even if `payslip_audits` rows exist.
- **No subscription status detail.** "Paket Pro" is shown with badge, but no renewal date, no payment method, no cancel link.
- **No cumulative value framing.** A user paid IDR 49.000 — they should see "kamu telah menemukan IDR 1.247.000 sejak Mei". That single number is what pays for retention.

This file replaces the dashboard with a single, scannable page that shows:
1. Cumulative IDR found (the headline retention metric).
2. Recent audits (clickable, opens verdict).
3. Subscription state (renewal date, billing method, cancel button, refund window).
4. One next-action prompt (audit again / share / submit salary for benchmark).
5. Tool grid (de-emphasized, below fold).

---

## 1. The New Dashboard Structure

```
┌────────────────────────────────────────────────────┐
│  Halo, Andi.    [⚙ Settings]  [🚪 Logout]          │
├────────────────────────────────────────────────────┤
│                                                    │
│  Kamu sudah menemukan                              │
│  IDR 1.247.000                                     │
│  selisih di slip gaji selama jadi anggota Pro.     │
│  (3 audit · 7 pelanggaran ditandai)                │
│                                                    │
│  [Audit slip terbaru] [Bagikan ke teman]           │
│                                                    │
├────────────────────────────────────────────────────┤
│  Riwayat audit                                     │
│  ──────────                                        │
│  20 Apr · Slip Februari 2026                       │
│   IDR 847.000 selisih · 3 pelanggaran   [Lihat →] │
│  15 Mar · Slip Januari 2026                        │
│   IDR 332.000 selisih · 2 pelanggaran   [Lihat →] │
│  20 Feb · Slip Desember 2025                       │
│   Tidak ada selisih signifikan          [Lihat →] │
│                                                    │
├────────────────────────────────────────────────────┤
│  Langganan                                         │
│  ──────────                                        │
│  Pro · IDR 49.000/bulan                            │
│  Otomatis perpanjang 21 Mei 2026                   │
│  Metode: GoPay (•••2847)                           │
│  [Ganti metode] [Batalkan] [Refund (4 hari sisa)] │
│                                                    │
├────────────────────────────────────────────────────┤
│  Yang lain                                         │
│  ──────────                                        │
│  [Wajar Gaji] [Wajar Tanah] [Wajar Kabur] [Wajar Hidup]
│                                                    │
└────────────────────────────────────────────────────┘
```

Every section is a vertical block on mobile, no bento grid weirdness.

---

## 2. The Cumulative-Value Headline (Top Block)

This is the single most-important retention number. Compute on render:

```ts
// src/app/dashboard/page.tsx — server component
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { DashboardCumulative } from '@/components/dashboard/DashboardCumulative'
import { DashboardHistory } from '@/components/dashboard/DashboardHistory'
import { DashboardSubscription } from '@/components/dashboard/DashboardSubscription'
import { DashboardOtherTools } from '@/components/dashboard/DashboardOtherTools'

export default async function DashboardPage() {
  const { user, tier, profile } = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  const sb = await createClient()
  const sinceDate = profile?.subscription_paid_first_at ?? user.created_at

  const [{ data: audits }, { data: agg }] = await Promise.all([
    sb.from('payslip_audits')
      .select('id, created_at, verdict, violation_count, shortfall_idr, period_month, period_year, city')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    sb.rpc('user_cumulative_shortfall', { _user_id: user.id, _since: sinceDate }),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <DashboardCumulative
        firstName={profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Anggota'}
        cumulativeIdr={agg?.total_shortfall ?? 0}
        auditCount={agg?.audit_count ?? 0}
        violationCount={agg?.violation_count ?? 0}
        sinceDate={sinceDate}
      />
      <DashboardHistory audits={audits ?? []} tier={tier} />
      <DashboardSubscription user={user} profile={profile} />
      <DashboardOtherTools tier={tier} />
    </div>
  )
}
```

Supabase RPC:
```sql
create or replace function public.user_cumulative_shortfall(_user_id uuid, _since timestamptz)
returns table(total_shortfall bigint, audit_count int, violation_count int)
language sql security definer as $$
  select
    coalesce(sum(shortfall_idr), 0)::bigint,
    count(*)::int,
    coalesce(sum(violation_count), 0)::int
  from public.payslip_audits
  where user_id = _user_id and created_at >= _since;
$$;
```

```tsx
// src/components/dashboard/DashboardCumulative.tsx
import Link from 'next/link'
import { Sparkles, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardCumulative({ firstName, cumulativeIdr, auditCount, violationCount, sinceDate }: Props) {
  const isFirstVisit = auditCount === 0
  return (
    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-6 sm:p-8">
      <p className="text-sm text-slate-600">Halo, {firstName}.</p>
      {isFirstVisit ? (
        <>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Selamat datang. Saatnya audit slip pertamamu.
          </h2>
          <p className="mt-1 text-sm text-slate-500">Aktifkan Pro mulai sekarang dengan upload slip terbaru.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/wajar-slip"><Button className="bg-emerald-600 hover:bg-emerald-700">Audit slip pertama →</Button></Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Total selisih ditemukan</p>
          <p className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-emerald-700 sm:text-5xl">
            IDR {cumulativeIdr.toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {auditCount} audit · {violationCount} pelanggaran ditandai sejak{' '}
            {new Date(sinceDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/wajar-slip"><Button className="bg-emerald-600 hover:bg-emerald-700"><Sparkles className="mr-2 h-4 w-4" /> Audit slip terbaru</Button></Link>
            <Link href="/dashboard?tab=referral"><Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Bagikan ke teman</Button></Link>
          </div>
        </>
      )}
    </section>
  )
}
```

---

## 3. Audit History — Make It Clickable

Each row links to a detail view. Free users see only the most recent 1 entry; gated rows show CompactGate.

```tsx
// src/components/dashboard/DashboardHistory.tsx
import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Paywall } from '@/components/Paywall'
import type { SubscriptionTier } from '@/types'

interface Audit {
  id: string; created_at: string; verdict: 'SESUAI' | 'ADA_PELANGGARAN'
  violation_count: number; shortfall_idr: number; period_month: number; period_year: number; city: string
}

const MONTHS = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export function DashboardHistory({ audits, tier }: { audits: Audit[]; tier: SubscriptionTier }) {
  if (!audits.length) {
    return null // first-visit users see only the cumulative block, not an empty history
  }

  const visibleCount = tier === 'pro' ? audits.length : 1

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900">Riwayat audit</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {audits.map((a, i) => {
          const isLocked = i >= visibleCount
          const dateStr = new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
          return (
            <li key={a.id} className="py-3">
              {isLocked ? (
                <Paywall compact feature={`Audit slip ${MONTHS[a.period_month]} ${a.period_year}`} />
              ) : (
                <Link href={`/wajar-slip/audit/${a.id}`} className="group flex items-start justify-between gap-3 rounded-md p-2 -mx-2 hover:bg-slate-50">
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="text-xs text-slate-400">{dateStr}</span>{' · '}
                      Slip {MONTHS[a.period_month]} {a.period_year} · {a.city}
                    </p>
                    <p className="mt-1 text-xs">
                      {a.verdict === 'SESUAI' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Sesuai regulasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <AlertTriangle className="h-3 w-3" /> {a.violation_count} pelanggaran · IDR {a.shortfall_idr.toLocaleString('id-ID')} selisih
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
```

The detail view at `/wajar-slip/audit/[id]` should reuse the verdict UI from file 03 §2 Frame 6. Cache the immutable result in DB; do not recompute.

---

## 4. Subscription Block — Trustworthy, Not Hostile

```tsx
// src/components/dashboard/DashboardSubscription.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarDays, CreditCard, ShieldCheck, ArrowDown, RefreshCw } from 'lucide-react'

export function DashboardSubscription({ user, profile }: Props) {
  const [confirming, setConfirming] = useState<'cancel' | 'refund' | null>(null)
  const tier = profile?.subscription_tier ?? 'free'

  if (tier === 'free') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Langganan</h2>
        <p className="mt-1 text-sm text-slate-500">Kamu di paket Gratis.</p>
        <Button asChild className="mt-3 bg-emerald-600 hover:bg-emerald-700">
          <a href="/upgrade">Upgrade ke Pro · IDR 49.000</a>
        </Button>
      </section>
    )
  }

  const renewAt = profile.subscription_renew_at ? new Date(profile.subscription_renew_at) : null
  const paidAt = profile.subscription_last_paid_at ? new Date(profile.subscription_last_paid_at) : null
  const refundDeadline = paidAt ? new Date(paidAt.getTime() + 7*24*3600*1000) : null
  const refundDaysLeft = refundDeadline ? Math.max(0, Math.ceil((refundDeadline.getTime() - Date.now()) / (24*3600*1000))) : 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Langganan Pro</h2>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Aktif</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
        <li className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-slate-400" /> IDR 49.000/bulan via {profile.payment_method ?? 'Midtrans'}</li>
        {renewAt && <li className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Otomatis perpanjang {renewAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</li>}
        {refundDaysLeft > 0 && <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Refund 7-hari masih bisa ({refundDaysLeft} hari lagi)</li>}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirming('cancel')}><ArrowDown className="mr-1 h-3.5 w-3.5" /> Batalkan langganan</Button>
        {refundDaysLeft > 0 && (
          <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setConfirming('refund')}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refund ({refundDaysLeft} hari)
          </Button>
        )}
      </div>

      {confirming === 'cancel' && <CancelDialog onClose={() => setConfirming(null)} />}
      {confirming === 'refund' && <RefundDialog onClose={() => setConfirming(null)} />}
    </section>
  )
}
```

`CancelDialog` and `RefundDialog`: see file 05 §8 (cancel) and file 01 §3 (refund). Both must:
- Confirm in plain language.
- Make the destructive action clear.
- Process within 1×24h.
- Send a confirmation email.

---

## 5. Engagement Loops — Why Users Renew

### 5.1 Loop 1 — Monthly slip prompt

A salaried Indonesian worker gets a slip on the 25th–28th every month. Send a single push (email + WhatsApp opt-in if available):

> Subject: *"Slip [month] sudah keluar? Audit dalam 30 detik."*
> *Hi [first name], slip [month] mungkin sudah masuk inbox kamu. Audit cepat untuk pastikan PPh21 + BPJS-nya benar.*
> *[Audit sekarang →]*

Send at 09:00 WIB local on the 26th. If user audited within the past 7 days, skip.

```ts
// scripts/cron-monthly-slip-prompt.ts (run on the 26th, 09:00 WIB)
const since = subDays(new Date(), 7)
const { data: users } = await sb
  .from('user_profiles').select('id, email, full_name, subscription_tier')
  .eq('subscription_tier', 'pro')
  .or(`last_audit_at.lt.${since.toISOString()},last_audit_at.is.null`)

for (const u of users ?? []) await sendMonthlySlipPrompt(u)
```

### 5.2 Loop 2 — Anniversary recap

On the 1-month anniversary of a paid subscription, send:

> Subject: *"Sebulan jadi anggota Pro. Total kamu nemu: IDR 1.247.000."*
> *Hi [name], makasih sudah jadi anggota cekwajar.id Pro 1 bulan. Selama bulan ini, kamu nemu IDR 1.247.000 selisih di 3 audit. Pertahankan kebiasaan: cek slip bulan depan begitu masuk.*
> *[Lihat dashboard →]*

This is reinforcement: the email itself reminds the user of the value, raising perceived ROI right before the auto-renewal.

Send 3 days *before* the second auto-renewal charge.

### 5.3 Loop 3 — Silent-week nudge

If a paying user has zero activity for 14 consecutive days, send:

> Subject: *"Tidak ada audit dalam 2 minggu. Semua oke?"*
> *Hai, kalau kamu tidak butuh Pro lagi, batalkan tanpa drama di sini: [Cancel].
> Atau audit slip terbaru dengan satu klik: [Audit].*

This is anti-pattern reversed: instead of fighting churn with friction, we lower it deliberately. Empirically reduces involuntary churn (people who forget they pay) without raising voluntary churn.

### 5.4 Loop 4 — Feature-shipped notification

When a new tool/feature ships (e.g., Wajar Gaji crowdsource live), email Pro users with a single CTA. One email per quarter max.

---

## 6. The Referral Tab

Add a `?tab=referral` view. Single page:

```
Bagikan ke teman, kamu dapat 1 bulan gratis.

Link kamu:
  cekwajar.id/r/A8F2K
  [Salin]

Statusmu:
  3 teman sudah klik link.
  1 teman sudah jadi Pro.
  → Kamu dapat +30 hari (sudah otomatis ditambah ke renewal).

Cara: 
  1. Bagikan link di atas via WhatsApp/Instagram/Twitter.
  2. Begitu teman bayar Pro IDR 49K, kamu otomatis dapat +30 hari.
  3. Tanpa batas total — sebanyak teman yang convert, segitu bulan gratis.
```

Hard cap 12 free months / referrer / lifetime; surface this honestly: *"Maks. 12 bulan gratis per pengguna untuk mencegah abuse."*

WhatsApp/Twitter/Instagram share buttons that prefill copy:
```
"Slip gajimu mencuri dari kamu? Aku nemu IDR 1.247.000 selisih pakai cekwajar.id. Cek punyamu di link ini:"
```

---

## 7. The Cancel Save — One Last Offer

When user clicks Cancel and confirms reason, before processing:

> *Sebelum batal, mau diskon 30% untuk 3 bulan ke depan?*
> *Jadi cuma IDR 34.300/bulan sampai bulan ke-3.*
> *[Iya, lanjut diskon]*  *[Tetap batal]*

This save offer fires once per lifetime per user. After they accept it once, never offer again. After they decline it once, never offer again. Persist via `cancel_save_offered_at`.

If accepted, apply Midtrans `discount_token` for 3 cycles, then revert to full price.

---

## 8. Settings Page — Account, Privacy, Notifications

`/dashboard/settings` (build new):

```
Akun
- Nama: [edit]
- Email: andi@gmail.com [verified]

Privasi (UU PDP)
- Persetujuan saat ini: v1.0_2026_05 (1 Mei 2026)
- [Tarik persetujuan eksplisit] — akan menghentikan audit slip baru
- [Download semua data saya] — JSON export dalam 1×24 jam
- [Hapus akun + semua data] — kosongkan dalam 7 hari (Pasal 23 UU PDP)

Notifikasi
☐ Email ringkasan bulanan
☐ Reminder 26-28 (bulanan slip)
☐ Email saat fitur baru rilis

Pembayaran
- Metode: GoPay (•••2847) [ganti]
- Riwayat transaksi: [lihat]
```

Each toggle persists immediately (`PATCH /api/account/preferences`); no global "Save" button.

---

## 9. Mobile Dashboard

On 375px viewport:
- Cumulative IDR block stacks fine; reduce font from 5xl to 4xl.
- Audit history: each row 64px tall, tap target on the right arrow.
- Subscription block: stack buttons vertically, full width.
- Tool grid below fold (de-emphasized): 2-column 2×2.
- Bottom sticky action: *"Audit slip terbaru"* persistent until user clicks.

---

## 10. Empty States Worth Caring About

| Page | Empty state | What to show |
|------|-------------|--------------|
| Dashboard cumulative (0 audits) | First-time Pro user | "Selamat datang. Audit slip pertama kamu →" + button |
| Dashboard history (0 audits) | (same) | Hide section entirely; surface single FTUE tip below cumulative |
| Settings transactions (0) | New free user | "Belum ada transaksi. Upgrade ke Pro untuk mulai →" |
| Wajar Gaji search (no result) | First search miss | "Belum ada data untuk posisi ini di kota ini. Bantu kami: laporkan gaji kamu (anonim)." |

Empty states must always include a next action — never just "no data".

---

## 11. Acceptance Criteria

- [ ] Dashboard rebuilt per §1 layout.
- [ ] `user_cumulative_shortfall` RPC live.
- [ ] Audit history rows clickable to `/wajar-slip/audit/[id]`.
- [ ] Subscription block shows real renewal date, payment method, refund window.
- [ ] Cancel + refund dialogs functional and tested with sandbox Midtrans.
- [ ] Cancel save offer (30% off 3 cycles) ships and persists state.
- [ ] Referral tab live, link working, deep-link prefilled WhatsApp share.
- [ ] Monthly slip prompt cron live (26th of each month).
- [ ] Anniversary recap email scheduled correctly per user.
- [ ] Silent-week nudge auto-sends after 14 days of inactivity.
- [ ] Settings page with privacy controls (export, delete, withdraw consent).
- [ ] Mobile layout passes at 375px width.
- [ ] No `BentoCard` ornamental component dominates the dashboard.

---

*End of file. Cross-references: `01_revenue_first_repositioning.md` (refund + referral), `04_paywall_freemium_gate_psychology.md` (Paywall component reused for compact gates), `05_pricing_page_persuasion.md` (cancel flow), `06_trust_authority_credibility.md` (privacy controls).*
