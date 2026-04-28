'use client'
import { useState } from 'react'
import { useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface PdpConsentGateProps {
  onConsent: () => void
  children: React.ReactNode
}

export function PdpConsentGate({ onConsent, children }: PdpConsentGateProps) {
  const [showConsent, setShowConsent] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const checkConsent = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setShowConsent(false)
        setLoading(false)
        return
      }
      
      const { data: consent } = await supabase
        .from('user_consents')
        .select('privacy_policy_accepted, terms_accepted')
        .eq('user_id', user.id)
        .single()
      
      if (!consent?.privacy_policy_accepted || !consent?.terms_accepted) {
        setShowConsent(true)
      }
      
      setLoading(false)
    }
    
    checkConsent()
  }, [])
  
  const handleAccept = async () => {
    if (!accepted || !termsAccepted) return
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    await supabase.from('user_consents').insert({
      user_id: user.id,
      policy_version: '2026.04',
      privacy_policy_accepted: true,
      terms_accepted: true,
      accepted_at: new Date().toISOString(),
    })
    
    onConsent()
    setShowConsent(false)
  }
  
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Memuat...</p>
    </div>
  }
  
  if (showConsent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Persetujuan Penggunaan Data</h2>
          
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Kami memerlukan persetujuan Anda untuk memproses slip gaji Anda sesuai dengan 
              <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
            </p>
            
            <ul className="list-disc list-inside space-y-2">
              <li>Slip gaji Anda akan diproses untuk audit PPh21 dan BPJS</li>
              <li>File slip gaji disimpan di server aman (Supabase Singapore)</li>
              <li>Slip gaji akan dihapus secara otomatis setelah 30 hari</li>
              <li>Data tidak akan dibagikan kepada pihak ketiga</li>
              <li>Anda dapat meminta penghapusan data kapan saja</li>
            </ul>
          </div>
          
          <div className="mt-6 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v as boolean)}
                id="privacy"
              />
              <span htmlFor="privacy" className="text-sm">
                Saya memahami dan menyetujui kebijakan privasi
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v as boolean)}
                id="terms"
              />
              <span htmlFor="terms" className="text-sm">
                Saya menyetujui syarat dan ketentuan penggunaan
              </span>
            </label>
          </div>
          
          <Button
            onClick={handleAccept}
            disabled={!accepted || !termsAccepted}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}