import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Rina W.',
    city: 'Bekasi',
    role: 'Staff Admin',
    quote:
      'Gak pernah mikir kalo slip gaji bisa salah. Pas cek di Wajar, ketemu violation IDR 1.2jt. Langsung screenshot dan tunjukin ke HRD.',
    amount: 'IDR 1.247.000',
  },
  {
    name: 'Ahmad R.',
    city: 'Surabaya',
    role: 'Software Engineer',
    quote:
      'Dulu kira-gak ada yang salah sama slip saya. Ternyat ada selisih PPh21 yang dipotong berlebihan. Uangnya balik sekitar 400ribu.',
    amount: 'IDR 418.000',
  },
  {
    name: 'Dewi K.',
    city: 'Jakarta',
    role: 'HR Associate',
    quote:
      'Toolsnya jujur. Dari 3 audit saya, 2 menemukan pelanggaran. Dan pas saya hitung ulang, emang bener selisihnya. Worth every rupiah.',
    amount: 'IDR 847.000',
  },
]

export function SocialProofTestimonials() {
  return (
    <section className="bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Cerita dari pengguna yang menemukan uangnya
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="bg-white">
              <CardContent className="p-5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm italic text-slate-700">&quot;{t.quote}&quot;</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.role} · {t.city}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  ↑ {t.amount} ditemukan
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
