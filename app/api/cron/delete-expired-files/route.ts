import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { subDays } from 'date-fns'

export const runtime = 'nodejs'

export async function DELETE() {
  const RETENTION_DAYS = 30
  const cutoff = subDays(new Date(), RETENTION_DAYS).toISOString()

  const { data: expired } = await supabaseAdmin
    .from('audit_files')
    .select('id, storage_path, user_id')
    .lt('created_at', cutoff)
    .eq('deleted', false)

  if (!expired?.length) {
    return NextResponse.json({ deleted: 0 })
  }

  let count = 0
  for (const file of expired) {
    const { error } = await supabaseAdmin.storage.from('payslips').remove([file.storage_path])
    if (!error) {
      await supabaseAdmin.from('audit_files').update({ deleted: true, deleted_at: new Date().toISOString() }).eq('id', file.id)
      count++
    } else {
      console.error('[cron] Failed to delete:', file.storage_path, error)
    }
  }

  console.log(`[cron] Deleted ${count} expired files`)
  return NextResponse.json({ deleted: count })
}