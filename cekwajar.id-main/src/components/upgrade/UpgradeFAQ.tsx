'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_DATA = [
  {
    q: 'Apakah data slip saya benar-benar aman?',
    a: 'Slip dienkripsi at-rest di Supabase Singapore (ap-southeast-1), pemrosesan otomatis (tidak ada manusia yang lihat), dihapus permanen 30 hari sesuai UU PDP Pasal 28.',
  },
  {
    q: 'Bagaimana kalau perhitungan kalian salah?',
    a: 'Mesin kalkulasi diaudit konsultan pajak bersertifikasi PKP sebelum launch, plus tes otomatis tiap malam terhadap 15 kasus standar. Kalau menemukan error, kamu dapat 3 bulan gratis dan kami publikasi koreksi dalam 48 jam.',
  },
  {
    q: 'Bisa batalkan kapan saja?',
    a: 'Ya. Klik "Cancel langganan" di dashboard. Akses Pro tetap aktif sampai akhir periode billing yang sudah dibayar.',
  },
  {
    q: 'Apa yang dipakai untuk refund 7 hari?',
    a: 'Refund otomatis via Midtrans, kembali ke metode pembayaran asal dalam 1×24 jam. Tanpa pertanyaan.',
  },
  {
    q: 'Apakah ini tools tax filing? (SPT, e-Filing)?',
    a: 'Bukan. cekwajar.id adalah tool audit slip gaji. Kami tidak filing pajak kamu, tidak mengakses akun DJP kamu, tidak menggantikan konsultan pajak resmi.',
  },
  {
    q: 'Saya pegawai negeri / freelancer. Apakah bisa pakai?',
    a: 'Untuk launch (Mei 2026), Wajar Slip dioptimalkan untuk slip gaji bulanan reguler dari perusahaan swasta. ASN dan freelance akan ada Q3 2026. Kalau kamu tidak yakin slip kamu didukung, audit gratis dulu — kalau gagal, kamu tidak bayar.',
  },
]

export function UpgradeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-slate-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Pertanyaan Umum
        </h2>
        <div className="mt-6 space-y-2">
          {FAQ_DATA.map((item, i) => (
            <div key={item.q} className="rounded-lg border border-slate-200">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-slate-900">{item.q}</span>
                <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform', openIndex === i && 'rotate-180')} />
              </button>
              {openIndex === i && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-2">
                  <p className="text-sm text-slate-600">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}