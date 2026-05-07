'use client'

import { useState, useRef } from 'react'
import { CheckCircle2, AlertTriangle, Pencil } from 'lucide-react'
import { IDRInput } from '@/components/forms/IDRInput'
import { Button } from '@/components/ui/button'
import type { ExtractedPayslipFields } from '@/lib/ocr/field-extractor'

type EditsMap = Record<string, number>

interface FieldRow {
  key: string
  label: string
  value: number
  confidence: number
}

interface Props {
  fields: ExtractedPayslipFields
  fieldConfidences: Record<string, number>
  ocrConfidence: number
  ocrEngine: 'vision' | 'tesseract'
  onConfirm: (overrides: ExtractedPayslipFields, totalTimeMs: number) => void
  onCancel: () => void
  onOverride?: (field: string, wasValue: number, newValue: number) => void
}

const FIELD_LABELS: Record<string, string> = {
  grossSalary: 'Gaji Bruto',
  pph21: 'PPh21 Dipotong',
  jhtEmployee: 'JHT Karyawan',
  jpEmployee: 'JP Karyawan',
  kesehatanEmployee: 'BPJS Kesehatan',
  takeHome: 'Take Home Pay',
}

const FIELD_ORDER = ['grossSalary', 'takeHome', 'pph21', 'jhtEmployee', 'jpEmployee', 'kesehatanEmployee'] as const

function buildFieldRows(
  extracted: ExtractedPayslipFields,
  confidences: Record<string, number>
): FieldRow[] {
  const rows: FieldRow[] = []
  for (const key of FIELD_ORDER) {
    const raw = (extracted as Record<string, unknown>)[key]
    if (raw !== undefined && raw !== null) {
      rows.push({
        key,
        label: FIELD_LABELS[key] ?? key,
        value: typeof raw === 'number' ? raw : 0,
        confidence: confidences[key] ?? 0.5,
      })
    }
  }
  return rows
}

export function ConfirmExtractedFields({
  fields,
  fieldConfidences,
  ocrConfidence,
  ocrEngine,
  onConfirm,
  onCancel,
  onOverride,
}: Props) {
  const [edits, setEdits] = useState<EditsMap>({})
  const startTime = useRef<number>(Date.now())

  const allFields = buildFieldRows(fields, fieldConfidences)
  const lowFields = allFields.filter((f) => f.confidence < 0.85)
  const hasEdits = Object.keys(edits).length > 0

  const resolveValue = (key: string, original: number): number => {
    return edits[key] ?? original
  }

  const handleConfirm = () => {
    const elapsed = Date.now() - startTime.current
    const overrides: ExtractedPayslipFields = { ...fields }
    for (const [k, v] of Object.entries(edits)) {
      ;(overrides as Record<string, number>)[k] = v
    }
    onConfirm(overrides, elapsed)
  }

  const handleChange = (key: string, was: number, next: number) => {
    setEdits((prev) => ({ ...prev, [key]: next }))
    onOverride?.(key, was, next)
  }

  return (
    <div className="space-y-4 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-base font-semibold text-slate-900">Konfirmasi 4 angka ini</p>
        <p className="mt-1 text-xs text-slate-500">
          OCR sudah baca slip kamu. Kalo salah, klik untuk edit.
        </p>
      </div>

      {lowFields.length > 0 ? (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>
            <strong>{lowFields.length} angka kurang yakin</strong> — kami tandai dengan.
            Pastikan benar sebelum lanjut.
          </span>
        </div>
      ) : null}

      <table className="w-full text-sm">
        <tbody>
          {allFields.map((f) => {
            const isHigh = f.confidence >= 0.92
            const isLow = f.confidence < 0.85
            const current = resolveValue(f.key, f.value)
            return (
              <tr key={f.key} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 align-top">
                  <p className="text-slate-700">{f.label}</p>
                  <p className="text-[11px] text-slate-500">
                    {isHigh ? (
                      <span>
                        <CheckCircle2 className="inline h-3 w-3 text-emerald-500" />{' '}
                        {Math.round(f.confidence * 100)}% yakin
                      </span>
                    ) : isLow ? (
                      <span>
                        <AlertTriangle className="inline h-3 w-3 text-amber-500" />{' '}
                        {Math.round(f.confidence * 100)}% — perlu cek
                      </span>
                    ) : (
                      <span>{Math.round(f.confidence * 100)}% yakin</span>
                    )}
                  </p>
                </td>
                <td className="py-3 text-right">
                  <IDRInput
                    value={current}
                    onValueChange={(v) => {
                      if (v !== '') handleChange(f.key, f.value, v as number)
                    }}
                    className={isLow ? 'border-amber-400 bg-amber-50/50' : ''}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Confidence: {Math.round(ocrConfidence * 100)}% ·{' '}
          {ocrEngine === 'vision' ? 'Google Vision' : 'Tesseract OCR'}
        </span>
        {hasEdits ? (
          <span className="flex items-center gap-1 text-amber-600">
            <Pencil className="h-3 w-3" /> {Object.keys(edits).length} diedit
          </span>
        ) : null}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirm}>
          Lanjut ke Verdict →
        </Button>
      </div>
    </div>
  )
}
