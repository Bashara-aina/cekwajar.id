#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Block oversized images
// Rejects PNG/JPG/WebP over 100KB at build time.
// Run: node scripts/check-image-size.js
// ══════════════════════════════════════════════════════════════════════════════

import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const MAX = 100_000 // 100KB

async function* walk(dir) {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, f.name)
    if (f.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git', '.vercel'].includes(f.name)) continue
      yield* walk(p)
    } else {
      yield p
    }
  }
}

let bad = 0
const publicDir = join(process.cwd(), 'public')

for await (const p of walk(publicDir)) {
  if (!/\.(png|jpe?g|webp)$/i.test(p)) continue
  const s = await stat(p)
  if (s.size > MAX) {
    console.log(`✗ ${p} — ${(s.size / 1024).toFixed(0)}KB (limit: 100KB)`)
    bad++
  }
}

if (bad) {
  console.log(`\n⚠️  ${bad} oversized image(s). Compress with: npx squoosh-cli --output-dir public/ -- public/**/*.png`)
  process.exit(1)
} else {
  console.log('✅ All images under 100KB.')
  process.exit(0)
}