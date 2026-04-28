import type { Metadata } from 'next'
import { REVENUE_ANCHORS } from '@/lib/constants'
import './globals.css'

export const metadata: Metadata = {
  title: 'cekwajar.id — Cek Apakah Slip Gajimu Mencuri dari Kamu',
  description: `Upload slip gajimu. Dalam 30 detik tahu apakah PPh21 & BPJS dipotong sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR ${REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')} yang seharusnya jadi miliknya.`,
  keywords: ['cek slip gaji', 'audit pph21', 'bpjs salah potong', 'pmk 168 2023'],
  openGraph: {
    title: 'Slip gajimu mencuri dari kamu? Cek dalam 30 detik.',
    description: `Rata-rata pengguna menemukan IDR ${REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')} yang seharusnya mereka dapat.`,
    locale: 'id_ID',
    type: 'website',
    siteName: 'cekwajar.id',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  )
}