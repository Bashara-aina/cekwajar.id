# 06 — Trust, Authority & Credibility Layer

> **For OpenCode:** A finance product that asks for a payslip cannot be polished if it isn't trusted. This file builds the trust layer end-to-end: UU PDP consent flow, regulatory attribution pages (`/regulasi/*`), security badges, founder bio, calculation auditor letter, breach response transparency, and the privacy/ToS rewrites. Every block raises **conversion** because it lowers perceived risk; treat trust as a revenue lever, not a legal box-checking exercise.

---

## 0. Why Trust Is The Top-3 Conversion Lever Here

cekwajar.id asks for the most sensitive document a wage worker has — their payslip. Indonesian users have learned to distrust apps that ask for KTP/payslip; they assume the data will leak, be sold, or be used for profiling. Without a deliberate trust layer, the upload-to-completion rate stays under 30% and gate→paid conversion stays under 8%.

`master_analysis_cekwajar.md §5` and `block_04_legal_compliance.md` already specify the legal architecture. This file translates those specs into **visible, conversion-driving UI**. The legal team wrote the law; this file makes the user feel safe enough to act on it.

---

## 1. The UU PDP Dual-Checkbox Modal

This is mandated by `master_analysis §5.2` and is non-negotiable before any payslip upload can occur. Currently the codebase ships a generic `<CookieConsent>` banner — that is **not** UU PDP consent for sensitive data.

### 1.1 Required Behaviour

Before the user uploads their first payslip (and only then), they see a modal that:
1. Cannot be dismissed by clicking outside (no `onOpenChange` close).
2. Has two **separate** checkboxes (UU PDP §20 ayat 2(a) — bundled consent for sensitive data is illegal).
3. Has a "Lihat detail pemrosesan" link to `/privacy-policy#payslip` for each.
4. The primary "Lanjut" button is disabled until both are checked.
5. Persists consent in the `user_consents` table with timestamp, IP hash, user-agent — auditable for Kominfo.

### 1.2 Implementation

```tsx
// src/components/legal/PdpConsentGate.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react'

interface Props {
  /** Renders nothing if consent already given for this user */
  onConsented: () => void
  open: boolean
}

export function PdpConsentGate({ open, onConsented }: Props) {
  const [generalConsent, setGeneralConsent] = useState(false)
  const [sensitiveConsent, setSensitiveConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  const canSubmit = generalConsent && sensitiveConsent

  async function record() {
    if (!canSubmit) return
    setLoading(true)
    await fetch('/api/consent/payslip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: 'v1.0_2026_05',
        general: generalConsent,
        sensitive: sensitiveConsent,
      }),
    })
    onConsented()
  }

  return (
    <Dialog open={open} onOpenChange={() => { /* not closable */ }}>
      <DialogContent
        className="max-w-lg"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <DialogTitle className="text-center text-lg">
            Persetujuan Pemrosesan Data — UU No. 27/2022 (PDP)
          </DialogTitle>
          <p className="text-center text-xs text-slate-500">
            Slip gaji adalah data pribadi sensitif. Hukum mengharuskan kami minta persetujuanmu secara eksplisit, terpisah dari syarat lain.
          </p>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Checkbox 1 — Umum */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={generalConsent}
              onChange={(e) => setGeneralConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-emerald-600"
            />
            <div className="text-sm">
              <p className="font-medium text-slate-800">Data umum (Pasal 4 ayat 1)</p>
              <p className="mt-1 text-slate-600">
                Saya menyetujui pemrosesan informasi gaji, pekerjaan, dan kota saya untuk benchmark anonim.
              </p>
              <Link href="/privacy-policy#general" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline" target="_blank">
                Lihat detail <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </label>

          {/* Checkbox 2 — Sensitif */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <input
              type="checkbox"
              checked={sensitiveConsent}
              onChange={(e) => setSensitiveConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-amber-600"
            />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Data sensitif (Pasal 20 ayat 2(a))</p>
              <p className="mt-1 text-amber-800">
                Saya memberikan persetujuan eksplisit untuk pemrosesan slip gaji saya.
                Slip akan diproses otomatis oleh OCR dan dihapus permanen dalam 30 hari.
                Tidak ada manusia yang akan melihat slip saya.
              </p>
              <Link href="/privacy-policy#payslip" className="mt-1 inline-flex items-center gap-1 text-xs text-amber-900 underline" target="_blank">
                Lihat detail pemrosesan <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </label>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Kamu dapat menarik persetujuan ini kapan saja melalui dashboard.
          Penarikan akan menghapus seluruh data pribadi kamu dari sistem dalam 7 hari.
        </p>

        <Button
          className="mt-4 h-12 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
          disabled={!canSubmit || loading}
          onClick={record}
        >
          {loading ? 'Menyimpan...' : 'Lanjut ke upload slip'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

```ts
// src/app/api/consent/payslip/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function POST(req: NextRequest) {
  const { user } = await getCurrentUser()
  const body = await req.json()
  const ip = (req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '').split(',')[0]
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_HASH_SALT ?? '')).digest('hex')

  const sb = await createClient()
  await sb.from('user_consents').insert({
    user_id: user?.id ?? null,
    anon_session_id: req.headers.get('x-session-id'),
    consent_version: body.version,
    general: body.general === true,
    sensitive: body.sensitive === true,
    ip_hash: ipHash,
    user_agent: req.headers.get('user-agent') ?? '',
    given_at: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}
```

```sql
-- supabase/migrations/20260427_user_consents.sql
create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  anon_session_id text,
  consent_version text not null,
  general boolean not null,
  sensitive boolean not null,
  ip_hash text not null,
  user_agent text,
  given_at timestamptz not null default now()
);
alter table public.user_consents enable row level security;
create policy "users_read_own_consents" on public.user_consents for select using (auth.uid() = user_id);
```

### 1.3 Where the modal triggers

Open `wajar-slip/page.tsx` at the IDLE state. Before showing the upload card, check `useConsentStatus()` (a hook). If consent for `v1.0_2026_05` not present, render `<PdpConsentGate open onConsented={...} />`.

```tsx
const consent = useConsentStatus('payslip', 'v1.0_2026_05')
if (consent.status === 'loading') return <Skeleton />
if (consent.status === 'missing') return <PdpConsentGate open onConsented={consent.refetch} />
// otherwise render the uploader
```

---

## 2. Privacy Policy & ToS — Rewrite for Humans

Audit `src/app/privacy-policy/page.tsx` and `src/app/terms/page.tsx`. The current files (assume placeholder text) need to be replaced with two structured documents:

- `/privacy-policy` — Bahasa Indonesia, plain language, structured by data type
- `/privacy-policy/en` — English mirror for international links / press
- `/terms` — Bahasa Indonesia, focus on disclaimer & dispute resolution (PerlKons UU 8/1999)
- `/terms/en` — English mirror

### 2.1 Privacy Policy Outline (write 100% in Bahasa first, English second)

```markdown
# Kebijakan Privasi cekwajar.id

Versi 1.0 · Berlaku 1 Mei 2026

## 1. Apa yang kami simpan, kapan, dan kenapa

| Data | Klasifikasi | Disimpan berapa lama | Untuk apa |
|------|-------------|----------------------|-----------|
| Slip gaji (PDF/foto) | SENSITIF | 30 hari (auto-delete) | OCR + audit |
| Status PTKP | SENSITIF | 90 hari | Kalkulasi PPh21 |
| Gaji bruto | UMUM | Anonim setelah 90 hari | Benchmark agregat |
| Email + akun | UMUM | Selama akun aktif | Login + komunikasi |
| Riwayat audit | UMUM | 24 bulan, lalu anonim | Riwayat |
| IP address | UMUM | 90 hari (dalam bentuk hash) | Pencegahan fraud |

## 2. Apa yang TIDAK kami lakukan

- Kami tidak menjual data ke pihak ketiga.
- Kami tidak mempelajari slip kamu untuk profiling.
- Kami tidak share dengan pemberi kerja kamu.
- Kami tidak menampilkan iklan di produk ini.

## 3. Hak kamu (UU PDP Pasal 22-27)

Setiap saat, kamu berhak:
- **Akses** — minta salinan data kamu yang kami simpan
- **Koreksi** — minta kami betulkan data salah
- **Hapus** — minta kami hapus seluruh data kamu (max 7 hari)
- **Tarik persetujuan** — hentikan pemrosesan data sensitif

Cara: email ke `pdp@cekwajar.id` atau klik "Hapus akun saya" di dashboard.

## 4. Pemrosesan Lintas Negara (Pasal 56)

Data kamu disimpan di Supabase region **ap-southeast-1 (Singapore)**.
Singapore tidak ada di daftar adekuasi Indonesia (per April 2026), jadi kami menggunakan
mekanisme Standard Contractual Clauses (SCC) sesuai Pasal 56(2)(a).
Salinan SCC kami tersedia di /legal/scc-supabase.

## 5. Insiden / Kebocoran

Kalau ada insiden keamanan yang menyentuh data kamu, kami akan:
1. Memberitahu kamu individual via email dalam 24 jam (Pasal 46)
2. Lapor BSSN/Kominfo dalam 3 hari (Pasal 46)
3. Publikasikan ringkasan teknis di /security/incidents

## 6. Kontak Pengawas Internal (DPO)

Founder bertindak sebagai Data Protection Officer.
Kontak: dpo@cekwajar.id (response SLA 5 hari kerja)
```

### 2.2 Terms of Service — Disclaimer Heart

The single most important paragraph in the entire `/terms` page:

> *"Hasil audit cekwajar.id bersifat informatif berdasarkan data yang kamu berikan dan peraturan yang berlaku. Hasil ini bukan merupakan konsultasi pajak, konsultasi hukum, atau penilaian resmi. Untuk keputusan finansial penting (mis. menggugat perusahaan, file SPT), konsultasikan dengan konsultan pajak atau pengacara terdaftar."*

This protects the company under UU PerlKons No.8/1999 and UU PDP simultaneously. Ship it as a `<DisclaimerBanner>` on the verdict page (already exists at `src/components/shared/DisclaimerBanner.tsx`) and also as the second-from-last paragraph in `/terms`.

---

## 3. The Authority Strip — Visible Across The Site

A persistent visual reminder of **who said the calculations are right**. Add this strip to:
- Wajar Slip IDLE state (above upload zone)
- Verdict page (just below the hero number)
- Footer of every tool page
- `/upgrade` page (in §3.7 of file 05)

### Component:

```tsx
// src/components/legal/AuthorityStrip.tsx
import Link from 'next/link'
import { ShieldCheck, FileText } from 'lucide-react'

const AUTHORITIES = [
  { label: 'PMK 168/2023 (TER)', href: '/regulasi/pmk-168-2023' },
  { label: 'PP 44, 45, 46/2015 (BPJS)', href: '/regulasi/bpjs' },
  { label: 'Perpres 82/2018 (Kesehatan)', href: '/regulasi/bpjs-kesehatan' },
  { label: 'UU 27/2022 (PDP)', href: '/privacy-policy' },
  { label: 'Audited by Kantor Konsultan Pajak X (PKP)', href: '/regulasi/audit-letter' },
]

export function AuthorityStrip() {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        <ShieldCheck className="h-3 w-3" /> Kalkulasi berdasarkan
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
        {AUTHORITIES.map((a) => (
          <li key={a.label}>
            <Link href={a.href} className="inline-flex items-center gap-1 hover:text-emerald-700 hover:underline">
              <FileText className="h-3 w-3" /> {a.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

The audit letter (last item) needs to be a real PDF scan from a real PKP. Budget IDR 25M for the engagement (`master_analysis §5.1`). It is the highest-yield trust artifact in the entire build.

---

## 4. Founder Identity — `/about` Page

A faceless finance app does not get paid. Build `/about` with:

1. **Photo of founder.** Real, facing camera, not stock.
2. **Two-paragraph bio.** Why this product, why credible. Mention specific Indonesian credentials (NIK, NPWP, prior workplaces).
3. **Public commitment statement.** "I built this because... I commit to..."
4. **Live email** for direct contact: `founder@cekwajar.id`. Responds within 24h.

Layout — clean, no padding gimmicks, single column 600px wide. Link from footer.

If the founder is not yet comfortable being public, do not launch. The product cannot reach product-market fit hidden behind a corporate veneer.

---

## 5. Public Calculation Audit Letter

Once the PKP audit (file 03 §5.3) completes, scan the signed letter and host at `/regulasi/audit-letter`:

```
[Letterhead PKP X]
[Date]

To: cekwajar.id (PT/individual)

We have reviewed the PPh21 TER and BPJS calculation engine implemented at cekwajar.id 
against the following test cases:

  TC-01 through TC-15 (per PMK 168/2023 Lampiran A, B, C)

Result:  All test cases produced output matching expected values within IDR 100 tolerance.
The engine correctly applies:
  - PPh21 TER monthly rates per PTKP category
  - PPh21 progressive annual true-up
  - BPJS JHT 2/3.7%, JP 1/2% with IDR 9,559,600 cap
  - BPJS JKK class-based 0.24-1.74%, JKM 0.30%
  - BPJS Kesehatan 1/4% with IDR 12M cap
  - Below-UMK detection per Kemnaker UMK 2026

[Signature]
[Name, license number, date]
```

Link to it from the AuthorityStrip and from the FAQ ("Bagaimana kalau perhitungan kalian salah?").

---

## 6. The `/regulasi/*` Section

Each linked authority needs a destination page. They serve two purposes: SEO and trust.

```
/regulasi/pmk-168-2023        — explainer + downloadable PDF
/regulasi/bpjs                 — 6 components, rates, sources
/regulasi/bpjs-kesehatan       — Perpres 82/2018 explainer
/regulasi/umk-2026             — interactive city/UMK lookup
/regulasi/audit-letter         — PKP audit scan
```

Each page structure:
1. H1 — official name of the regulation
2. 3-paragraph plain-language summary
3. Embedded PDF (Supabase Storage public bucket)
4. "Apa hubungannya dengan cekwajar.id" — how the regulation drives our calculation
5. Link back to the relevant tool (Wajar Slip)

Build 5 pages over a sprint. Average 1 day per page (writing + sourcing PDF + linking).

---

## 7. Security Badges — Trust Stamps That Work

Place at:
- Footer of every page
- Below the upgrade CTA on `/upgrade`
- Below the verdict-page CTA

```tsx
// src/components/legal/SecurityBadges.tsx
import { ShieldCheck, Lock, MapPin } from 'lucide-react'

export function SecurityBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> TLS 1.3</span>
      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Singapore (ap-southeast-1)</span>
      <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> AES-256 at rest</span>
      <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Auto-delete 30 hari (UU PDP)</span>
    </div>
  )
}
```

If the project later passes a pen test (`master_analysis §6.5`), add an "ISO/PCI scan complete by [firm], [date]" badge with link.

---

## 8. The Breach Response Playbook (Visible)

Most companies hide breach response policies. Be the opposite — publish at `/security/policy`. This converts skeptics.

Outline:
```markdown
# Cara cekwajar.id Menangani Insiden

Kami percaya transparansi mengurangi risiko, bukan menambahnya.

## Kalau ada insiden, ini yang akan kamu dapat:

1. **Dalam 1 jam** — bucket terkait di-isolasi, akses dicabut.
2. **Dalam 24 jam** — kamu dapat email individual yang menjelaskan apa yang terjadi.
3. **Dalam 3 hari** — kami lapor BSSN/Kominfo (Pasal 46).
4. **Dalam 48 jam publik** — kami publikasi postmortem teknis di /security/incidents.

## Yang TIDAK akan kami lakukan:

- Kami tidak akan menyembunyikan kebocoran.
- Kami tidak akan menyalahkan pengguna.
- Kami tidak akan menghapus komentar di publik.

## Riwayat insiden

[link ke /security/incidents — jika belum ada, tulis: "Belum ada insiden sejak peluncuran."]
```

Link from footer ("Keamanan").

---

## 9. Account Deletion — End-to-End

UU PDP Pasal 23 says users have the right to deletion. Make it one click.

```tsx
// dashboard/settings — danger zone
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function DeleteAccountFlow() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  async function deleteIt() {
    setLoading(true)
    await fetch('/api/account/delete', { method: 'POST' })
    window.location.href = '/account-deleted'
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="text-red-600 hover:bg-red-50">
        Hapus akun saya
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">Hapus akun + seluruh data?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-700">
            Ini akan menghapus seluruh data kamu di sistem dalam 7 hari (UU PDP Pasal 23).
            Termasuk: slip yang masih tersisa, riwayat audit, langganan aktif (otomatis dibatalkan).
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ketik <strong>HAPUS</strong> untuk konfirmasi.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <Button
            disabled={confirmText !== 'HAPUS' || loading}
            onClick={deleteIt}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Menghapus…' : 'Hapus akun saya'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

Server-side: queue async deletion. Cancel any active subscription via Midtrans API. Schedule pg_cron 7-day delay to actually wipe (gives user a window to recover).

---

## 10. Press / Contact Page

Build `/press` with:
- Logo download (PNG + SVG, dark and light)
- Founder photo download
- Pre-written brief (1 paragraph)
- Press contact: `pers@cekwajar.id`
- Recent metrics published quarterly: total audits, average shortfall found, paying users

This is for journalists who Google the brand. They need a media kit in the second click.

---

## 11. Acceptance Criteria

- [ ] `<PdpConsentGate>` ships and triggers before any payslip upload.
- [ ] `user_consents` table created with RLS, `/api/consent/payslip` live.
- [ ] `<AuthorityStrip>` rendered on Wajar Slip IDLE, verdict page, upgrade page, footer.
- [ ] `<SecurityBadges>` rendered on footer + key revenue surfaces.
- [ ] Privacy policy and Terms rewritten in Bahasa Indonesia per §2.
- [ ] All 5 `/regulasi/*` pages built with PDF + summary + linkback.
- [ ] `/about` page with founder photo, bio, public email.
- [ ] PKP audit letter scanned, hosted at `/regulasi/audit-letter`.
- [ ] `/security/policy` and `/security/incidents` pages live.
- [ ] Account deletion flow end-to-end working with 7-day grace cron.
- [ ] `/press` with media kit.
- [ ] All policy pages accessible from footer.
- [ ] Lighthouse desktop ≥95 on all `/regulasi/*` pages (text-heavy → easy to hit).

---

*End of file. Cross-references: `01_revenue_first_repositioning.md` (refund mechanics), `03_wajar_slip_full_flow_audit.md` (consent triggers), `05_pricing_page_persuasion.md` (FAQ links), `10_launch_checklist_production_quality.md` (legal blockers in pre-launch checklist).*
