// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Accessibility Utilities
// WCAG 2.1 contrast ratio calculator and design token audit
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Parses a hex color string to RGB components.
 * Supports: #RGB, #RRGGBB, rgb(r, g, b)
 */
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
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    }
  }
  return null
}

/**
 * Computes the relative luminance of a color per WCAG 2.1.
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Computes WCAG contrast ratio between two colors.
 * Returns a value like 4.5 for a 4.5:1 ratio.
 */
export function contrastRatio(fg: string, bg: string): number {
  const fgRGB = parseColor(fg)
  const bgRGB = parseColor(bg)
  if (!fgRGB || !bgRGB) return 0

  const l1 = relativeLuminance(fgRGB.r, fgRGB.g, fgRGB.b)
  const l2 = relativeLuminance(bgRGB.r, bgRGB.g, bgRGB.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG conformance levels */
export type WCAGLevel = 'AA' | 'AAA' | 'fail'

/** Text size categories */
export type TextSize = 'normal' | 'large'

const CONTRAST_THRESHOLDS: Record<WCAGLevel, Record<TextSize, number>> = {
  AA: { normal: 4.5, large: 3 },
  AAA: { normal: 7, large: 4.5 },
  fail: { normal: 0, large: 0 },
}

/**
 * Verifies that a foreground/background color pair meets WCAG conformance.
 * @param fg - foreground color (hex or rgb())
 * @param bg - background color (hex or rgb())
 * @param minLevel - minimum required level: 'AA' (default) or 'AAA'
 * @param isLargeText - whether the text is >= 18pt or 14pt bold
 */
export function verifyContrast(
  fg: string,
  bg: string,
  minLevel: WCAGLevel = 'AA',
  isLargeText = false
): { pass: boolean; ratio: number; level: WCAGLevel } {
  const ratio = contrastRatio(fg, bg)
  const sizeKey: TextSize = isLargeText ? 'large' : 'normal'
  const threshold = CONTRAST_THRESHOLDS[minLevel][sizeKey]

  if (ratio >= CONTRAST_THRESHOLDS.AAA[sizeKey]) return { pass: true, ratio, level: 'AAA' }
  if (ratio >= threshold) return { pass: true, ratio, level: 'AA' }
  return { pass: false, ratio, level: 'fail' }
}

// ─── Token pair audit ────────────────────────────────────────────────────────

interface TokenPair {
  label: string
  fg: string
  bg: string
  minLevel?: WCAGLevel
  isLarge?: boolean
}

/** Key token pairs from DESIGN_SYSTEM.md Section 2.2 */
const TOKEN_PAIRS_LIGHT: TokenPair[] = [
  { label: 'page-text on page-bg', fg: '#0f172a', bg: '#ffffff', minLevel: 'AAA' },
  { label: 'nav-text on nav-bg', fg: '#0f172a', bg: '#ffffff' },
  { label: 'muted-foreground on secondary', fg: '#475569', bg: '#f1f5f9' },
  { label: 'verdict-wajar text on card', fg: '#16A34A', bg: '#ffffff' },
  { label: 'verdict-wajar-bg surface', fg: '#16A34A', bg: '#F0FDF4' },
  { label: 'verdict-salah text on card', fg: '#DC2626', bg: '#ffffff' },
  { label: 'primary on primary-foreground', fg: '#1B65A6', bg: '#ffffff' },
  { label: 'border on card', fg: '#e2e8f0', bg: '#ffffff' },
  { label: 'destructive on white', fg: '#ef4444', bg: '#ffffff' },
]

const TOKEN_PAIRS_DARK: TokenPair[] = [
  { label: 'page-text on page-bg (dark)', fg: '#f8fafc', bg: '#0f172a', minLevel: 'AAA' },
  { label: 'nav-text on nav-bg (dark)', fg: '#f8fafc', bg: '#0f172a' },
  { label: 'muted-foreground on secondary (dark)', fg: '#cbd5e1', bg: '#1e293b' },
  { label: 'verdict-wajar text dark bg', fg: '#22c55e', bg: '#052e16' },
  { label: 'verdict-salah text dark bg', fg: '#ef4444', bg: '#450a0a' },
  { label: 'primary on dark bg', fg: '#2B7CC9', bg: '#0f172a' },
  { label: 'border on card (dark)', fg: '#334155', bg: '#1e293b' },
]

interface AuditResult {
  label: string
  ratio: number
  level: WCAGLevel
  pass: boolean
}

function runAudit(pairs: TokenPair[]): AuditResult[] {
  return pairs.map((pair) => {
    const result = verifyContrast(pair.fg, pair.bg, pair.minLevel ?? 'AA', pair.isLarge ?? false)
    return { label: pair.label, ratio: result.ratio, level: result.level, pass: result.pass }
  })
}

export interface ContrastAudit {
  light: AuditResult[]
  dark: AuditResult[]
  allPass: boolean
  failures: string[]
}

/**
 * Audits all key token pairs from DESIGN_SYSTEM.md.
 * Call this in a Node.js script or at build time.
 */
export function auditContrastTokens(): ContrastAudit {
  const light = runAudit(TOKEN_PAIRS_LIGHT)
  const dark = runAudit(TOKEN_PAIRS_DARK)
  const failures = [...light, ...dark]
    .filter((r) => !r.pass)
    .map((r) => `[${r.level.toUpperCase()}] ${r.label} — ratio ${r.ratio.toFixed(2)}:1`)

  return { light, dark, allPass: failures.length === 0, failures }
}

// ─── Console logger for use in scripts/builds ───────────────────────────────

export function logContrastAudit(audit: ContrastAudit): void {
  const divider = '─'.repeat(60)
  console.log('\n🔍 cekwajar.id — Contrast Audit')
  console.log(divider)

  for (const result of [...audit.light, ...audit.dark]) {
    const icon = result.pass ? '✅' : '❌'
    const levelTag = result.level === 'AAA' ? '(AAA)' : result.level === 'AA' ? '(AA)' : '(FAIL)'
    console.log(`  ${icon} ${result.label} ${levelTag} — ${result.ratio.toFixed(2)}:1`)
  }

  console.log(divider)
  if (audit.allPass) {
    console.log('✅ All token pairs pass WCAG AA.\n')
  } else {
    console.log(`❌ ${audit.failures.length} failure(s):`)
    audit.failures.forEach((f) => console.log(`   • ${f}`))
    console.log('')
  }
}