'use client'

import { useState } from 'react'
import { getAnonSessionId } from '@/lib/anon-session'

const CONSENT_KEY = 'cekwajar_consent_v1'

interface ConsentStatus {
  hasConsented: boolean
  consentedAt: number | null
}

function getInitialStatus(): ConsentStatus {
  if (typeof window === 'undefined') return { hasConsented: false, consentedAt: null }
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return { hasConsented: false, consentedAt: null }
    return JSON.parse(raw) as ConsentStatus
  } catch {
    return { hasConsented: false, consentedAt: null }
  }
}

export function useConsentStatus() {
  const [status, setStatus] = useState<ConsentStatus>(getInitialStatus)

  const recordConsent = async () => {
    const sessionId = getAnonSessionId()
    await fetch('/api/consent/payslip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: 'v1.0_2026_05',
        general: true,
        sensitive: true,
        sessionId,
      }),
    })
    const newStatus: ConsentStatus = { hasConsented: true, consentedAt: Date.now() }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newStatus))
    setStatus(newStatus)
  }

  return { ...status, recordConsent, loading: false }
}