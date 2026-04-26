import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const today = new Date()
  const dayOfMonth = today.getDate()

  if (dayOfMonth !== 26) {
    return NextResponse.json({ sent: 0, note: 'Not 26th' })
  }

  const { data: proUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('id, full_name, email')
    .eq('subscription_tier', 'pro')

  if (!proUsers?.length) return NextResponse.json({ sent: 0 })

  let count = 0
  for (const user of proUsers) {
    const email = user.email
    if (!email) continue

    await fetch(`${process.env.DATABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        template: 'monthly-slip-prompt',
        vars: { name: user.full_name?.split(' ')[0] ?? 'Andi' },
      }),
    }).catch(() => {})
    count++
  }

  return NextResponse.json({ sent: count })
}