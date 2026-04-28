import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ tier: 'free', email: null, full_name: null })
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, email, full_name')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      tier: profile?.subscription_tier || 'free',
      email: profile?.email || user.email,
      full_name: profile?.full_name || null,
    })
  } catch {
    return NextResponse.json({ tier: 'free', email: null, full_name: null })
  }
}
