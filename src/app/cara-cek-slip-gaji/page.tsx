import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Cara Cek Slip Gaji — cekwajar.id',
  description:
    'Pelajari cara audit slip gaji kamu sendiri dalam 30 detik. Cek apakah PPh21 dan BPJS dipotong sesuai PMK 168/2023.',
  keywords: [
    'cara cek slip gaji',
    'audit slip gaji online',
    'cek pph21 slip gaji',
    'pmk 168 2023',
    'bpjs salah potong',
  ],
}

export default function CaraCekSlipGajiPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-emerald-700">
            cekwajar.id
          </Link>
          <Link href="/wajar-slip">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              Cek Slip Gaji
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Cara Cek Slip Gaji Online dalam 30 Detik
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Apakah slip gaji kamu sudah dipotong dengan benar? Dengan cekwajar.id, kamu bisa
          audit slip gaji sendiri tanpa perlu ahli pajak — langsung dari HP atau laptop.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Kenapa Perlu Cek Slip Gaji?</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Banyak perusahaan di Indonesia memotong PPh21 dan BPJS karyawan tidak sesuai
              aturan. Tanpa dicek, kamu tidak akan pernah tahu bahwa sebagian gajimu
              diselewengkan.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Rata-rata pengguna menemukan IDR 847.000 yang harusnya jadi miliknya
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                67% slip gaji yang diaudit mengandung setidaknya 1 pelanggaran
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Gratis untuk cek, berbayar hanya untuk lihat detail rupiah
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Yang Dicek oleh cekwajar.id</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="text-slate-700">
                  <strong>PPh21</strong> — Apakah pemotongan pajak sesuai PMK 168/2023?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="text-slate-700">
                  <strong>BPJS JHT</strong> — Apakah 2% dipotong dari gaji kamu?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="text-slate-700">
                  <strong>BPJS JP</strong> — Apakah 1% dipotong dengan ceiling yang benar?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="text-slate-700">
                  <strong>BPJS Kesehatan</strong> — Apakah 1% dipotong sesuai batas?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="text-slate-700">
                  <strong>UMK</strong> — Apakah gaji kamu di atas UMK kota kamu?
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-bold text-slate-900">Langkah-Langkah Cek Slip Gaji</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                step: '1',
                title: 'Buka halaman Wajar Slip',
                desc: 'Klik tombol "Cek Slip Gajiku" di atas atau buka /wajar-slip.',
                icon: Clock,
              },
              {
                step: '2',
                title: 'Upload atau isi manual',
                desc: 'Unggah foto/PDF slip gaji, atau isi langsung 4 angka: gaji bruto, PTKP, kota, bulan.',
                icon: FileText,
              },
              {
                step: '3',
                title: 'Tunggu 30 detik',
                desc: 'Sistem akan menghitung apakah ada pelanggaran dan menampilkan verdict.',
                icon: Clock,
              },
              {
                step: '4',
                title: 'Lihat hasil',
                desc: 'Kalau ada pelanggaran, kamu bisa upgrade ke Pro untuk lihat detail rupiahnya.',
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/wajar-slip">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Mulai Cek Slip Gaji Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Gratis · 30 detik · Tanpa daftar
          </p>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-lg font-bold text-slate-900">Pertanyaan Umum</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: 'Apakah aman?',
                a: 'Sangat aman. File slip gaji langsung dihapus 30 hari setelah diproses. Kami tidak pernah melihat slip kamu secara manual.',
              },
              {
                q: 'Berapa biaya?',
                a: 'Audit gratis. Upgrade ke Pro (IDR 49.000/bulan) hanya kalau kamu mau lihat detail selisih dalam rupiah.',
              },
              {
                q: 'Dasar hukum apa yang digunakan?',
                a: 'PMK 168/2023 untuk PPh21 TER, PP 46/2015 dan PP 45/2015 untuk BPJS, Perpres 82/2018 untuk BPJS Kesehatan.',
              },
              {
                q: 'Apakah hasil audit bisa digunakan untuk klaim?',
                a: 'Hasil audit dari cekwajar.id adalah indikatif. Untuk klaim resmi, silakan hubungi HRD atau konsultan pajak.',
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-medium text-slate-900">{faq.q}</h3>
                <p className="mt-1 text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        <p>&copy; 2026 cekwajar.id · Berdasarkan PMK 168/2023, PP 46/2015, Perpres 82/2018</p>
      </footer>
    </div>
  )
}
