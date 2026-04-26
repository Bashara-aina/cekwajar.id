import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral — cekwajar.id',
}

interface Props {
  params: Promise<{ code: string }>
}

export default async function ReferralRedirectPage({ params }: Props) {
  const { code } = await params
  const sb = await createClient()

  const { data: profile } = await sb
    .from('user_profiles')
    .select('id, referral_code')
    .eq('referral_code', code)
    .maybeSingle()

  if (profile) {
    redirect(`/upgrade?ref=${code}`)
  } else {
    redirect('/')
  }
}