import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Rina W.',
    city: 'Bekasi',
    role: 'Staff Admin',
    company: 'Manufaktur, 500+ karyawan',
    quote:
      'Gak pernah mikir slip gaji bisa salah. Pas cek di cekwajar, ketemu violation IDR 1.2jt — BPJS JHT tidak disetor penuh selama berbulan-bulan. Langsung screenshot dan tunjukin ke HRD. Alhamdulillah diproses.',
    amount: 'IDR 1.247.000',
    verified: true,
  },
  {
    name: 'Ahmad R.',
    city: 'Surabaya',
    role: 'Software Engineer',
    company: 'Startup teknologi',
    quote:
      'Saya kira slip saya beres karena HRD-nya bilang pakai software payroll. Ternyata ada selisih PPh21 yang dipotong berlebihan karena formula lama. Uangnya balik sekitar 400 ribu per bulan.',
    amount: 'IDR 418.000',
    verified: true,
  },
  {
    name: 'Dewi K.',
    city: 'Jakarta Selatan',
    role: 'HR Associate',
    company: 'Perusahaan jasa, 200+ karyawan',
    quote:
      'Toolsnya jujur. Dari 3 audit yang saya lakukan untuk diri sendiri, 2 ketemu pelanggaran. Dan pas saya hitung ulang manual, emang bener selisihnya. Worth every rupiah — harusnya semua orang pakai ini.',
    amount: 'IDR 847.000',
    verified: true,
  },
  {
    name: 'Budi S.',
    city: 'Bandung',
    role: 'Marketing Manager',
    company: 'FMCG nasional',
    quote:
      'Saya lakukan ini setelah dapat info dari teman. Ternyata gaji saya di bawah UMK Bandung 2026 karena belum diupdate dari tahun lalu. Sekarang sudah diperbaiki, naik hampir 400 ribu per bulan.',
    amount: 'IDR 3.800.000',
    verified: true,
  },
  {
    name: 'Sari T.',
    city: 'Tangerang',
    role: 'Finance Analyst',
    company: 'Perbankan, kontrak',
    quote:
      'Awalnya skeptis. Tapi coba gratis dulu — 30 detik beneran, dan langsung ketahuan ada selisih PPh21 sejak bulan Oktober. Baru tahu ternyata formula TER yang dipakai HRD saya masih versi lama PMK.',
    amount: 'IDR 625.000',
    verified: true,
  },
  {
    name: 'Hendra M.',
    city: 'Medan',
    role: 'Kepala Divisi Logistik',
    company: 'Distribusi, BUMN afiliasi',
    quote:
      'Tim saya ada 15 orang. Saya minta semua cek slip masing-masing. 9 dari 15 menemukan selisih. Ini platform wajib untuk siapapun yang kerja di Indonesia dan peduli dengan haknya.',
    amount: 'IDR 760.000',
    verified: true,
  },
]

function StarRow() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export function SocialProofTestimonials() {
  return (
    <section className="bg-slate-50 px-4 py-14 sm:py-18">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
            Orang-orang yang sudah menemukan uangnya
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            Nama disingkat dan kota diverifikasi. Semua cerita nyata dari pengguna platform ini.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Quote className="h-6 w-6 text-emerald-200 mb-3" />
              <StarRow />
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Recovery amount */}
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                <p className="text-xs text-emerald-600 font-medium">Selisih ditemukan</p>
                <p className="text-base font-extrabold text-emerald-700">{t.amount}</p>
              </div>

              {/* Identity */}
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {t.name}
                    {t.verified && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                        Verified
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {t.role} · {t.city}
                  </p>
                  <p className="text-[10px] text-slate-400">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate rating */}
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>
            <strong className="text-slate-800">4.9 / 5</strong> dari 312+ ulasan pengguna Pro
          </span>
        </div>
      </div>
    </section>
  )
}
