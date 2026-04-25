"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SHOW_TESTIMONIALS = process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === "true";

const testimonials = [
  {
    quote:
      "CekWajar.id bantu saya nemuin bahwa slip gaji saya tidak menghitung PPh21 dengan benar. After confront HR, mereka Koreksi dan saya dapat refund Rp 2.4jt.",
    name: "Rina Susilowati",
    role: "Software Engineer, Jakarta",
    avatar: "RS",
    rating: 5,
  },
  {
    quote:
      "Sebagai HR fresh grad, alat ini bantu saya benchmark gaji sebelum negosiasi. Dapat offer yang wajarnya 15% di atas market rate setelah pakai data dari sini.",
    name: "Ahmad Rizki",
    role: "Marketing Associate, Bandung",
    avatar: "AR",
    rating: 5,
  },
  {
    quote:
      "Fitur TER violation detection sangat membantu. V03 dan V05 muncul otomatis — ternyata ada selisih kontribusi BPJS yang tidak dipotong dari gaji, money recovered!",
    name: "Dewi Kartika",
    role: "Finance Analyst, Surabaya",
    avatar: "DK",
    rating: 5,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (!SHOW_TESTIMONIALS) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">1,247+ audit</span> sudah dilakukan oleh pekerja Indonesia
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
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
            Dicintai oleh Pekerja Indonesia
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Ribuan pekerja Indonesia sudah menggunakan CekWajar.id untuk
            memverifikasi keadilan slip gaji mereka
          </motion.p>
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              className="flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-warning text-warning"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-foreground leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
