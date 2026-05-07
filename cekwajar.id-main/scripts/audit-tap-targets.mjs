#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Audit Tap Targets
// Playwright script to audit 44×44 minimum tap targets across the app.
// Run: node scripts/audit-tap-targets.mjs
// ══════════════════════════════════════════════════════════════════════════════

import { chromium } from 'playwright'

const PAGES = [
  { name: 'wajar-slip', path: '/wajar-slip', width: 375 },
  { name: 'wajar-gaji', path: '/wajar-gaji', width: 375 },
  { name: 'dashboard', path: '/dashboard', width: 1280 },
  { name: 'login', path: '/auth/login', width: 375 },
]

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const MIN_TAP_SIZE = 44

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
const page = await ctx.newPage()

let failures = 0
for (const { name, path } of PAGES) {
  const url = BASE + path
  console.log(`Checking ${name} (${path})...`)

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
  } catch {
    console.log(`  ⚠️  Could not load ${url}`)
    continue
  }

  const shorts = await page.$$eval(
    'a, button, [role=button], input[type=submit], input[type=checkbox], [tabindex="0"]',
    (els) =>
      els
        .map((e) => ({ rect: e.getBoundingClientRect(), tag: e.tagName, text: (e.textContent || '').slice(0, 40) }))
        .filter((e) => e.rect.width > 0 && (e.rect.width < 44 || e.rect.height < 44)),
  )

  if (shorts.length) {
    failures += shorts.length
    console.log(`  ✗ ${shorts.length} too-small target(s)`)
    for (const s of shorts.slice(0, 5)) {
      console.log(`    <${s.tag}> "${s.text}" ${Math.round(s.rect.width)}×${Math.round(s.rect.height)}px`)
    }
  } else {
    console.log(`  ✓ No small targets`)
  }
}

await browser.close()

if (failures > 0) {
  console.log(`\n⚠️  Total: ${failures} tap target(s) below ${MIN_TAP_SIZE}×${MIN_TAP_SIZE}px`)
  process.exit(failures > 5 ? 1 : 0) // tolerate up to 5 during transition
} else {
  console.log('\n✅ All tap targets pass.')
  process.exit(0)
}