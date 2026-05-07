'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Wajar Slip Page (Full Client Component)
// Stage 6: 6-phase state machine + CONFIRM + telemetry + save-resume
// ══════════════════════════════════════════════════════════════════════════════

import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { AlertCircle, CheckCircle2, X, AlertTriangle, Zap, Loader2,
  Upload, Camera
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ConfirmExtractedFields } from '@/components/wajar-slip/ConfirmExtractedFields'
import { RevealOnPaid } from '@/components/wajar-slip/RevealOnPaid'
import { ViolationItem } from '@/components/wajar-slip/ViolationItem'
import { UMKBadge } from '@/components/wajar-slip/UMKBadge'
import { InfoAccordion } from '@/components/wajar-slip/InfoAccordion'
import { Paywall } from '@/components/shared'
import { ExitIntentModal, useExitIntent, setPendingAudit } from '@/components/shared/ExitIntentModal'
import { SuratKeberatanButton } from '@/components/legal/SuratKeberatanButton'
import type { SubscriptionTier } from '@/types'
import type { ExtractedPayslipFields } from '@/lib/ocr/field-extractor'
import { track, trackAbandon } from '@/lib/analytics'
import {
  slipReducer,
  type AuditResult,
  ERROR_MESSAGES,
  bucketShortfall,
} from './_state'

// ─── Constants ───────────────────────────────────────────────────────────────

const PTKP_LABELS: Record<string, string> = {
  'TK/0':  'Tidak Kawin, 0 tanggungan',
  'TK/1':  'Tidak Kawin, 1 tanggungan',
  'TK/2':  'Tidak Kawin, 2 tanggungan',
  'TK/3':  'Tidak Kawin, 3 tanggungan',
  'K/0':   'Kawin, 0 tanggungan',
  'K/1':   'Kawin, 1 tanggungan',
  'K/2':   'Kawin, 2 tanggungan',
  'K/3':   'Kawin, 3 tanggungan',
  'K/I/0': 'Kawin + Istri/Suami, 0 tanggungan',
  'K/I/1': 'Kawin + Istri/Suami, 1 tanggungan',
  'K/I/2': 'Kawin + Istri/Suami, 2 tanggungan',
  'K/I/3': 'Kawin + Istri/Suami, 3 tanggungan',
}

const MONTHS = [
  { value: 1,  label: 'Januari' },
  { value: 2,  label: 'Februari' },
  { value: 3,  label: 'Maret' },
  { value: 4,  label: 'April' },
  { value: 5,  label: 'Mei' },
  { value: 6,  label: 'Juni' },
  { value: 7,  label: 'Juli' },
  { value: 8,  label: 'Agustus' },
  { value: 9,  label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

const DRAFT_KEY = 'cekwajar_slip_draft'
const DRAFT_TTL_MS = 7 * 24 * 3600 * 1000

// ─── Form Schema ───────────────────────────────────────────────────────────

const apiSchema = z.object({
  grossSalary:        z.number().min(500_000).max(1_000_000_000),
  ptkpStatus:         z.enum(['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3','K/I/0','K/I/1','K/I/2','K/I/3']),
  city:               z.string().min(1),
  monthNumber:         z.number().int().min(1).max(12),
  year:               z.number().int().min(2024).max(2030),
  hasNPWP:           z.boolean(),
  reportedPph21:      z.number().min(0),
  reportedJht:       z.number().min(0),
  reportedJp:        z.number().min(0),
  reportedKesehatan:  z.number().min(0),
  takeHome:          z.number().min(0),
})

const formSchema = z.object({
  grossSalary:        z.string().min(1, 'Wajib diisi'),
  ptkpStatus:         z.enum(['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3','K/I/0','K/I/1','K/I/2','K/I/3']),
  city:               z.string().min(1, 'Pilih kota'),
  monthNumber:        z.string(),
  year:              z.string(),
  hasNPWP:           z.boolean(),
  reportedPph21:      z.string(),
  reportedJht:       z.string(),
  reportedJp:        z.string(),
  reportedKesehatan:  z.string(),
  takeHome:          z.string(),
})

type FormValues = z.infer<typeof formSchema>
type ApiPayload  = z.infer<typeof apiSchema>

function parseIDR(v: string): number {
  return parseInt(v.replace(/\D/g, '') || '0', 10)
}

// ─── City type ───────────────────────────────────────────────────────────────

interface CityOption { city: string; province: string; umk: number }

// ─── Slip Drop Zone ───────────────────────────────────────────────────────

function SlipDropZone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) onFileSelected(acceptedFiles[0])
  }, [onFileSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'application/pdf': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  return (
    <Card className={`border-dashed border-2 transition-colors ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-slate-50'}`}>
      <CardContent className="flex flex-col items-center justify-center py-10 px-6">
        <div
          {...getRootProps()}
          className="flex w-full cursor-pointer flex-col items-center justify-center text-center"
        >
          <input {...getInputProps()} />
          <div className="mb-4 rounded-full bg-primary-100 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="mb-1 text-base font-semibold text-slate-700">
            Tap atau drag slip gaji di sini
          </p>
          <p className="mb-4 text-sm text-slate-500">PDF, JPG, PNG. Maks 5MB.</p>
          <Button size="sm" variant="outline" className="border-primary-300 text-primary-700">
            <Camera className="mr-2 h-4 w-4" />
            Pilih File
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function WajarSlipPage() {
  const [phase, dispatch] = useReducer(slipReducer, { kind: 'IDLE' })
  const [cities, setCities]             = useState<CityOption[]>([])
  const [userTier, setUserTier]         = useState<SubscriptionTier>('free')
  const [ocrBridge, setOcrBridge]       = useState<{
    extracted: ExtractedPayslipFields
    filePath: string
    ocrConfidence: number
    fieldConfidences: Record<string, number>
  } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPaid, setIsPaid]             = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const exitIntentReady = useRef(false)

  // Exit intent — desktop only, fires after 30s on verdict page when unpaid
  useExitIntent(() => setShowExitModal(true), phase.kind === 'VERDICT' && phase.data.verdict === 'ADA_PELANGGARAN' && !isPaid && exitIntentReady.current)

  const [showResumeBanner, setShowResumeBanner] = useState(false)
  const [draftCount, setDraftCount]     = useState(0)

  const sessionStartTime = useRef<number>(Date.now())
  const currentMonth = new Date().getMonth() + 1
  const currentYear  = new Date().getFullYear()

  // ── Exit intent ready after 30s ─────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => { exitIntentReady.current = true }, 30_000)
    return () => clearTimeout(timer)
  }, [])

  // ── Store pending audit when VERDICT with violations is reached ───
  useEffect(() => {
    if (phase.kind === 'VERDICT' && phase.data.auditId && phase.data.verdict === 'ADA_PELANGGARAN') {
      setPendingAudit(phase.data.auditId)
    }
  }, [phase])

  // ── Load cities + user tier ───────────────────────────────────────
  useEffect(() => {
    fetch('/api/cities')
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]))

    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.tier) setUserTier(d.tier) })
      .catch(() => {})

    // Track slip_landed
    track('slip_landed', {
      referrer: document.referrer,
      viewport_width: window.innerWidth,
    })

    // Track abandon on unload
    const handleUnload = () => {
      trackAbandon(phase.kind, Date.now() - sessionStartTime.current)
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── localStorage draft ────────────────────────────────────────────
  const loadDraft = useCallback((): Partial<FormValues> | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY)
        return null
      }
      return parsed.values
    } catch {
      return null
    }
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
  }, [])

  useEffect(() => {
    const draft = loadDraft()
    if (draft && Object.keys(draft).length > 0) {
      setShowResumeBanner(true)
    }
  }, [loadDraft])

  // ── Form ─────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossSalary:        '',
      ptkpStatus:         'TK/0',
      city:               '',
      monthNumber:        String(currentMonth),
      year:               String(currentYear),
      hasNPWP:           true,
      reportedPph21:      '',
      reportedJht:       '',
      reportedJp:        '',
      reportedKesehatan:  '',
      takeHome:          '',
    },
  })

  // Watch and persist draft to localStorage
  useEffect(() => {
    const sub = form.watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, savedAt: Date.now() }))
      const filled = Object.values(values).filter((v) => v !== '' && v !== undefined).length
      setDraftCount(filled)
    })
    return () => sub.unsubscribe()
  }, [form])

  const prefillForm = useCallback((values: Partial<FormValues>) => {
    if (values.grossSalary)        form.setValue('grossSalary',        String(values.grossSalary))
    if (values.takeHome)           form.setValue('takeHome',           String(values.takeHome))
    if (values.reportedPph21)     form.setValue('reportedPph21',     String(values.reportedPph21))
    if (values.reportedJht)        form.setValue('reportedJht',        String(values.reportedJht))
    if (values.reportedJp)         form.setValue('reportedJp',         String(values.reportedJp))
    if (values.reportedKesehatan)   form.setValue('reportedKesehatan',   String(values.reportedKesehatan))
  }, [form])

  const resumeDraft = useCallback(() => {
    const draft = loadDraft()
    if (draft) {
      prefillForm(draft)
      setShowResumeBanner(false)
    }
  }, [loadDraft, prefillForm])

  // ── Upload with XHR progress ───────────────────────────────────
  const uploadWithProgress = useCallback((file: File) => {
    dispatch({ type: 'START_UPLOAD', fileName: file.name })
    track('slip_upload_start', { file_type: file.type, file_size_kb: Math.round(file.size / 1024) })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('sessionId', crypto.randomUUID())

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        setUploadProgress(pct)
        if ([25, 50, 75, 100].includes(pct)) {
          track('slip_upload_progress', { pct })
        }
      }
    }

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const json = JSON.parse(xhr.responseText)
        if (!json.success) {
          dispatch({ type: 'OCR_FAILED', code: 'OCR_FAILED', message: json.error?.message ?? 'OCR gagal.' })
          return
        }

        const { extractedFields, fieldConfidences, confidence } = json.data
        const filePath = json.data.filePath ?? ''

        setOcrBridge({ extracted: extractedFields, filePath, ocrConfidence: confidence, fieldConfidences })
        dispatch({ type: 'OCR_COMPLETE', extracted: extractedFields, filePath, ocrConfidence: confidence, fieldConfidences })
      } else {
        dispatch({ type: 'OCR_FAILED', code: 'OCR_FAILED', message: `Upload gagal (${xhr.status}).` })
      }
    }

    xhr.onerror = () => {
      dispatch({ type: 'OCR_FAILED', code: 'NETWORK', message: 'Koneksi terputus.' })
    }

    xhr.open('POST', '/api/ocr/upload')
    xhr.send(formData)
  }, [])

  // ── Manual mode ────────────────────────────────────────────────
  const handleManualMode = useCallback(() => {
    const draft = loadDraft()
    if (draft) {
      prefillForm(draft)
      setShowResumeBanner(false)
    }
    // Reset to IDLE then immediately dispatch SUBMIT to signal manual form intent
    // The manual form is shown as the final "fallback" render at the bottom
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SUBMIT' })
  }, [loadDraft, prefillForm])

  const handleRetry = useCallback(() => {
    dispatch({ type: 'RETRY' })
    setOcrBridge(null)
  }, [])

  // ── CONFIRM handlers ────────────────────────────────────────────
  const handleConfirm = useCallback((overrides: ExtractedPayslipFields, totalTimeMs: number) => {
    const nOverrides = ocrBridge
      ? Object.keys(overrides).filter(
          (k) => overrides[k as keyof ExtractedPayslipFields] !== ocrBridge.extracted[k as keyof ExtractedPayslipFields]
        ).length
      : 0
    track('slip_confirm_accept', { n_overrides: nOverrides, total_time_ms: totalTimeMs })
    prefillForm({
      grossSalary:       String(overrides.grossSalary ?? ''),
      takeHome:         String(overrides.takeHome ?? ''),
      reportedPph21:     String(overrides.pph21 ?? ''),
      reportedJht:      String(overrides.jhtEmployee ?? ''),
      reportedJp:       String(overrides.jpEmployee ?? ''),
      reportedKesehatan: String(overrides.kesehatanEmployee ?? ''),
    })
    dispatch({ type: 'CONFIRM_OVERRIDE', overrides })
  }, [ocrBridge, prefillForm])

  const handleConfirmCancel = useCallback(() => {
    dispatch({ type: 'CONFIRM_CANCEL' })
    setOcrBridge(null)
  }, [])

  const handleConfirmOverride = useCallback((field: string, wasValue: number, newValue: number) => {
    track('slip_confirm_override', { field, was_value: wasValue, new_value: newValue })
  }, [])

  // ── Gate CTA ─────────────────────────────────────────────────
  const handleGateClick = useCallback(() => {
    const shortfall = phase.kind === 'VERDICT' ? (phase.data.shortfallIdr ?? 0) : 0
    track('slip_gate_cta_click', { shortfall_idr_bucket: bucketShortfall(shortfall) })
  }, [phase])

  // ── Submit ────────────────────────────────────────────────────
  async function onSubmit(values: FormValues) {
    dispatch({ type: 'SUBMIT' })

    const parsed: ApiPayload = {
      grossSalary:        parseIDR(values.grossSalary),
      ptkpStatus:         values.ptkpStatus,
      city:               values.city,
      monthNumber:         parseInt(values.monthNumber, 10),
      year:               parseInt(values.year, 10),
      hasNPWP:           values.hasNPWP,
      reportedPph21:      parseIDR(values.reportedPph21),
      reportedJht:       parseIDR(values.reportedJht),
      reportedJp:        parseIDR(values.reportedJp),
      reportedKesehatan:  parseIDR(values.reportedKesehatan),
      takeHome:          parseIDR(values.takeHome),
    }

    const safe = apiSchema.safeParse(parsed)
    if (!safe.success) {
      dispatch({ type: 'ERROR', code: 'VALIDATION_ERROR', message: safe.error.issues[0]?.message ?? 'Validasi gagal' })
      return
    }

    try {
      const res = await fetch('/api/audit-payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossSalary: safe.data.grossSalary,
          ptkpStatus: safe.data.ptkpStatus,
          city: safe.data.city,
          monthNumber: safe.data.monthNumber,
          year: safe.data.year,
          hasNPWP: safe.data.hasNPWP,
          reportedDeductions: {
            pph21:            safe.data.reportedPph21,
            jhtEmployee:      safe.data.reportedJht,
            jpEmployee:       safe.data.reportedJp,
            jkkEmployee:      0,
            jkmEmployee:      0,
            kesehatanEmployee: safe.data.reportedKesehatan,
            takeHome:         safe.data.takeHome,
          },
          ocrSource: 'manual',
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        dispatch({ type: 'ERROR', code: 'CALC_FAILED', message: json.message ?? 'Kalkulasi gagal.' })
        return
      }

      const shortfall = (json.data?.violations ?? []).reduce(
        (sum: number, v: { differenceIDR: number | null }) => sum + (v.differenceIDR ?? 0),
        0
      )

      const result: AuditResult = {
        auditId:            json.data?.id ?? null,
        verdict:            json.data?.verdict ?? 'SESUAI',
        violationCount:     json.data?.violationCount ?? 0,
        violationCodes:      json.data?.violationCodes ?? [],
        violations:         json.data?.violations ?? [],
        calculations:       json.data?.calculations,
        isGated:           json.data?.isGated ?? true,
        gateMessage:       json.data?.gateMessage,
        subscriptionRequired: json.data?.subscriptionRequired,
        cityUMK:           json.data?.calculations?.cityUMK ?? 0,
        city:               values.city,
        grossSalary:       safe.data.grossSalary,
        monthNumber:       safe.data.monthNumber,
        year:              safe.data.year,
        shortfallIdr:     shortfall,
      }

      clearDraft()
      dispatch({ type: 'SUCCESS', data: result })
    } catch {
      dispatch({ type: 'ERROR', code: 'NETWORK', message: 'Tidak dapat terhubung ke server.' })
    }
  }

  // ─── RENDER: IDLE ────────────────────────────────────────────────────
  if (phase.kind === 'IDLE') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Cek Slip Gaji · 30 Detik, Gratis</h1>
            <p className="mt-1 text-sm text-slate-500">PMK 168/2023 + 6 komponen BPJS. Slip dihapus 30 hari.</p>
          </div>

          {/* Privacy accordion — replaces top disclaimer per spec */}
          <InfoAccordion />

          <SlipDropZone onFileSelected={uploadWithProgress} />

          <p className="text-center text-xs text-slate-500">
            Atau{' '}
            <button onClick={handleManualMode} className="underline hover:text-primary">
              isi form manual →
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ─── RENDER: UPLOADING ─────────────────────────────────────────────────
  if (phase.kind === 'UPLOADING') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="mx-4 max-w-sm w-full">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="w-full space-y-2">
              <p className="font-medium text-slate-700">Mengupload slip gaji...</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {uploadProgress < 50 ? 'Menyimpan ke storage...' : 'Slip berhasil diupload'}
              </p>
            </div>
            <p className="text-xs text-slate-500">Mengupload slip gaji aman ke server Singapore...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── RENDER: OCR_PROCESSING ───────────────────────────────────────────
  if (phase.kind === 'OCR_PROCESSING') {
    const isVision = phase.engine === 'vision'
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="mx-4 max-w-sm w-full border-emerald-200 bg-primary-50/40">
          <CardContent className="flex flex-col items-center gap-5 p-8">
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${isVision ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
                <span className="text-sm font-medium text-slate-700">Mendeteksi field di slip kamu...</span>
              </div>
              <p className="pl-6 text-xs text-slate-500">Google Vision · ~1.2s</p>

              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${!isVision ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'}`} />
                <span className="text-sm text-slate-600">Backup OCR (Tesseract) standby</span>
              </div>
              <p className="pl-6 text-xs text-slate-500">Akan dijalankan otomatis kalo Vision gagal</p>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500">~3-8 detik</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── RENDER: CONFIRM ──────────────────────────────────────────────────
  if (phase.kind === 'CONFIRM') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Konfirmasi Hasil OCR</h1>
              <p className="text-sm text-slate-500">Periksa angka yang kami deteksi dari slip kamu.</p>
            </div>
            <button onClick={handleConfirmCancel} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-600">
              <X className="h-4 w-4" />
              Batal
            </button>
          </div>

          <ConfirmExtractedFields
            fields={phase.extracted}
            fieldConfidences={phase.fieldConfidences}
            ocrConfidence={phase.ocrConfidence}
            ocrEngine="vision"
            onConfirm={handleConfirm}
            onCancel={handleConfirmCancel}
            onOverride={handleConfirmOverride}
          />

          <p className="mt-4 text-center text-xs text-slate-500">
            Setelah konfirmasi, kalkulasi PPh21 + BPJS akan berjalan otomatis.
          </p>
        </div>
      </div>
    )
  }

  // ─── RENDER: CALCULATING ──────────────────────────────────────────────
  if (phase.kind === 'CALCULATING') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="mx-4 max-w-sm w-full">
          <CardContent className="flex flex-col items-center gap-5 p-8">
            <div className="space-y-3 w-full">
              {[
                { done: true,                   label: 'Kalkulasi PPh21 TER (PMK 168/2023)...', time: '0.4s' },
                { done: false, active: true,    label: 'Kalkulasi BPJS 6 komponen...',       time: '' },
                { done: false,                  label: 'Bandingkan dengan slip kamu...',       time: '' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${step.done ? 'bg-emerald-500' : step.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
                  <span className={`text-sm ${step.done ? 'text-slate-700' : step.active ? 'text-primary-700 font-medium' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  {step.done && <span className="text-xs text-slate-500">{step.time}</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Total biasanya kurang dari 2 detik...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── RENDER: VERDICT ─────────────────────────────────────────────────
  if (phase.kind === 'VERDICT') {
    const { data } = phase
    const monthLabel = MONTHS.find((m) => m.value === data.monthNumber)?.label ?? ''
    const shortfall  = data.shortfallIdr ?? 0

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-8">

          {/* Verdict header */}
          <Card className={`mb-6 ${data.verdict === 'SESUAI' ? 'border-emerald-300 bg-emerald-50' : 'border-red-200 bg-red-50/60'}`}>
            <CardContent className="flex items-start gap-4 p-6">
              {data.verdict === 'SESUAI'
                ? <CheckCircle2 className="h-10 w-10 shrink-0 text-primary" />
                : <AlertTriangle className="h-10 w-10 shrink-0 text-red-600" />
              }
              <div>
                <h2 className={`text-xl font-bold ${data.verdict === 'SESUAI' ? 'text-primary-800' : 'text-red-800'}`}>
                  {data.verdict === 'SESUAI' ? 'Slip Gaji Sesuai Regulasi' : `Ada ${data.violationCount} Pelanggaran di Slip Kamu`}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {data.verdict === 'SESUAI'
                    ? `Slip kamu sesuai PMK 168/2023 dan aturan BPJS untuk gaji bruto Rp ${data.grossSalary.toLocaleString('id-ID')}/bulan, ${monthLabel} ${data.year}.`
                    : `Ditemukan ${data.violationCount} pelanggaran pada slip gaji kamu.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hero shortfall — wrapped in Paywall (NumericGate) for violation verdicts */}
          {data.verdict === 'ADA_PELANGGARAN' && (
            <div className="mb-6">
              {!isPaid ? (
                <Paywall
                  shortfallIdr={shortfall}
                  feature="Detail selisih per komponen + langkah ke HRD"
                  className="mt-4"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <RevealOnPaid amountIdr={shortfall} isPaid={isPaid} />
                  <p className="text-xs text-slate-500">Garansi 7 hari uang kembali · Batalkan kapan saja</p>
                </div>
              )}
            </div>
          )}

          {/* UMK Badge */}
          {data.cityUMK > 0 && (
            <div className="mb-6">
              <UMKBadge city={data.city} umk={data.cityUMK} grossSalary={data.grossSalary} />
            </div>
          )}

          {/* Violations */}
          {data.violations.length > 0 && (
            <div className="mb-6 space-y-3">
              {data.violations.map((violation) => (
                <ViolationItem
                  key={violation.code}
                  violation={violation}
                  showAmount={isPaid}
                  reportedValue={
                    violation.code === 'V01' || violation.code === 'V05' || violation.code === 'V03'
                      ? 0
                      : violation.code === 'V06'
                      ? data.grossSalary
                      : data.calculations
                      ? violation.code === 'V04'
                        ? data.calculations.correctPph21 - (violation.differenceIDR ?? 0)
                        : violation.code === 'V02'
                        ? data.calculations.correctJp - (violation.differenceIDR ?? 0)
                        : 0
                      : 0
                  }
                  calculatedValue={
                    violation.code === 'V01'
                      ? data.calculations?.correctJht ?? 0
                      : violation.code === 'V05'
                      ? data.calculations?.correctKesehatan ?? 0
                      : violation.code === 'V03'
                      ? data.calculations?.correctPph21 ?? 0
                      : violation.code === 'V06'
                      ? data.cityUMK
                      : violation.code === 'V04'
                      ? data.calculations?.correctPph21 ?? 0
                      : violation.code === 'V02'
                      ? data.calculations?.correctJp ?? 0
                      : violation.code === 'V07'
                      ? data.calculations?.correctJp ?? 0
                      : 0
                  }
                />
              ))}
            </div>
          )}

          {/* Calculations table — stacked on mobile, table on desktop */}
          {isPaid && data.calculations && (
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Rincian Kalkulasi</CardTitle></CardHeader>
              <CardContent>
                {/* Mobile stacked rows */}
                <div className="space-y-3 sm:hidden">
                  {[
                    { label: 'PPh21', slip: data.calculations.correctPph21 - (data.violations.find((v) => v.code === 'V04')?.differenceIDR ?? 0), correct: data.calculations.correctPph21 },
                    { label: 'JHT (2%)', slip: data.violations.find((v) => v.code === 'V01') ? 0 : data.calculations.correctJht, correct: data.calculations.correctJht },
                    { label: 'JP (1%)', slip: data.violations.find((v) => v.code === 'V07' || v.code === 'V02') ? 0 : data.calculations.correctJp, correct: data.calculations.correctJp },
                    { label: 'BPJS Kesehatan (1%)', slip: data.violations.find((v) => v.code === 'V05') ? 0 : data.calculations.correctKesehatan, correct: data.calculations.correctKesehatan },
                  ].map((row) => {
                    const diff = row.correct - row.slip
                    return (
                      <div key={row.label} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between text-sm">
                          <p className="font-medium">{row.label}</p>
                          <p className={`font-mono text-xs ${diff > 0 ? 'text-red-600' : 'text-primary'}`}>
                            {diff > 0 ? '+' : ''}Rp {Math.abs(diff).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <span>Slip: <span className="font-mono text-slate-700">Rp {row.slip.toLocaleString('id-ID')}</span></span>
                          <span>Seharusnya: <span className="font-mono text-slate-700">Rp {row.correct.toLocaleString('id-ID')}</span></span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Desktop table */}
                <table className="hidden sm:table w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="text-left py-2 pr-4">Komponen</th>
                      <th className="text-right py-2 px-2">Di Slip</th>
                      <th className="text-right py-2 px-2">Seharusnya</th>
                      <th className="text-right py-2 pl-2">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {[
                      { label: 'PPh21', slip: data.calculations.correctPph21 - (data.violations.find((v) => v.code === 'V04')?.differenceIDR ?? 0), correct: data.calculations.correctPph21 },
                      { label: 'JHT (2%)', slip: data.violations.find((v) => v.code === 'V01') ? 0 : data.calculations.correctJht, correct: data.calculations.correctJht },
                      { label: 'JP (1%)', slip: data.violations.find((v) => v.code === 'V07' || v.code === 'V02') ? 0 : data.calculations.correctJp, correct: data.calculations.correctJp },
                      { label: 'BPJS Kesehatan (1%)', slip: data.violations.find((v) => v.code === 'V05') ? 0 : data.calculations.correctKesehatan, correct: data.calculations.correctKesehatan },
                    ].map((row) => {
                      const diff = row.correct - row.slip
                      return (
                        <tr key={row.label} className="border-b border-slate-100">
                          <td className="py-2 pr-4 font-medium">{row.label}</td>
                          <td className="py-2 px-2 text-right text-slate-500">Rp {row.slip.toLocaleString('id-ID')}</td>
                          <td className="py-2 px-2 text-right">Rp {row.correct.toLocaleString('id-ID')}</td>
                          <td className={`py-2 pl-2 text-right font-semibold ${diff > 0 ? 'text-red-600' : 'text-primary'}`}>
                            {diff > 0 ? '+' : ''}Rp {Math.abs(diff).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Gate message */}
          {data.isGated && !isPaid && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-4 p-4">
                <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">{data.gateMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Surat Keberatan — Pro only, after paid verdict */}
          {isPaid && data.auditId && (
            <div className="mb-6">
              <SuratKeberatanButton auditId={data.auditId} tier={userTier} />
            </div>
          )}

          <p className="mb-6 text-xs text-slate-500">
            Kalkulasi berdasarkan PMK 168/2023 (TER) dan peraturan BPJS. Alat ini bukan pengganti konsultasi pajak resmi.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => { dispatch({ type: 'RESET' }); setOcrBridge(null); setIsPaid(false) }}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cek Slip Lain
            </button>
            <button
              onClick={() => { dispatch({ type: 'RESET' }) }}
              className="flex-1 rounded-lg bg-primary-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Hitung Ulang
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── RENDER: ERROR ────────────────────────────────────────────────────
  if (phase.kind === 'ERROR') {
    const errMsg = ERROR_MESSAGES[phase.code]
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="mx-4 max-w-md border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <p className="font-semibold text-red-800">Terjadi Kesalahan</p>
              <p className="mt-1 text-sm text-red-600">{errMsg?.primary ?? phase.message}</p>
            </div>
            <div className="flex gap-2 mt-2">
              {errMsg?.secondary && (
                <Button
                  onClick={
                    phase.code === 'OCR_FAILED' || phase.code === 'OCR_LOW_CONFIDENCE'
                      ? () => { handleConfirmCancel(); dispatch({ type: 'RESET' }) }
                      : handleRetry
                  }
                  className="bg-primary-600 hover:bg-emerald-700"
                >
                  {errMsg.secondary}
                </Button>
              )}
              <Button variant="outline" onClick={() => dispatch({ type: 'RESET' })}>
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── RENDER: MANUAL FORM ──────────────────────────────────────────────
  // This is reached when phase.kind is not matched above (manual form intent via SUBMIT)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-8">

        {showResumeBanner && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="text-sm text-primary-800">
              Lanjutkan dari yang kemarin? ({draftCount} dari 10 field sudah diisi)
            </p>
            <div className="flex gap-2 shrink-0">
              <button onClick={resumeDraft} className="text-xs font-medium text-primary-700 underline">Lanjutkan</button>
              <button onClick={() => { setShowResumeBanner(false); clearDraft() }} className="text-xs text-slate-500 underline">Hapus</button>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Cek Slip Gaji</h1>
            <p className="text-sm text-slate-500">Input data manual</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
            Batal
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* Gross Salary */}
          <div>
            <Label htmlFor="grossSalary">Gaji Bruto /bulan *</Label>
            <div className="mt-1">
              <Input
                id="grossSalary"
                placeholder="7.500.000"
                inputMode="numeric"
                pattern="[0-9]*"
                {...form.register('grossSalary')}
              />
            </div>
            {form.formState.errors.grossSalary && (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.grossSalary.message}</p>
            )}
          </div>

          {/* PTKP + Kota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Status PTKP *
              </Label>
              <Select
                onValueChange={(v) => form.setValue('ptkpStatus', v as FormValues['ptkpStatus'])}
                defaultValue={form.getValues('ptkpStatus')}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PTKP_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{value} — {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kota *</Label>
              <Select
                onValueChange={(v) => form.setValue('city', v)}
                defaultValue={form.getValues('city')}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih kota..." /></SelectTrigger>
                <SelectContent>
                  {cities.length === 0
                    ? <SelectItem value="loading" disabled>Memuat kota...</SelectItem>
                    : cities.map((c) => (
                        <SelectItem key={`${c.city}-${c.province}`} value={c.city}>
                          {c.city} ({c.province})
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Month + Year + NPWP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label>Bulan *</Label>
              <Select
                onValueChange={(v) => form.setValue('monthNumber', v)}
                defaultValue={String(form.getValues('monthNumber'))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tahun *</Label>
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-1"
                {...form.register('year', { valueAsNumber: true })}
              />
            </div>
            <div className="col-span-2">
              <Label>Punya NPWP?</Label>
              <div className="mt-1 flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={form.watch('hasNPWP') === true}
                    onChange={() => form.setValue('hasNPWP', true)}
                    className="accent-primary"
                  />
                  Ya
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={form.watch('hasNPWP') === false}
                    onChange={() => form.setValue('hasNPWP', false)}
                    className="accent-primary"
                  />
                  Tidak
                </label>
              </div>
              {form.watch('hasNPWP') === false && (
                <p className="mt-1 text-xs text-amber-600">Tanpa NPWP, tarif PPh21 lebih tinggi 20%.</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Reported deductions */}
          <div>
            <p className="text-sm font-medium text-slate-700">Isian dari Slip Gaji</p>
            <p className="text-xs text-slate-500 mb-3">Masukkan angka yang ada di slip gaji kamu</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="reportedPph21">PPh21 Dipotong</Label>
                <Input
                  id="reportedPph21"
                  placeholder="112.500"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...form.register('reportedPph21')}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportedJht">JHT Karyawan</Label>
                  <Input
                    id="reportedJht"
                    placeholder="150.000"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    {...form.register('reportedJht')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reportedJp">JP Karyawan</Label>
                  <Input
                    id="reportedJp"
                    placeholder="75.000"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    {...form.register('reportedJp')}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reportedKesehatan">BPJS Kesehatan Karyawan</Label>
                <Input
                  id="reportedKesehatan"
                  placeholder="75.000"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...form.register('reportedKesehatan')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="takeHome">
                  Take Home Pay
                  <span className="ml-1 text-xs text-slate-500 font-normal">(gaji masuk rekening)</span>
                </Label>
                <Input
                  id="takeHome"
                  placeholder="7.000.000"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...form.register('takeHome')}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <strong>Catatan:</strong> Hasil kalkulasi bersifat indikatif berdasarkan PMK 168/2023 (TER). Bukan nasihat perpajakan resmi.
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-600 hover:bg-emerald-700 text-base py-6 rounded-xl font-semibold"
          >
            <Zap className="inline h-4 w-4 mr-2 text-amber-400" />
            Cek Slip Gaji →
          </Button>

          <p className="text-center text-xs text-slate-500">
            Slip dihapus 30 hari otomatis (UU PDP).
          </p>
        </form>
      </div>
    </div>
  )
}
