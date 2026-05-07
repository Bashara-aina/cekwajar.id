import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { GlobalNav } from '@/components/layout/GlobalNav'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { validateEnvVars } from '@/lib/config/validate'
import { SettingsProvider } from '@/contexts/settings-context'
import { ClientProviders } from '@/components/ClientProviders'
import { ThemeProvider } from '@/components/ThemeProvider'

// Validate required env vars on every server component render
// Skip during build (env vars injected at deploy time)
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnvVars()
  } catch {
    // Env vars injected at deploy time; allow build to proceed
  }
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const viewport: Metadata['viewport'] = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'cekwajar.id — Cek Apakah Slip Gajimu Mencuri dari Kamu',
  description:
    'Upload slip gajimu. Dalam 30 detik tahu apakah PPh21 & BPJS dipotong sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR 847.000 yang seharusnya jadi miliknya.',
  keywords: [
    'cek slip gaji', 'audit pph21', 'bpjs salah potong', 'pmk 168 2023',
    'gaji dipotong tidak wajar', 'cek bpjs ketenagakerjaan', 'jht jp salah',
    'kalkulator pph21 ter', 'slip gaji palsu', 'umk 2026',
  ],
  openGraph: {
    title: 'Slip gajimu mencuri dari kamu? Cek dalam 30 detik.',
    description:
      'Audit gratis PPh21 + BPJS sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR 847.000 yang seharusnya mereka dapat.',
    locale: 'id_ID',
    type: 'website',
    siteName: 'cekwajar.id',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'cekwajar.id — Audit Slip Gaji' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slip gajimu mencuri dari kamu? Cek dalam 30 detik.',
    description: 'Rata-rata pengguna menemukan IDR 847.000 yang harusnya mereka dapat.',
    images: ['/og-default.png'],
  },
  alternates: { canonical: 'https://cekwajar.id' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <ClientProviders>
              <GlobalNav />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
              <CookieConsent />
            </ClientProviders>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
