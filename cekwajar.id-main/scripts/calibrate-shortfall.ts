#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// scripts/calibrate-shortfall.ts
// Run weekly: pnpm calibrate-shortfall
//
// Pulls real shortfall data from payslip_audits and checks if AVG_SHORTFALL_IDR
// in REVENUE_ANCHORS needs updating.
// If median moves >15% in either direction, alert and require manual update.
// ══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../src/lib/supabase/server'

async function main() {
  const sb = await getServiceClient()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()

  const { data, error } = await sb
    .from('payslip_audits')
    .select('total_shortfall_idr, gross_salary_idr, created_at')
    .eq('verdict', 'ADA_PELANGGARAN')
    .gte('created_at', ninetyDaysAgo)
    .gt('total_shortfall_idr', 0)
    .lt('total_shortfall_idr', 50_000_000)

  if (error) {
    console.error('[calibrate-shortfall] DB error:', error)
    process.exit(1)
  }

  if (!data || data.length < 50) {
    console.log(
      `[calibrate-shortfall] Not enough data (n=${data?.length ?? 0} < 50) — keep current anchor IDR 847.000`,
    )
    console.log('[calibrate-shortfall] NOTE: Add more audit data before next calibration cycle.')
    return
  }

  const shortfallValues = data.map((r: { total_shortfall_idr: number }) => r.total_shortfall_idr)
  const sorted = [...shortfallValues].sort((a: number, b: number) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const mean = Math.round(
    shortfallValues.reduce((s: number, r: number) => s + r, 0) / shortfallValues.length,
  )

  const CURRENT_ANCHOR = 847_000
  const pctChange = ((median - CURRENT_ANCHOR) / CURRENT_ANCHOR) * 100

  console.log(`[calibrate-shortfall] Results (n=${data.length}, last 90d):`)
  console.log(`  Median shortfall : IDR ${median.toLocaleString('id-ID')}`)
  console.log(`  Mean shortfall   : IDR ${mean.toLocaleString('id-ID')}`)
  console.log(`  Current anchor   : IDR ${CURRENT_ANCHOR.toLocaleString('id-ID')}`)
  console.log(`  Change           : ${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`)

  if (Math.abs(pctChange) > 15) {
    console.warn(`[calibrate-shortfall] ⚠️  Median shifted >15% — update REVENUE_ANCHORS.AVG_SHORTFALL_IDR in src/lib/constants.ts`)
    console.warn(`[calibrate-shortfall]   New value should be: ${median}`)
    console.warn(`[calibrate-shortfall]   Then rebuild OG images (file 02 §4) and deploy.`)
    process.exit(1)
  } else {
    console.log(`[calibrate-shortfall] ✓ Anchor within tolerance — no change needed.`)
  }
}

main().catch((err) => {
  console.error('[calibrate-shortfall] Unexpected error:', err)
  process.exit(1)
})