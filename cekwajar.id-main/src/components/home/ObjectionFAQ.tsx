// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — ObjectionFAQ Component (shadcn Accordion)
// ══════════════════════════════════════════════════════════════════════════════

'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const OBJECTIONS = [
  {
    q: 'Slip gaji saya privacy banget. Apakah aman?',
    a: 'Sangat aman. Ada dua lapisan: (1) Kamu harus consent explicit untuk proses data (UU PDP). (2) File slip gaji dihapus otomatis dari server setelah 30 hari. Kami simpan di Supabase Singapore (ap-southeast-1), tidak pernah dilihat manusia kecuali kamu minta dukungan teknis.',
  },
  {
    q: 'Apakah ini benar-benar gratis?',
    a: 'Audit dasar benar-benar gratis — kamu bisa lihat ada atau tidaknya pelanggaran tanpa bayar. Detail rupiah selisih per komponen (BPJS JHT, PPh21, dll) dan rekomendasi langkah ke HRD ada di level berbayar: IDR 49.000 sekali. Tidak ada langganan, tidak ada tersembunyi biaya.',
  },
  {
    q: 'Bagaimana kalau kalkulasinya salah?',
    a: 'Engine kami dibangun di atas dasar PMK 168/2023 dan 6 komponen resmi BPJS Ketenagakerjaan, telah diaudit oleh konsultan pajak bersertifikasi PKP. Kalau kamu tidak setuju dengan hasil audit, kami refund penuh tanpa pertanyaan dalam 7 hari.',
  },
  {
    q: 'Bisa untuk kondisi non-standard? (THR, bonus tahunan, freelance)',
    a: 'Saat ini launch mendukung hanya slip bulanan reguler (gaji pokok + tunjangan tetap). THR/bonus akan tersedia di Q3 2026. Kalau slip kamu tidak cocok dengan format reguler, hubungi kami dan kami akan refund tanpa diminta.',
  },
]

export function ObjectionFAQ({ className = '' }: { className?: string }) {
  return (
    <section className={`px-4 py-12 ${className}`}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Pertanyaan yang sering ditunda karena ragu
        </h2>

        <Accordion type="single" collapsible className="mt-6 w-full">
          {OBJECTIONS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="px-4 text-left text-sm font-semibold text-slate-900">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <p className="leading-7 text-slate-600">{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
