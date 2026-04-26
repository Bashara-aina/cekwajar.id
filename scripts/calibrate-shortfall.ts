import { supabaseAdmin } from '../lib/supabase/server'

async function main() {
  const sb = supabaseAdmin
  const { data } = await sb
    .from('payslip_audits')
    .select('shortfall_idr, created_at')
    .eq('verdict', 'ADA_PELANGGARAN')
    .gte('created_at', new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString())
    .gt('shortfall_idr', 0)
    .lt('shortfall_idr', 50_000_000)

  if (!data || data.length < 50) {
    console.log('Not enough data — keep current anchor IDR 847.000')
    return
  }
  const sorted = data.map((r) => r.shortfall_idr).sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  console.log(`Median shortfall (n=${data.length}): IDR ${median.toLocaleString('id-ID')}`)
  console.log('Update REVENUE_ANCHORS.AVG_SHORTFALL_IDR in lib/constants.ts')
}

main().catch(console.error)