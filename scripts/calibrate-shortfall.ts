import { createClient } from '../src/lib/supabase/server'

async function main() {
  const sb = createClient()

  const { data } = await sb
    .from('payslip_audits')
    .select('id, violations, gross_salary, created_at')
    .eq('verdict', 'ADA_PELANGGARAN')
    .gte('created_at', new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString())
    .gt('violations', '[]')

  if (!data || data.length < 50) {
    console.log('Not enough data — keep current anchor IDR 847.000')
    console.log(`Current count: ${data?.length || 0}`)
    return
  }

  const shortfalls = data
    .map((r) => {
      try {
        const violations = Array.isArray(r.violations) ? r.violations : JSON.parse(r.violations || '[]')
        return violations.reduce((sum: number, v: any) => sum + (Number(v.difference) || 0), 0)
      } catch {
        return 0
      }
    })
    .filter((s: number) => s > 0 && s < 50_000_000)

  if (shortfalls.length === 0) {
    console.log('No valid shortfalls found')
    return
  }

  shortfalls.sort((a: number, b: number) => a - b)
  const median = shortfalls[Math.floor(shortfalls.length / 2)]

  console.log(`Median shortfall (n=${shortfalls.length}): IDR ${median.toLocaleString('id-ID')}`)
  console.log(`Update REVENUE_ANCHORS.AVG_SHORTFALL_IDR in src/lib/constants.ts`)
  console.log(`New value should be: ${median}`)
}

main().catch(console.error)
