# 07 — Onboarding: Signup to First Value in Under 60 Seconds

> **For OpenCode:** Every second the user spends on a signup form is a second they're not seeing IDR shortfall on their slip. This file rebuilds the onboarding architecture so a TikTok visitor can land, audit, and pay without ever touching a signup form — and so signup happens **after** they've already received value, not before. Time-to-first-verdict is the operational metric; payment conversion is the consequence.

---

## 0. The Diagnosis

Current onboarding paths:

| Path | Time to Verdict | Friction | Drop |
|------|-----------------|----------|------|
| Anon → Wajar Slip → manual form → verdict | ~120s | 9 fields, OCR fallback | ~45% drop at form |
| Anon → Wajar Slip → upload → verdict | ~30–60s | 2-3 OCR confirms | ~25% drop at OCR |
| Anon → Sign Up → Login → Wajar Slip → verdict | ~5 min | Magic link in email | ~75% drop on email step |

The problem is the codebase nudges users toward sign-up too early. `GlobalNav.tsx` shows a "Masuk" button alongside the "Cek Gratis" CTA — the visual symmetry tells users that signing up is *part* of the entry path. It isn't, and shouldn't be.

`auth/login/page.tsx` uses Supabase magic-link OTP. That is correct technically but it means: user types email → leaves your site → opens email → clicks link → returns. **A 4-step tab-switch in the middle of a sales funnel.** Magic links are a retention mechanism, not an acquisition mechanism. Use them only after first value.

---

## 1. The New Onboarding Principle: Anonymous-First, Lazy-Auth

**Default:** all 5 tools work without login. The audit, the verdict, the gate moment — all anonymous. We track `anon_session_id` in a cookie + localStorage.

**Auth-required moments (and only these):**
- Saving audit history beyond the current session
- Paying via Midtrans (Snap requires a customer record)
- Accessing dashboard / referral / cancel flow

**Auth-deferred moments (capture email but don't block):**
- After verdict view, before user closes tab → "Mau hasil dikirim ke email?" (file 04 §6.1)

---

## 2. The Anonymous Session Model

### 2.1 Cookie + localStorage

When the user first lands, mint a UUID:

```ts
// src/lib/anon-session.ts
import { v4 as uuid } from 'uuid'

const KEY = 'cekwajar_anon'
const COOKIE = 'cekwajar_anon_id'

export function ensureAnonSession(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = uuid()
    localStorage.setItem(KEY, id)
    document.cookie = `${COOKIE}=${id}; path=/; max-age=${60*60*24*365}; SameSite=Lax`
  }
  return id
}
```

Send the ID via header `x-session-id` on every API call. Server reads from header first, falls back to cookie.

### 2.2 Anon-to-account migration

When the anonymous user finally signs in (or signs up), migrate their data:

```sql
-- Migrate anonymous audits to authenticated user on login
create or replace function public.migrate_anon_data(_anon_id text, _user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.payslip_audits  set user_id = _user_id, anon_session_id = null where anon_session_id = _anon_id;
  update public.user_consents    set user_id = _user_id, anon_session_id = null where anon_session_id = _anon_id;
  update public.salary_submissions set user_id = _user_id, anon_session_id = null where anon_session_id = _anon_id;
  insert into public.audit_migration_log (user_id, anon_id, migrated_at) values (_user_id, _anon_id, now());
end $$;
```

Call this from the auth callback:
```ts
// src/app/auth/callback/route.ts
const anonId = req.cookies.get('cekwajar_anon_id')?.value
if (anonId && session?.user) {
  await sb.rpc('migrate_anon_data', { _anon_id: anonId, _user_id: session.user.id })
}
```

This means a user can audit anonymously, pay anonymously (Midtrans guest checkout — see §3), then later create an account and find their entire history waiting.

---

## 3. Payment Without Pre-Auth (Guest Checkout)

The current `/api/payment/create-transaction` requires `getCurrentUser()` to return a user. That blocks the smoothest path: anon → audit → pay → unblur. Open the door for guest checkout.

```ts
// src/app/api/payment/create-transaction/route.ts — pseudo-diff
const { user } = await getCurrentUser()
const sessionId = req.headers.get('x-session-id')

// Allow either authenticated OR anon-with-session
if (!user && !sessionId) {
  return NextResponse.json({ error: 'no_session' }, { status: 401 })
}

// Capture email at this moment if guest
let email = user?.email
if (!email) {
  email = body.email // captured from a tiny form right before Snap opens
  if (!email) return NextResponse.json({ error: 'email_required' }, { status: 400 })
}

// Create or fetch a "shadow" account for guest
if (!user) {
  const shadowUser = await sb.auth.admin.createUser({
    email, email_confirm: false, // unconfirmed; user can claim later via magic link
    user_metadata: { shadow: true, anon_session_id: sessionId },
  })
  // attach to payment
}
```

The "shadow account" is invisible until the user later signs in via magic link sent post-payment ("Buka akun untuk lihat riwayat selamanya"). This pattern is used by Substack, Stripe Atlas, and others — it works in Indonesian context as long as we're explicit about the email being for receipt + future access.

---

## 4. Post-Payment Account Claim

Right after payment success (`/upgrade/success`), surface a single panel:

> **Selamat! Pembayaran berhasil.**
> Kami sudah kirim resi + magic link ke `andi@gmail.com`. Klik di email untuk simpan riwayat audit selamanya.
> *[Resend magic link]*  *[Lanjut tanpa akun]*

The "Lanjut tanpa akun" path is essential — never hold the user hostage to email confirmation. They've already paid; they get their value. Magic link expiry: 7 days, single use, then refreshable.

Magic-link template (Resend):
```tsx
// emails/magic-link-claim.tsx
export default function MagicLinkClaim({ email, link }: { email: string; link: string }) {
  return (
    <div>
      <h1>Selamat datang di cekwajar.id Pro 👋</h1>
      <p>Klik tombol di bawah untuk akses dashboard kamu.</p>
      <a href={link} style={{
        display: 'inline-block', padding: '12px 24px',
        background: '#10b981', color: '#fff', borderRadius: 8, textDecoration: 'none',
      }}>Buka Dashboard</a>
      <p style={{ fontSize: 12, color: '#64748b' }}>
        Link berlaku 7 hari. Email ini juga dapat dipakai untuk login selanjutnya.
      </p>
    </div>
  )
}
```

---

## 5. Login Page Cleanup

`src/app/auth/login/page.tsx` currently offers Google OAuth and email magic link. Keep both but reorder:

1. **Magic link** (default form) — top, big.
2. **Google sign-in** — secondary, smaller button.
3. **Footer line** — "Tidak punya akun? Tidak perlu daftar — [audit slip dulu →](/wajar-slip)".

The footer line is the conversion-saver: a user who clicked "Masuk" by mistake gets pushed back to the value path.

### Code:
```tsx
// inside LoginForm component, append at bottom of CardContent
<div className="mt-6 border-t pt-4 text-center">
  <p className="text-xs text-slate-500">Belum punya akun?</p>
  <Link href="/wajar-slip" className="mt-1 inline-block text-sm font-semibold text-emerald-700 hover:underline">
    Audit slip gaji dulu — gratis, tanpa daftar →
  </Link>
</div>
```

Strip the `Card` shadow on mobile and reduce padding on inputs to match Apple/Google form vibes.

---

## 6. The Signup Page — Eliminate

Audit `src/app/auth/signup/page.tsx`. If it exists, delete it. Magic link IS signup; an explicit `/auth/signup` page is duplicate friction. Redirect:

```tsx
// src/app/auth/signup/page.tsx
import { redirect } from 'next/navigation'
export default function SignupPage() { redirect('/auth/login?intent=signup') }
```

The `?intent=signup` flag flips one piece of copy on the login page from *"Masuk"* to *"Buat akun"* but otherwise the experience is identical.

---

## 7. Capacity & Rate Limit For Anon Users

Without a user record, abuse becomes easier. Defenses:

| Action | Anon limit | Signed-in free | Pro |
|--------|-----------|----------------|-----|
| Audit / hour | 3 | 5 | 50 |
| Audit / day | 5 | 10 | 100 |
| OCR upload / hour | 2 | 5 | 50 |
| Salary submit / day | 1 | 3 | 10 |

Track via `@vercel/kv` keyed on `anon:{session_id}:{action}:{period}`. Reset windows as ISO date strings.

```ts
// src/lib/rate-limit.ts
import { kv } from '@vercel/kv'

export async function checkRate(
  identifier: string, // anon:abc or user:def
  action: string,
  windowSec: number,
  max: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `rl:${identifier}:${action}`
  const now = Math.floor(Date.now() / 1000)
  const window = Math.floor(now / windowSec)
  const fullKey = `${key}:${window}`
  const count = await kv.incr(fullKey)
  if (count === 1) await kv.expire(fullKey, windowSec)
  return {
    allowed: count <= max,
    remaining: Math.max(0, max - count),
    resetAt: (window + 1) * windowSec,
  }
}
```

When a rate limit blocks an anon user, the message includes a path forward: *"5 audit/jam adalah batas tanpa daftar. Daftar gratis (1 detik) untuk batas lebih tinggi, atau tunggu 47 menit."*

---

## 8. The First-Time-User Experience On Wajar Slip

Layer the IDLE state with a tiny FTUE banner that disappears after first audit:

```tsx
{!hasAuditedBefore && (
  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-900">
    <strong>Audit pertama?</strong> Upload slip apa adanya. Sistem yang akan kerjain sisanya. Kalo OCR gagal, kamu bisa isi manual.
  </div>
)}
```

`hasAuditedBefore` reads from anon session: `localStorage.getItem('cekwajar_audits_count') > 0`. Increment on every successful verdict.

---

## 9. Onboarding Telemetry — The 5 Critical Events

| Event | Where | Why |
|-------|-------|-----|
| `anon_session_minted` | First page load | Cohort root |
| `audit_started` | IDLE → UPLOADING (first time) | Top of funnel |
| `verdict_received` | First reach VERDICT | First value |
| `paid_first` | First Snap success | Core conversion |
| `email_captured` | Email entered (lazy auth) | Re-engagement |

Compute time deltas between these in the analytics tool to build a first-session funnel:
- `anon_session_minted` → `audit_started`: target median ≤ 90s
- `audit_started` → `verdict_received`: target median ≤ 60s
- `verdict_received` → `paid_first`: target median ≤ 5 min for those who pay

If any of these crosses 2× the target, the corresponding step is broken — diagnose immediately.

---

## 10. The "Welcome" Email (For Authenticated Users Only)

After a user converts an anon session to a real account, send one welcome email. Not a series, just one. Content:

```
Subject: Selamat datang. Slip kamu aman.

Hi [name or email prefix],

Akun cekwajar.id kamu siap. Yang sudah aktif:
✓ Audit slip gaji unlimited
✓ Detail rupiah selisih  
✓ Skrip langkah ke HRD
✓ Garansi 7 hari uang kembali

Cara pakai berikutnya:
1. Login: cekwajar.id/auth/login (klik magic link)
2. Klik "Wajar Slip" → upload slip
3. Lihat hasil

Kalau ada yang aneh, balas email ini. Saya yang baca.
— [Founder name], cekwajar.id
```

Keep it under 100 words. Send it once. No "weekly digest" — at this stage that's spam.

---

## 11. Mobile Onboarding — The 375px Reality

Most TikTok-driven traffic is iPhone SE / Samsung Galaxy A-series users at 375px width.

Specific things to do on mobile:

1. **Hero CTA full-width, 56px tall.** Tap targets need to forgive shaky thumbs.
2. **Skip the modal trust strip on the IDLE state if vertical space is tight.** Move to an info icon next to the H1.
3. **The PdpConsentGate dialog must scroll inside its content area on small phones.** Test on iOS Safari with iOS 17 zoom enabled.
4. **The OCR confirm fields must use `inputmode="numeric"`** to bring up the number pad. Existing `IDRInput` should already do this; verify.
5. **No hover states.** Replace with persistent affordances. (`group-hover:` is fine for desktop polish; do not require hover for tap-target visibility.)
6. **No tooltips that require hover.** Convert tooltips to expand-on-tap accordions.
7. **Bottom sticky CTA bar** (file 02 §3.1) appears on every tool page, not just homepage.

---

## 12. Acceptance Criteria

- [ ] All 5 tools function fully without login.
- [ ] `cekwajar_anon_id` cookie + localStorage minted on first visit.
- [ ] Migration RPC `migrate_anon_data` ships, called from auth callback.
- [ ] Guest checkout (anon → Snap → success) end-to-end working.
- [ ] Magic-link claim email sent post-payment for guest users.
- [ ] `auth/signup` redirects to `auth/login?intent=signup`.
- [ ] Login page footer points back to `/wajar-slip` for indecisive visitors.
- [ ] Rate limit table per §7 enforced via `@vercel/kv`.
- [ ] FTUE banner appears on first IDLE state visit.
- [ ] All 5 onboarding events firing in analytics.
- [ ] Welcome email template lives in `emails/welcome.tsx`.
- [ ] Mobile-specific items 1–7 verified at 375px viewport.

---

*End of file. Cross-references: `02_landing_homepage_conversion.md` (homepage CTA), `04_paywall_freemium_gate_psychology.md` (lazy email capture), `05_pricing_page_persuasion.md` (Snap inline), `09_mobile_first_ux_perfection.md` (375px audit script).*
