'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Slip gaji saya privacy banget. Apakah aman?',
    answer:
      'Sangat aman. File slip gaji kamu diupload dan langsung diproses di server Singapore (Supabase, ap-southeast-1). Setelah diproses, file otomatis dihapus dalam 30 hari sesuai UU PDP Pasal 20. Data hasil audit hanya disimpan sebagai angka, bukan file asli. Tim cekwajar.id tidak pernah melihat slip gaji kamu secara manual.',
  },
  {
    question: 'Apakah ini benar-benar gratis?',
    answer:
      'Ya, audit slip gaji benar-benar gratis. Kamu bisa lihat apakah ada pelanggaran atau tidak tanpa perlu bayar. Kalau mau lihat detail selisih dalam rupiah, baru perlu upgrade ke Pro seharga IDR 49.000 per bulan. Kalau tidak ada pelanggaran, kamu tidak perlu bayar apapun.',
  },
  {
    question: 'Bagaimana kalau kalkulasinya salah?',
    answer:
      'Perhitungan PPh21 menggunakan PMK 168/2023 dan 6 komponen BPJS sesuai regulasi yang berlaku. Kami sudah Kreuz-check dengan konsultan pajak bersertifikasi (PKP). Kalau kamu menemukan kesalahan, silakan hubungi kami dan kami akan koreksi. Garansi 7 hari uang kembali kalau terbukti ada kesalahan perhitungan.',
  },
  {
    question: 'Bisa untuk slip gaji non-standard? (THR, bonus, freelance)',
    answer:
      'Saat ini cekwajar.id dirancang untuk slip gaji bulanan reguler. Fitur untuk THR, bonus tahunan, dan income non-regular akan kami tambahkan di Q3 2026. Kalau slip kamu tidak termasuk kategori reguler, silakan konsultasikan ke konsultan pajak atau hrdf@cekwajar.id.',
  },
  {
    question: 'Perusahaan saya besar, apakah masih relevan?',
    answer:
      'Tergantung. cekwajar.id mendeteksi pelanggaran berdasarkan regulasi yang berlaku untuk SEMUA perusahaan di Indonesia, baik kecil maupun besar. Tapi untuk perusahaan dengan sistem payroll yang sangat kompleks, ada kemungkinan hasil audit berbeda. Gunakan sebagai acuan awal, bukan pengganti konsultasi dengan HRD atau konsultan pajak.',
  },
  {
    question: 'Data saya digunakan untuk apa?',
    answer:
      'Data slip gaji kamu SEBAGAI NUMERIK SAJA (angka-angka potongan) yang kami gunakan untuk menghitung apakah ada pelanggaran. Kami TIDAK menyimpan file slip asli. Data agregat (tanpa identitas) digunakan untuk meningkatkan akurasi perhitungan dan membuat fitur baru.',
  },
]

export function ObjectionFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Pertanyaan yang Sering Muncul
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Anteseden kekhawatiran kamu, sudah kami jawab di sini
        </p>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => (
            <Card key={i} className={openIndex === i ? 'border-emerald-200 bg-emerald-50/50' : ''}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="pr-4 text-sm font-medium text-slate-900">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-sm leading-relaxed text-slate-700">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
