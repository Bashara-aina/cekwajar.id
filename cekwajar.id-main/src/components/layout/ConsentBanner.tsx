'use client'

// ==============================================================================
// cekwajar.id — ConsentBanner.tsx
// UU PDP (Undang-Undang Pelindungan Data Pribadi) compliance banner
// Shows before payslip upload; records three-way consent.
// ==============================================================================

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Checkbox({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 transition-colors',
        checked ? 'bg-emerald-600 border-emerald-600' : 'bg-white hover:border-emerald-400',
        className
      )}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

interface ConsentBannerProps {
  /** Called when consent is successfully recorded and user may proceed */
  onConsentGranted?: () => void
  /** If true, show just the checkbox form (no banner chrome) embedded in page */
  embedded?: boolean
}

export function ConsentBanner({ onConsentGranted, embedded = false }: ConsentBannerProps) {
  const [privacyPolicy, setPrivacyPolicy] = useState(false)
  const [termsOfService, setTermsOfService] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = privacyPolicy && termsOfService

  async function handleSubmit() {
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Anda harus login terlebih dahulu.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacyPolicyAccepted: privacyPolicy,
          termsAccepted: termsOfService,
          marketingAccepted: marketing,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Gagal menyimpan consent. Silakan coba lagi.')
        setLoading(false)
        return
      }

      onConsentGranted?.()
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  // Embedded mode (for inserting into an existing page flow)
  if (embedded) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <p className="text-sm text-slate-600">
          Sebelum mengunggah slip gaji, Anda harus menyetujui Kebijakan Privasi dan Syarat Layanan kami.
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-2">
            <Checkbox
              checked={privacyPolicy}
              onCheckedChange={(v) => setPrivacyPolicy(!!v)}
            />
            <span className="text-sm">
              Saya telah membaca dan menyetujui{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                Kebijakan Privasi
              </a>{' '}
              *
            </span>
          </label>
          <label className="flex items-start gap-2">
            <Checkbox
              checked={termsOfService}
              onCheckedChange={(v) => setTermsOfService(!!v)}
            />
            <span className="text-sm">
              Saya telah membaca dan menyetujui{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                Syarat dan Ketentuan Layanan
              </a>{' '}
              *
            </span>
          </label>
          <label className="flex items-start gap-2">
            <Checkbox
              checked={marketing}
              onCheckedChange={(v) => setMarketing(!!v)}
            />
            <span className="text-sm">
              Saya menyetujui menerima informasi promosi dan newsletter dari cekwajar.id (opsional)
            </span>
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? 'Menyimpan...' : 'Setuju dan Lanjutkan'}
        </Button>
      </div>
    )
  }

  // Full banner mode (fixed at bottom, overlay style)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Persetujuan Pengumpulan Data
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Sesuai dengan UU PDP (Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi),
          kami memerlukan persetujuan eksplisit Anda sebelum mengumpulkan dan memproses data pribadi
          yang terdapat dalam slip gaji Anda.
        </p>

        <div className="mb-4 flex flex-col gap-3">
          <label className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              checked={privacyPolicy}
              onCheckedChange={(v) => setPrivacyPolicy(!!v)}
            />
            <span className="text-sm">
              Saya telah membaca dan menyetujui{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                Kebijakan Privasi
              </a>{' '}
              *
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              checked={termsOfService}
              onCheckedChange={(v) => setTermsOfService(!!v)}
            />
            <span className="text-sm">
              Saya telah membaca dan menyetujui{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                Syarat dan Ketentuan Layanan
              </a>{' '}
              *
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              checked={marketing}
              onCheckedChange={(v) => setMarketing(!!v)}
            />
            <span className="text-sm">
              Saya menyetujui menerima informasi promosi dan newsletter dari cekwajar.id (opsional)
            </span>
          </label>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <p className="mb-4 text-xs text-slate-500">
          * Wajib diisi. Data slip gaji Anda (gaji kotor, NPWP, identitas empleador) akan disimpan
          sementara untuk keperluan kalkulasi PPh 21 dan analisis kepatuhan. Slip gaji akan dihapus
          secara otomatis setelah 30 hari sesuai kebijakan penyimpanan data kami.
        </p>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? 'Menyimpan persetujuan...' : 'Setuju dan Lanjutkan'}
        </Button>
      </div>
    </div>
  )
}