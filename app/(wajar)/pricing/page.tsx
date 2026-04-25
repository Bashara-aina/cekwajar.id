"use client";

import Link from "next/link";
import { CreditCard, CheckCircle2, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TrustBadges } from "@/components/TrustBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "Rp 29K",
    period: "/bulan",
    description: "Kurang dari 1 kopi per hari",
    cta: "Mulai Paket Basic",
    href: "/upgrade?plan=basic",
    featured: true,
    features: [
      "Lihat selisih IDR per komponen (PPh21, JHT, JP, BPJS)",
      "Tabel kalkulasi lengkap dengan metode TER",
      "Rekomendasi tindak lanjut per pelanggaran",
      "Riwayat semua audit tersimpan",
      "Audit slip gaji tanpa batas",
    ],
  },
  {
    name: "Pro",
    price: "Rp 79K",
    period: "/bulan",
    description: "Untuk HRD dan profesional",
    cta: "Mulai Paket Pro",
    href: "/upgrade?plan=pro",
    featured: false,
    features: [
      "Semua fitur Basic",
      "Export PDF laporan audit",
      "Benchmark gaji unlimited (Wajar Gaji)",
      "API akses untuk integrasi",
      "Priority support",
    ],
  },
];

const comparisonData = {
  headers: ["Fitur", "Basic", "Pro"],
  rows: [
    ["Audit slip gaji PPh21 & BPJS", true, true],
    ["Selisih IDR per komponen", true, true],
    ["Tabel kalkulasi TER lengkap", true, true],
    ["Rekomendasi tindak lanjut", true, true],
    ["Riwayat audit tersimpan", true, true],
    ["Export PDF laporan", false, true],
    ["Benchmark gaji unlimited", false, true],
    ["API akses", false, true],
    ["Priority support", false, true],
  ],
};

const faqs = [
  {
    question: "Bagaimana cara upgrade ke paket berbayar?",
    answer:
      "Pilih paket yang sesuai, klik tombol upgrade, dan kamu akan diarahkan ke halaman pembayaran Midtrans. Pembayaran aman dengan berbagai metode (GoPay, OVO, Bank Transfer, dll).",
  },
  {
    question: "Apakah ada biaya tersembunyi?",
    answer:
      "Tidak ada. Harga yang kamu lihat adalah harga yang kamu bayarkan. Tidak ada biaya setup, biaya admin, atau biaya lainnya.",
  },
  {
    question: "Bagaimana kalau selisih PPh21 saya kecil?",
    answer:
      "Even jika selisihnya kecil, memiliki perhitungan yang akurat membantu kamu memahami hak-hak kamu. Jika selisihnya Rp 50K/bulan, break-even terjadi dalam sekitar 2 minggu langganan.",
  },
  {
    question: "Bagaimana kalau saya ingin berhenti?",
    answer:
      "Kamu bisa membatalkan langganan kapan saja tanpa penalties. Tidak ada kontrak jangka panjang.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Ya. Data dienkripsi dengan TLS 1.3 dan dihapus secara otomatis setelah 30 hari. Kami tidak pernah membagikan data pribadi kamu ke pihak ketiga.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        icon={CreditCard}
        title="Paket Berlangganan"
        description="Pilih paket yang sesuai kebutuhan kamu"
      />
      <TrustBadges />

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative",
              plan.featured
                ? "border-2 border-emerald-500 dark:border-emerald-400"
                : ""
            )}
          >
            <CardContent className="pt-6">
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    PALING POPULER
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Paket {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              {/* Value framing */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 mb-4 text-xs text-emerald-700 dark:text-emerald-400">
                💡 Kurang dari 1 kopi per hari. Batal kapan saja.
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "w-full h-12",
                  plan.featured
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
                )}
                variant={plan.featured ? "default" : "outline"}
              >
                <Link href={plan.href}>{plan.cta} →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Perbandingan Fitur</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Fitur
                </th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                  Basic
                </th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.rows.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-3 px-4">{row[0]}</td>
                  <td className="text-center py-3 px-4">
                    {row[1] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {row[2] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          ← Geser untuk melihat semua kolom →
        </p>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pertanyaan Umum</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">{faq.question}</p>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-muted-foreground mb-4">
          Belum yakin?{" "}
          <Link href="/slip" className="text-emerald-600 hover:underline">
            Cek dulu contoh hasil audit slip gaji →
          </Link>
        </p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/upgrade?plan=basic">Mulai Paket Basic — Rp 29K/bulan</Link>
        </Button>
      </div>
    </div>
  );
}