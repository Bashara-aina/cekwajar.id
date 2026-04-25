import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  description: "Platform verifikasi keadilan gaji dan biaya hidup di Indonesia. Periksa PPh21, BPJS, benchmark gaji, dan harga properti dengan standar regulasi terkini.",
  keywords: ["payslip", "pph21", "bpjs", "gaji", "Indonesia", "payroll", "compliance", "benchmark", "TER"],
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
    description: "Platform verifikasi keadilan gaji dan biaya hidup di Indonesia.",
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
        {children}
      </body>
    </html>
  );
}