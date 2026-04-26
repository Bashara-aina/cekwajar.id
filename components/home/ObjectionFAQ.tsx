import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, HelpCircle } from 'lucide-react'

const FAQS = [
  {
    q: 'Slip gaji saya privacy banget. Apakah aman?',
    a: 'Sangat aman. File slip kamu di-upload, langsung di-proses, dan dihapus otomatis setelah 30 hari sesuai UU PDP. Data disimpan di Supabase Singapore, tidak pernah dilihat manusia.',
  },
  {
    q: 'Apakah ini benar-benar gratis?',
    a: 'Audit dasar gratis — kamu lihat ada atau tidaknya pelanggaran. IDR 49K untuk lihat detail rupiah selisih dan langkah konkret ke HRD.',
  },
  {
    q: 'Bagaimana kalau kalkulasinya salah?',
    a: 'Perhitungan didasarkan pada PMK 168/2023 dan 6 komponen BPJS yang diaudit konsultan pajak bersertifikasi PKP. Garansi 7 hari uang kembali tanpa pertanyaan.',
  },
  {
    q: 'Bisa untuk kondisi non-standard? (THR, bonus, freelance)',
    a: 'Launch focus: slip bulanan reguler. THR/bonus akan ditambahkan Q3 2026. Kalau slip kamu bukan format reguler, hubungi kami — akan direfund tanpa diminta.',
  },
]

export function ObjectionFAQ() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Pertanyaan yang mungkin kamu punya</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">{faq.q}</p>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
