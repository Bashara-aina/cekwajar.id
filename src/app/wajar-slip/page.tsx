'use client'
import { useState, useReducer } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Upload, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IDRInput } from '@/components/ui/idr-input'
import { createClient } from '@/lib/supabase/client'

type SlipPhase =
  | { kind: 'IDLE' }
  | { kind: 'UPLOADING' }
  | { kind: 'OCR_PROCESSING' }
  | { kind: 'CONFIRM' }
  | { kind: 'CALCULATING' }
  | { kind: 'VERDICT'; data: any }
  | { kind: 'ERROR'; message: string }

type Action =
  | { type: 'START_UPLOAD' }
  | { type: 'OCR_DONE'; extracted: any }
  | { type: 'CONFIRM' }
  | { type: 'CALCULATE'; result: any }
  | { type: 'ERROR'; message: string }

function reducer(state: SlipPhase, action: Action): SlipPhase {
  switch (action.type) {
    case 'START_UPLOAD': return { kind: 'UPLOADING' }
    case 'OCR_DONE': return { kind: 'CONFIRM' }
    case 'CONFIRM': return { kind: 'CALCULATING' }
    case 'CALCULATE': return { kind: 'VERDICT', data: action.result }
    case 'ERROR': return { kind: 'ERROR', message: action.message }
    default: return state
  }
}

const PTKP_OPTIONS = [
  { value: 'TK/0', label: 'TK/0 - Tidak Kawin, tanpa tanggungan' },
  { value: 'TK/1', label: 'TK/1 - Tidak Kawin, 1 tanggungan' },
  { value: 'TK/2', label: 'TK/2 - Tidak Kawin, 2 tanggungan' },
  { value: 'K/0', label: 'K/0 - Kawin, tanpa tanggungan' },
  { value: 'K/1', label: 'K/1 - Kawin, 1 tanggungan' },
  { value: 'K/2', label: 'K/2 - Kawin, 2 tanggungan' },
  { value: 'K/3', label: 'K/3 - Kawin, 3 tanggungan' },
]

export default function WajarSlipPage() {
  const [state, dispatch] = useReducer(reducer, { kind: 'IDLE' })
  const [grossSalary, setGrossSalary] = useState(0)
  const [ptkpStatus, setPtkpStatus] = useState('TK/0')
  const [city, setCity] = useState('')
  const [monthNumber, setMonthNumber] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [hasNPWP, setHasNPWP] = useState(true)
  const [reportedDeductions, setReportedDeductions] = useState({
    pph21: 0, jht: 0, jp: 0, jkk: 0, jkm: 0, kesehatan: 0, takeHome: 0
  })

  const handleSubmit = async () => {
    dispatch({ type: 'CONFIRM' })

    try {
      const supabase = createClient()
      const response = await fetch('/api/audit-payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossSalary,
          ptkpStatus,
          city,
          monthNumber,
          year,
          hasNPWP,
          reportedDeductions,
        }),
      })

      const result = await response.json()
      dispatch({ type: 'CALCULATE', result })
    } catch (err) {
      dispatch({ type: 'ERROR', message: 'Audit failed' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Cek Slip Gaji</h1>
          <p className="text-slate-500">PMK 168/2023 + 6 komponen BPJS</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Gross Salary */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gaji Bruto</label>
              <IDRInput value={grossSalary} onChange={setGrossSalary} className="text-lg" />
            </div>

            {/* PTKP Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status PTKP</label>
              <select
                value={ptkpStatus}
                onChange={(e) => setPtkpStatus(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                {PTKP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kota</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jakarta"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            {/* Month/Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bulan</label>
                <select
                  value={monthNumber}
                  onChange={(e) => setMonthNumber(parseInt(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                >
                  {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* NPWP */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="npwp"
                checked={hasNPWP}
                onChange={(e) => setHasNPWP(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="npwp" className="text-sm text-slate-700">Memiliki NPWP</label>
            </div>

            {/* Deductions */}
            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-medium text-slate-700">Potongan yang Tercantum di Slip</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">PPh21</label>
                  <IDRInput value={reportedDeductions.pph21} onChange={(v) => setReportedDeductions(d => ({ ...d, pph21: v }))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">JHT</label>
                  <IDRInput value={reportedDeductions.jht} onChange={(v) => setReportedDeductions(d => ({ ...d, jht: v }))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">JP</label>
                  <IDRInput value={reportedDeductions.jp} onChange={(v) => setReportedDeductions(d => ({ ...d, jp: v }))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">BPJS Kesehatan</label>
                  <IDRInput value={reportedDeductions.kesehatan} onChange={(v) => setReportedDeductions(d => ({ ...d, kesehatan: v }))} />
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full h-12 text-base" disabled={state.kind === 'CALCULATING'}>
              {state.kind === 'CALCULATING' ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menghitung...</>
              ) : (
                <>Cek Slip Gaji <ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Verdict Display */}
        {state.kind === 'VERDICT' && (
          <Card className={`mt-6 ${state.data.verdict === 'ADA_PELANGGARAN' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {state.data.verdict === 'ADA_PELANGGARAN' ? (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                )}
                <div>
                  <Badge variant={state.data.verdict === 'ADA_PELANGGARAN' ? 'destructive' : 'default'}>
                    {state.data.verdict}
                  </Badge>
                  <p className="mt-1 text-sm text-slate-600">
                    {state.data.violations.length} pelanggaran ditemukan
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {state.data.violations.map((v: any) => (
                  <li key={v.code} className="flex justify-between text-sm">
                    <span className="text-slate-700">[{v.code}] {v.name}</span>
                    {v.difference !== null ? (
                      <span className="font-mono text-red-600">+ IDR {v.difference.toLocaleString('id-ID')}</span>
                    ) : (
                      <span className="text-slate-400">***</span>
                    )}
                  </li>
                ))}
              </ul>

              {state.data.upsellMessage && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">{state.data.upsellMessage}</p>
                  <Button asChild className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">
                    <a href="/upgrade">Upgrade ke Pro — IDR 49.000/bulan</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}