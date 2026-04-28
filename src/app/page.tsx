import Link from 'next/link'
import { ArrowRight, ShieldCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { TrustStrip } from '@/components/home/TrustStrip'
import { LiveAuditTicker } from '@/components/home/LiveAuditTicker'
import { VerdictMockup } from '@/components/home/VerdictMockup'
import { ProofGrid } from '@/components/home/ProofGrid'
import { SocialProofTestimonials } from '@/components/home/SocialProofTestimonials'
import { ObjectionFAQ } from '@/components/home/ObjectionFAQ'
import { FinalCta } from '@/components/home/FinalCta'
import { StickyMobileCTA } from '@/components/home/StickyMobileCTA'
import { ScrollDepth } from '@/components/home/ScrollDepth'

export const revalidate = 60

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <ScrollDepth />
      <StickyMobileCTA />

      <section className="relative bg-gradient-to-b from-amber-50/40 to-white px-4 pt-6 pb-10 sm:pt-10 sm:pb-14">
        <div className="mx-auto max-w-2xl">
          <TrustStrip />

          <div id="hero-sentinel" />

          <h1 className="mt-5 text-balance text-center text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Slip gajimu mencuri{' '}
            <span className="relative whitespace-nowrap text-emerald-600">
              dari kamu
              <svg className="absolute -bottom-1 left-0 h-2 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0 6 Q50 2 100 6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
            ?
          </h1>

          <p className="mt-4 text-center text-base leading-relaxed text-slate-600 sm:text-lg">
            Rata-rata pengguna menemukan{' '}
            <strong className="font-bold text-slate-900">
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </strong>{' '}
            yang seharusnya jadi miliknya. Cek dalam{' '}
            <strong>{REVENUE_ANCHORS.AUDIT_TIME_SECONDS} detik</strong>. Gratis.
          </p>

          <div className="mt-7 flex flex-col items-center gap-2">
            <Link href="/wajar-slip" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 w-full bg-emerald-600 px-8 text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 sm:h-12 sm:w-auto sm:text-sm"
              >
                Cek Slip Gajiku Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Tanpa daftar. Slip dihapus 30 hari (UU PDP).
            </p>
          </div>

          <LiveAuditTicker className="mt-8" />
        </div>
      </section>

      <section className="px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            Kamu akan dapat hasil seperti ini
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Mockup nyata. Angka diburamkan untuk privasi.
          </p>
          <VerdictMockup className="mt-6" />
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            30 detik dari sini sampai jawaban
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { t: '0:00', step: 'Upload slip', detail: 'PDF atau foto. Sistem baca otomatis.' },
              { t: '0:15', step: 'Konfirmasi 4 angka', detail: 'Gaji bruto, PTKP, kota, bulan.' },
              { t: '0:30', step: 'Lihat verdict', detail: 'Pelanggaran ditandai dengan jelas.' },
            ].map((s, i) => (
              <li key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
                  <Clock className="h-3.5 w-3.5" />
                  {s.t}
                </div>
                <p className="mt-2 text-base font-semibold text-slate-900">{s.step}</p>
                <p className="mt-1 text-sm text-slate-500">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <ProofGrid />
        </div>
      </section>

      <SocialProofTestimonials />

      <ObjectionFAQ />

      <FinalCta />
    </div>
  )
}
