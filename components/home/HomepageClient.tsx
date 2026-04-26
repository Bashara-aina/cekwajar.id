'use client'

import { ArrowRight, ShieldCheck, Clock, FileText, Banknote, Plane, Scale, Landmark } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { TrustStrip } from '@/components/home/TrustStrip'
import { LiveAuditTicker } from '@/components/home/LiveAuditTicker'
import { VerdictMockup } from '@/components/home/VerdictMockup'
import { ProofGrid } from '@/components/home/ProofGrid'
import { WhyItHappensSection } from '@/components/home/WhyItHappensSection'
import { SocialProofTestimonials } from '@/components/home/SocialProofTestimonials'
import { PricingSection } from '@/components/home/PricingSection'
import { GuaranteeSection } from '@/components/home/GuaranteeSection'
import { ObjectionFAQ } from '@/components/home/ObjectionFAQ'
import { FinalCta } from '@/components/home/FinalCta'
import { StickyMobileCTA } from '@/components/home/StickyMobileCTA'
import { ScrollDepth } from '@/components/home/ScrollDepth'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const TOOLS = [
  {
    href: '/slip',
    icon: FileText,
    name: 'Wajar Slip',
    desc: 'Audit PPh21 & BPJS slip gajimu',
    accent: 'bg-amber-500/10 text-amber-700 border-amber-200',
    badge: 'Paling Populer',
  },
  {
    href: '/gaji',
    icon: Banknote,
    name: 'Wajar Gaji',
    desc: 'Benchmark gaji industri P25–P90',
    accent: 'bg-blue-500/10 text-blue-700 border-blue-200',
    badge: null,
  },
  {
    href: '/tanah',
    icon: Landmark,
    name: 'Wajar Tanah',
    desc: 'Verifikasi harga properti vs pasar',
    accent: 'bg-stone-500/10 text-stone-700 border-stone-200',
    badge: null,
  },
  {
    href: '/kabur',
    icon: Plane,
    name: 'Wajar Kabur',
    desc: 'Bandingkan daya beli 20+ negara',
    accent: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    badge: null,
  },
  {
    href: '/hidup',
    icon: Scale,
    name: 'Wajar Hidup',
    desc: 'Hitung biaya hidup vs gajimu',
    accent: 'bg-teal-500/10 text-teal-700 border-teal-200',
    badge: null,
  },
]

export function HomepageClient() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ══════════ ABOVE THE FOLD ══════════ */}
      <section className="relative bg-gradient-to-b from-emerald-50/50 via-white/90 to-white px-4 pt-8 pb-12 sm:pt-14 sm:pb-16 overflow-hidden">
        {/* Radial glow + subtle grid */}
        <div className="hero-glow pointer-events-none" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <TrustStrip />

          <h1 className="mt-6 text-balance text-center text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Slip gajimu{' '}
            <span className="relative inline-block text-red-600">
              mencuri
              <svg
                className="absolute -bottom-1 left-0 h-2 w-full"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path d="M0 6 Q25 1 50 5 Q75 9 100 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            dari kamu?
          </h1>

          <p className="mt-5 text-center text-base leading-relaxed text-slate-600 sm:text-lg">
            Rata-rata pengguna menemukan{' '}
            <strong className="font-extrabold text-slate-900">
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </strong>{' '}
            yang seharusnya jadi miliknya.{' '}
            <span className="text-slate-500">
              Cek dalam <strong className="text-slate-700">{REVENUE_ANCHORS.AUDIT_TIME_SECONDS} detik</strong>. Gratis.
            </span>
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="h-14 w-full bg-emerald-600 px-8 text-base font-bold shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 sm:w-auto"
              asChild
            >
              <Link href="/slip">
                Cek Slip Gajiku — Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Tanpa daftar · Slip dihapus 30 hari (UU PDP) · Tidak ada manusia yang melihat
            </p>
          </div>

          <LiveAuditTicker className="mt-8" />

          <div id="hero-sentinel" />
        </div>
      </section>

      {/* ══════════ VERDICT MOCKUP ══════════ */}
      <section className="px-4 py-12 sm:py-16" id="tools">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Hasil yang akan kamu terima
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Contoh nyata. Angka disamarkan untuk privasi — kamu yang buka nanti.
            </p>
          </div>
          <VerdictMockup className="mt-2" />
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-slate-50 px-4 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            {REVENUE_ANCHORS.AUDIT_TIME_SECONDS} detik dari sini sampai jawaban
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Tidak perlu daftar. Langsung upload atau isi manual.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: '0:00',
                step: 'Upload slip gaji',
                detail: 'PDF atau foto. OCR baca otomatis dalam 3–8 detik.',
                done: false,
              },
              {
                t: '0:15',
                step: 'Konfirmasi 4 angka',
                detail: 'Gaji bruto, status PTKP, kota, bulan. OCR sudah prefill.',
                done: false,
              },
              {
                t: '0:30',
                step: 'Lihat verdict lengkap',
                detail: 'Ada/tidak pelanggaran. Pro: rupiah pastinya + skrip ke HRD.',
                done: false,
              },
            ].map((s, i) => (
              <li key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 mb-3">
                  <Clock className="h-3.5 w-3.5" />
                  {s.t}
                </div>
                <p className="text-base font-bold text-slate-900">{s.step}</p>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 text-center">
            <Link href="/slip">
              <Button className="bg-emerald-600 font-semibold hover:bg-emerald-700">
                Coba Sekarang — Gratis <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ PROOF GRID ══════════ */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl mb-8">
            Angka yang bicara sendiri
          </h2>
          <ProofGrid />
        </div>
      </section>

      {/* ══════════ WHY IT HAPPENS ══════════ */}
      <WhyItHappensSection />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <SocialProofTestimonials />

      {/* ══════════ ALL TOOLS ══════════ */}
      <section className="px-4 py-14 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Platform keadilan finansial untuk pekerja Indonesia
            </h2>
            <p className="mt-2 text-sm text-slate-500">5 tools. Semua gratis untuk cek dasar.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${tool.accent}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tool.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{tool.name}</p>
                      {tool.badge && (
                        <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{tool.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <PricingSection />

      {/* ══════════ GUARANTEE ══════════ */}
      <GuaranteeSection />

      {/* ══════════ FAQ ══════════ */}
      <ObjectionFAQ />

      {/* ══════════ FINAL CTA ══════════ */}
      <FinalCta />

      <Footer />

      <StickyMobileCTA />
      <ScrollDepth />
    </div>
  )
}
