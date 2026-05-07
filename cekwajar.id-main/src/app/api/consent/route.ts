/**
 * cekwajar.id — Consent API
 * Records and retrieves user consent for privacy policy, terms, and marketing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CURRENT_POLICY_VERSION = '2024.1'

const ConsentSchema = z.object({
  privacyPolicyAccepted: z.boolean(),
  termsAccepted: z.boolean(),
  marketingAccepted: z.boolean().default(false),
})

type ConsentInput = z.infer<typeof ConsentSchema>

/**
 * GET /api/consent
 * Returns the user's current consent status for the current policy version.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } },
        { status: 401 }
      )
    }

    const { data: consent, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id)
      .eq('policy_version', CURRENT_POLICY_VERSION)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Gagal mengambil status consent.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        policyVersion: CURRENT_POLICY_VERSION,
        privacyPolicyAccepted: consent?.privacy_policy_accepted ?? false,
        termsAccepted: consent?.terms_accepted ?? false,
        marketingAccepted: consent?.marketing_accepted ?? false,
        acceptedAt: consent?.accepted_at ?? null,
        isAnonymous: false,
      },
    })
  } catch (err) {
    console.error('[consent] GET error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server.' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/consent
 * Records user consent for the current policy version.
 * Required: privacy_policy and terms must both be accepted.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  let body: ConsentInput
  try {
    const json = await request.json()
    body = ConsentSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: err.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } },
      { status: 400 }
    )
  }

  // Core consents (privacy + terms) are mandatory
  if (!body.privacyPolicyAccepted || !body.termsAccepted) {
    return NextResponse.json(
      {
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'Acceptance of privacy policy and terms is required.',
        },
      },
      { status: 422 }
    )
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } },
        { status: 401 }
      )
    }

    // Upsert consent record for the current policy version
    const { error: upsertError } = await supabase
      .from('user_consents')
      .upsert(
        {
          user_id: user.id,
          policy_version: CURRENT_POLICY_VERSION,
          privacy_policy_accepted: body.privacyPolicyAccepted,
          terms_accepted: body.termsAccepted,
          marketing_accepted: body.marketingAccepted,
          accepted_at: new Date().toISOString(),
          ip_hash: null,
        },
        {
          onConflict: 'user_id,policy_version',
          ignoreDuplicates: false,
        }
      )

    if (upsertError) {
      console.error('[consent] upsert error:', upsertError)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Gagal menyimpan consent.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        policyVersion: CURRENT_POLICY_VERSION,
        privacyPolicyAccepted: body.privacyPolicyAccepted,
        termsAccepted: body.termsAccepted,
        marketingAccepted: body.marketingAccepted,
        recordedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[consent] POST error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server.' } },
      { status: 500 }
    )
  }
}
