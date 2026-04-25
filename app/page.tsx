"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Banknote,
  Plane,
  Scale,
  Landmark,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/landing/Navbar";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

const tools = [
  {
    name: "Wajar Slip",
    description:
      "Audit slip gaji Anda — cek kepatuhan PPh21 & BPJS dengan standar PMK 168/2023 terbaru.",
    icon: FileText,
    href: "/slip",
    color: "bg-blue-500",
    badge: "PPh21 + BPJS",
  },
  {
    name: "Wajar Gaji",
    description:
      "Bandingkan gaji Anda dengan benchmark industri berdasarkan posisi, lokasi, dan pengalaman.",
    icon: Banknote,
    href: "/gaji",
    color: "bg-green-500",
    badge: "Salary Benchmark",
  },
  {
    name: "Wajar Kabur",
    description:
      "Analisis PPP dan biaya hidup antar kota di Indonesia — tahu persis kota mana yang lebih murah.",
    icon: Plane,
    href: "/kabur",
    color: "bg-purple-500",
    badge: "PPP Analysis",
  },
  {
    name: "Wajar Hidup",
    description:
      "Bandingkan biaya hidup: makan, sewa, transportasi, dan tagihan bulanan di berbagai kota.",
    icon: Scale,
    href: "/hidup",
    color: "bg-orange-500",
    badge: "Cost of Living",
  },
  {
    name: "Wajar Tanah",
    description:
      "Cek apakah harga properti di lokasi tertentu wajar berdasarkan data pasar terkini.",
    icon: Landmark,
    href: "/tanah",
    color: "bg-red-500",
    badge: "Property Index",
  },
];

const plans = [
  {
    name: "Free",
    price: "Rp 0",
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
    price: "Rp 29K",
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
    price: "Rp 79K",
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

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] },
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center">
        {/* Trust badge above headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          Trusted by 10,000+ Indonesian workers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
        >
          Cek Gaji Anda{" "}
          <span className="text-primary">Wajar</span> Atau Tidak
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-4"
        >
          Platform verifikasi keadilan gaji untuk pekerja Indonesia
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto max-w-2xl text-base text-muted-foreground mb-10"
        >
          5 alat terintegrasi untuk audit slip gaji, bandingkan gaji dengan
          benchmark industri, hitung biaya hidup, dan cek harga properti —
          semua dari satu tempat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" asChild className="gap-2">
            <Link href="#tools">
              Mulai Sekarang — Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">Lihat Pricing</Link>
          </Button>
        </motion.div>

        {/* Data source badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-12"
        >
          <span className="text-xs text-muted-foreground">
            Data bersumber dari:
          </span>
          {["BPS Indonesia", "World Bank", "PMK 168/2023"].map((source) => (
            <Badge key={source} variant="outline" className="text-xs font-normal">
              {source}
            </Badge>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <Stats />

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold tracking-tight mb-4"
          >
            Semua Tool yang Anda Butuhkan
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Pilih alat yang sesuai kebutuhan Anda. Semua gratis untuk
            memulai.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                variants={fadeInUp}
              >
                <Link
                  href={tool.href}
                  className="group block rounded-2xl border border-border p-6 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tool.color} text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tool.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Gunakan tool
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 border-t border-border">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold tracking-tight mb-4"
          >
            Pilihan Plan yang Fleksibel
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground"
          >
            Mulai gratis, upgrade kapan saja. Tanpa kartu kredit.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i}
              variants={fadeInUp}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 bg-card"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-sm">
                    Populer
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold tracking-tight font-mono">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  /{plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm"
                  >
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular ? "" : "variant-outline"
                }`}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href="#tools">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </div>
  );
}