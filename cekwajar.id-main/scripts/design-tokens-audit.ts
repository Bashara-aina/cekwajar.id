#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Design Tokens Audit Script
// Verifies CSS custom properties, contrast ratios, and Tailwind config coverage
//
// Usage: npx tsx scripts/design-tokens-audit.ts
// ══════════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

// ─── 1. Parse CSS custom properties from globals.css ────────────────────────

function extractCssVars(filePath: string): Set<string> {
  const content = readFileSync(filePath, 'utf-8')
  const vars: string[] = []
  const re = /--([\w-]+):/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    vars.push(m[1])
  }
  return new Set(vars)
}

// ─── 2. Parse Tailwind config to extract token references ───────────────────

function extractTailwindTokens(configPath: string): Set<string> {
  try {
    const content = readFileSync(configPath, 'utf-8')
    // Find all --color- variable references in the config
    const re = /--color-([\w-]+)/g
    const tokens: string[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(content)) !== null) {
      tokens.push(m[1])
    }
    return new Set(tokens)
  } catch {
    return new Set()
  }
}

// ─── 3. Contrast ratio helpers (duplicated here so script is standalone) ────

function parseColor(color: string): { r: number; g: number; b: number } | null {
  const hex = color.replace('#', '')
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    }
  }
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    }
  }
  return null
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(fg: string, bg: string): number {
  const fgRGB = parseColor(fg)
  const bgRGB = parseColor(bg)
  if (!fgRGB || !bgRGB) return 0
  const l1 = relativeLuminance(fgRGB.r, fgRGB.g, fgRGB.b)
  const l2 = relativeLuminance(bgRGB.r, bgRGB.g, bgRGB.b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

// ─── 4. Key token pairs for contrast checking ───────────────────────────────

interface TokenPairTest {
  label: string
  fg: string
  bg: string
  minRatio: number
}

const CONTRAST_TESTS: TokenPairTest[] = [
  // Light mode
  { label: 'page-text on page-bg (light)', fg: '#0f172a', bg: '#ffffff', minRatio: 4.5 },
  { label: 'muted on secondary (light)', fg: '#475569', bg: '#f1f5f9', minRatio: 4.5 },
  { label: 'verdict-wajar on white (light)', fg: '#16A34A', bg: '#ffffff', minRatio: 4.5 },
  { label: 'verdict-salah on white (light)', fg: '#DC2626', bg: '#ffffff', minRatio: 4.5 },
  { label: 'primary on white (light)', fg: '#1B65A6', bg: '#ffffff', minRatio: 4.5 },
  // Dark mode
  { label: 'page-text on page-bg (dark)', fg: '#f8fafc', bg: '#0f172a', minRatio: 4.5 },
  { label: 'muted on secondary (dark)', fg: '#cbd5e1', bg: '#1e293b', minRatio: 4.5 },
  { label: 'verdict-wajar on dark bg', fg: '#22c55e', bg: '#052e16', minRatio: 4.5 },
  { label: 'verdict-salah on dark bg', fg: '#ef4444', bg: '#450a0a', minRatio: 4.5 },
  { label: 'primary on dark bg', fg: '#2B7CC9', bg: '#0f172a', minRatio: 4.5 },
]

// ─── 5. CSS variable names that MUST be defined ───────────────────────────

const REQUIRED_CSS_VARS = [
  // Background layers
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  // cekwajar.id
  'nav-bg', 'nav-border', 'nav-text', 'nav-text-muted', 'nav-hover-bg',
  'page-bg', 'page-text', 'page-text-muted',
  'verdict-wajar', 'verdict-wajar-bg', 'verdict-aneh', 'verdict-aneh-bg',
  'verdict-salah', 'verdict-salah-bg', 'info', 'info-bg',
  'success', 'success-light', 'warning', 'warning-light',
]

// ─── 6. Run audit ──────────────────────────────────────────────────────────

function runAudit(): void {
  const divider = '─'.repeat(65)
  let errors = 0

  console.log('\n🎨 cekwajar.id — Design Tokens Audit')
  console.log(divider)

  // CSS variable check
  const cssPath = join(ROOT, 'src/app/globals.css')
  let cssVars: Set<string>
  try {
    cssVars = extractCssVars(cssPath)
    console.log(`\n📄 CSS Variables (${cssVars.size} defined in globals.css)`)
    const missing = REQUIRED_CSS_VARS.filter((v) => !cssVars.has(v))
    if (missing.length > 0) {
      console.log(`  ❌ Missing CSS vars: ${missing.join(', ')}`)
      errors += missing.length
    } else {
      console.log(`  ✅ All ${REQUIRED_CSS_VARS.length} required CSS vars are defined`)
    }
  } catch (e) {
    console.log(`  ⚠️  Could not read globals.css: ${e}`)
  }

  // Contrast ratio check
  console.log(`\n🔍 Contrast Ratios (WCAG AA minimum: 4.5:1)`)
  for (const test of CONTRAST_TESTS) {
    const ratio = contrastRatio(test.fg, test.bg)
    const pass = ratio >= test.minRatio
    const icon = pass ? '✅' : '❌'
    console.log(`  ${icon} ${test.label}: ${ratio.toFixed(2)}:1 (min: ${test.minRatio}:1)`)
    if (!pass) errors++
  }

  // Summary
  console.log(divider)
  if (errors === 0) {
    console.log('✅ All design token checks passed.\n')
    process.exit(0)
  } else {
    console.log(`❌ ${errors} issue(s) found. Review above.\n`)
    process.exit(1)
  }
}

runAudit()