import { INDONESIAN_CITIES } from '../lib/cities'

const names: string[] = INDONESIAN_CITIES.map((c: string) => c.toLowerCase())
const dupes: string[] = names.filter((n: string, i: number) => names.indexOf(n) !== i)
if (dupes.length) {
  console.error('Duplicate cities:', dupes)
  process.exit(1)
}
console.log(`OK — ${INDONESIAN_CITIES.length} unique cities`)