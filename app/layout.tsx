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
  title: "cekwajar.id — Cek Gaji Wajar Atau Tidak",
  description:
    "Platform verifikasi keadilan gaji dan biaya hidup di Indonesia. Periksa PPh21, BPJS, benchmark gaji, dan harga properti dengan standar regulasi terkini.",
  keywords: [
    "payslip",
    "pph21",
    "bpjs",
    "gaji",
    "Indonesia",
    "payroll",
    "compliance",
    "benchmark",
    "TER",
  ],
  authors: [{ name: "cekwajar.id" }],
  openGraph: {
    title: "cekwajar.id — Cek Gaji Wajar Atau Tidak",
    description: "Verifikasi keadilan slip gaji Anda dengan 5 alat terintegrasi.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "cekwajar.id — Cek Gaji Wajar Atau Tidak",
    description:
      "Platform verifikasi keadilan gaji dan biaya hidup di Indonesia.",
  },
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
