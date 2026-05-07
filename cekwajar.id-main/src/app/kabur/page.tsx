'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — WAJAR KABUR (Resignation Feasibility Calculator)
// Two-step form: Step 1 (finances) → Step 2 (work history) → Runway Result
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
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
import { SeveranceBreakdown } from '@/components/kabur/SeveranceBreakdown'
import { RunwayGauge } from '@/components/kabur/RunwayGauge'
import { VerdictCard } from '@/components/kabur/VerdictCard'
import { kaburFormSchema, formToApiPayload, type KaburFormValues } from '@/lib/schemas/kabur'
import type { KaburVerdict } from '@/app/wajar-kabur/_state'

// ─── Animation variants ────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-40%' : '40%', opacity: 0 }),
}

// ─── Step schemas (inline with useForm — avoids type inference mismatches) ─────────

const step1Schema = z.object({
  monthlySalary: z.string().min(1, 'Wajib diisi'),
  monthlyExpenses: z.string().min(1, 'Wajib diisi'),
  savings: z.string().min(1, 'Wajib diisi'),
  outstandingDebtsMonthly: z.string().optional(),
})

const step2Schema = z.object({
  masaKerjaYears: z.string().min(0),
  resignationType: z.enum(['resign', 'phk', 'pkwt_expire'] as const),
  dependentsCount: z.string().min(0),
  optionalJhtBalance: z.string(),
  optionalInvestmentValue: z.string(),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

// ─── Currency formatter ───────────────────────────────────────────────────────

function fmtIDR(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

// ─── Step 1 ────────────────────────────────────────────────────────────────

function Step1Form({
  onNext,
}: {
  onNext: (values: Step1Values) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      monthlySalary: '',
      monthlyExpenses: '',
      savings: '',
      outstandingDebtsMonthly: '0',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="monthlySalary">
          Gaji Bulanan (Gaji Pokok + Tunjangan)
        </Label>
        <Input
          id="monthlySalary"
          type="text"
          inputMode="numeric"
          placeholder="Rp 10.000.000"
          {...register('monthlySalary')}
          className={errors.monthlySalary ? 'border-red-400' : ''}
        />
        {errors.monthlySalary && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.monthlySalary.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monthlyExpenses">Pengeluaran Bulanan</Label>
        <Input
          id="monthlyExpenses"
          type="text"
          inputMode="numeric"
          placeholder="Rp 5.000.000"
          {...register('monthlyExpenses')}
          className={errors.monthlyExpenses ? 'border-red-400' : ''}
        />
        {errors.monthlyExpenses && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.monthlyExpenses.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="savings">Tabungan / Dana Darurat</Label>
        <Input
          id="savings"
          type="text"
          inputMode="numeric"
          placeholder="Rp 20.000.000"
          {...register('savings')}
          className={errors.savings ? 'border-red-400' : ''}
        />
        {errors.savings && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.savings.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="outstandingDebtsMonthly">
          Cicilan Utang per Bulan{' '}
          <span className="font-normal text-slate-400">(opsional)</span>
        </Label>
        <Input
          id="outstandingDebtsMonthly"
          type="text"
          inputMode="numeric"
          placeholder="Rp 0"
          {...register('outstandingDebtsMonthly')}
        />
      </div>

      <Button type="submit" className="w-full gap-2">
        Lanjut
        <ChevronRight className="h-4 w-4" />
      </Button>
    </form>
  )
}

// ─── Step 2 ────────────────────────────────────────────────────────────────

function Step2Form({
  initialValues,
  onBack,
  onCalculate,
  submitting,
}: {
  initialValues: Step1Values
  onBack: () => void
  onCalculate: (values: KaburFormValues) => void
  submitting: boolean
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      masaKerjaYears: '0',
      resignationType: 'phk',
      dependentsCount: '0',
      optionalJhtBalance: '',
      optionalInvestmentValue: '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((step2) => {
        const merged: KaburFormValues = {
          monthlySalary: initialValues.monthlySalary,
          monthlyExpenses: initialValues.monthlyExpenses,
          savings: initialValues.savings,
          outstandingDebtsMonthly: initialValues.outstandingDebtsMonthly ?? '0',
          masaKerjaYears: Number(step2.masaKerjaYears),
          resignationType: step2.resignationType,
          dependentsCount: Number(step2.dependentsCount),
          optionalJhtBalance: step2.optionalJhtBalance || '',
          optionalInvestmentValue: step2.optionalInvestmentValue || '',
        }
        onCalculate(merged)
      })}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <Label htmlFor="masaKerjaYears">
          Masa Kerja (Tahun)
        </Label>
        <Input
          id="masaKerjaYears"
          type="number"
          min={0}
          max={50}
          placeholder="3"
          {...register('masaKerjaYears')}
          className={errors.masaKerjaYears ? 'border-red-400' : ''}
        />
        {errors.masaKerjaYears && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.masaKerjaYears.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resignationType">Jenis PHK / Resign</Label>
        <Controller
          name="resignationType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                id="resignationType"
                className={errors.resignationType ? 'border-red-400' : ''}
              >
                <SelectValue placeholder="Pilih jenis perpisahan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phk">
                  PHK (Termination / Dipecat)
                </SelectItem>
                <SelectItem value="pkwt_expire">
                  PKWT Habis (Kontrak Berakhir)
                </SelectItem>
                <SelectItem value="resign">
                  Mundur / Resign (Quit Sukarela)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.resignationType && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.resignationType.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dependentsCount">
          Jumlah Tanggungan (Anak / Pasangan){' '}
          <span className="font-normal text-slate-400">(untuk catatan)</span>
        </Label>
        <Input
          id="dependentsCount"
          type="number"
          min={0}
          max={10}
          placeholder="0"
          {...register('dependentsCount')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="optionalJhtBalance">
          Saldo JHT (BPJS){' '}
          <span className="font-normal text-slate-400">(opsional)</span>
        </Label>
        <Input
          id="optionalJhtBalance"
          type="text"
          inputMode="numeric"
          placeholder="Rp 10.000.000"
          {...register('optionalJhtBalance')}
        />
        <p className="text-xs text-slate-400">
          Jika kosong, akan diestimasi dari gaji dan masa kerja.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="optionalInvestmentValue">
          Nilai Investasi / Aset Liquid Lain{' '}
          <span className="font-normal text-slate-400">(opsional)</span>
        </Label>
        <Input
          id="optionalInvestmentValue"
          type="text"
          inputMode="numeric"
          placeholder="Rp 0"
          {...register('optionalInvestmentValue')}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button
          type="submit"
          className="flex-1 gap-2"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menghitung...
            </>
          ) : (
            <>
              <Plane className="h-4 w-4" />
              Hitung Runway
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// ─── Result view ──────────────────────────────────────────────────────────

function ResultView({
  verdict,
  onReset,
}: {
  verdict: KaburVerdict
  onReset: () => void
}) {
  const { breakdown } = verdict

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <VerdictCard verdictData={verdict} />

      <RunwayGauge
        runwayMonths={breakdown.runwayMonths}
        totalLiquidAssets={breakdown.totalLiquidAssets}
        monthlyBurnRate={breakdown.monthlyBurnRate}
        currencyFmt={fmtIDR}
      />

      <SeveranceBreakdown
        severance={breakdown.severanceBreakdown}
        currencyFmt={fmtIDR}
      />

      {/* Monthly Burn Detail */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rincian Biaya Bulanan
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Pengeluaran</span>
              <span className="font-medium text-slate-800">
                {fmtIDR(breakdown.monthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Cicilan utang</span>
              <span className="font-medium text-slate-800">
                {fmtIDR(breakdown.outstandingDebtsMonthly)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">BPJS Kesehatan mandiri (estimasi)</span>
              <span className="font-medium text-slate-800">
                {fmtIDR(breakdown.bpjsMandiriMonthlyEstimate)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold">
              <span className="text-slate-800">Total biaya bulanan</span>
              <span className="text-emerald-700">
                {fmtIDR(breakdown.monthlyBurnRate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JHT Info */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Saldo JHT
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {breakdown.jhtWithdrawal.eligible
                  ? 'Bisa dicairkan sekarang'
                  : 'Belum bisa dicairkan'}
              </p>
              <p className="text-xs text-slate-500">
                {breakdown.jhtWithdrawal.reason}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-slate-800">
              {fmtIDR(breakdown.jhtWithdrawal.amountIDR)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-700">
          <strong>Disclaimer:</strong> Hasil bersifat indikatif berdasarkan PP 35/2021 &amp; UU BPJS.
          Pajak pesangon dihitung sendiri. Konsultasikan dengan akuntan untuk kepastian.
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={onReset}
      >
        Hitung Lagi
      </Button>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function KaburPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [direction, setDirection] = useState(1)
  const [step1Values, setStep1Values] = useState<Step1Values | null>(null)
  const [verdict, setVerdict] = useState<KaburVerdict | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStep1Next = (values: Step1Values) => {
    setStep1Values(values)
    setDirection(1)
    setStep(2)
  }

  const handleBack = () => {
    setDirection(-1)
    setStep(1)
  }

  const handleReset = () => {
    setStep(1)
    setStep1Values(null)
    setVerdict(null)
    setError(null)
  }

  const handleCalculate = async (values: KaburFormValues) => {
    setSubmitting(true)
    setError(null)

    try {
      const payload = formToApiPayload(values)

      const res = await fetch('/api/kabur/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(
          json.message ?? json.error?.message ?? 'Terjadi kesalahan server'
        )
      }

      setVerdict(json.data as KaburVerdict)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-full bg-emerald-100 p-3">
              <Plane className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            WaJat — Kabur?
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bisa nggak kamu resign sekarang?
          </p>
        </div>

        {/* Step indicator */}
        {!verdict && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-slate-400">
              Langkah {step} dari 2
            </span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result view */}
        {verdict ? (
          <ResultView verdict={verdict} onReset={handleReset} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {step === 1 ? (
                    <div>
                      <h2 className="mb-4 text-base font-semibold text-slate-800">
                        Keuangan Kamu
                      </h2>
                      <Step1Form onNext={handleStep1Next} />
                    </div>
                  ) : (
                    <div>
                      <h2 className="mb-4 text-base font-semibold text-slate-800">
                        Riwayat Kerja &amp; Jenis PHK
                      </h2>
                      {step1Values && (
                        <Step2Form
                          initialValues={step1Values}
                          onBack={handleBack}
                          onCalculate={handleCalculate}
                          submitting={submitting}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* Info footer */}
        {!verdict && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              <strong>Catatan:</strong> Resign sukarela (quit) tidak mendapat
              uang pesangon — hanya UPMK jika masa kerja &gt; 3 tahun. PHK
              dan PKWT habis mendapat pesangon penuh.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
