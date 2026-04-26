import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LayoutBanner } from "@/components/LayoutBanner";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "cekwajar.id — Cek Apakah Slip Gajimu Mencuri dari Kamu",
  description:
    "Upload slip gajimu. Dalam 30 detik tahu apakah PPh21 & BPJS dipotong sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR 847.000 yang seharusnya jadi miliknya — sebelum perusahaan tahu kamu cek.",
  keywords: [
    "cek slip gaji",
    "audit pph21",
    "bpjs salah potong",
    "pmk 168 2023",
    "gaji dipotong tidak wajar",
    "cek bpjs ketenagakerjaan",
    "jht jp salah",
    "kalkulator pph21",
    "slip gaji palsu",
    "umk 2026",
  ],
  openGraph: {
    title: "Slip gajimu mencuri dari kamu? Cek dalam 30 detik.",
    description:
      "Audit gratis PPh21 + BPJS sesuai PMK 168/2023. Rata-rata pengguna menemukan IDR 847.000 yang seharusnya mereka dapat.",
    locale: "id_ID",
    type: "website",
    siteName: "cekwajar.id",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slip gajimu mencuri dari kamu? Cek dalam 30 detik.",
    description: "Rata-rata pengguna menemukan IDR 847.000 yang harusnya mereka dapat.",
  },
  alternates: { canonical: "https://cekwajar.id" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} min-h-full flex flex-col antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Langsung ke konten utama
        </a>
        <LayoutBanner />
        <main id="main-content" className="pb-16 md:pb-0">{children}</main>
        <MobileBottomNav />
        <CookieConsent />
      </body>
    </html>
  );
}
