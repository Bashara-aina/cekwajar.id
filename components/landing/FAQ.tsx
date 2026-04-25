"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Apakah data slip gaji saya aman?",
    answer:
      "Ya, keamanan adalah prioritas utama kami. Semua data slip gaji diproses secara anonim — kami tidak menyimpan file slip Anda. Hanya hasil analisis (violations, benchmark) yang disimpan dengan enkripsi end-to-end.",
  },
  {
    question: "Bagaimana V01–V07 violation dideteksi?",
    answer:
      "Sistem kami menggunakan standar PMK 168/2023 untuk menentukan TER (Tarif Efektif Rata-rata). V01–V07 adalah kode untuk jenis pelanggaran spesifik: V01 (gaji di bawah UMK), V02 (BPJS tidak dipotong), V03 (selisih BPJS), V04 (PPh21 salah hitung), V05 (tunjangan tidak dihitung), V06 (lembur tidak dibayar), V07 (benefit tidak sesuai).",
  },
  {
    question: "Berapa biaya langganan?",
    answer:
      "Plan Free gratis selamanya dengan 1 cek slip per bulan. Plan Basic Rp 29K/bulan untuk 5 cek slip. Plan Pro Rp 79K/bulan untuk unlimited cek slip plus akses API dan notifikasi.",
  },
  {
    question: "Apakah ini legal untuk digunakan sebagai bukti?",
    answer:
      "CekWajar.id adalah alat bantu verifikasi, bukan lembaga pemerintah. Namun hasil analisis kami berdasarkan regulasi resmi (UU PPh21, PMK 168/2023, UU BPJS) dan bisa digunakan sebagai dasar negosiasi dengan HR. Untuk kasus sengketa formal, disarankan konsultasi ke pengacara ketenagakerjaan.",
  },
  {
    question: "Benchmark gaji dari mana datanya?",
    answer:
      "Data benchmark gaji kami bersumber dari agregasi data employer yang menyerahkan slip ke BPJS, ditambah survei market salary dari berbagai platform rekrutmen Indonesia. Data diperbarui setiap kuartal.",
  },
  {
    question: "Apakah bisa cek slip untuk freelancer atau PKL?",
    answer:
      "Saat ini kami fokus pada pekerja tetap dengan slip gaji formal. Untuk PKL/magang, cek V01 (gaji di bawah UMK) masih berlaku. Fitur untuk contractor/freelancer sedang dalam pengembangan.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground">
            Still punya pertanyaan? Chat kami di{" "}
            <a href="mailto:hi@cekwajar.id" className="text-primary hover:underline">
              hi@cekwajar.id
            </a>
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-medium text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}