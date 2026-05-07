# 03 — Wajar Slip Full-Flow Audit (The Cash Cow)

> **For OpenCode:** Wajar Slip is the only tool that pays the rent. Audit and rebuild every screen, every state, every error path. This file walks the user journey from the moment they tap the homepage CTA to the moment Midtrans returns success — frame by frame. Every annotation has a reason and a fix.

---

## 0. Why This File Is The Most Important One

`master_analysis_cekwajar.md §1.1`: Wajar Slip is the **only** v1 product. The other four tools exist on the homepage and dashboard to look credible, but they don't generate revenue at launch. Therefore: **every conversion problem on Wajar Slip is a P0 problem; everything else is P2.**

Current state of `src/app/wajar-slip/page.tsx` (838 lines, single file):

- Decent state machine with `useReducer`, but the 7 OCR-related states are cramped and the `OCR_CONFIRM` state is declared in the type union and never rendered (orphaned UI).
- `parseIDR` strips all non-digits but accepts any string — no bound checks at the input layer; user can paste "0" and it submits.
- Form schema duplicates fields between `formSchema` and `apiSchema` — risk of drift; consolidate.
- Verdict screen logic in the JSX is a cognitive load bomb (≈140 lines of nested ternaries computing `reportedValue` and `calculatedValue`). Move to a pure helper function.
- Disclaimer text mentions "PMK 168/2023 (TER)" but no link; users don't trust because they can't verify.
- No state telemetry: we have no idea where users abandon.
- No "save & resume" flow — if a user has to go look up their PTKP, they lose all input.
- The `CALCULATING` state shows `<Skeleton shimmer />` inline with text, not on the verdict surface — animation feels broken.

This file fixes all of it.

---

## 1. The Six States — Canonical Definition

```ts
// src/app/wajar-slip/_state.ts
export type SlipPhase =
  | { kind: 'IDLE' }
  | { kind: 'UPLOADING'; fileName: string }
  | { kind: 'OCR_PROCESSING'; engine: 'vision' | 'tesseract'; progress: number }
  | { kind: 'CONFIRM'; extracted: ExtractedFields; filePath: string; ocrConfidence: number }
  | { kind: 'CALCULATING' }
  | { kind: 'VERDICT'; data: AuditResult }
  | { kind: 'ERROR'; code: ErrorCode; message: string; retry?: () => void }

export type ErrorCode =
  | 'FILE_TOO_LARGE' | 'FILE_TYPE_INVALID' | 'OCR_FAILED' | 'OCR_LOW_CONFIDENCE'
  | 'NETWORK' | 'RATE_LIMITED' | 'INVALID_CITY' | 'CALC_FAILED' | 'AUTH_REQUIRED'
```

CONFIRM is a real state (currently missing). It must show what OCR extracted, highlight the 2 most-likely-wrong fields, and let the user override before calculation. Without CONFIRM, every Wajar Slip call is a black box and we will get viral "calculation wrong" complaints.

Move the reducer into a separate file `_state.ts`, import into `page.tsx`. Test it independently with `__tests__/wajar-slip/state.test.ts` covering every transition.

---

## 2. Frame-by-Frame: The Ideal Wajar Slip Journey

### Frame 1 — Landing (IDLE state)

**Above the fold, 375px viewport:**

| Element | Spec |
|---------|------|
| Page title | `Cek Slip Gaji — 30 Detik, Gratis` (20px bold) |
| Sub-title | `PMK 168/2023 + 6 komponen BPJS. Slip dihapus 30 hari.` (13px slate-500) |
| Trust strip | Same as homepage `<TrustStrip />` |
| Privacy modal trigger button (small) | `Bagaimana data slip saya diperlakukan? →` opens UU PDP modal (file 06 §3) |
| Big drop zone | 280px tall, full width, dashed emerald border, file icon 48px, copy: `Tap atau drag slip gaji di sini` + `PDF, JPG, PNG. Maks 5MB.` |
| Manual fallback | small text link `Atau isi manual →` (don't make this a button — it competes for attention) |
| Live audit ticker | Same as homepage |

The IDLE state must NOT show the disclaimer at the top; it goes inside an info accordion. Cluttering the upload moment with legal text is responsible for ~12% of first-screen abandons.

**Critical fix:** Remove the unconditional `<DisclaimerBanner type="tax" />` at line 331. Replace with a small `<InfoAccordion>` collapsed by default, opens to show the disclaimer text. UU PDP consent is on its own dedicated modal, not bundled here.

### Frame 2 — Upload click → file picker (UPLOADING state)

`UPLOADING` is currently <500ms but renders nothing — the user perceives a freeze. Add a determinate progress bar tied to `XMLHttpRequest.onprogress` (fetch doesn't expose progress; rewrite the upload as XHR for this state).

```tsx
async function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append('file', file)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total * 100)
    xhr.onload = () => xhr.status === 200 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error(`HTTP ${xhr.status}`))
    xhr.onerror = () => reject(new Error('NETWORK'))
    xhr.open('POST', '/api/ocr/upload')
    xhr.send(fd)
  })
}
```

Show a real progress bar (Tailwind: `w-full h-2 bg-slate-100 rounded-full overflow-hidden` with inner `h-full bg-emerald-600 transition-[width]`). Below it: `Mengupload slip gaji aman ke server Singapore...`

### Frame 3 — OCR processing (OCR_PROCESSING state)

Show two-engine signaling. The visitor needs to know we're trying hard.

```
[●○] Mendeteksi field di slip kamu...
     Google Vision · 1.2s
[○●] Backup OCR (Tesseract) standby
     Akan dijalankan otomatis kalo Vision gagal
```

If Vision returns `< 0.80` confidence, show: `OCR pertama tidak yakin. Mencoba Tesseract...` with a moving progress bar tied to `tesseract.js` worker progress (the existing `tesseract-client.ts` exposes a callback).

Display estimated total time: `~3-8 detik`. After 12 seconds, show a "Skip ke manual" button — this is the abandonment escape hatch.

### Frame 4 — Confirm (CONFIRM state) — DOES NOT EXIST YET, BUILD IT

This is the single most important frame to add. It's where we earn the user's trust before showing them money.

Layout: a single card with the extracted data, each row showing the extracted value, the confidence score (visual badge), and an inline editor.

```tsx
// src/components/wajar-slip/ConfirmExtractedFields.tsx
'use client'
import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Pencil } from 'lucide-react'
import { IDRInput } from '@/components/forms/IDRInput'
import { Button } from '@/components/ui/button'

interface FieldRow { key: string; label: string; value: number; confidence: number }

export function ConfirmExtractedFields({
  fields,
  onConfirm,
  onCancel,
}: {
  fields: FieldRow[]
  onConfirm: (overrides: Record<string, number>) => void
  onCancel: () => void
}) {
  const [edits, setEdits] = useState<Record<string, number>>({})

  const lowConfidence = fields.filter((f) => f.confidence < 0.85)

  return (
    <div className="space-y-4 rounded-xl border border-emerald-200 bg-white p-5">
      <div>
        <p className="text-base font-semibold text-slate-900">Konfirmasi 4 angka ini</p>
        <p className="mt-1 text-xs text-slate-500">
          OCR sudah baca slip kamu. Kalo salah, klik untuk edit.
        </p>
      </div>

      {lowConfidence.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>{lowConfidence.length} angka kurang yakin</strong> — kami tandai dengan ⚠️.
            Pastikan benar sebelum lanjut.
          </span>
        </div>
      )}

      <table className="w-full text-sm">
        <tbody>
          {fields.map((f) => {
            const isHigh = f.confidence >= 0.92
            const isLow = f.confidence < 0.85
            const value = edits[f.key] ?? f.value
            return (
              <tr key={f.key} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 align-top">
                  <p className="text-slate-700">{f.label}</p>
                  <p className="text-[11px] text-slate-400">
                    {isHigh ? <><CheckCircle2 className="inline h-3 w-3 text-emerald-500" /> {Math.round(f.confidence*100)}% yakin</>
                      : isLow ? <><AlertTriangle className="inline h-3 w-3 text-amber-500" /> {Math.round(f.confidence*100)}% — perlu cek</>
                      : <>{Math.round(f.confidence*100)}% yakin</>}
                  </p>
                </td>
                <td className="py-3 text-right">
                  <IDRInput
                    value={value}
                    onChange={(v) => setEdits((e) => ({ ...e, [f.key]: v }))}
                    className={isLow ? 'border-amber-400 bg-amber-50/50' : ''}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onConfirm(edits)}
        >
          Lanjut ke Verdict →
        </Button>
      </div>
    </div>
  )
}
```

**Telemetry on this frame:** track every override. If a field is overridden by >40% of users, that means our OCR field-extractor regex is broken — fire alert (file 10 §5).

### Frame 5 — Calculating (CALCULATING state)

Replace the inline `<Skeleton shimmer />` button mess with a full-screen overlay (modal). Shows three progressive checkpoints:

```
[✓] Kalkulasi PPh21 TER (PMK 168/2023)... 0.4s
[●] Kalkulasi BPJS 6 komponen... 
[ ] Bandingkan dengan slip kamu...
```

Total expected time: <2 seconds. If it crosses 5 seconds, show "Server lambat. Coba lagi?" with retry button.

### Frame 6 — Verdict (VERDICT state) — Two Variants

#### Variant A — `verdict === 'SESUAI'`

Calm, congratulatory. No upgrade pressure (it would feel cynical). Layout:

```
[Big green checkmark]  Slip Gaji Sesuai Regulasi

Slip kamu sesuai PMK 168/2023 dan aturan BPJS untuk
gaji bruto IDR 7.500.000 di Bekasi (UMK 2026: 5.343.430).

Tidak ada selisih yang perlu dipertanyakan ke HRD.

[Lihat detail kalkulasi]   [Cek slip lain]
```

After 8 seconds, surface a single low-pressure prompt: *"Bantu kami: bagikan ke 1 teman yang baru kerja?"* with a share button. Do not push upgrade — they have no reason to upgrade.

#### Variant B — `verdict === 'ADA_PELANGGARAN'` (the revenue moment)

This is the entire business model. Treat it like a Broadway opening.

```
[Big red triangle]  Ada {n} Pelanggaran di Slip Kamu

[Hero number, 56px bold]  IDR ████.███ ← BLURRED
  Total selisih bulan ini

──────────────────────────────────────────────
Pelanggaran yang ditemukan:
[red pill]  V01 · BPJS JHT tidak dipotong
[red pill]  V03 · PPh21 tidak dipotong
[red pill]  V05 · BPJS Kesehatan tidak dipotong
──────────────────────────────────────────────

Buka detail rupiah selisih + langkah ke HRD
[BIG EMERALD BUTTON]  Buka Detail · IDR 49.000

  ↓ small print ↓
  Garansi 7 hari uang kembali. Batalkan kapan saja.
  Slip dihapus 30 hari otomatis (UU PDP).
```

The blurred IDR amount uses the **real calculated total**, just rendered with `filter: blur(8px) saturate(0.6)` and `user-select: none`. Reveal animation on payment success: blur → 0 over 800ms, with a number tick from 0 to the real value.

```tsx
// src/components/wajar-slip/BlurredHeroNumber.tsx
export function BlurredHeroNumber({ amountIdr, isPaid }: { amountIdr: number; isPaid: boolean }) {
  return (
    <div className="text-center">
      <p
        className={`font-mono text-5xl font-extrabold tracking-tight transition-all duration-700 sm:text-6xl ${
          isPaid ? 'text-red-700' : 'select-none text-slate-900 blur-md'
        }`}
        aria-label={isPaid ? `Selisih ${amountIdr} rupiah` : 'Selisih tertutup, klik untuk buka'}
      >
        IDR {amountIdr.toLocaleString('id-ID')}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Total selisih bulan ini</p>
    </div>
  )
}
```

**Per-violation cards** (below the hero number): each card shows the violation code (V01–V07), the user-friendly label, and either a blurred IDR (free) or the real amount + "what to do" (paid). The "what to do" is a 2-step action plan, e.g.:

> *V01 — BPJS JHT tidak dipotong*
> 1. Cetak hasil ini, beri ke HRD/Finance.
> 2. Minta surat tertulis selisih + jadwal koreksi 30 hari.
> Kalau ditolak, lapor ke BPJS Ketenagakerjaan call center 175.

These action plans are gold and they are what makes IDR 49.000 feel like a steal. Spend a week with a labour-law consultant getting them right; do not write them yourself.

### Frame 7 — Pay (Midtrans Snap)

When the user taps "Buka Detail · IDR 49.000", the Midtrans Snap modal opens **inline** without a page navigation. After Snap closes, three outcomes:

- `onSuccess` → unblur the hero number + every violation card with the staggered animation, show success toast, log `paid_at` to dashboard.
- `onPending` → grey-out the upgrade card and show *"Pembayaran sedang diproses. Hasil akan terbuka otomatis dalam ≤5 menit. Refresh untuk cek."* with a polling timer.
- `onError` / `onClose` → revert to the gated state, show toast *"Pembayaran gagal. Coba metode lain?"* (do not auto-redirect).

The current `upgrade/page.tsx` has the Snap initialization but the Wajar Slip verdict page does **not** integrate it inline. Fix: extract Snap loader to `src/lib/midtrans/snap.ts` and import in both places.

### Frame 8 — Post-payment (sustained engagement)

After unblur, show **one** prompt: *"Berhasil! Bagikan link hasil ini ke teman → kamu dapat 1 bulan gratis kalo dia bayar."* This is referral entry; see file 01 §8.

Do **not** redirect to dashboard. The user is in a peak-engagement moment — keep them here.

### Frame 9 — Error states

There are 9 error codes in §1. Each must have:
1. A specific human-readable message in Bahasa Indonesia.
2. A primary action ("Coba lagi" or "Isi manual").
3. A secondary escape ("Kembali").

Example:
```
FILE_TOO_LARGE  → "File lebih dari 5MB. Coba kompres dulu di Adobe Scan / Apple Notes."
                  [Pilih file lain]  [Isi manual]
FILE_TYPE_INVALID → "Hanya PDF/JPG/PNG. File kamu: .docx."
                    [Pilih file lain]  [Isi manual]
OCR_FAILED      → "OCR gagal baca slip. Yuk isi manual — 30 detik selesai."
                  [Isi manual sekarang →]
RATE_LIMITED    → "Sudah 5 audit dalam 1 jam. Tunggu 47 menit lagi atau upgrade."
                  [Upgrade IDR 49K]  [Tunggu]
NETWORK         → "Koneksi terputus. Coba lagi?"  [Coba lagi]
INVALID_CITY    → "Kota '{x}' tidak ada di database UMK kami. Pilih dari daftar."
                  [Pilih kota]
AUTH_REQUIRED   → "Untuk simpan riwayat, masuk dulu. Atau lanjut tanpa simpan."
                  [Masuk]  [Lanjut]
```

Each error must call `track('wajar_slip_error', { code, retried: false })`. Without this we cannot diagnose flow drops.

---

## 3. The Manual Form — When OCR Fails

The current manual form (lines 573–798 of `wajar-slip/page.tsx`) is fine functionally but fails on the most important UX detail: the user is staring at 9 input fields with no idea why they all matter or where to find them on their slip. Add a side panel image: a generic Indonesian payslip with the 4 most-important fields circled. On mobile, this becomes an accordion above the form.

### Field-by-field cleanup

| Field | Issue | Fix |
|-------|-------|-----|
| `grossSalary` | Placeholder `"7.500.000"` is fine but no formatting on input | Use existing `IDRInput` component everywhere, not raw `Input` |
| `ptkpStatus` | 12 options crammed in a select | Add a `?` icon next to the label that opens a tooltip explaining PTKP with examples (single = TK/0, married = K/0, etc.) |
| `city` | Loaded from `/api/cities`, falls back silently to empty | Show skeleton, but if cities fail to load after 3s, surface inline error and let user type free-text (server validates) |
| `monthNumber` / `year` | Two separate selects | Merge to a single MonthYearPicker like Stripe's: tap → calendar grid |
| `hasNPWP` | Two radio buttons with no context | Add tooltip: *"Tanpa NPWP, tarif PPh21 lebih tinggi 20%."* |
| `reportedPph21` etc | Generic placeholders | Use empty placeholder + a "Tidak dipotong? Isi 0" hint below |
| `takeHome` | Often duplicate info; user confused | Add tooltip: *"Take home = gaji yang masuk rekening kamu."* |

### Save-and-resume

If the user spends >30s on the form and navigates away, save the entered fields to `localStorage` under key `cekwajar_slip_draft`. On return, prompt: *"Lanjutkan dari yang kemarin? (5 dari 9 field sudah diisi)"*. After successful audit, clear the draft.

```tsx
// inside the form component
useEffect(() => {
  const draft = localStorage.getItem('cekwajar_slip_draft')
  if (draft) {
    const parsed = JSON.parse(draft)
    if (Date.now() - parsed.savedAt < 7 * 24 * 3600 * 1000) {
      // show resume prompt
    }
  }
}, [])

useEffect(() => {
  const sub = form.watch((values) => {
    localStorage.setItem('cekwajar_slip_draft', JSON.stringify({ values, savedAt: Date.now() }))
  })
  return () => sub.unsubscribe()
}, [form])
```

---

## 4. Server-Side Hardening (`/api/audit-payslip`)

Audit `src/app/api/audit-payslip/route.ts` line by line:

- **L19–35 rate limit:** in-memory `Map` is not durable across Edge instances. Move to `@vercel/kv` (already in deps). 5 req / hour / IP is OK; add a second rule: 20 req / day / authenticated user.
- **L91 IP detection:** `x-forwarded-for` can be spoofed. On Vercel use `request.headers.get('x-real-ip')` first, then `forwarded-for[0]` as fallback. Document the assumption in a comment.
- **L106–113 UMK lookup:** ILIKE `%city%` is dangerous — partial matches return wrong UMK. Match exact lowercase city name against a dedicated `city_canonical` slug. Build the slug at insert time, not at query.
- **No idempotency key:** if a Snap payment retries, a duplicate audit row is inserted. Add `idempotency_key` from client (UUID generated at form mount) and `unique` constraint.
- **No audit cost capture:** add `ocr_cost_usd_micro` field (Vision $1.5/1000 = $0.0015 → 1500 micro-USD). After 1.000 audits we can see cost-per-conversion.

```ts
// reinforced top of POST handler
const idempotencyKey = req.headers.get('idempotency-key')
if (idempotencyKey) {
  const cached = await kv.get<AuditResult>(`idem:${idempotencyKey}`)
  if (cached) return NextResponse.json({ data: cached, cached: true })
}
// … after success:
if (idempotencyKey) await kv.set(`idem:${idempotencyKey}`, result, { ex: 3600 })
```

---

## 5. Calculation Trust Layer

The hero number is only as trusted as the math. Make the math verifiable.

1. **Show the formula on demand.** On the verdict page, every violation card has a "Tunjukkan rumus" affordance. Tapping it expands an explanation:
   > *V01 — BPJS JHT*
   > Aturan: 2% × gaji_pokok = potongan_seharusnya
   > Slip kamu: gaji_pokok = IDR 7.500.000 → seharusnya IDR 150.000
   > Tertulis di slip: IDR 0 → selisih: IDR 150.000
   > Sumber: PP 46/2015 Pasal 16
2. **Link to source documents.** PMK 168/2023 lampiran A, BPJS rate table, UMK SK Gubernur — all hosted in `/regulasi/[slug]` as scanned PDFs with extracted searchable text. This is a one-week build but it converts skeptics to advocates.
3. **Daily smoke test.** `master_analysis §4.4` mandates a nightly cron that runs all 15 test cases (TC-01 through TC-15) against the calculation engine. If any fail, block new audits and page the founder. Implement as Supabase pg_cron + Edge Function.

```sql
-- supabase/migrations/20260427_calc_smoke_test.sql
create or replace function public.run_calc_smoke_test() returns text language plpgsql as $$
declare result text;
begin
  -- delegated to Edge Function; pg_cron simply triggers webhook
  perform net.http_post(
    'https://cekwajar.id/api/cron/calc-smoke-test',
    jsonb_build_object('token', current_setting('app.smoke_token')),
    'application/json'
  );
  return 'queued';
end $$;

select cron.schedule('calc-smoke-test', '0 2 * * *', $$ select public.run_calc_smoke_test() $$);
```

---

## 6. The Verdict Share Card (`@vercel/og`)

After payment, generate an OG image of the verdict for sharing. The user **wants** to share — they just discovered IDR 1 million missing — but currently the only thing they can share is the URL.

```tsx
// src/app/wajar-slip/share/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { id: string } }) {
  const sb = createServiceClient()
  const { data } = await sb
    .from('payslip_audits')
    .select('shortfall_idr, violation_count, city, masked_first_name')
    .eq('id', params.id)
    .single()

  const display = data?.shortfall_idr ? `IDR ${(data.shortfall_idr).toLocaleString('id-ID')}` : 'IDR ███.███'

  return new ImageResponse(
    <div style={{
      height: '100%', width: '100%', padding: 80, display: 'flex',
      flexDirection: 'column', justifyContent: 'space-between',
      background: 'linear-gradient(135deg,#fff5f5 0%,#fee2e2 100%)',
    }}>
      <div style={{ fontSize: 24, color: '#dc2626', letterSpacing: 4, textTransform: 'uppercase' }}>
        cekwajar.id · audit slip gaji
      </div>
      <div>
        <div style={{ fontSize: 38, color: '#7f1d1d' }}>
          {data?.masked_first_name ?? 'Anonim'} di {data?.city ?? 'Indonesia'} menemukan
        </div>
        <div style={{ fontSize: 110, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
          {display}
        </div>
        <div style={{ fontSize: 30, color: '#9f1239' }}>
          yang seharusnya jadi miliknya.
        </div>
      </div>
      <div style={{ fontSize: 22, color: '#6b7280' }}>
        Cek slip gajimu sendiri di cekwajar.id · 30 detik · gratis
      </div>
    </div>,
    { ...size },
  )
}
```

Add a Public/Private toggle: by default the share link 410-Gone after the user closes their browser unless they explicitly click "Bikin link bisa dibagikan". This is the privacy-respecting default.

---

## 7. Telemetry Events to Wire

Every state transition emits an event. Without this, every other section in this plan is shooting in the dark.

| Event | Properties | When |
|-------|------------|------|
| `slip_landed` | `referrer, viewport_width` | IDLE mount |
| `slip_upload_start` | `file_type, file_size_kb` | UPLOADING |
| `slip_upload_progress` | `pct` (sampled at 25/50/75/100) | UPLOADING |
| `slip_ocr_engine` | `engine, confidence` | when each engine returns |
| `slip_confirm_override` | `field, was_value, new_value` | per CONFIRM edit |
| `slip_confirm_accept` | `n_overrides, total_time_ms` | CONFIRM submit |
| `slip_calc_complete` | `verdict, n_violations, shortfall_idr_bucket` | VERDICT mount |
| `slip_gate_view` | `shortfall_idr_bucket, n_violations` | gated VERDICT mount |
| `slip_gate_cta_click` | `shortfall_idr_bucket` | upgrade CTA tap |
| `slip_paid` | `shortfall_idr, plan='pro'` | Snap success |
| `slip_share_card_built` | — | OG generated |
| `slip_error` | `code, retry, time_in_state_ms` | any error |
| `slip_abandon` | `last_state, time_total_ms` | beforeunload |

`shortfall_idr_bucket` is a coarse bucket: `<100K`, `100K-500K`, `500K-1M`, `1M-3M`, `3M+`. Buckets prevent PII leak to analytics provider.

---

## 8. Visual Polish (after functional fixes)

1. The `<DisclaimerBanner>` (currently top of IDLE state) → move into a footer affordance + a `?` tooltip near the H1.
2. The `Cek Slip Gaji →` button at form bottom → use full-width emerald, 56px tall on mobile, 48px on desktop. Match homepage primary.
3. Verdict card backgrounds: `border-red-300 bg-red-50` is OK but red is alarming — soften to `border-red-200 bg-red-50/60` so the user reads the body text first instead of bouncing on alarm color.
4. Replace `<Skeleton shimmer />` inline in the calc button with a proper `<Loader2 className="animate-spin">` — shimmer skeletons are for content-pending, not button-loading.
5. Add `prefers-reduced-motion` respects on every framer-motion stagger.

---

## 9. Acceptance Criteria

- [ ] Six-state machine extracted to `_state.ts` and unit-tested.
- [ ] `CONFIRM` state ships and renders the field-confirmation table.
- [ ] Upload uses XHR with progress events; visible progress bar 0–100%.
- [ ] OCR engine choice is visible; <12s before manual fallback option appears.
- [ ] Verdict variant B (violations) shows a blurred hero IDR amount.
- [ ] Per-violation action plans are written by labour-law consultant, in the database.
- [ ] Midtrans Snap opens inline; success unblurs hero with animation.
- [ ] Share OG image generates at `/wajar-slip/share/[id]`.
- [ ] All 13 telemetry events firing in PostHog (or chosen provider).
- [ ] All 9 error states have specific messages + primary/secondary actions.
- [ ] `/api/audit-payslip` uses `@vercel/kv` rate limiting and idempotency key.
- [ ] Calc smoke test cron live in Supabase, runs daily, alerts on failure.
- [ ] localStorage save-and-resume works for manual form.
- [ ] All 4 multilingual artifacts (Korean/Chinese characters) removed (file 10 §1).
- [ ] Lighthouse mobile ≥90 on `/wajar-slip`.

---

*End of file. Cross-references: `01_revenue_first_repositioning.md` (positioning), `04_paywall_freemium_gate_psychology.md` (the gate moment), `06_trust_authority_credibility.md` (UU PDP modal, source documents), `10_launch_checklist_production_quality.md` (smoke test, bug fixes).*
