import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cekwajar.id — Cek Gaji Wajar Atau Tidak",
  description: "Indonesian payroll compliance checker. Periksa PPh21, BPJS, dan slip gaji Anda.",
  keywords: ["payslip", "pph21", "bpjs", "gaji", "Indonesia", "payroll", "compliance"],
  authors: [{ name: "cekwajar.id" }],
  openGraph: {
    title: "cekwajar.id",
    description: "Cek apakah slip gaji Anda dihitung dengan benar",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
