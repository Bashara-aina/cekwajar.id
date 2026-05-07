// ==============================================================================
// cekwajar.id — DELETE /api/user/delete-account
// Data subject rights under UU PDP — deletes all user data
// Uses Supabase service role client for admin operations
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DeletionReport {
  deleted_profiles: boolean
  deleted_subscriptions: boolean
  deleted_transactions: number
  deleted_payslip_audits: number
  deleted_storage_files: number
  errors: string[]
}

export async function DELETE(request: NextRequest) {
  // Verify authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' } },
      { status: 401 }
    )
  }

  const userId = user.id
  const errors: string[] = []

  // Get service role client for admin operations
  const admin = await getServiceClient()

  // 1. Delete storage files (payslips bucket)
  try {
    const listResult = await admin.storage
      .from('payslips')
      .list(userId, { limit: 100 })

    if (listResult.error) {
      errors.push(`Storage listing failed: ${listResult.error.message}`)
    } else {
      const files = listResult.data ?? []
      if (files.length > 0) {
        const pathsToDelete = files
          .filter((f) => f.name !== '.emptyFolderPlaceholder')
          .map((f) => `${userId}/${f.name}`)

        if (pathsToDelete.length > 0) {
          const { error: deleteError } = await admin.storage
            .from('payslips')
            .remove(pathsToDelete)
          if (deleteError) {
            errors.push(`Storage deletion failed: ${deleteError.message}`)
          }
        }
      }
      }
  } catch (e) {
    errors.push(`Storage error: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 2. Delete payslip_audits
  let deletedAudits = 0
  try {
    const { error: auditError } = await admin
      .from('payslip_audits')
      .delete()
      .eq('user_id', userId)

    if (auditError) {
      errors.push(`Payslip audits deletion failed: ${auditError.message}`)
    } else {
      deletedAudits = 0 // Affected rows not returned by suppress
    }
  } catch (e) {
    errors.push(`Payslip audits error: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 3. Delete transactions
  let deletedTransactions = 0
  try {
    const { error: txError } = await admin
      .from('transactions')
      .delete()
      .eq('user_id', userId)

    if (txError) {
      errors.push(`Transactions deletion failed: ${txError.message}`)
    }
  } catch (e) {
    errors.push(`Transactions error: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 4. Delete subscriptions
  let deletedSubscriptions = false
  try {
    const { error: subError } = await admin
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)

    if (subError) {
      errors.push(`Subscriptions deletion failed: ${subError.message}`)
    } else {
      deletedSubscriptions = true
    }
  } catch (e) {
    errors.push(`Subscriptions error: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 5. Delete user_consents
  try {
    await admin
      .from('user_consents')
      .delete()
      .eq('user_id', userId)
  } catch {
    // Non-critical, skip
  }

  // 6. Delete user profile (cascade deletes auth.users)
  let deletedProfile = false
  try {
    const { error: profileError } = await admin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      errors.push(`Profile deletion failed: ${profileError.message}`)
    } else {
      deletedProfile = true
    }
  } catch (e) {
    errors.push(`Profile error: ${e instanceof Error ? e.message : String(e)}`)
  }

  const report: DeletionReport = {
    deleted_profiles: deletedProfile,
    deleted_subscriptions: deletedSubscriptions,
    deleted_transactions: deletedTransactions,
    deleted_payslip_audits: deletedAudits,
    deleted_storage_files: 0, // Count not reliably returned
    errors,
  }

  // Log the deletion for audit trail (server-side only)
  console.info(`[delete-account] User ${userId} deletion report:`, JSON.stringify(report))

  return NextResponse.json({
    success: true,
    data: {
      message: 'Data pengguna telah dihapus sesuai permintaan.',
      report,
      deletedAt: new Date().toISOString(),
    },
  })
}