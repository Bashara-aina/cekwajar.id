import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'
import { SecurityBadges } from '@/components/legal/SecurityBadges'
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cara Cek Slip Gaji Benar atau Tidak — Panduan Lengkap 2026',
  description:
    'Pelajari 8 komponen wajib slip gaji, cara hitung PPh21 PMK 168/2023, dan cara klaim BPJS yang benar. Audit otomatis dalam 30 detik di cekwajar.id.',
  alternates: { canonical: 'https://cekwajar.id/cara-cek-slip-gaji' },
  openGraph: {
    title: 'Cara Cek Slip Gaji Benar atau Tidak — Panduan Lengkap 2026',
    description: 'Panduan lengkap cek slip gaji: 8 komponen wajib, cara hitung PPh21 TER, dan cara klaim BPJS. Audit otomatis 30 detik.',
    type: 'article',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Cara Cek Slip Gaji Benar atau Tidak — Panduan Lengkap 2026',
  author: { '@type': 'Organization', name: 'cekwajar.id' },
  publisher: {
    '@type': 'Organization',
    name: 'cekwajar.id',
    logo: { '@type': 'ImageObject', url: 'https://cekwajar.id/logo.png' },
  },
  datePublished: '2026-05-01',
  dateModified: new Date().toISOString().split('T')[0],
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://cekwajar.id/cara-cek-slip-gaji' },
}

export default function CaraCekSlipGajiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <FileText className="h-3.5 w-3.5" /> Panduan 2026
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
          Cara Cek Slip Gaji Benar atau Tidak — Panduan Lengkap 2026
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          8 komponen wajib, cara hitung PPh21 PMK 168/2023, dan cara klaim BPJS yang benar. Atau cek otomatis dalam 30 detik — gratis.
        </p>
        <div className="pt-2">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 text-base">
            <Link href="/slip">Audit Slip Gajiku Sekarang →</Link>
          </Button>
        </div>
      </header>

      <AuthorityStrip />

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
        <p className="text-sm font-medium text-emerald-800">
          <strong>TLDR:</strong> Audit otomatis slip gaji di cekwajar.id dalam 30 detik. Atau baca panduan manual di bawah ini.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Apa Saja yang Harus Ada di Slip Gaji yang Benar?</h2>
        <p className="text-slate-600 leading-relaxed">
          Slip gaji yang sah di Indonesia harus memuat minimal 8 komponen utama. Jika salah satu komponen hilang atau nilainya tidak sesuai perhitungan resmi, slip kamu berpotensi bermasalah.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-700">No</th>
                <th className="text-left p-3 font-semibold text-slate-700">Komponen</th>
                <th className="text-left p-3 font-semibold text-slate-700">Dasar Hukum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { no: 1, nama: 'Gaji Pokok', dasar: 'PP 78/2015 jo. PP 46/2022' },
                { no: 2, nama: 'Tunjangan Tetap (Transportasi, Makan, Rumah)', dasar: 'PP 78/2015' },
                { no: 3, nama: 'Tunjangan Tidak Tetap (Lembur, Bonus, THR)', dasar: 'PP 78/2015' },
                { no: 4, nama: 'Iuran BPJS JHT (2% dari employee)', dasar: 'PP 46/2015' },
                { no: 5, nama: 'Iuran BPJS JP (1% dari employee)', dasar: 'PP 46/2015' },
                { no: 6, nama: 'Iuran BPJS Kesehatan (1% dari employee)', dasar: 'Perpres 82/2018' },
                { no: 7, nama: 'PPh 21 TER (bulan efektif)', dasar: 'PMK 168/2023' },
                { no: 8, nama: 'Total Gaji Bersih (Take Home Pay)', dasar: 'PP 78/2015' },
              ].map((row) => (
                <tr key={row.no}>
                  <td className="p-3 text-slate-500">{row.no}</td>
                  <td className="p-3 font-medium text-slate-800">{row.nama}</td>
                  <td className="p-3 text-xs text-slate-500 font-mono">{row.dasar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Cara Menghitung PPh 21 dengan PMK 168/2023 (TER)</h2>
        <p className="text-slate-600 leading-relaxed">
          Sejak 1 Januari 2024, perhitungan PPh 21 di Indonesia berubah drastis dengan sistem Tarif Efektif Monthly (TER). Sebelumnya, perusahaan menghitung PPh 21 berdasarkan Tarif Lapisan (PTKP) yang sering tidak akurat. Sekarang, metode TER menggunakan persentase tetap dari penghasilan bruto per bulan.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="font-semibold text-slate-800">Tarif TER PTKP (per bulan, sejak 2025)</h3>
          {[
            { kategori: 'TK/0 (Tanpa Tanggungan)', tarif: '0%' },
            { kategori: 'TK/1', tarif: '3%' },
            { kategori: 'K/0 (Kawin, 1 tanggungan)', tarif: '3%' },
            { kategori: 'K/2+', tarif: '6%' },
          ].map((t) => (
            <div key={t.kategori} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t.kategori}</span>
              <span className="font-mono font-semibold text-slate-800">{t.tarif}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-semibold text-slate-800 mb-2">Contoh: Andi, TK/0, Gaji Bruto IDR 8.000.000/bulan</h3>
          <div className="space-y-1.5 text-sm text-slate-600 font-mono">
            <p>Gaji bruto: IDR 8.000.000</p>
            <p>PTKP TK/0: Tarif 0% dari bruto</p>
            <p>PPh 21bulan = IDR 8.000.000 × 0% = IDR 0</p>
            <p className="font-semibold text-emerald-700">Take home pay bersih: IDR 8.000.000</p>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Catatan: TER ini hanya untuk penghitungan bulanan. Perusahaan tetap harus melakukan rekonsiliasi tahunan (penghitungan ulang) di akhir tahun untuk memastikan pajak yang dibayar sudah sesuai dengan tarif progresif正式.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Cara Menghitung BPJS yang Benar</h2>
        <p className="text-slate-600 leading-relaxed">
          Banyak perusahaan melakukan kesalahan umum pada perhitungan iuran BPJS. Berikut tarif resmi yang berlaku:
        </p>

        {[
          {
            nama: 'BPJS JHT (Jaminan Hari Tua)',
            rates: [
              { bagian: 'Employee', pct: '2%', dari: 'Gaji pokok + tunjangan tetap' },
              { bagian: 'Employer', pct: '3.7%', dari: 'Gaji pokok + tunjangan tetap' },
            ],
            note: 'Capped di UMK/UMR setempat. Untuk UMK Bekasi 2026: maks IDR 9.559.600/bulan.',
          },
          {
            nama: 'BPJS JP (Jaminan Pensiun)',
            rates: [
              { bagian: 'Employee', pct: '1%', dari: 'Upah tetap' },
              { bagian: 'Employer', pct: '2%', dari: 'Upah tetap' },
            ],
            note: ' juga capped di batas atas UP yang sama dengan JHT.',
          },
          {
            nama: 'BPJS JKK (Jaminan Kecelakaan Kerja)',
            rates: [
              { bagian: 'Employer only', pct: '0.24% – 1.74%', dari: 'Upah tetap, tergantung risiko kerja' },
            ],
            note: 'Tergantung kelas risiko: Rendah 0.24%, Sedang 0.54%, Tinggi 1.74%.',
          },
          {
            nama: 'BPJS JKM (Jaminan Kematian)',
            rates: [
              { bagian: 'Employer only', pct: '0.30%', dari: 'Upah tetap' },
            ],
            note: '',
          },
          {
            nama: 'BPJS Kesehatan',
            rates: [
              { bagian: 'Employee', pct: '1%', dari: 'Upah tetap (max IDR 12.000.000)' },
              { bagian: 'Employer', pct: '4%', dari: 'Upah tetap (max IDR 12.000.000)' },
            ],
            note: 'Batas atas upah: IDR 12.000.000/bulan. Jadi maks iuran BPJS Kesehatan: employee IDR 120.000, employer IDR 480.000.',
          },
        ].map((bpjs) => (
          <div key={bpjs.nama} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-800 mb-2">{bpjs.nama}</h3>
            <div className="space-y-1">
              {bpjs.rates.map((r) => (
                <div key={r.bagian} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{r.bagian}</span>
                  <span className="font-mono font-semibold text-slate-800">{r.pct}</span>
                </div>
              ))}
            </div>
            {bpjs.note && <p className="mt-2 text-xs text-slate-500">{bpjs.note}</p>}
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">5 Tanda Slip Gaji Kamu Bermasalah</h2>
        <div className="space-y-3">
          {[
            {
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              title: 'Tidak ada rincian komponen BPJS',
              desc: 'Slip hanya bilang "BPJS" tanpa breakdown JHT, JP, Kesehatan. Ini tidak sesuai UU 24/2011.',
            },
            {
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              title: 'PPh 21 sama tiap bulan padahal bonus/THR beda',
              desc: 'Jika masuk angin kamu dapat bonus besar tapi PPh 21 tetap sama, berarti perusahaan salah hitung TER.',
            },
            {
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              title: 'Total potongan lebih dari 27% dari gaji bruto',
              desc: 'Max total potongan (BPJS + PPh 21) untuk employee TK/0 seharusnya sekitar 3-4%, bukan 27%.',
            },
            {
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              title: 'Kode TER tidak tercantum',
              desc: 'Perusahaan wajib cantumkan kode TER di slip. Jika tidak ada, perusahaan belum compliance.',
            },
            {
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              title: 'Nama karyawan salah eja atau terlalu generik',
              desc: '"PT. ABC, Karyawan" tanpa nama lengkap adalah tanda slip template yang tidak personalized.',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
              {item.icon}
              <div>
                <p className="font-semibold text-red-800">{i + 1}. {item.title}</p>
                <p className="mt-0.5 text-sm text-red-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Apa yang Harus Dilakukan Jika Menemukan Selisih?</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Screenshot slip + hasil audit cekwajar.id',
              desc: 'Simpan bukti digital berupa slip gaji (PDF/foto) dan hasil audit dari cekwajar.id.',
            },
            {
              step: 2,
              title: 'Ajukan ke HRD secara tertulis',
              desc: 'Kirim email atau surat resmi ke HRD dengan merujuk pada PMK 168/2023 dan ketentuan BPJS yang berlaku. Simpan salinannya.',
            },
            {
              step: 3,
              title: 'Jika diabaikan lebih dari 14 hari, lapor ke BPJSTK Kantor Cabang',
              desc: 'Pengaduan bisa melaluiwebsite bpjs.go.id atau datang langsung ke kantor cabang dengan membawa dokumen pendukung.',
            },
            {
              step: 4,
              title: 'Jika masih diabaikan, laporkan ke Dinas Tenaga Kerja (Disnaker) setempat',
              desc: 'Disnaker berwenang menindak perusahaan yang tidak compliance dengan regulasi ketenagakerjaan.',
            },
          ].map((step) => (
            <div key={step.step} className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {step.step}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{step.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Template email ke HRD:</strong> &ldquo;Dengan hormat, berdasarkan hasil audit slip gaji saya melalui cekwajar.id, saya menemukan beberapa selisih perhitungan PPh 21 dan/atau iuran BPJS yang tidak sesuai dengan PMK 168/2023 dan PP 46/2015. Mohon dapat ditinjau ulang. Terima kasih.&rdquo;
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Audit Otomatis Sekarang (30 Detik)</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Tidak perlu hitung manual. Upload slip gaji, kami yang periksa semua komponen PPh 21 + BPJS dalam 30 detik.
        </p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 text-base font-semibold">
          <Link href="/slip">Cek Slip Gajiku Sekarang →</Link>
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Apakah ini gratis?',
              a: 'Ya, audit dasar (identifikasi ada/tidak ada pelanggaran) gratis untuk semua pengguna. Detail per komponen dan skrip ke HRD memerlukan langganan Pro IDR 49.000/bulan.',
            },
            {
              q: 'Apakah slip saya aman?',
              a: 'Slip gaji diproses oleh OCR dan langsung dihapus dari server dalam 30 hari (UU PDP Pasal 20-21). Tidak ada manusia yang melihat slip kamu.',
            },
            {
              q: 'Berlaku untuk karyawan kontrak/freelance?',
              a: 'Ya. Selama kamu menerima slip gaji, kalkulasi PPh 21 dan BPJS wajib mengikuti PMK 168/2023 dan PP 46/2015, tanpa memandang status kepegawaian.',
            },
            {
              q: 'Bagaimana jika perusahaan menolak mengakui selisih?',
              a: 'Kamu dapat melaporkan ke BPJSTK atau Disnaker setempat. Hasil audit cekwajar.id disertai screenshot bisa menjadi bukti pendukung pengaduan.',
            },
          ].map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-800">{faq.q}</p>
              <p className="mt-1 text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4">
        <SecurityBadges />
      </div>
    </div>
  )
}