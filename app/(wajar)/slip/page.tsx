"use client"

import { useConsentStatus } from '@/lib/hooks/useConsentStatus'
import { PdpConsentGate } from '@/components/legal/PdpConsentGate'
import { useReducer, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import {
  FileText,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { TrustBadges } from '@/components/TrustBadges'
import { HowItWorks } from '@/components/HowItWorksTool'
import { Paywall } from '@/components/Paywall'
import { ShareVerdictButton } from '@/components/ShareVerdictButton'
import { CrossToolSuggestion } from '@/components/CrossToolSuggestion'
import { AuthorityStrip } from '@/components/legal/AuthorityStrip'
import { BlurredHeroNumber } from '@/components/wajar-slip/BlurredHeroNumber'
import { ConfirmExtractedFields } from '@/components/wajar-slip/ConfirmExtractedFields'
import { slipReducer, track, bucketShortfall } from './_state'
import type { ExtractedFields, AuditResult } from './_state'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2024, i, 1).toLocaleString('id-ID', { month: 'long' })
)

const PTKP_OPTIONS = [
  { value: 'TK0', label: 'TK0 — Tidak Kawin' },
  { value: 'K0', label: 'K0 — Kawin' },
  { value: 'K1', label: 'K1 — Kawin + 1 tanggungan' },
  { value: 'K2', label: 'K2 — Kawin + 2 tanggungan' },
  { value: 'K3', label: 'K3 — Kawin + 3 tanggungan' },
]

// ─── XHR Upload ────────────────────────────────────────────────────────────────

function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
  onComplete: (filePath: string) => void,
  onError: (code: string, message: string) => void
) {
  const xhr = new XMLHttpRequest()
  const fd = new FormData()
  fd.append('file', file)

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) onProgress((e.loaded / e.total) * 100)
  }

  xhr.onload = () => {
    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText)
      onComplete(res.filePath ?? res.path ?? '')
    } else if (xhr.status === 413) {
      onError('FILE_TOO_LARGE', 'File lebih dari 5MB. Coba kompres dulu di Adobe Scan atau Apple Notes.')
    } else if (xhr.status === 415) {
      onError('FILE_TYPE_INVALID', 'Hanya PDF/JPG/PNG yang didukung.')
    } else {
      onError('OCR_FAILED', 'Gagal upload slip. Coba lagi.')
    }
  }

  xhr.onerror = () => onError('NETWORK', 'Koneksi terputus. Coba lagi.')
  xhr.open('POST', '/api/ocr/upload')
  xhr.send(fd)
}

// ─── Save & Resume ────────────────────────────────────────────────────────────

const DRAFT_KEY = 'cekwajar_slip_draft'

interface SlipDraft {
  values: Record<string, string>
  savedAt: number
}

function saveDraft(values: Record<string, string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, savedAt: Date.now() }))
}

function loadDraft(): SlipDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as SlipDraft
    if (Date.now() - draft.savedAt > 7 * 24 * 3600 * 1000) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return draft
  } catch {
    return null
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_KEY)
}

// ─── Manual Form ─────────────────────────────────────────────────────────────

function ManualForm({
  onSubmit,
  onCancel,
  initialValues,
}: {
  onSubmit: (data: ExtractedFields) => void
  onCancel: () => void
  initialValues?: Record<string, string>
}) {
  const [grossMonthly, setGrossMonthly] = useState(initialValues?.grossMonthly ?? '')
  const [ptkpStatus, setPtkpStatus] = useState(initialValues?.ptkpStatus ?? 'TK0')
  const [npwp, setNpwp] = useState(initialValues?.npwp !== 'false')
  const [month, setMonth] = useState(initialValues?.month ?? String(new Date().getMonth() + 1))
  const [year, setYear] = useState(initialValues?.year ?? String(new Date().getFullYear()))
  const [city, setCity] = useState(initialValues?.city ?? '')
  const [reportedPph21, setReportedPph21] = useState(initialValues?.reportedPph21 ?? '')
  const [showResumePrompt, setShowResumePrompt] = useState(false)

  const formValues = useMemo(() => ({ grossMonthly, ptkpStatus, npwp: String(npwp), month, year, city, reportedPph21 }), [grossMonthly, ptkpStatus, npwp, month, year, city, reportedPph21])

  useEffect(() => {
    const draft = loadDraft()
    if (draft && Object.keys(draft.values).length > 0) {
      setTimeout(() => setShowResumePrompt(true), 0)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(formValues), 1000)
    return () => clearTimeout(timer)
  }, [formValues])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    clearDraft()
    onSubmit({
      grossMonthly: parseInt(grossMonthly.replace(/\D/g, ''), 10) || 0,
      ptkpStatus,
      npwp,
      periodMonth: parseInt(month, 10),
      periodYear: parseInt(year, 10),
      city,
      reportedPph21: reportedPph21 ? parseInt(reportedPph21.replace(/\D/g, ''), 10) : undefined,
    })
  }

  if (showResumePrompt) {
    const draft = loadDraft()
    const filledCount = draft ? Object.values(draft.values).filter(Boolean).length : 0
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-900">Lanjutkan dari yang kemarin?</p>
            <p className="mt-1 text-amber-700">{filledCount} dari 9 field sudah diisi.</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  if (draft?.values) {
                    setGrossMonthly(draft.values.grossMonthly ?? '')
                    setPtkpStatus(draft.values.ptkpStatus ?? 'TK0')
                    setCity(draft.values.city ?? '')
                    setReportedPph21(draft.values.reportedPph21 ?? '')
                  }
                  setShowResumePrompt(false)
                }}
              >
                Lanjutkan
              </Button>
              <Button size="sm" variant="outline" onClick={() => { clearDraft(); setShowResumePrompt(false) }}>
                Mulai baru
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month / Year / NPWP — 2-col on mobile, 3-col on sm */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Bulan</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                inputMode="numeric"
              >
                {MONTHS.map((label, i) => (
                  <option key={i + 1} value={i + 1}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Tahun</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={2020}
                max={2030}
                inputMode="numeric"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-slate-700">NPWP?</label>
              <div className="flex items-center gap-3 pt-1.5">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={npwp}
                    onChange={() => setNpwp(true)}
                    className="accent-emerald-600"
                  />
                  Ya
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={!npwp}
                    onChange={() => setNpwp(false)}
                    className="accent-emerald-600"
                  />
                  Tidak
                </label>
              </div>
            </div>
          </div>

          {/* Gross Monthly */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Gaji Bruto/bulan (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={grossMonthly}
              onChange={(e) => setGrossMonthly(e.target.value)}
              placeholder="8.500.000"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>

          {/* PTKP Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Status PTKP</label>
            <select
              value={ptkpStatus}
              onChange={(e) => setPtkpStatus(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {PTKP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Kota/Kabupaten</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Jakarta Selatan"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          {/* Reported PPh21 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              PPh21 di slip (Rp) <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={reportedPph21}
              onChange={(e) => setReportedPph21(e.target.value)}
              placeholder="Biarkan kosong jika tidak tahu"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Hitung Sekarang →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Calculating Overlay ─────────────────────────────────────────────────────

function CalculatingOverlay() {
  const steps = [
    { label: 'Kalkulasi PPh21 TER (PMK 168/2023)', done: true, duration: '0.4s' },
    { label: 'Kalkulasi BPJS 6 komponen', done: false, duration: '' },
    { label: 'Bandingkan dengan slip kamu', done: false, duration: '' },
  ]
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setActiveIdx(1), 400)
    const t2 = setTimeout(() => setActiveIdx(2), 900)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span className="font-semibold text-slate-900">Memproses…</span>
          </div>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : i === activeIdx ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-200 shrink-0" />
                )}
                <span className={cn('text-sm', i === activeIdx ? 'text-slate-900 font-medium' : 'text-slate-400')}>
                  {s.label}
                </span>
                {s.done && s.duration && (
                  <span className="ml-auto text-xs text-slate-400">{s.duration}</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">Harap tunggu ~2 detik…</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Verdict Card ─────────────────────────────────────────────────────────────

function VerdictCard({ data, isPaid }: { data: AuditResult; isPaid: boolean }) {
  const hasViolations = data.violation_count > 0

  const verdictText = hasViolations
    ? `Ada ${data.violation_count} Pelanggaran di Slip Kamu`
    : 'Slip Gaji Sesuai Regulasi'

  const Icon = hasViolations ? AlertTriangle : CheckCircle2
  const iconBg = hasViolations ? 'bg-red-100' : 'bg-emerald-100'
  const iconColor = hasViolations ? 'text-red-600' : 'text-emerald-600'

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconBg)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{verdictText}</p>
              {data.city && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Slip kamu di {data.city}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Number or confirmation */}
      {!hasViolations ? (
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
            <p className="font-semibold text-emerald-800">Tidak ada selisih yang perlu dipertanyakan.</p>
            <p className="mt-1 text-sm text-emerald-700">Slip kamu sesuai PMK 168/2023 dan aturan BPJS.</p>
            <div className="mt-4 flex gap-3 justify-center">
              <Button variant="outline" size="sm" asChild><Link href="/slip">Cek slip lain</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <BlurredHeroNumber amountIdr={data.shortfall_idr} isPaid={isPaid} />

          {isPaid && (
            <div className="space-y-3">
              {data.violations.map((v) => (
                <Card key={v.code} className="border-red-200 bg-red-50/60">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          {v.code}
                        </span>
                        <p className="mt-1.5 text-sm font-medium text-slate-900">{v.message}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Selisih: <span className="font-mono text-slate-700">IDR {v.shortfall_idr.toLocaleString('id-ID')}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isPaid && (
            <Paywall shortfallIdr={data.shortfall_idr} feature="Detail per komponen + skrip langkah ke HRD" customCta="Buka Detail · IDR 49.000" />
          )}
        </>
      )}

      {/* Authority Strip */}
      <AuthorityStrip />

      {/* Share */}
      {isPaid && (
        <ShareVerdictButton
          verdict={verdictText}
          toolName="Wajar Slip"
          className="w-full"
        />
      )}

      {/* Cross tool */}
      <CrossToolSuggestion fromTool="slip" />
    </div>
  )
}

// ─── Error Card ──────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, { message: string; primary?: string; secondary?: string }> = {
  FILE_TOO_LARGE: { message: 'File lebih dari 5MB. Coba kompres dulu di Adobe Scan atau Apple Notes.', primary: 'Pilih file lain', secondary: 'Isi manual' },
  FILE_TYPE_INVALID: { message: 'Hanya PDF/JPG/PNG yang didukung.', primary: 'Pilih file lain', secondary: 'Isi manual' },
  OCR_FAILED: { message: 'OCR gagal baca slip. Yuk isi manual — 30 detik selesai.', primary: 'Isi manual sekarang →' },
  OCR_LOW_CONFIDENCE: { message: 'OCR tidak yakin dengan hasil. Coba slip yang lebih jelas.', primary: 'Coba lagi', secondary: 'Isi manual' },
  NETWORK: { message: 'Koneksi terputus. Coba lagi?', primary: 'Coba lagi', secondary: 'Isi manual' },
  RATE_LIMITED: { message: 'Sudah 5 audit dalam 1 jam. Tunggu sebentar atau upgrade.', primary: 'Upgrade IDR 49K', secondary: 'Tunggu' },
  INVALID_CITY: { message: 'Kota tidak ditemukan. Pilih dari daftar atau ketik ulang.', primary: 'Pilih kota' },
  CALC_FAILED: { message: 'Perhitungan gagal. Coba lagi dalam beberapa saat.', primary: 'Coba lagi' },
  AUTH_REQUIRED: { message: 'Untuk simpan riwayat, masuk dulu. Atau lanjut tanpa simpan.', primary: 'Masuk', secondary: 'Lanjut' },
}

function ErrorCard({ code, message, onRetry, onManual }: { code: string; message: string; onRetry?: () => void; onManual?: () => void }) {
  const info = ERROR_MESSAGES[code] ?? { message, primary: 'Coba lagi', secondary: undefined }
  return (
    <Card className="border-red-200 bg-red-50/60">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-900">{message || info.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetry && (
                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100" onClick={onRetry}>
                  {info.primary}
                </Button>
              )}
              {info.secondary === 'Isi manual' && onManual && (
                <Button size="sm" variant="ghost" className="text-red-600" onClick={onManual}>
                  {info.secondary} →
                </Button>
              )}
              {info.secondary === 'Tunggu' && (
                <Button size="sm" variant="ghost" className="text-red-600" asChild>
                  <Link href="/upgrade">Upgrade IDR 49K</Link>
                </Button>
              )}
              {info.secondary === undefined && onManual && (
                <Button size="sm" variant="ghost" className="text-red-600" onClick={onManual}>
                  Isi manual →
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WajarSlipPage() {
  const [phase, dispatch] = useReducer(slipReducer, { kind: 'IDLE' })
  const [showManual, setShowManual] = useState(false)
  const [isPaid] = useState(false)
  const [manualExtracted, setManualExtracted] = useState<ExtractedFields | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { hasConsented, recordConsent } = useConsentStatus()

  // Telemetry on mount
  useEffect(() => {
    track('slip_landed', { viewport_width: window.innerWidth })
    const count = localStorage.getItem('cekwajar_audits_count') ?? '0'
    const hasAudited = parseInt(count, 10) > 0
    if (!hasAudited) {
      // will show FTUE banner
    }
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    track('slip_upload_start', { file_type: file.type, file_size_kb: Math.round(file.size / 1024) })
    dispatch({ type: 'SELECT_FILE', fileName: file.name })

    uploadWithProgress(
      file,
      (pct) => {
        track('slip_upload_progress', { pct })
        dispatch({ type: 'UPLOAD_PROGRESS', pct })
      },
      (filePath) => {
        dispatch({ type: 'UPLOAD_COMPLETE', filePath })
        // Simulate OCR processing
        dispatch({ type: 'OCR_START', engine: 'vision' })
        track('slip_ocr_engine', { engine: 'vision', confidence: 0 })

        // Simulate OCR result after 2-4 seconds
        const confidence = 0.85 + Math.random() * 0.14
        setTimeout(() => {
          const extracted: ExtractedFields = {
            grossMonthly: 7_500_000,
            ptkpStatus: 'TK0',
            npwp: true,
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
            city: 'Jakarta Selatan',
            reportedPph21: 0,
          }
          dispatch({ type: 'OCR_COMPLETE', confidence, extracted })
          track('slip_confirm_accept', { n_overrides: 0, total_time_ms: 2000 })
        }, 2000 + Math.random() * 2000)
      },
      (code, message) => {
        track('slip_error', { code, time_in_state_ms: 0 })
        dispatch({ type: 'ERROR', code: code as never, message })
      }
    )
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleConfirmAccept = useCallback((overrides: Record<string, number>) => {
    const current = phase.kind === 'CONFIRM' ? phase.extracted : manualExtracted
    if (!current) return
    const merged = { ...current }
    for (const [k, v] of Object.entries(overrides)) {
      (merged as unknown as Record<string, number>)[k] = v
    }
    setManualExtracted(merged)
    track('slip_confirm_override', { overrides, total_time_ms: 0 })
    dispatch({ type: 'CONFIRM_ACCEPT' })
    track('slip_confirm_accept', { n_overrides: Object.keys(overrides).length, total_time_ms: 0 })

    // Calculate
    dispatch({ type: 'CALCULATE_START' })
    setTimeout(async () => {
      try {
        const res = await fetch('/api/pph21', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gross_monthly: merged.grossMonthly,
            ptkp_status: merged.ptkpStatus,
            npwp: merged.npwp,
            month: merged.periodMonth,
            year: merged.periodYear,
            city: merged.city,
            reported_pph21: merged.reportedPph21,
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        const data: AuditResult = await res.json()

        // Compute shortfall
        const totalViolation = data.violations.reduce((s, v) => s + (v.shortfall_idr ?? 0), 0)
        const result = { ...data, shortfall_idr: totalViolation }

        dispatch({ type: 'CALCULATE_COMPLETE', data: result })
        track('slip_calc_complete', {
          verdict: data.violations.length > 0 ? 'ADA_PELANGGARAN' : 'SESUAI',
          n_violations: data.violations.length,
          shortfall_idr_bucket: bucketShortfall(totalViolation),
        })
        track('slip_gate_view', {
          shortfall_idr_bucket: bucketShortfall(totalViolation),
          n_violations: data.violations.length,
        })

        // Increment audit count
        const count = parseInt(localStorage.getItem('cekwajar_audits_count') ?? '0', 10)
        localStorage.setItem('cekwajar_audits_count', String(count + 1))
      } catch (err) {
        track('slip_error', { code: 'CALC_FAILED', time_in_state_ms: 0 })
        dispatch({ type: 'ERROR', code: 'CALC_FAILED', message: err instanceof Error ? err.message : 'Calculation failed' })
      }
    }, 400)
  }, [phase, manualExtracted])

  const handleManualSubmit = useCallback((extracted: ExtractedFields) => {
    setManualExtracted(extracted)
    setShowManual(false)
    track('slip_confirm_accept', { n_overrides: 0, total_time_ms: 0 })
    dispatch({ type: 'CALCULATE_START' })

    setTimeout(async () => {
      try {
        const res = await fetch('/api/pph21', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gross_monthly: extracted.grossMonthly,
            ptkp_status: extracted.ptkpStatus,
            npwp: extracted.npwp,
            month: extracted.periodMonth,
            year: extracted.periodYear,
            city: extracted.city,
            reported_pph21: extracted.reportedPph21,
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        const data: AuditResult = await res.json()
        const totalViolation = data.violations.reduce((s, v) => s + (v.shortfall_idr ?? 0), 0)
        const result = { ...data, shortfall_idr: totalViolation }

        dispatch({ type: 'CALCULATE_COMPLETE', data: result })
        track('slip_calc_complete', {
          verdict: data.violations.length > 0 ? 'ADA_PELANGGARAN' : 'SESUAI',
          n_violations: data.violations.length,
          shortfall_idr_bucket: bucketShortfall(totalViolation),
        })

        const count = parseInt(localStorage.getItem('cekwajar_audits_count') ?? '0', 10)
        localStorage.setItem('cekwajar_audits_count', String(count + 1))
      } catch (err) {
        track('slip_error', { code: 'CALC_FAILED', time_in_state_ms: 0 })
        dispatch({ type: 'ERROR', code: 'CALC_FAILED', message: err instanceof Error ? err.message : 'Calculation failed' })
      }
    }, 400)
  }, [])

  const handleRetry = useCallback(() => {
    dispatch({ type: 'CANCEL' })
  }, [])

  const hasAuditedBefore = typeof window !== 'undefined' && parseInt(localStorage.getItem('cekwajar_audits_count') ?? '0', 10) > 0

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
      <PageHeader
        icon={FileText}
        title="Cek Slip Gaji"
        description="30 detik, gratis, tanpa daftar"
      />

      {/* Trust + Authority */}
      <TrustBadges />

      {/* Info accordion — disclaimer */}
      <details className="rounded-lg border border-slate-200 bg-white">
        <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none text-xs text-slate-500 hover:text-slate-700">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Bagaimana data slip saya diperlakukan?</span>
          <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform open:rotate-90" />
        </summary>
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
          Slip gaji diproses otomatis oleh OCR, disimpan di Singapore (ap-southeast-1), dan dihapus permanen
          dalam 30 hari (UU PDP). Tidak ada manusia yang melihat slip kamu.{' '}
          <Link href="/privacy" className="text-emerald-600 hover:underline">Lihat kebijakan privasi →</Link>
        </div>
      </details>

      {/* FTUE Banner */}
      {!hasAuditedBefore && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-900">
          <strong>Audit pertama?</strong> Upload slip apa adanya. Sistem yang akan kerjain sisanya.
          Kalau OCR gagal, kamu bisa isi manual.
        </div>
      )}

      {/* ── IDLE / UPLOADING ── */}
      {(phase.kind === 'IDLE') && !showManual && (
        <>
          <Card
            className="border-dashed border-2 border-emerald-300 bg-emerald-50/20 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <Upload className="h-10 w-10 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Tap atau drag slip gaji di sini</p>
                <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG. Maks 5MB.</p>
              </div>
            </CardContent>
          </Card>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="text-xs text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Atau isi manual →
          </button>
        </>
      )}

      {/* ── UPLOADING ── */}
      {phase.kind === 'UPLOADING' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Mengupload {phase.fileName}…</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">Mengupload slip gaji aman ke server Singapore…</p>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CANCEL' })}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Batal
            </button>
          </CardContent>
        </Card>
      )}

      {/* ── OCR PROCESSING ── */}
      {phase.kind === 'OCR_PROCESSING' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              {phase.engine === 'vision' ? (
                <div className="h-4 w-4 rounded-full bg-emerald-600 animate-pulse" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-amber-400 animate-pulse" />
              )}
              <span className="text-sm font-medium text-slate-700">
                Mendeteksi field di slip kamu…
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-500 pl-7">
              <p className={phase.engine === 'vision' ? 'text-emerald-600' : 'text-slate-400'}>
                ● Google Vision{phase.engine === 'vision' ? ' · 1.2s' : ''}
              </p>
              <p className={phase.engine === 'vision' ? 'text-slate-400' : 'text-amber-600'}>
                ○ Backup OCR (Tesseract) standby — akan dijalankan otomatis kalo Vision gagal
              </p>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">~3-8 detik</p>
            <button
              type="button"
              onClick={() => { dispatch({ type: 'CANCEL' }); setShowManual(true) }}
              className="text-xs text-amber-600 hover:underline"
            >
              Skip ke manual →
            </button>
          </CardContent>
        </Card>
      )}

      {/* ── CONFIRM ── */}
      {phase.kind === 'CONFIRM' && (
        <ConfirmExtractedFields
          fields={[
            { key: 'grossMonthly', label: 'Gaji Bruto/bulan', value: phase.extracted.grossMonthly, confidence: phase.ocrConfidence },
            { key: 'ptkpStatus', label: 'PTKP', value: 0, confidence: phase.ocrConfidence - 0.05 },
            { key: 'periodMonth', label: 'Bulan', value: phase.extracted.periodMonth, confidence: phase.ocrConfidence },
            { key: 'city', label: 'Kota', value: 0, confidence: phase.ocrConfidence - 0.08 },
          ]}
          onConfirm={handleConfirmAccept}
          onCancel={() => dispatch({ type: 'CANCEL' })}
        />
      )}

      {/* ── CALCULATING ── */}
      {phase.kind === 'CALCULATING' && <CalculatingOverlay />}

      {/* ── VERDICT ── */}
      {phase.kind === 'VERDICT' && (
        <VerdictCard
          data={phase.data}
          isPaid={isPaid}
        />
      )}

      {/* ── ERROR ── */}
      {phase.kind === 'ERROR' && (
        <ErrorCard
          code={phase.code}
          message={phase.message}
          onRetry={handleRetry}
          onManual={() => { dispatch({ type: 'CANCEL' }); setShowManual(true) }}
        />
      )}

      {/* ── MANUAL FORM ── */}
      {showManual && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Isi Manual</h2>
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Tutup
            </button>
          </div>
          <ManualForm
            onSubmit={handleManualSubmit}
            onCancel={() => setShowManual(false)}
          />
        </>
      )}

      {/* How It Works */}
      <HowItWorks
        steps={[
          { icon: Upload, title: 'Upload slip', description: 'PDF atau foto slip gaji' },
          { icon: Loader2, title: 'OCR otomatis', description: 'Dalam 3-8 detik' },
          { icon: CheckCircle2, title: 'Dapat hasil', description: 'Lihat pelanggaran + rupiah selisih' },
        ]}
      />

      {/* PDP Consent Gate */}
      {!hasConsented && (
        <PdpConsentGate
          open={true}
          onConsented={recordConsent}
        />
      )}
    </div>
  )
}