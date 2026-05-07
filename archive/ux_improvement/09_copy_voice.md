# 09 — Copy & Microcopy Voice
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: All copy is functional Bahasa Indonesia — accurate but emotionally flat. Loading states say "Menghitung...". Error messages are informational. Violation descriptions are neutral ("PPh21 tidak dipotong sesuai regulasi"). The app sounds like a government tax portal.

## Objective
Define a brand voice constant file. Replace all loading states, error messages, empty states, and violation descriptions with copy that sounds like "a smart friend who knows labor law, speaking up for the employee." Zero new dependencies — pure string replacements.

---

## Task 1: Create Brand Voice Constants File

Create file: `src/lib/copy.ts`

This file is the single source of truth for all user-facing strings in the app.

```ts
/**
 * cekwajar.id Brand Voice
 * ========================
 * Tone: Teman finansial yang tahu hukum ketenagakerjaan.
 * Voice: Berpihak pada karyawan. Bicara seperti teman pintar, bukan portal pemerintah.
 * Never: corporate, passive, blame-shifting, overly formal.
 * Always: specific, actionable, warm, slightly combative on behalf of the user.
 */

export const COPY = {
  // ─── Loading States ─────────────────────────────────────────
  loading: {
    calculating: 'Lagi ngitung PPh21 kamu... ⚡',
    fetchingData: 'Ambil data dari database... 🗺️',
    analyzingSlip: 'AI lagi baca slip gaji kamu...',
    fetchingBenchmark: 'Cari data gaji untuk posisi ini...',
    analyzingProperty: 'Cek harga properti di area tersebut...',
    fetchingPPP: 'Ambil data daya beli dari World Bank...',
    uploadingFile: 'Upload foto slip gaji...',
    ocrProcessing: 'OCR lagi baca teks dari foto kamu...',
    generic: 'Tunggu sebentar...',
  },

  // ─── Success States ──────────────────────────────────────────
  success: {
    sesuai: 'Slip gaji kamu 100% sesuai regulasi ✓',
    sesuaiSub: 'HRD-mu taat aturan bulan ini. Keren! 🎉',
    uploadSuccess: 'Foto berhasil dibaca! Data sudah diisi otomatis.',
    paymentSuccess: 'Pembayaran berhasil! Paket aktif sekarang.',
    submittedSalary: 'Data gaji kamu sudah masuk. Terima kasih kontribusinya! 🙏',
  },

  // ─── Error Messages (with action guidance) ──────────────────
  error: {
    cityNotFound: 'Kota ini belum ada di database UMK kami. Coba kota terdekat, atau pilih dari daftar.',
    invalidNumber: 'Angka ini keliatan kurang pas — coba cek lagi ya.',
    uploadFailed: 'Upload gagal. File terlalu besar atau bukan gambar? Coba lagi atau isi manual di bawah.',
    ocrFailed: 'OCR tidak bisa baca foto ini. Coba foto ulang dengan pencahayaan lebih baik, atau isi manual.',
    ocrLowConfidence: 'Hasil OCR kurang yakin di beberapa angka. Cek dan koreksi dulu sebelum lanjut.',
    networkError: 'Koneksi bermasalah. Cek internet kamu dan coba lagi.',
    noBenchmarkData: 'Belum ada data gaji untuk posisi ini di kota tersebut. Coba kota terdekat atau jabatan yang lebih umum.',
    noPropertyData: 'Belum ada data properti di area ini. Coba kecamatan terdekat.',
    sessionExpired: 'Sesi kamu habis. Login lagi untuk lanjut.',
    genericError: 'Ada yang salah di server kami. Tim sudah dikabari. Coba lagi dalam beberapa menit.',
    formValidation: 'Ada kolom yang belum diisi atau nilainya tidak valid. Cek yang ditandai merah.',
    paymentFailed: 'Pembayaran gagal. Cek detail kartu kamu atau coba metode lain.',
  },

  // ─── Empty States ────────────────────────────────────────────
  empty: {
    auditHistory: 'Belum ada riwayat audit. Mulai cek slip gaji pertama kamu — butuh 30 detik.',
    auditHistoryCTA: 'Audit Slip Gaji Sekarang →',
    noBenchmark: 'Data gaji untuk posisi ini belum tersedia. Jadilah yang pertama kontribusi! 🙌',
    noNotifications: 'Tidak ada notifikasi.',
    noSavedProperties: 'Belum ada properti yang disimpan.',
  },

  // ─── Violation Descriptions ─────────────────────────────────
  violations: {
    V01: {
      title: 'PPh21 Dibulatkan Salah',
      description: 'Pembulatan PPh21 di slip tidak sesuai aturan PMK 168/2023. Selisihnya mungkin kecil, tapi tetap tidak benar secara regulasi.',
      recommendation: 'Tunjukkan perbedaan pembulatan ke HRD dan minta koreksi di slip bulan depan.',
    },
    V02: {
      title: 'PPh21 Tidak Dipotong',
      description: 'HRD kamu tidak memotong PPh21 bulan ini. Ini artinya kewajiban pajak itu tetap ada — kamu yang akan bayar lebih besar di akhir tahun, bukan perusahaan.',
      recommendation: 'Tanyakan ke HRD kenapa PPh21 tidak dipotong. Ini kewajiban perusahaan, bukan pilihan.',
    },
    V03: {
      title: 'PPh21 Dipotong Berlebih',
      description: 'PPh21 yang dipotong lebih besar dari yang seharusnya berdasarkan tarif TER. Kamu membayar pajak lebih dari kewajiban.',
      recommendation: 'Minta HRD untuk rekap dan koreksi selisih PPh21. Kelebihan bisa dikembalikan atau dikompensasi.',
    },
    V04: {
      title: 'JP Karyawan Kurang Dipotong',
      description: 'Jaminan Pensiun yang dipotong dari slip-mu lebih kecil dari 1% seharusnya. Hak pensiun BPJS-mu tidak terpenuhi bulan ini.',
      recommendation: 'Cek apakah perusahaanmu terdaftar BPJS TK. Jika iya, minta rekap iuran JP dari HR.',
    },
    V05: {
      title: 'JHT Karyawan Kurang Dipotong',
      description: 'Jaminan Hari Tua yang dipotong tidak sesuai — seharusnya 2% dari gaji. Ini mempengaruhi saldo JHT kamu yang bisa dicairkan saat resign atau pensiun.',
      recommendation: 'Minta slip BPJS TK untuk cek apakah iuran benar-benar disetorkan sesuai gaji aktual.',
    },
    V06: {
      title: 'Gaji di Bawah UMK — PELANGGARAN HUKUM',
      description: 'Gaji pokokmu berada di bawah Upah Minimum Kota yang berlaku tahun ini. Ini bukan sekadar ketidaksesuaian — ini pelanggaran UU Ketenagakerjaan No.13/2003 Pasal 90. Perusahaan bisa dikenai sanksi pidana.',
      recommendation: 'Kamu berhak melaporkan ini ke Dinas Tenaga Kerja setempat. Simpan bukti slip gaji dan kontrak kerja. Konsultasikan dengan LBH atau Disnaker.',
    },
    V07: {
      title: 'BPJS Kesehatan Kurang Dipotong',
      description: 'Potongan BPJS Kesehatan dari gajimu lebih kecil dari 1% yang seharusnya. Ini bisa mempengaruhi status kepesertaan BPJS Kesehatan aktif kamu.',
      recommendation: 'Cek status kepesertaan BPJS Kesehatan di aplikasi Mobile JKN. Hubungi HR untuk klarifikasi iuran yang dibayarkan.',
    },
  },

  // ─── Verdict Copy ────────────────────────────────────────────
  verdict: {
    sesuai: {
      title: 'Slip Gaji Kamu SESUAI ✓',
      subtitle: 'Semua komponen PPh21 dan BPJS sudah benar.',
      note: 'HRD-mu taat regulasi bulan ini. 🎉',
    },
    pelanggaran: {
      title: (count: number) => `${count} Pelanggaran Ditemukan`,
      subtitle: 'Kamu berhak tahu ini. Cek detail di bawah.',
      critical: 'Ada pelanggaran bersifat KRITIS — segera tindaklanjuti.',
    },
  },

  // ─── Form Copy ────────────────────────────────────────────────
  form: {
    submitSlip: 'Cek Slip Gaji Sekarang',
    submitting: 'Lagi ngitung PPh21 kamu... ⚡',
    uploadBtn: 'Upload Foto Slip Gaji',
    orManual: 'atau isi manual di bawah',
    tryAgain: 'Coba Lagi',
    back: '← Kembali',
    next: 'Lanjut →',
    review: 'Review & Cek',
    optional: '(opsional)',
    notSure: 'Tidak tahu? → gunakan nilai 0',
  },

  // ─── General UI ───────────────────────────────────────────────
  ui: {
    upgradeBtn: 'Upgrade Paket Basic',
    upgradeSubtext: 'Kurang dari 1 kopi per hari',
    shareWA: 'Bagikan ke WhatsApp',
    shareResult: 'Bagikan Hasil',
    seeDetails: 'Lihat Detail',
    hideDetails: 'Sembunyikan',
    learnMore: 'Pelajari lebih lanjut →',
    close: 'Tutup',
    copyLink: 'Salin Link',
    copied: 'Tersalin! ✓',
  },
}
```

---

## Task 2: Update All Loading States

Search the entire codebase for these patterns and replace:

| Find | Replace with |
|------|-------------|
| `"Menghitung..."` | `COPY.loading.calculating` |
| `"Memuat..."` | `COPY.loading.generic` |
| `"Menganalisis..."` | `COPY.loading.analyzingSlip` |
| `"Loading..."` | `COPY.loading.generic` |
| `"Uploading..."` | `COPY.loading.uploadingFile` |
| `"Processing..."` | `COPY.loading.ocrProcessing` |

In each file, add at the top:
```ts
import { COPY } from '@/lib/copy'
```

Then replace the string literals with the constants.

**Specifically in Wajar Slip form submit button:**
```tsx
// BEFORE:
<Button disabled={isLoading}>
  {isLoading ? 'Menghitung...' : 'Cek Sekarang'}
</Button>

// AFTER:
<Button disabled={isLoading}>
  {isLoading ? COPY.loading.calculating : COPY.form.submitSlip}
</Button>
```

---

## Task 3: Update All Error Messages

Search for these patterns in API route handlers, catch blocks, and error state renders:

```tsx
// Pattern to find and replace in catch blocks and error renders:

// BEFORE:
toast({ title: 'Error', description: 'Terjadi kesalahan' })

// AFTER:
toast({ title: 'Ups!', description: COPY.error.genericError, variant: 'destructive' })
```

**Specific replacements to make:**

In OCR error handling:
```tsx
// BEFORE:
'Gagal membaca slip gaji'
// AFTER:
COPY.error.ocrFailed
```

In city not found error:
```tsx
// BEFORE:
'Kota tidak ditemukan dalam database UMK kami'
// AFTER:
COPY.error.cityNotFound
```

In network error catch:
```tsx
// BEFORE:
'Terjadi kesalahan jaringan'
// AFTER:
COPY.error.networkError
```

---

## Task 4: Update Violation Descriptions in UI

Open the ViolationItem component. Find where `violation.description` is rendered. Instead of using the raw database description (which may be technical), map it through the COPY constants:

```tsx
import { COPY } from '@/lib/copy'

// In ViolationItem.tsx:
const violationCopy = COPY.violations[violation.code as keyof typeof COPY.violations]

// Render:
<p className="text-sm font-semibold mb-1">
  {violationCopy?.title ?? violation.title}
</p>
<p className="text-xs text-muted-foreground mb-3">
  {violationCopy?.description ?? violation.description}
</p>
{violationCopy?.recommendation && (
  <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
    <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
    <span>{violationCopy.recommendation}</span>
  </div>
)}
```

---

## Task 5: Update Verdict Text

In the Wajar Slip result section, replace raw verdict strings with COPY constants:

```tsx
import { COPY } from '@/lib/copy'

// SESUAI state:
<h2 className="text-2xl font-bold">
  {COPY.verdict.sesuai.title}
</h2>
<p>{COPY.verdict.sesuai.subtitle}</p>
<p className="text-sm text-muted-foreground">{COPY.verdict.sesuai.note}</p>

// PELANGGARAN state:
<h2 className="text-2xl font-bold">
  {COPY.verdict.pelanggaran.title(violations.length)}
</h2>
<p>{COPY.verdict.pelanggaran.subtitle}</p>
{hasCritical && (
  <p className="text-red-600 font-semibold text-sm">
    {COPY.verdict.pelanggaran.critical}
  </p>
)}
```

---

## Task 6: Update Empty States

In all dashboard and result components where empty states exist:

```tsx
import { COPY } from '@/lib/copy'

// Audit history empty:
<p className="text-muted-foreground">{COPY.empty.auditHistory}</p>
<Button asChild>
  <Link href="/wajar-slip">{COPY.empty.auditHistoryCTA}</Link>
</Button>

// No benchmark data:
<p>{COPY.empty.noBenchmark}</p>
```

---

## Task 7: Update Form Button Labels

Search for submit button text and standardize:

```tsx
// All Wajar Slip submit buttons:
{isLoading ? COPY.loading.calculating : COPY.form.submitSlip}

// All "back" buttons:
{COPY.form.back}

// All "next" buttons:
{COPY.form.next}

// Upload button:
{COPY.form.uploadBtn}

// Or fill manually text:
<p className="text-center text-xs text-muted-foreground">{COPY.form.orManual}</p>
```

---

## Task 8: Add Founder Voice to About/Kontak Page

Open `src/app/kontak/page.tsx`. Replace the current opening content (if it's a generic company description) with the founder letter from `FounderSection` (Task 4 in file 05). If that component was already created, just import and use it.

If the page has a generic "Tentang cekwajar.id" heading, replace the copy:

```tsx
// BEFORE:
<h1>Tentang cekwajar.id</h1>
<p>cekwajar.id adalah platform untuk mengecek kewajaran gaji dan slip gaji di Indonesia.</p>

// AFTER:
<h1>Kenapa cekwajar.id ada?</h1>
<p className="text-lg text-muted-foreground leading-relaxed">
  Karena kebanyakan karyawan Indonesia tidak tahu apakah slip gaji mereka benar — 
  dan tidak ada tools yang mudah untuk mengeceknya.
</p>
<p className="text-muted-foreground leading-relaxed mt-4">
  Saya bikin cekwajar.id karena pernah kena underpay BPJS hampir setahun penuh 
  sebelum sadar. Waktu itu saya tidak tahu harus cek ke mana, dan tidak ada tools 
  yang mudah dipakai orang biasa tanpa latar belakang pajak.
</p>
<p className="text-muted-foreground leading-relaxed mt-4">
  Sekarang kamu tidak perlu ngalamin hal yang sama.
</p>
```

---

## Task 9: Add Copy Voice to Wajar Kabur/Hidup Results

Open `src/app/wajar-kabur/page.tsx`. Find where the PPP comparison result is displayed. Add advocacy-forward copy:

```tsx
// If result shows salary in country is lower in PPP terms:
{pppRatio < 1 && (
  <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
    ⚠️ Secara daya beli, gaji kamu di {targetCountry} setara dengan lebih rendah dari 
    penghasilan saat ini. Pastikan kamu sudah hitung biaya hidup lokal sebelum memutuskan.
  </p>
)}

// If result shows salary is higher in PPP terms:
{pppRatio > 1.2 && (
  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">
    ✓ Secara daya beli, gajimu di {targetCountry} lebih kuat dari sekarang. 
    Ini artinya kamu bisa hidup dengan standar lebih tinggi di sana.
  </p>
)}
```

---

## Acceptance Criteria

- [ ] `src/lib/copy.ts` exists with all COPY constants defined
- [ ] All loading state strings in the app reference COPY constants (no hardcoded "Menghitung..." strings)
- [ ] All error messages reference COPY constants (no hardcoded Indonesian error strings)
- [ ] ViolationItem renders descriptions from COPY.violations (not raw DB strings)
- [ ] V02 description says "HRD kamu tidak memotong PPh21" (not neutral)
- [ ] V06 description includes mention of UU Ketenagakerjaan and legal violation language
- [ ] Verdict text references COPY.verdict constants
- [ ] Kontak/About page has founder-voice opening paragraph
- [ ] All submit buttons use COPY.form constants
- [ ] `npm run build` passes with zero errors
