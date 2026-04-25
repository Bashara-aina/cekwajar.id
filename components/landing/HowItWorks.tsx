"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Upload, Search, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Unggah Slip Gaji",
    description:
      "Upload slip gaji Anda dalam format PDF atau foto. Data diproses secara anonim dan tidak disimpan.",
  },
  {
    number: "02",
    icon: Search,
    title: "Analisis Otomatis",
    description:
      "Sistem kami memeriksa kepatuhan PPh21, BPJS, dan membandingkan dengan benchmark industri berdasarkan data BPS.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Dapatkan Hasil",
    description:
      "Lihat pelanggaran TER (V01–V07), bandingkan gaji Anda dengan percentile, dan dapatkan rekomendasi perbaikan.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold tracking-tight mb-4"
          >
            Cara Kerja CekWajar.id
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Tiga langkah mudah untuk mengetahui apakah slip gaji Anda dihitung
            dengan benar
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={{
                  ...fadeInUp,
                  visible: {
                    transition: { delay: i * 0.1, duration: 0.5 },
                  },
                }}
                className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow duration-300"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 mt-2">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connector arrow (hidden on mobile, shown between items on desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      className="text-border"
                    >
                      <path
                        d="M12 8L20 16L12 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}