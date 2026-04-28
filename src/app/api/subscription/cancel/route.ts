import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const cancelSchema = z.object({
  reason: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const parsed = cancelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { reason } = parsed.data

    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription_cancel_at_period_end: true,
        subscription_cancel_reason: reason ?? null,
        subscription_canceled_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Cancel subscription error:', error)
      return NextResponse.json({ error: 'Cancel failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Subscription cancelled at period end' })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Cancel failed' }, { status: 500 })
  }
}
