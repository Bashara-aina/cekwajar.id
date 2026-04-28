import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userIdShort: string }> }
) {
  try {
    const { userIdShort } = await params
    const supabase = createSupabaseClient()

    const { data: user } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .ilike('id', `${userIdShort}%`)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    return NextResponse.json({
      referralLink: `https://cekwajar.id/r/${userIdShort}`,
      referrerName: user.full_name ?? 'Temanmu',
    })
  } catch (error) {
    console.error('Referral link error:', error)
    return NextResponse.json({ error: 'Failed to fetch referral' }, { status: 500 })
  }
}
