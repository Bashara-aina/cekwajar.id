'use client'

// app/gaji/page.tsx
// Two-step salary benchmarking: Step 1 (profile) → Step 2 (salary) → Results
// Client-side calculation using seeded 2026 Indonesian market data

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Banknote, Briefcase, MapPin, Star, CheckCircle2,
  TrendingUp, TrendingDown, Shield, ArrowLeft,
  ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  calculateClientBenchmark,
  getComparableRoles,
  getAllRoles,
  type ClientBenchmarkResult,
  type ComparableRole,
} from '@/lib/engines/client-salary-engine'
import { INDUSTRIES, COMPANY_SIZES, EDUCATION_LEVELS } from '@/lib/schemas/gaji'

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ['Profil Kerja', 'Gaji Anda'] as const
type Step = (typeof STEPS)[number]

const CITIES_GROUPED: { group: string; cities: string[] }[] = [
  { group: 'Jawa', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Malang', 'Tangerang', 'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor', 'Sidoarjo', 'Serang'] },
  { group: 'Sumatera', cities: ['Medan', 'Palembang'] },
  { group: 'Kalimantan', cities: ['Balikpapan', 'Samarinda', 'Pontianak'] },
  { group: 'Sulawesi', cities: ['Makassar', 'Manado'] },
  { group: 'Bali & Nusa Tenggara', cities: ['Denpasar'] },
]

const EXPERIENCE_OPTIONS = [
  { value: '0-2', label: '0-2 tahun' },
  { value: '3-5', label: '3-5 tahun' },
  { value: '6-10', label: '6-10 tahun' },
  { value: '10+', label: '10+ tahun' },
]

const ALL_ROLES = getAllRoles()

// ─── Form Types ────────────────────────────────────────────────────────────

interface Step1Data {
  jobTitle: string
  yearsExperience: string
  industry: string
  city: string
  education: string
  companySize: string
}

interface Step2Data {
  grossMonthly: string
}

interface FormErrors {
  jobTitle?: string
  yearsExperience?: string
  city?: string
  industry?: string
  companySize?: string
  education?: string
  grossMonthly?: string
}

// ─── Formatters ───────────────────────────────────────────────────────────

function formatIDR(amount: number | null): string {
  if (amount == null) return '-'
  return `Rp ${amount.toLocaleString('id-ID')}`
}

function parseIDRInput(raw: string): number {
  return parseInt(raw.replace(/[^\d]/g, ''), 10) || 0
}

// ─── Sub-Components ───────────────────────────────────────────────────────

function RoleAutocomplete({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const filtered =
    query.length < 2
      ? []
      : ALL_ROLES.filter(r =>
          r.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6)

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          onChange(e.target.value)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Ketik nama posisi, contoh: Software Engineer"
        className="w-full"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {filtered.map(r => (
            <button
              key={r.title}
              onMouseDown={() => {
                onChange(r.title)
                setQuery(r.title)
                setOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-800 text-sm">{r.title}</span>
              <span className="ml-2 text-xs text-slate-400">{r.industry}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StepIndicator({
  current,
  steps,
}: {
  current: Step
  steps: readonly string[]
}) {
  const currentIdx = steps.indexOf(current)
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${active ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-slate-300" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PercentileBar({
  percentile,
  p25,
  p50,
  p75,
}: {
  percentile: number
  p25: number
  p50: number
  p75: number
}) {
  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="relative">
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-red-400 via-emerald-400 to-blue-400 transition-all" />
        </div>
        {/* User marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"
          style={{ left: `${Math.min(96, Math.max(4, percentile))}%` }}
        />
      </div>

      {/* Zone labels */}
      <div className="flex justify-between text-xs text-slate-400 px-1">
        <span>0</span>
        <span className="text-red-500 font-medium">Kurang</span>
        <span className="text-emerald-500 font-medium">Wajar</span>
        <span className="text-blue-500 font-medium">Atas</span>
        <span>100</span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4 pt-2 text-center">
        <div>
          <div className="text-sm font-semibold text-slate-700">{formatIDR(p25)}</div>
          <div className="text-xs text-slate-400">P25 Bawah</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-emerald-600">{formatIDR(p50)}</div>
          <div className="text-xs text-slate-400">Median</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-700">{formatIDR(p75)}</div>
          <div className="text-xs text-slate-400">P75 Atas</div>
        </div>
      </div>
    </div>
  )
}

function VerdictBadge({ verdict }: { verdict: ClientBenchmarkResult['verdict'] }) {
  const config = {
    UNDERPAID: {
      label: 'Gaji di Bawah Wajar',
      Icon: TrendingDown,
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500',
    },
    FAIR: {
      label: 'Gaji Wajar',
      Icon: CheckCircle2,
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-500',
    },
    ABOVE_MARKET: {
      label: 'Di Atas Wajar',
      Icon: TrendingUp,
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-500',
    },
  } as const

  const cfg = config[verdict]

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${cfg.bg}`}>
      <cfg.Icon className={`h-8 w-8 ${cfg.icon}`} />
      <div>
        <p className={`text-lg font-bold ${cfg.text}`}>{cfg.label}</p>
        <p className="text-sm text-slate-500">
          {verdict === 'UNDERPAID'
            ? 'Gaji Anda di bawah 25% pekerjan serupa'
            : verdict === 'FAIR'
            ? 'Gaji Anda dalam rentang wajar (P25–P75)'
            : 'Gaji Anda di atas 75% pekerja serupa'}
        </p>
      </div>
    </div>
  )
}

function ComparableCard({
  role,
  index,
}: {
  role: ComparableRole
  index: number
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {index + 1}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{role.title}</p>
          <p className="text-xs text-slate-400">{role.industry}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-700">{formatIDR(role.p50)}</p>
        <p className="text-xs text-slate-400">/bulan</p>
      </div>
    </div>
  )
}

function NegotiationPoints({
  verdict,
  deltaPercent,
  p50,
}: {
  verdict: ClientBenchmarkResult['verdict']
  deltaPercent: number
  p50: number
}) {
  const points = {
    UNDERPAID: [
      'Kumpulkan data: screenshot 3-5 lowongan dengan gaji lebih tinggi',
      'Siapkan pencapaian kuantitatif: target exceeded, revenue generated, proyek launched',
      'Gunakan bahasa: "Berdasarkan benchmark industri, market rate untuk peran ini adalah..."',
      'Fokus pada nilai tambah bisnis, bukan kebutuhan pribadi',
      'Tulis email ke HR dengan data terlampir sebagai leverage',
    ],
    FAIR: [
      'Evaluasi benefit tambahan: tunjangan kesehatan, bonus, equity',
      'Tanyakan timeline promosi dan criteria promotion',
      'Minta formal salary review dalam 6 bulan',
      'Perhatikan stabilitas perusahaan dan budaya kerja',
    ],
    ABOVE_MARKET: [
      'Pertimbangkan menaikan ekspektasi Anda juga saat negosiasi berikutnya',
      'Fokus pada learning budget dan program pengembangan',
      'Pastikan total compensation (bonus, equity) sudah maksimal',
      'Jangan early anchor rendah saat interview nanti',
    ],
  }[verdict]

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-3">
        <Star className="h-4 w-4 text-amber-500" />
        Poin Negosiasi Gaji
      </p>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-slate-300 mt-0.5">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      {verdict === 'UNDERPAID' && deltaPercent !== 0 && (
        <p className="mt-3 text-xs text-slate-500 italic">
          Gap: {formatIDR(p50)} median - gaji Anda {formatIDR(p50)} ({Math.abs(deltaPercent)}% {deltaPercent < 0 ? 'di bawah' : 'di atas'} median)
        </p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function GajiPage() {
  const [step, setStep] = useState<Step>('Profil Kerja')
  const [result, setResult] = useState<ClientBenchmarkResult | null>(null)
  const [comparables, setComparables] = useState<ComparableRole[]>([])
  const [errors, setErrors] = useState<FormErrors>({})

  const [step1, setStep1] = useState<Step1Data>({
    jobTitle: '',
    yearsExperience: '',
    industry: '',
    city: '',
    education: '',
    companySize: '',
  })

  const [step2, setStep2] = useState<Step2Data>({ grossMonthly: '' })

  // ─── Validation ───────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const errs: FormErrors = {}
    if (!step1.jobTitle.trim()) errs.jobTitle = 'Pilih atau ketik judul pekerjaan'
    if (!step1.yearsExperience) errs.yearsExperience = 'Pilih tahun pengalaman'
    if (!step1.city) errs.city = 'Pilih kota'
    if (!step1.industry) errs.industry = 'Pilih industri'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const salary = parseIDRInput(step2.grossMonthly)
    const errs: FormErrors = {}
    if (salary < 100_000) errs.grossMonthly = 'Gaji minimal Rp 100.000'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Navigation ───────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 'Profil Kerja') {
      if (!validateStep1()) return
      setStep('Gaji Anda')
    }
  }

  const handleBack = () => {
    if (step === 'Gaji Anda') {
      setStep('Profil Kerja')
    }
  }

  const handleCalculate = () => {
    if (!validateStep2()) return

    const grossMonthly = parseIDRInput(step2.grossMonthly)
    const benchmarkResult = calculateClientBenchmark({
      jobTitle: step1.jobTitle,
      yearsExperience: parseInt(step1.yearsExperience, 10),
      industry: step1.industry,
      city: step1.city,
      companySize: step1.companySize,
      educationLevel: step1.education,
      grossMonthly,
    })

    const comparableRoles = getComparableRoles(
      step1.jobTitle,
      step1.city,
      parseInt(step1.yearsExperience, 10),
      4
    )

    setResult(benchmarkResult)
    setComparables(comparableRoles)
  }

  // ─── Render ───────────────────────────────────────────────────────────

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-8">
          {/* Back */}
          <button
            onClick={() => {
              setResult(null)
              setStep('Profil Kerja')
            }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Hitung Lagi
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Banknote className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Hasil Benchmark</h1>
              <p className="text-sm text-slate-500">{step1.jobTitle} · {step1.city}</p>
            </div>
          </div>

          {/* Verdict */}
          <div className="mb-4">
            <VerdictBadge verdict={result.verdict} />
          </div>

          {/* Percentile bar */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-slate-800">
                    {result.percentile}
                    <span className="text-lg text-slate-400 font-normal">/100</span>
                  </div>
                  <p className="text-sm text-slate-500">Persentil Anda</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-700">
                    {result.deltaPercent >= 0 ? '+' : ''}{result.deltaPercent}%
                  </p>
                  <p className="text-xs text-slate-400">dari median</p>
                </div>
              </div>
              <PercentileBar
                percentile={result.percentile}
                p25={result.p25}
                p50={result.p50}
                p75={result.p75}
              />
            </CardContent>
          </Card>

          {/* Market range */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Rentang Bawah</p>
                  <p className="text-lg font-semibold text-slate-700">{formatIDR(result.marketRange.min)}</p>
                  <p className="text-xs text-slate-400">P25</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Rentang Atas</p>
                  <p className="text-lg font-semibold text-slate-700">{formatIDR(result.marketRange.max)}</p>
                  <p className="text-xs text-slate-400">P90</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="h-3 w-3" />
                Kalkulasi lokal di browser Anda — tidak dikirim ke server
              </div>
            </CardContent>
          </Card>

          {/* Comparables */}
          {comparables.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Perbandingan Posisi Sejenis
                </h3>
                <div className="space-y-2">
                  {comparables.map((role, i) => (
                    <ComparableCard key={role.title} role={role} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Negotiation points */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <NegotiationPoints
                verdict={result.verdict}
                deltaPercent={result.deltaPercent}
                p50={result.p50}
              />
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Kembali
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Lihat Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Step Form ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <Banknote className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cek Gaji Wajar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Benchmark gaji Anda vs market Indonesia 2026
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* Card */}
        <Card>
          <CardContent className="p-6">
            {step === 'Profil Kerja' && (
              <div className="space-y-5">
                {/* Job Title */}
                <div>
                  <Label htmlFor="jobTitle" className="flex items-center gap-1.5 mb-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    Posisi / Jabatan
                  </Label>
                  <RoleAutocomplete
                    value={step1.jobTitle}
                    onChange={v => setStep1(s => ({ ...s, jobTitle: v }))}
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-xs text-red-500">{errors.jobTitle}</p>
                  )}
                </div>

                {/* Years Experience */}
                <div>
                  <Label htmlFor="yearsExp" className="mb-1.5 block">
                    Pengalaman Kerja
                  </Label>
                  <Select
                    value={step1.yearsExperience}
                    onValueChange={v => setStep1(s => ({ ...s, yearsExperience: v }))}
                  >
                    <SelectTrigger id="yearsExp" className="w-full">
                      <SelectValue placeholder="Pilih tahun pengalaman..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.yearsExperience && (
                    <p className="mt-1 text-xs text-red-500">{errors.yearsExperience}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry" className="mb-1.5 block">
                    Industri
                  </Label>
                  <Select
                    value={step1.industry}
                    onValueChange={v => setStep1(s => ({ ...s, industry: v }))}
                  >
                    <SelectTrigger id="industry" className="w-full">
                      <SelectValue placeholder="Pilih industri..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city" className="flex items-center gap-1.5 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Kota
                  </Label>
                  <Select
                    value={step1.city}
                    onValueChange={v => setStep1(s => ({ ...s, city: v }))}
                  >
                    <SelectTrigger id="city" className="w-full">
                      <SelectValue placeholder="Pilih kota..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES_GROUPED.map(group => (
                        <div key={group.group}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {group.group}
                          </div>
                          {group.cities.map(city => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* Education */}
                <div>
                  <Label htmlFor="education" className="mb-1.5 block">
                    Pendidikan Terakhir
                  </Label>
                  <Select
                    value={step1.education}
                    onValueChange={v => setStep1(s => ({ ...s, education: v }))}
                  >
                    <SelectTrigger id="education" className="w-full">
                      <SelectValue placeholder="Pilih pendidikan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map(edu => (
                        <SelectItem key={edu} value={edu}>
                          {edu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Size */}
                <div>
                  <Label htmlFor="companySize" className="mb-1.5 block">
                    Ukuran Perusahaan
                  </Label>
                  <Select
                    value={step1.companySize}
                    onValueChange={v => setStep1(s => ({ ...s, companySize: v }))}
                  >
                    <SelectTrigger id="companySize" className="w-full">
                      <SelectValue placeholder="Pilih ukuran perusahaan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(size => (
                        <SelectItem key={size} value={size}>
                          {size} karyawan
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Lanjut
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 'Gaji Anda' && (
              <div className="space-y-5">
                {/* Summary */}
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">{step1.jobTitle}</span>
                    {' '}di{' '}
                    <span className="font-semibold text-slate-800">{step1.city}</span>
                    {' '}· {step1.yearsExperience.replace('-', '–')} tahun pengalaman
                  </p>
                </div>

                {/* Gross Monthly */}
                <div>
                  <Label htmlFor="grossMonthly" className="flex items-center gap-1.5 mb-1.5">
                    <Banknote className="h-3.5 w-3.5 text-slate-400" />
                    Gaji Kotor Bulanan (Gross)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      Rp
                    </span>
                    <Input
                      id="grossMonthly"
                      type="text"
                      inputMode="numeric"
                      value={step2.grossMonthly}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^\d]/g, '')
                        setStep2(s => ({
                          ...s,
                          grossMonthly: raw
                            ? parseInt(raw, 10).toLocaleString('id-ID')
                            : '',
                        }))
                      }}
                      placeholder="10.000.000"
                      className="pl-10"
                    />
                  </div>
                  {errors.grossMonthly && (
                    <p className="mt-1 text-xs text-red-500">{errors.grossMonthly}</p>
                  )}
                  <p className="mt-1.5 text-xs text-slate-400">
                    Jumlah bersih sebelum pajak. Isi 0 jika tidak ada.
                  </p>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Perhitungan dilakukan langsung di browser Anda. Data tidak dikirim ke
                    server kami — privasi terjaga 100%.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Kembali
                  </Button>
                  <Button
                    onClick={handleCalculate}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Hitung
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-4 text-center text-xs text-slate-400">
          <p>Data benchmark berdasarkan UMR 2026 + market rate Indonesia</p>
        </div>
      </div>
    </div>
  )
}
