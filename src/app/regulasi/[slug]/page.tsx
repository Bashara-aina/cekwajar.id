import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface RegulationPageProps {
  params: Promise<{ slug: string }>
}

const REGULATIONS: Record<string, {
  title: string
  description: string
  sections: { heading: string; content: string }[]
}> = {
  'pmk-168-2023': {
    title: 'PMK 168/2023 — Metode TER PPh21',
    description: 'Peraturan Menteri Keuangan tentang cara menghitung pajak penghasilan Pasal 21 dengan metode Tarif Efektif Rata-rata (TER).',
    sections: [
      {
        heading: 'Tentang PMK 168/2023',
        content: 'PMK 168/2023 diterbitkan pada 15 Desember 2023 dan mulai berlaku untuk masa pajak Januari 2024. Peraturan ini memperkenalkan metode Tarif Efektif Rata-rata (TER) sebagai alternatif dari metode gross, net, dan gross-up sebelumnya.',
      },
      {
        heading: 'Cara Kerja TER',
        content: 'TER dihitung berdasarkan rata-rata tarif pajak efektif tahunan yang dibulatkan ke bawah ke mata uang penuh terdekat. TER terdiri dari tiga kategori: TER-A untuk PTKP TK/0 dan TK/1, TER-B untuk PTKP TK/2, TK/3, K/1, K/2, dan TER-C untuk PTKP K/3 dan K/I.',
      },
      {
        heading: 'Kelebihan TER',
        content: 'TER menyederhanakan perhitungan PPh21 menjadi satu langkah: gross income × TER = PPh21 bulanan. Tidak perlu lagi menghitung PPh21 tahunan terlebih dahulu kemudian membaginya dengan 12.',
      },
      {
        heading: 'Referensi',
        content: 'Lampiran PMK 168/2023 tersedia di situs DJP (pajak.go.id). Kalkulasi CekWajar menggunakan data dari Lampiran A, B, dan C peraturan ini.',
      },
    ],
  },
  'bpjs': {
    title: 'BPJS — 6 Komponen Iuran',
    description: 'Enam komponen BPJS yang wajib dipotong dari gaji: JHT, JP, JKK, JKM, BPJS Kesehatan, dan BPJS Kesehatan excess.',
    sections: [
      {
        heading: 'JHT (Jaminan Hari Tua)',
        content: 'Iuran JHT ditanggung 2% oleh employee dan 3.7% oleh employer, dihitung dari gaji sampai batas atas Rp 10.547.400 (2025). JHT dapat dicairkan sebagian untuk perumahan.',
      },
      {
        heading: 'JP (Jaminan Pensiun)',
        content: 'Iuran JP ditanggung 1% oleh employee dan 2% oleh employer, dihitung dari gaji sampai batas atas Rp 10.547.400 (2025). JP memberikan manfaat pensiun bulanan setelah mencapai usia pension.',
      },
      {
        heading: 'JKK (Jaminan Kecelakaan Kerja)',
        content: 'Iuran JKK sepenuhnya ditanggung oleh employer, besarannya 0.24%–1.74% dari gaji tergantung risiko pekerjaan. JKK TIDAK boleh dipotong dari employee.',
      },
      {
        heading: 'JKM (Jaminan Kematian)',
        content: 'Iuran JKM sepenuhnya ditanggung oleh employer, besarannya 0.15%–0.30% dari gaji. JKM memberikan manfaat uang tunai jika employee meninggal. JKK TIDAK boleh dipotong dari employee.',
      },
      {
        heading: 'BPJS Kesehatan',
        content: 'Iuran BPJS Kesehatan ditanggung 1% oleh employee dan 4% oleh employer, dihitung dari gaji sampai batas atas Rp 12.000.000. Above cap (gaji di atas Rp 12 juta), employee tetap membayar 1% dari Rp 12 juta.',
      },
    ],
  },
  'umk-2026': {
    title: 'UMK 2026 — Upah Minimum Kabupaten/Kota',
    description: 'Upah minimum berdasarkan SK Gubernur untuk 34 provinsi di Indonesia tahun 2026.',
    sections: [
      {
        heading: 'Tentang UMK',
        content: 'Upah Minimum Kabupaten/Kota (UMK) adalah batas minimum gaji bulanan yang wajib dibayar employer kepada worker di wilayah tersebut. UMK ditetapkan oleh Gubernur melalui SK Gubernur.',
      },
      {
        heading: 'Pelanggaran UMK',
        content: 'Jika gaji bruto lebih rendah dari UMK, perusahaan melanggar PP 36/2021 Pasal 23. Pelanggaran UMK termasuk CRITICAL violation yang wajib dilaporkan ke Dinas Ketenagakerjaan (Disnaker).',
      },
      {
        heading: 'Cek UMK Kamu',
        content: 'Cek UMK berdasarkan kota dan tahun di halaman Wajar Gaji. Data UMK bersumber dari SK Gubernur 34 provinsi untuk tahun 2026.',
      },
    ],
  },
}

export async function generateMetadata({ params }: RegulationPageProps): Promise<Metadata> {
  const { slug } = await params
  const reg = REGULATIONS[slug]
  if (!reg) return {}
  return {
    title: `${reg.title} — cekwajar.id`,
    description: reg.description,
  }
}

export default async function RegulationPage({ params }: RegulationPageProps) {
  const { slug } = await params
  const reg = REGULATIONS[slug]
  if (!reg) notFound()

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/upgrade" className="text-sm text-emerald-600 hover:underline">
            ← Kembali
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{reg.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{reg.description}</p>

        <div className="mt-8 space-y-8">
          {reg.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-base font-semibold text-slate-900">{section.heading}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <Link href="/upgrade" className="text-sm text-emerald-600 hover:underline">
            ← Kembali ke Upgrade
          </Link>
        </div>
      </div>
    </div>
  )
}
