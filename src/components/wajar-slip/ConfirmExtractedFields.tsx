'use client'
import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IDRInput } from '@/components/ui/idr-input'
import type { ExtractedFields } from './_state'

interface ConfirmExtractedFieldsProps {
  extracted: ExtractedFields
  onConfirm: (fields: ExtractedFields) => void
  onCancel: () => void
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 0.92
      ? 'bg-emerald-100 text-emerald-700'
      : confidence >= 0.80
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'
  const label =
    confidence >= 0.92 ? 'Tinggi' : confidence >= 0.80 ? 'Sedang' : 'Rendah'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {confidence >= 0.92 ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {label} ({Math.round(confidence * 100)}%)
    </span>
  )
}

interface FieldRowProps {
  label: string
  value: number
  confidence: number
  onChange: (value: number) => void
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
}

function FieldRow({ label, value, confidence, onChange, isEditing, onEdit, onCancel }: FieldRowProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
        <span className="min-w-0 flex-1 text-sm text-slate-700">{label}</span>
        <div className="w-32">
          <IDRInput value={value} onChange={onChange} />
        </div>
        <Button size="sm" onClick={onCancel} variant="ghost" className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">{label}</span>
        <ConfidenceBadge confidence={confidence} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-slate-900">
          IDR {value.toLocaleString('id-ID')}
        </span>
        <button
          onClick={onEdit}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ConfirmExtractedFields({ extracted, onConfirm, onCancel }: ConfirmExtractedFieldsProps) {
  const [fields, setFields] = useState<ExtractedFields>(extracted)
  const [editingField, setEditingField] = useState<keyof ExtractedFields | null>(null)

  const overallConfidence = extracted.confidence

  const handleConfirm = () => {
    onConfirm(fields)
  }

  const fieldLabels: Record<keyof ExtractedFields['fieldConfidences'], string> = {
    grossSalary: 'Gaji Bruto',
    pph21: 'PPh21',
    jht: 'JHT',
    jp: 'JP',
    kesehatan: 'BPJS Kesehatan',
    takeHome: 'Take Home Pay',
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Konfirmasi Data</h2>
          <p className="mt-1 text-sm text-slate-500">
            Periksa data yang kami ekstrak dari slip gaji kamu. Kalau ada yang salah, ketuk untuk koreksi.
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Kepercayaan ekstraksi keseluruhan</span>
            <ConfidenceBadge confidence={overallConfidence} />
          </div>
        </div>

        <div className="mb-6 space-y-2">
          {(Object.keys(fields.fieldConfidences) as Array<keyof ExtractedFields['fieldConfidences']>).map(
            (field) => (
              <FieldRow
                key={field}
                label={fieldLabels[field]}
                value={fields[field]}
                confidence={fields.fieldConfidences[field]}
                onChange={(value) => {
                  setFields((f) => ({ ...f, [field]: value }))
                }}
                isEditing={editingField === field}
                onEdit={() => setEditingField(field)}
                onCancel={() => setEditingField(null)}
              />
            )
          )}
        </div>

        {overallConfidence < 0.80 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                Ekstraksi tidak yakin dengan beberapa field. Mohon periksa dan koreksi sebelum
                melanjutkan.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Batal
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            Konfirmasi & Hitung →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
