'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FieldRow {
  key: string
  label: string
  value: number
  confidence: number
}

interface Props {
  fields: FieldRow[]
  onConfirm: (overrides: Record<string, number>) => void
  onCancel: () => void
}

export function ConfirmExtractedFields({ fields, onConfirm, onCancel }: Props) {
  const [edits, setEdits] = useState<Record<string, number>>({})

  const lowConfidence = fields.filter((f) => f.confidence < 0.85)

  const handleChange = (key: string, raw: string) => {
    const numeric = parseInt(raw.replace(/\D/g, ''), 10)
    if (!isNaN(numeric)) {
      setEdits((e) => ({ ...e, [key]: numeric }))
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-emerald-200 bg-white p-5 sm:p-6">
      <div>
        <p className="text-base font-semibold text-slate-900">Konfirmasi 4 angka ini</p>
        <p className="mt-1 text-xs text-slate-500">
          OCR sudah baca slip kamu. Kalo salah, klik untuk edit.
        </p>
      </div>

      {lowConfidence.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>{lowConfidence.length} angka kurang yakin</strong> — kami tandai dengan ⚠️.
            Pastikan benar sebelum lanjut.
          </span>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((f) => {
          const isHigh = f.confidence >= 0.92
          const isLow = f.confidence < 0.85
          const value = edits[f.key] ?? f.value

          return (
            <div key={f.key} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{f.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {isHigh ? (
                    <>
                      <CheckCircle2 className="inline h-3 w-3 text-emerald-500" /> {Math.round(f.confidence * 100)}% yakin
                    </>
                  ) : isLow ? (
                    <>
                      <AlertTriangle className="inline h-3 w-3 text-amber-500" /> {Math.round(f.confidence * 100)}% — perlu cek
                    </>
                  ) : (
                    <>{Math.round(f.confidence * 100)}% yakin</>
                  )}
                </p>
              </div>
              <div className="w-36 shrink-0">
                <input
                  type="text"
                  inputMode="numeric"
                  value={value > 0 ? value.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.value > 0 ? f.value.toLocaleString('id-ID') : '0'}
                  className={cn(
                    'w-full rounded-md border bg-white px-2 py-1.5 text-right font-mono text-sm transition-colors',
                    isLow ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200'
                  )}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onConfirm(edits)}
        >
          Lanjut ke Verdict →
        </Button>
      </div>
    </div>
  )
}