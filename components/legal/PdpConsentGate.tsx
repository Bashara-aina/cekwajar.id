'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ExternalLink } from 'lucide-react'

interface Props {
  open: boolean
  onConsented: () => void
}

export function PdpConsentGate({ open, onConsented }: Props) {
  const [generalConsent, setGeneralConsent] = useState(false)
  const [sensitiveConsent, setSensitiveConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  const canSubmit = generalConsent && sensitiveConsent

  async function record() {
    if (!canSubmit) return
    setLoading(true)
    try {
      await fetch('/api/consent/payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 'v1.0_2026_05',
          general: generalConsent,
          sensitive: sensitiveConsent,
        }),
      })
      onConsented()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg"
      >
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <DialogTitle className="text-center text-lg">
            Persetujuan Pemrosesan Data — UU No. 27/2022 (PDP)
          </DialogTitle>
          <p className="text-center text-xs text-slate-500">
            Slip gaji adalah data pribadi sensitif. Hukum mengharuskan kami minta persetujuanmu secara eksplisit, terpisah dari syarat lain.
          </p>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={generalConsent}
              onChange={(e) => setGeneralConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-emerald-600"
            />
            <div className="text-sm">
              <p className="font-medium text-slate-800">Data umum (Pasal 4 ayat 1)</p>
              <p className="mt-1 text-slate-600">
                Saya menyetujui pemrosesan informasi gaji, pekerjaan, dan kota saya untuk benchmark anonim.
              </p>
              <Link href="/privacy#general" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline" target="_blank">
                Lihat detail <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <input
              type="checkbox"
              checked={sensitiveConsent}
              onChange={(e) => setSensitiveConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-amber-600"
            />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Data sensitif (Pasal 20 ayat 2(a))</p>
              <p className="mt-1 text-amber-800">
                Saya memberikan persetujuan eksplisit untuk pemrosesan slip gaji saya.
                Slip akan diproses otomatis oleh OCR dan dihapus permanen dalam 30 hari.
                Tidak ada manusia yang akan melihat slip saya.
              </p>
              <Link href="/privacy#payslip" className="mt-1 inline-flex items-center gap-1 text-xs text-amber-900 underline" target="_blank">
                Lihat detail pemrosesan <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </label>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Kamu dapat menarik persetujuan ini kapan saja melalui dashboard.
          Penarikan akan menghapus seluruh data pribadi kamu dari sistem dalam 7 hari.
        </p>

        <Button
          className="mt-4 h-12 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
          disabled={!canSubmit || loading}
          onClick={record}
        >
          {loading ? 'Menyimpan…' : 'Lanjut ke upload slip'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}