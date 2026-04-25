"use client";

import { FileText, Banknote, Plane, Scale, Landmark, Check } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    name: "Wajar Slip",
    description: "Audit payslip Anda — cek kepatuhan PPh21 & BPJS dengan standar regulasi terkini.",
    icon: FileText,
    href: "/slip",
    color: "bg-blue-500",
  },
  {
    name: "Wajar Gaji",
    description: "Bandingkan gaji Anda dengan benchmark industri berdasarkan posisi, lokasi, dan pengalaman.",
    icon: Banknote,
    href: "/gaji",
    color: "bg-green-500",
  },
  {
    name: "Wajar Kabur",
    description: "Analisis PPP dan biaya hidup antar kota di Indonesia — tahu persis kota mana yang lebih murah.",
    icon: Plane,
    href: "/kabur",
    color: "bg-purple-500",
  },
  {
    name: "Wajar Hidup",
    description: "Bandingkan biaya hidup: makan, sewa, transportasi, dan tagihan bulanan di berbagai kota.",
    icon: Scale,
    href: "/hidup",
    color: "bg-orange-500",
  },
  {
    name: "Wajar Tanah",
    description: "Cek apakah harga properti di lokasi tertentu wajar berdasarkan data pasar terkini.",
    icon: Landmark,
    href: "/tanah",
    color: "bg-red-500",
  },
];

const plans = [
  {
    name: "Free",
    price: "IDR 0",
    period: "selamanya",
    description: "Cukup untuk pengecekan pertama.",
    features: [
      "1 cek slip per bulan",
      "Benchmark gaji dasar",
      "Perbandingan 2 kota",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Basic",
    price: "IDR 29K",
    period: "per bulan",
    description: "Untuk pekerja yang ingin cek secara rutin.",
    features: [
      "5 cek slip per bulan",
      "Benchmark gaji lengkap",
      "Perbandingan 5 kota",
      "Export PDF",
    ],
    cta: "Ambil Basic",
    popular: false,
  },
  {
    name: "Pro",
    price: "IDR 79K",
    period: "per bulan",
    description: "Full access untuk HR dan individu yang serius.",
    features: [
      "Unlimited cek slip",
      "Semua benchmark + grafik tren",
      "Semua kota + export CSV",
      "Akses API + notifikasi",
    ],
    cta: "Ambil Pro",
    popular: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">cekwajar.id</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#tools" className="hover:text-black dark:hover:text-white transition-colors">Tools</a>
            <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <a href="/slip" className="hover:text-black dark:hover:text-white transition-colors">Masuk</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Cek Gaji Anda Wajar Atau Tidak
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 mb-4">
          Gratuity公平 checker untuk pekerja Indonesia
        </p>
        <p className="mx-auto max-w-2xl text-base text-zinc-500 dark:text-zinc-500 mb-10">
          5 alat terintegrasi untukAudit slip gaji, bandingkan gaji, hitung biaya hidup, dan cek harga properti — semua dari satu tempat.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#tools"
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang — Gratis
          </a>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-8 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Lihat Pricing
          </a>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Semua Tool yang Anda Butuhkan</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Pilih alat yang sesuai kebutuhan Anda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group block rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tool.color} text-white mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Pilihan Plan yang Fleksibel</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Mulai gratis, upgrade kapan saja</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-blue-500 dark:border-blue-500 shadow-lg shadow-blue-500/10"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex h-6 items-center rounded-full bg-blue-500 px-3 text-xs font-semibold text-white">
                    Populer
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-zinc-500">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm text-zinc-500 ml-1">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full h-11 rounded-full text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">
            © 2026 cekwajar.id — Gratuity公平 untuk pekerja Indonesia
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Tentang</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privasi</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}