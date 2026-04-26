import { ShieldCheck, Clock, HeartHandshake, RotateCcw } from 'lucide-react'

const PILLARS = [
  {
    icon: ShieldCheck,
    label: 'Garansi 7 hari',
    sub: 'Uang kembali penuh',
  },
  {
    icon: Clock,
    label: 'Refund < 24 jam',
    sub: 'Proses langsung',
  },
  {
    icon: HeartHandshake,
    label: 'Tanpa pertanyaan',
    sub: 'Kebijakan jujur',
  },
  {
    icon: RotateCcw,
    label: 'Batalkan kapan saja',
    sub: 'Tanpa kontrak',
  },
]

export function GuaranteeSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-12 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border-2 border-emerald-200 bg-white px-6 py-8 sm:px-8 text-center shadow-sm">
          {/* Shield icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            Garansi 7 Hari Uang Kembali
          </h2>
          <p className="mt-3 text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
            Coba Pro selama 7 hari. Kalau kamu tidak puas — apapun alasannya —
            kami refund 100%. Tidak ada proses panjang, tidak ada pertanyaan.
            Cukup email sekali.
          </p>

          {/* Pillars */}
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.label} className="text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{p.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{p.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Fine print */}
          <p className="mt-6 text-xs text-slate-400">
            Email{' '}
            <a
              href="mailto:refund@cekwajar.id"
              className="text-emerald-600 hover:underline font-medium"
            >
              refund@cekwajar.id
            </a>{' '}
            kapan saja dalam 7 hari pertama. Garansi berlaku untuk pembelian pertama per akun.
          </p>
        </div>
      </div>
    </section>
  )
}
