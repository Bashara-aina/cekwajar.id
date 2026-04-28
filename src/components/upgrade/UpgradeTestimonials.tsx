import { REVENUE_ANCHORS } from '@/lib/constants'

interface Testimonial {
  name: string
  city: string
  role: string
  amount: string
  quote: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rina S.',
    city: 'Jakarta',
    role: 'Staff HR',
    amount: 'IDR 2.340.000',
    quote: 'Nggak nyangka JHT dipotong 3% padahal seharusnya 2%. Setelah kirim skrip ke HRD, uangnya balik dalam 2 minggu.',
  },
  {
    name: 'Ahmad R.',
    city: 'Surabaya',
    role: 'Software Engineer',
    amount: 'IDR 1.870.000',
    quote: 'PPh21-nya overdeducted 6 bulan. audit pertama langsung ketahuan. Recommend banget.',
  },
  {
    name: 'Dewi M.',
    city: 'Bandung',
    role: 'Marketing',
    amount: 'IDR 940.000',
    quote: 'CekWajar nemuin JP yang nggak pernah di-set sama perusahaan. Sekarang udah aktif dan hitung-hitungannya bener.',
  },
]

export function UpgradeTestimonials() {
  return (
    <section className="bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Yang pengguna temukan
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">{t.name} — {t.city}</p>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-sm font-bold text-red-700">{t.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
