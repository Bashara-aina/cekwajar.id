import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { GlobalNav } from '@/components/layout/GlobalNav'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { validateEnvVars } from '@/lib/config/validate'
import { SettingsProvider } from '@/contexts/settings-context'
import { ClientProviders } from '@/components/ClientProviders'

// Validate required env vars on every server component render
validateEnvVars()

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'cekwajar.id — Audit Slip Gaji, Benchmark Gaji & Harga Properti',
  description:
    '5 alat gratis untuk karyawan Indonesia. Audit PPh21 & BPJS, benchmark gaji, dan cek harga properti.',
  keywords: ['gaji', 'slip gaji', 'pph21', 'bpjs', 'Indonesia', 'audit', 'benchmark'],
  openGraph: {
    title: 'cekwajar.id',
    description: 'Audit slip gaji, benchmark gaji & harga properti — gratis.',
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <SettingsProvider>
          <ClientProviders>
            <GlobalNav />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </ClientProviders>
        </SettingsProvider>
      </body>
    </html>
  )
}
