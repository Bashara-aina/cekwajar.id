'use client'

/**
 * cekwajar.id — ConsentGate
 * Requires user to accept privacy policy + terms before proceeding.
 * Shown before payslip upload / audit flow per UU PDP 27/2022.
 */

import { useState } from 'react'
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConsentGateProps {
  children: React.ReactNode
  /** If true, show the gate regardless of consent state */
  forceShow?: boolean
  onConsentGranted?: () => void
}

/**
 * ConsentGate wraps sensitive data collection flows (payslip upload).
 * It checks the user's consent status and shows a consent dialog if needed.
 *
 * The consent check is performed client-side via GET /api/consent.
 * On acceptance, POST /api/consent is called to record the consent.
 */
export function ConsentGate({ children, forceShow = false, onConsentGranted }: ConsentGateProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [consentState, setConsentState] = useState<{
    privacyPolicyAccepted: boolean
    termsAccepted: boolean
    marketingAccepted: boolean
    acceptedAt: string | null
  } | null>(null)

  async function checkConsent() {
    if (consentState !== null && !forceShow) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/consent')
      const json = await res.json()
      if (json.success && json.data) {
        setConsentState({
          privacyPolicyAccepted: json.data.privacyPolicyAccepted,
          termsAccepted: json.data.termsAccepted,
          marketingAccepted: json.data.marketingAccepted,
          acceptedAt: json.data.acceptedAt,
        })
        if (!json.data.privacyPolicyAccepted || !json.data.termsAccepted) {
          setShowConsentDialog(true)
        } else {
          onConsentGranted?.()
        }
      }
    } catch {
      setShowConsentDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function grantConsent() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacyPolicyAccepted: true,
          termsAccepted: true,
          marketingAccepted: consentState?.marketingAccepted ?? false,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setConsentState({
          privacyPolicyAccepted: true,
          termsAccepted: true,
          marketingAccepted: json.data.marketingAccepted,
          acceptedAt: json.data.recordedAt,
        })
        setShowConsentDialog(false)
        onConsentGranted?.()
      }
    } catch {
      // error — keep dialog open
    } finally {
      setIsLoading(false)
    }
  }

  if (consentState === null && !isLoading) {
    checkConsent()
  }

  const needsConsent =
    consentState === null ||
    !consentState.privacyPolicyAccepted ||
    !consentState.termsAccepted

  if (needsConsent && !showConsentDialog && !forceShow) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {showConsentDialog && (
        <ConsentDialog
          isLoading={isLoading}
          marketingAccepted={consentState?.marketingAccepted ?? false}
          onAccept={() => grantConsent()}
          onDecline={() => setShowConsentDialog(false)}
        />
      )}
      {consentState?.privacyPolicyAccepted && consentState?.termsAccepted && (
        <>{children}</>
      )}
    </>
  )
}

interface ConsentDialogProps {
  isLoading: boolean
  marketingAccepted: boolean
  onAccept: () => void
  onDecline: () => void
}

function ConsentDialog({ isLoading, marketingAccepted, onAccept, onDecline }: ConsentDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <ShieldCheck className="h-6 w-6 text-primary-600" />
          </div>
          <DialogTitle className="text-center">
            Persetujuan Penggunaan Data
          </DialogTitle>
          <DialogDescription className="text-center">
            Sebelum mengunggah slip gaji, Anda perlu menyetujui kebijakan privasi
            dan ketentuan layanan kami sesuai UU PDP 27/2022.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <div>
              <p className="text-sm font-medium">Kebijakan Privasi</p>
              <p className="text-xs text-muted-foreground">
                Kami melindungi data pribadi Anda dan tidak akan membagikan
                ke pihak ketiga tanpa persetujuan.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <div>
              <p className="text-sm font-medium">Ketentuan Layanan</p>
              <p className="text-xs text-muted-foreground">
                Dengan mengunggah slip gaji, Anda menyetujui pemrosesan data
                untuk keperluan audit kepatuhan.
              </p>
            </div>
          </div>
          {marketingAccepted && (
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <div>
                <p className="text-sm font-medium">Persetujuan Marketing</p>
                <p className="text-xs text-muted-foreground">
                  Anda telah menyetujui menerima komunikasi promosi.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onDecline} disabled={isLoading}>
            <XCircle className="mr-2 h-4 w-4" />
            Tidak, Batalkan
          </Button>
          <Button
            onClick={onAccept}
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saya Setuju
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}