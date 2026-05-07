import type { Metadata } from 'next'
import { Suspense } from 'react'
import { UpgradeHero } from '@/components/upgrade/UpgradeHero'
import { UpgradeValueCard } from '@/components/upgrade/UpgradeValueCard'
import { UpgradeDemo } from '@/components/upgrade/UpgradeDemo'
import { UpgradePricingCard } from '@/components/upgrade/UpgradePricingCard'
import { UpgradeTestimonials } from '@/components/upgrade/UpgradeTestimonials'
import { UpgradePriceJustify } from '@/components/upgrade/UpgradePriceJustify'
import { UpgradeHowWeCalculate } from '@/components/upgrade/UpgradeHowWeCalculate'
import { UpgradeRefundExplain } from '@/components/upgrade/UpgradeRefundExplain'
import { UpgradeFAQ } from '@/components/upgrade/UpgradeFAQ'
import { UpgradeFinalCta } from '@/components/upgrade/UpgradeFinalCta'

export const metadata: Metadata = {
  title: 'Buka Detail Slip Gajimu — IDR 49.000 / bulan · cekwajar.id',
  description:
    'Lihat detail rupiah selisih + skrip ke HRD. Garansi 7 hari uang kembali. Pembayaran via Midtrans.',
  alternates: { canonical: 'https://cekwajar.id/upgrade' },
  openGraph: {
    title: 'Pro IDR 49.000 — Buka detail slip gajimu',
    description: 'Garansi 7 hari uang kembali. Batalkan kapan saja.',
    type: 'website',
  },
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Apakah data slip saya benar-benar aman?',
      acceptedAnswer: { '@type': 'Answer', text: 'Slip dienkripsi at-rest di Supabase Singapore (ap-southeast-1), pemrosesan otomatis (tidak ada manusia yang lihat), dihapus permanen 30 hari sesuai UU PDP Pasal 28.' },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana kalau perhitungan kalian salah?',
      acceptedAnswer: { '@type': 'Answer', text: 'Mesin kalkulasi diaudit konsultan pajak bersertifikasi PKP sebelum launch, plus tes otomatis tiap malam terhadap 15 kasus standar. Kalau menemukan error, kamu dapat 3 bulan gratis dan kami publikasi koreksi dalam 48 jam.' },
    },
    {
      '@type': 'Question',
      name: 'Bisa batalkan kapan saja?',
      acceptedAnswer: { '@type': 'Answer', text: 'Ya. Klik "Cancel langganan" di dashboard. Akses Pro tetap aktif sampai akhir periode billing yang sudah dibayar.' },
    },
    {
      '@type': 'Question',
      name: 'Apa yang dipakai untuk refund 7 hari?',
      acceptedAnswer: { '@type': 'Answer', text: 'Refund otomatis via Midtrans, kembali ke metode pembayaran asal dalam 1×24 jam. Tanpa pertanyaan.' },
    },
    {
      '@type': 'Question',
      name: 'Apakah ini tools tax filing? (SPT, e-Filing)?',
      acceptedAnswer: { '@type': 'Answer', text: 'Bukan. cekwajar.id adalah tool audit slip gaji. Kami tidak filing pajak kamu, tidak mengakses akun DJP kamu, tidak menggantikan konsultan pajak resmi.' },
    },
    {
      '@type': 'Question',
      name: 'Saya pegawai negeri / freelancer. Apakah bisa pakai?',
      acceptedAnswer: { '@type': 'Answer', text: 'Untuk launch (Mei 2026), Wajar Slip dioptimalkan untuk slip gaji bulanan reguler dari perusahaan swasta. ASN dan freelance akan ada Q3 2026. Kalau kamu tidak yakin slip kamu didukung, audit gratis dulu — kalau gagal, kamu tidak bayar.' },
    },
  ],
}

export default function UpgradePage() {
  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <UpgradeHero />
      <UpgradeValueCard />
      <UpgradeDemo />
      <Suspense fallback={<div className="h-[420px] animate-pulse rounded-2xl bg-slate-100 mx-4 my-12" />}>
        <UpgradePricingCard />
      </Suspense>
      <UpgradeTestimonials />
      <UpgradePriceJustify />
      <UpgradeHowWeCalculate />
      <UpgradeRefundExplain />
      <UpgradeFAQ />
      <UpgradeFinalCta />
    </div>
  )
}