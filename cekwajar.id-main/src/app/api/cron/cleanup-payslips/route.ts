// ==============================================================================
// cekwajar.id — /api/cron/cleanup-payslips
// UU PDP 30-day auto-delete for payslip files and audit records
// Runs via Supabase pg_cron or can be called as a webhook
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cron endpoint secret to prevent unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function POST(request: NextRequest) {
  // Verify cron secret (if configured)
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authorized.' } },
        { status: 401 }
      )
    }
  }

  const admin = await getServiceClient()

  const results = {
    deleted_audits: 0,
    deleted_files: 0,
    errors: [] as string[],
  }

  // Fetch audits due for deletion (older than 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: dueForDeletion, error: fetchError } = await admin
    .from('payslip_audits')
    .select('id, payslip_file_path, user_id')
    .lt('delete_at', thirtyDaysAgo)

  if (fetchError) {
    results.errors.push(`Fetch error: ${fetchError.message}`)
    return NextResponse.json(
      { success: false, data: results },
      { status: 500 }
    )
  }

  if (!dueForDeletion || dueForDeletion.length === 0) {
    return NextResponse.json({
      success: true,
      data: { message: 'No records to clean up.', ...results },
    })
  }

  // Collect unique storage paths
  const storagePaths = dueForDeletion
    .filter((r) => r.payslip_file_path)
    .map((r) => r.payslip_file_path as string)

  // Delete storage files
  if (storagePaths.length > 0) {
    const { error: storageError } = await admin.storage
      .from('payslips')
      .remove(storagePaths)

    if (storageError) {
      results.errors.push(`Storage deletion error: ${storageError.message}`)
    } else {
      results.deleted_files = storagePaths.length
    }
  }

  // Delete audit records
  const auditIds = dueForDeletion.map((r) => r.id)
  const { error: deleteError } = await admin
    .from('payslip_audits')
    .delete()
    .in('id', auditIds)

  if (deleteError) {
    results.errors.push(`Audit deletion error: ${deleteError.message}`)
  } else {
    results.deleted_audits = auditIds.length
  }

  console.info(`[cleanup-payslips] Ran at ${new Date().toISOString()}:`, JSON.stringify(results))

  return NextResponse.json({
    success: true,
    data: {
      message: `Cleaned up ${results.deleted_audits} audit records and ${results.deleted_files} storage files.`,
      ...results,
      runAt: new Date().toISOString(),
    },
  })
}

// Allow GET for manual testing in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Manual runs not allowed in production.' } },
      { status: 403 }
    )
  }
  return POST(request)
}