import { createClient } from '../src/lib/supabase/server'

async function main() {
  const sb = createClient()

  const { data: cities, error } = await sb.from('umk_2026').select('city, province')

  if (error) {
    console.error('Error fetching cities:', error.message)
    return
  }

  const seen = new Map<string, string>()
  const duplicates: string[] = []

  for (const row of cities || []) {
    const key = row.city.toLowerCase().trim()
    if (seen.has(key)) {
      duplicates.push(`"${row.city}" (province: ${row.province}) is duplicate of "${seen.get(key)}"`)
    } else {
      seen.set(key, row.city)
    }
  }

  if (duplicates.length === 0) {
    console.log('No duplicate cities found.')
  } else {
    console.log(`Found ${duplicates.length} duplicate cities:`)
    duplicates.forEach((d) => console.log(`  - ${d}`))
  }
}

main().catch(console.error)
