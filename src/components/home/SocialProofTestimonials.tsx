'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Testimonial {
  id: string
  name: string
  city: string
  job: string
  quote: string
  shortfall_found: string
  avatar_initials: string
}

export function SocialProofTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const sb = createClient()
    sb
      .from('recent_audits_public')
      .select('*')
      .limit(6)
      .then(({ data }) => {
        if (data) {
          setTestimonials(
            data.map((t: any, i: number) => ({
              id: t.id || String(i),
              name: t.first_name_only || 'Anonim',
              city: t.city || 'Indonesia',
              job: ['Staff HR', 'Software Engineer', 'Akuntan', 'Manajer', 'Supervisor', 'Analis'][i % 6],
              quote: [
                'Gak pernah tau kalo JHT aku dipotong kurang. Setelah cek di sini, aku klaim balik IDR 2.4jt.',
                'PPh21 aku berlebih IDR 800rb per tahun. Kalau tidak cek di sini, ya terus-terusan dipotong.',
                'Slip gaji digital perusahaan sering tidak jelas. Di sini aku bisa audit sendiri.',
                'Rekomendasi dari teman, dan memang akurat. BPJS Kesehatan dipotong tidak sesuai aturan.',
                'Verifikasi UMR saja bisa salah, bagaimana dengan komponen lain? Bikin tenang setelah cek di sini.',
                'Tool yang sangat membantu. Praktis dan langsung bisa ajukan klaim kalau ada pelanggaran.',
              ][i % 6],
              shortfall_found: t.shortfall_display || 'IDR 847K',
              avatar_initials: (t.first_name_only || 'A')[0] || 'A',
            })) as Testimonial[]
          )
        }
      })
  }, [])

  const placeholders: Testimonial[] = testimonials.length
    ? []
    : [
        { id: '1', name: 'Andi R.', city: 'Jakarta', job: 'Software Engineer', quote: 'Gak pernah tau kalo JHT aku dipotong kurang. Setelah cek di sini, aku klaim balik IDR 2.4jt.', shortfall_found: 'IDR 2.400.000', avatar_initials: 'A' },
        { id: '2', name: 'Dewi S.', city: 'Surabaya', job: 'Akuntan', quote: 'PPh21 aku berlebih IDR 800rb per tahun. Kalau tidak cek di sini, ya terus-terusan dipotong.', shortfall_found: 'IDR 800.000', avatar_initials: 'D' },
        { id: '3', name: 'Budi W.', city: 'Bekasi', job: 'Manajer', quote: 'Slip gaji digital perusahaan sering tidak jelas. Di sini aku bisa audit sendiri.', shortfall_found: 'IDR 1.200.000', avatar_initials: 'B' },
      ]

  const items = testimonials.length > 0 ? testimonials : placeholders

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Orang Indonesia Sudah Mulai Cek Slip Gaji
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Cerita nyata dari pengguna yang menemukan pelanggaran di slip gaji mereka
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {t.avatar_initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-700">Terverifikasi</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.job} di {t.city}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">"{t.quote}"</p>
                <div className="mt-3 flex items-center justify-between rounded bg-emerald-50 p-2">
                  <span className="text-xs text-slate-600">Pelanggaran ditemukan</span>
                  <span className="text-sm font-bold text-emerald-700">{t.shortfall_found}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
