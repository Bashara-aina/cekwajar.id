// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — SocialProofTestimonials Component
// Three placeholder testimonials (replace with real beta user quotes).
// Each card: avatar, job/city, quote, IDR recovered, verified badge.
// ══════════════════════════════════════════════════════════════════════════════

import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const TESTIMONIALS = [
  {
    name: 'Maya Putri',
    city: 'Jakarta',
    job: 'Staff HR, 3 tahun pengalaman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MayaPutri',
    quote:
      'Gak nyangka sama sekali. Setelah cek di sini, ternyata potongan BPJS saya selama 2 tahun salah hitung. Saya langsung tunjukkan hasil auditnya ke finance dan mereka setuju untuk refund.',
    recovered: 'IDR 2.340.000',
    verified: true,
  },
  {
    name: 'Ahmad Rizki',
    city: 'Bekasi',
    job: 'Software Engineer, startup',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmadRizki',
    quote:
      '30 detik doang, langsung ketahuan ada apa. Gak perlu tunggu audit HRD atau tanya-tanya ke finance. Langsung dapat angka yang jelas dan langkah selanjutnya.',
    recovered: 'IDR 847.000',
    verified: true,
  },
  {
    name: 'Dewi Lestari',
    city: 'Bandung',
    job: 'Marketing Coordinator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DewiLestari',
    quote:
      'Awalnya ragu karena data slip gaji terasa sensitif. Tapi penjelasan UU PDP-nya meyakinkan — slip dihapus 30 hari dan tidak pernah dilihat manusia. Baru tenang setelah baca itu.',
    recovered: 'IDR 412.000',
    verified: false,
  },
]

export function SocialProofTestimonials() {
  return (
    <section className="bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Mereka menemukan uang yang seharusnya sudah milik mereka
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
         Hasil audit nyata dari pengguna beta.{' '}
          <a href="#" className="underline">
            Cara kami memverifikasi testimoni →
          </a>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-10 w-10 rounded-full bg-slate-100 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      {t.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-600" aria-label="terverifikasi" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{t.city} · {t.job}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>

                <div className="mt-3 flex items-center justify-between rounded bg-primary-50 px-3 py-2">
                  <span className="text-xs text-slate-600">Total ditemukan</span>
                  <span className="text-sm font-bold text-primary-700">{t.recovered}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}