'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — SuratKeberatanButton Component
// Pro feature: appears on ADA_PELANGGARAN verdict for pro users
// Opens a modal where user enters company name → generates objection letter + WA templates
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react'
import { FileText, MessageSquare, Copy, Check, Loader2, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface SuratKeberatanButtonProps {
  auditId: string
  tier: 'free' | 'basic' | 'pro'
}

interface GeneratedContent {
  letter: string
  letterSource: 'groq' | 'fallback'
  letterConfidence: number
  whatsappTemplates: [string, string, string]
  whatsappSource: 'groq' | 'fallback'
  whatsappConfidence: number
}

type ModalStep = 'input' | 'loading' | 'result'

const WA_TEMPLATE_LABELS = ['Template 1 — Initial Follow-up', 'Template 2 — Escalation Notice', 'Template 3 — Settlement Offer'] as const

export function SuratKeberatanButton({ auditId, tier }: SuratKeberatanButtonProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<ModalStep>('input')
  const [companyName, setCompanyName] = useState('')
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const isPro = tier === 'pro'

  const handleOpen = useCallback(() => {
    if (!isPro) return
    setOpen(true)
    setStep('input')
    setCompanyName('')
    setContent(null)
    setError(null)
  }, [isPro])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    setStep('loading')
    setError(null)

    try {
      const res = await fetch('/api/surat-keberatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message ?? 'Gagal menghasilkan surat.')
        setStep('input')
        return
      }

      setContent(json.data)
      setStep('result')
    } catch {
      setError('Koneksi terputus. Coba lagi.')
      setStep('input')
    }
  }, [auditId])

  const handleCopy = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }, [])

  // Replace HR placeholder in letter with company name if provided
  const displayLetter = content?.letter.replace(
    /Yth\.\s*Bapak\/Ibu\s*\[HR\/Divisi SDM\]/g,
    companyName ? `Yth. Bapak/Ibu ${companyName}` : 'Yth. Bapak/Ibu HR/Divisi SDM'
  ) ?? ''

  if (!isPro) return null

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left transition-colors hover:bg-red-100"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <FileText className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">Surat Keberatan + Template WA</p>
          <p className="text-xs text-red-600">Buat surat resmi &amp; template chat HR — fitur Pro</p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-red-400" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Surat Keberatan Resmi
            </DialogTitle>
            <DialogDescription className="text-left">
              Masukkan nama perusahaan kamu untuk menyesuaikan surat. Surat akan menyebut
              pelanggaran spesifik, jumlah selisih IDR, dan dasar hukum yang dilanggar.
            </DialogDescription>
          </DialogHeader>

          {/* ── Step: Input ─────────────────────────────────────────────── */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name" className="text-sm font-medium text-slate-700">
                  Nama Perusahaan <span className="text-slate-500">(opsional)</span>
                </Label>
                <Input
                  id="company-name"
                  placeholder="Contoh: PT ABC Indonesia"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1.5"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerate()
                  }}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Jika kosong, akan menggunakan &quot;HR/Divisi SDM&quot; generik.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={handleClose}>
                  Batal
                </Button>
                <Button onClick={handleGenerate} className="bg-primary-600 hover:bg-primary-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Buat Surat Keberatan
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── Step: Loading ─────────────────────────────────────────── */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              <div className="text-center">
                <p className="font-medium text-slate-700">Menghasilkan surat...</p>
                <p className="mt-1 text-sm text-slate-500">
                  Groq AI membuat surat keberatan &amp; template WA untuk kamu.
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Result ──────────────────────────────────────────── */}
          {step === 'result' && content && (
            <div className="space-y-5">
              {/* Letter section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Surat Keberatan</h3>
                  {content.letterSource === 'fallback' && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      Fallback — GROQ unavailable
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                    {displayLetter}
                  </div>
                  <button
                    onClick={() => handleCopy(displayLetter, 0)}
                    className="absolute right-2 top-2 rounded bg-white p-1.5 text-slate-500 shadow-sm hover:text-slate-600 transition-colors"
                    title="Copy letter"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4 text-primary-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp templates */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MessageSquare className="h-4 w-4 text-primary-600" />
                  Template WhatsApp ke HR
                </h3>
                <div className="space-y-2">
                  {content.whatsappTemplates.map((template, i) => (
                    <div key={i} className="relative">
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="mb-1 text-xs text-slate-500">{WA_TEMPLATE_LABELS[i]}</p>
                        <p className="text-sm text-slate-700">{template}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(template, i + 1)}
                        className="absolute right-2 top-2 rounded bg-slate-50 p-1.5 text-slate-600 hover:text-slate-700 transition-colors"
                        title="Copy template"
                      >
                        {copiedIndex === i + 1 ? (
                          <Check className="h-3.5 w-3.5 text-primary-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Template WA bersifat sopan, singkat (max 200 karakter), dan langsung bisa
                  dikirim ke HR via WhatsApp.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('input')
                    setContent(null)
                  }}
                >
                  Buat Ulang
                </Button>
                <Button onClick={handleClose} className="bg-primary-600 hover:bg-primary-700">
                  Selesai
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
