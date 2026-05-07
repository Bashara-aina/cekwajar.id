// ==============================================================================
// cekwajar.id — Verify Seed Data
// Checks row counts for all reference tables and reports empty/low data tables.
// ==============================================================================

import { createClient } from '../src/lib/supabase/server'

const REFERENCE_TABLES: Array<{
  name: string
  minExpected: number
  description: string
}> = [
  { name: 'umk_2026', minExpected: 50, description: 'UMK 2026 — at least 1 per province' },
  { name: 'pph21_ter_rates', minExpected: 50, description: 'PPh21 TER rates — should have multiple tariff brackets' },
  { name: 'bpjs_rates', minExpected: 5, description: 'BPJS rates — JHT, JP, Kesehatan rates' },
  { name: 'salary_benchmarks', minExpected: 20, description: 'Salary benchmarks by job category and city' },
  { name: 'job_categories', minExpected: 30, description: 'Job categories — Indonesian common job titles' },
  { name: 'property_benchmarks', minExpected: 10, description: 'Property benchmarks — land/building price per m2 by district' },
  { name: 'col_indices', minExpected: 30, description: 'Cost of living indices by city' },
  { name: 'ppp_reference', minExpected: 10, description: 'PPP purchasing power parity by country' },
]

interface TableStatus {
  name: string
  description: string
  count: number
  minExpected: number
  status: 'ok' | 'low' | 'empty'
  percentage: number
}

async function verify() {
  const supabase = await createClient()

  console.log('\n🔍 cekwajar.id — Seed Data Verification\n')
  console.log('='.repeat(60))

  const results: TableStatus[] = []

  for (const table of REFERENCE_TABLES) {
    process.stdout.write(`Checking ${table.name}... `)

    const { count, error } = await supabase
      .from(table.name as string)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`\n  ⚠️  ERROR: ${error.message}`)
      results.push({
        name: table.name,
        description: table.description,
        count: 0,
        minExpected: table.minExpected,
        status: 'empty',
        percentage: 0,
      })
      continue
    }

    const cnt = count ?? 0
    const pct = Math.round((cnt / table.minExpected) * 100)
    let status: TableStatus['status']

    if (cnt === 0) {
      status = 'empty'
      console.log(`⚠️  EMPTY (${cnt} rows)`)
    } else if (cnt < table.minExpected) {
      status = 'low'
      console.log(`⚠️  LOW (${cnt} rows, expected ${table.minExpected})`)
    } else {
      status = 'ok'
      console.log(`✅ ${cnt} rows`)
    }

    results.push({
      name: table.name,
      description: table.description,
      count: cnt,
      minExpected: table.minExpected,
      status,
      percentage: pct,
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 SUMMARY\n')

  const ok = results.filter(r => r.status === 'ok')
  const low = results.filter(r => r.status === 'low')
  const empty = results.filter(r => r.status === 'empty')

  console.log(`  ✅ OK:            ${ok.length}/${results.length} tables`)
  console.log(`  ⚠️  LOW:          ${low.length}/${results.length} tables`)
  console.log(`  ❌ EMPTY/MISSING: ${empty.length}/${results.length} tables`)

  if (empty.length > 0) {
    console.log('\n❌ EMPTY TABLES (must be seeded before deployment):')
    for (const r of empty) {
      console.log(`   - ${r.name}: 0 rows (expected ${r.minExpected})`)
    }
  }

  if (low.length > 0) {
    console.log('\n⚠️  LOW DATA TABLES (may cause incomplete results):')
    for (const r of low) {
      console.log(`   - ${r.name}: ${r.count} rows (expected ${r.minExpected})`)
    }
  }

  if (ok.length === results.length) {
    console.log('\n✅ All reference tables are seeded and healthy!\n')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some tables need attention before deployment.\n')
    process.exit(1)
  }
}

verify()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\nVerification failed:', err)
    process.exit(1)
  })