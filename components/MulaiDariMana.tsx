"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Banknote, Plane, Scale, Landmark, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    name: "Cek Slip Gaji",
    description: "PPh21, BPJS, & UU Ketenagakerjaan",
    icon: FileText,
    href: "/slip",
    color: "bg-blue-500",
    hover: "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
  },
  {
    name: "Bandingkan Gaji",
    description: "Benchmark industri & percentile",
    icon: Banknote,
    href: "/gaji",
    color: "bg-green-500",
    hover: "hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20",
  },
  {
    name: "Bandingkan Biaya Hidup",
    description: "Daya beli antar kota Indonesia",
    icon: Scale,
    href: "/hidup",
    color: "bg-orange-500",
    hover: "hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
  },
  {
    name: "Cek Harga Properti",
    description: "Harga tanah & indekos wajar?",
    icon: Landmark,
    href: "/tanah",
    color: "bg-stone-500",
    hover: "hover:border-stone-300 hover:bg-stone-50/50 dark:hover:bg-stone-950/20",
  },
  {
    name: "Bandingkan ke Luar Negeri",
    description: "PPP & gaji global",
    icon: Plane,
    href: "/kabur",
    color: "bg-purple-500",
    hover: "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
  },
];

export function MulaiDariMana() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
          <HelpCircle className="h-3 w-3" />
          Bingung mulai dari mana?
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          Pilih kebutuhan Anda
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Kami akan arahkan ke tool yang tepat. Tidak perlu login.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                href={tool.href}
                aria-label={`${tool.name} — ${tool.description}`}
                className={cn(
                  "group block rounded-xl border border-border bg-card p-4 transition-all duration-200",
                  "hover:shadow-md hover:-translate-y-0.5",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  tool.hover
                )}
              >
                <div
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl text-white mb-3",
                    tool.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
