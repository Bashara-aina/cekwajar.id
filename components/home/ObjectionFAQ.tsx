'use client'

import { useState } from 'react'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'Slip gaji saya sangat privat. Apakah aman?',
    a: 'Sangat aman. File slip di-upload langsung ke server Singapore (AWS ap-southeast-1), diproses oleh OCR otomatis, dan dihapus permanen setelah 30 hari sesuai UU PDP No.27/2022. Tidak ada manusia yang pernah melihat slip kamu — hanya mesin. Data dienkripsi saat transit dan saat disimpan.',
  },
  {
    q: 'Apakah audit dasar benar-benar gratis?',
    a: 'Ya, selamanya. Audit dasar (ada/tidak pelanggaran, jumlah pelanggaran) tidak pernah berbayar. Upgrade ke Pro untuk tahu angka pastinya — berapa rupiah per komponen — dan mendapat skrip langkah ke HRD. Tidak ada batas penggunaan gratis.',
  },
  {
    q: 'Apa yang terjadi kalau audit saya tidak menemukan pelanggaran?',
    a: 'Kamu dapat konfirmasi bahwa slip kamu sesuai PMK 168/2023 dan aturan BPJS bulan ini. Ini juga informasi berharga — kamu tahu HRD-mu benar. Tidak perlu upgrade kalau tidak ada pelanggaran yang ditemukan.',
  },
  {
    q: 'Bagaimana kalau kalkulasinya salah?',
    a: 'Perhitungan menggunakan tabel TER resmi PMK 168/2023 dan 6 komponen BPJS yang diaudit konsultan pajak bersertifikasi PKP. Metodologi tersedia untuk dibaca di halaman regulasi. Kalau kamu yakin ada kesalahan, email kami dan kami investigasi dalam 24 jam. Garansi 7 hari uang kembali berlaku tanpa pertanyaan.',
  },
  {
    q: 'Slip saya non-standard (THR, bonus, freelance). Bisa?',
    a: 'Fokus saat ini adalah slip gaji bulanan reguler (pekerja tetap/kontrak). THR dan bonus akan ditambahkan Q3 2026. Untuk freelance/outsource, hubungi kami terlebih dahulu — kalau tidak bisa diproses, refund tanpa diminta.',
  },
  {
    q: 'Apakah hasil audit ini bisa digunakan sebagai bukti hukum?',
    a: 'Hasil audit cekwajar adalah referensi berbasis regulasi, bukan dokumen hukum resmi. Untuk keperluan hukum formal (laporan ke Disnaker, sengketa kerja), kamu perlu konsultasi dengan konsultan pajak atau pengacara ketenagakerjaan. Hasilnya bisa digunakan sebagai dasar diskusi awal dengan HRD.',
  },
  {
    q: 'Kenapa saya harus percaya angka di sini?',
    a: 'Semua kalkulasi transparan dan berdasarkan regulasi publik yang bisa kamu verifikasi sendiri: PMK 168/2023 (PPh21 TER), PP No.44/2015 (BPJS Ketenagakerjaan), dan Perpres BPJS Kesehatan. Metodologi lengkap tersedia di halaman /regulasi. Kami tidak punya insentif untuk merekayasa angka — ini platform berbasis kepercayaan.',
  },
  {
    q: 'Bagaimana cara membatalkan Pro?',
    a: 'Dari dashboard akun kamu → Settings → Cancel Subscription. Berlaku langsung, tidak ada biaya tambahan. Kamu tetap bisa mengakses fitur Pro sampai akhir periode yang sudah dibayar.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-900 leading-snug">{q}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 mt-0.5 text-slate-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  )
}

export function ObjectionFAQ() {
  return (
    <section id="faq" className="px-4 py-14 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Pertanyaan yang sering ditanyakan
          </h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Masih ada pertanyaan?{' '}
          <a href="mailto:hi@cekwajar.id" className="text-emerald-600 hover:underline font-medium">
            Email kami
          </a>{' '}
          — founder baca dan balas sendiri dalam 24 jam.
        </p>
      </div>
    </section>
  )
}
