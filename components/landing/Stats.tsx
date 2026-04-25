"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Shield, TrendingUp, MapPin } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Slip Gaji Diverifikasi",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Shield,
    value: "V01–V07",
    label: "Pelanggaran TER Terdeteksi",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: TrendingUp,
    value: "35",
    label: "Bracket TER (PMK 168/2023)",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: MapPin,
    value: "5+",
    label: "Kota di Indonesia",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="flex flex-col items-center text-center gap-3"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
                >
                  <Icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight font-mono">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}