# 07 — Verdict & Results Design
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: VerdictBadge exists with colored background. Violations listed as cards after the badge. The verdict renders immediately with no animation. V06 (UMK/illegal wage) is not visually distinguished from less severe violations. No share functionality. No cross-tool suggestions after result.

## Objective
Make the verdict screen the most impactful moment in the product. Animate the verdict reveal. Add violation count summary. Give V06 critical visual treatment. Add WhatsApp share. Add confetti for SESUAI. Integrate CrossToolSuggestion after result.

---

## Task 1: Animate the Verdict Badge Reveal

Open the VerdictBadge component (find in `src/components/wajar-slip/` or wherever it's defined).

The `scale-in` animation already exists in `src/lib/animations.css`. Apply it to the verdict container:

```tsx
// In VerdictBadge.tsx or wherever the verdict card renders:

// BEFORE:
<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
  <CheckCircle2 ... />
  <span>SESUAI REGULASI</span>
</div>

// AFTER:
<div
  className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 animate-scale-in"
  style={{ transformOrigin: 'center top' }}
>
  <CheckCircle2 ... />
  <span>SESUAI REGULASI</span>
</div>
```

Apply `animate-scale-in` to the verdict wrapper div for BOTH the SESUAI and PELANGGARAN states.

If `animate-scale-in` is defined in `animations.css` but not in Tailwind config, add it to `tailwind.config.ts`:

```ts
// In tailwind.config.ts under theme.extend.animation:
'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',

// Under theme.extend.keyframes:
'scale-in': {
  '0%': { opacity: '0', transform: 'scale(0.85)' },
  '100%': { opacity: '1', transform: 'scale(1)' },
},
```

---

## Task 2: Add Violation Count Summary Banner

**Before** the individual ViolationItem cards, add a full-width summary banner that shows the total count with visual prominence.

Find where violations are mapped in the Wajar Slip result section. Add this component ABOVE the violations list:

Create file: `src/components/wajar-slip/ViolationSummaryBanner.tsx`

```tsx
import { AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViolationSummaryBannerProps {
  count: number
  criticalCount: number
  className?: string
}

export function ViolationSummaryBanner({ count, criticalCount, className }: ViolationSummaryBannerProps) {
  if (count === 0) return null

  const isCritical = criticalCount > 0

  return (
    <div
      className={cn(
        'rounded-xl p-5 mb-4 animate-fade-in-up',
        isCritical
          ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800'
          : 'bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            isCritical ? 'bg-red-100 dark:bg-red-900' : 'bg-amber-100 dark:bg-amber-900'
          )}
        >
          <AlertTriangle
            className={cn(
              'w-6 h-6',
              isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
            )}
          />
        </div>
        <div>
          <p
            className={cn(
              'text-2xl font-bold leading-none',
              isCritical ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
            )}
          >
            {count} Pelanggaran Ditemukan
          </p>
          <p className={cn('text-sm mt-1', isCritical ? 'text-red-600 dark:text-red-300' : 'text-amber-600 dark:text-amber-300')}>
            {criticalCount > 0
              ? `${criticalCount} bersifat KRITIS — perlu segera ditindaklanjuti`
              : 'Cek detail di bawah untuk penjelasan dan saran'}
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Usage in the result section:**

```tsx
import { ViolationSummaryBanner } from '@/components/wajar-slip/ViolationSummaryBanner'

// Before the violations.map():
<ViolationSummaryBanner
  count={violations.length}
  criticalCount={violations.filter(v => v.severity === 'CRITICAL').length}
/>

{violations.map(v => (
  <ViolationItem key={v.code} violation={v} />
))}
```

---

## Task 3: Add Critical Visual Treatment for V06 (UMK Violation)

V06 (salary below UMK) is an illegal act, not just a calculation error. It needs to look fundamentally different.

Open the ViolationItem component. Add a special case for V06:

```tsx
// In ViolationItem.tsx:

// Check if this is V06 (UMK violation)
const isUMKViolation = violation.code === 'V06'

// Apply special wrapper for V06:
return (
  <div
    className={cn(
      'rounded-xl border p-4 mb-3 transition-all',
      isUMKViolation
        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/30 animate-pulse-soft ring-2 ring-red-200 dark:ring-red-900'
        : severity === 'CRITICAL'
        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
        : severity === 'HIGH'
        ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20'
        : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20',
    )}
  >
    {/* V06 special header */}
    {isUMKViolation && (
      <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" />
        PELANGGARAN HUKUM — UU Ketenagakerjaan Pasal 90
      </div>
    )}
    
    {/* Rest of violation item content */}
    ...
  </div>
)
```

Ensure `animate-pulse-soft` is in the Tailwind config. If not, add:

```ts
// tailwind.config.ts:
animation: {
  'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
},
keyframes: {
  'pulse-soft': {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.75' },
  },
},
```

---

## Task 4: Add WhatsApp Share Button

This is the primary viral loop. Add a share button to the verdict result.

Create file: `src/components/ShareVerdictButton.tsx`

```tsx
'use client'

import { Share2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareVerdictButtonProps {
  violationCount: number
  isSesuai: boolean
}

export function ShareVerdictButton({ violationCount, isSesuai }: ShareVerdictButtonProps) {
  const handleShare = () => {
    const text = isSesuai
      ? `Slip gaji saya SESUAI regulasi ✅ — cek PPh21, BPJS, dan UMK otomatis di cekwajar.id`
      : `Slip gaji saya ada ${violationCount} pelanggaran ⚠️ — cek slip gajimu juga di cekwajar.id`

    const encodedText = encodeURIComponent(text)
    const waUrl = `https://wa.me/?text=${encodedText}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  const handleNativeShare = async () => {
    const text = isSesuai
      ? 'Slip gaji saya SESUAI regulasi ✅'
      : `Slip gaji saya ada ${violationCount} pelanggaran ⚠️`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Audit Slip Gaji — cekwajar.id',
          text,
          url: 'https://cekwajar.id/wajar-slip',
        })
      } catch {
        // User cancelled share
      }
    } else {
      handleShare()
    }
  }

  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
        onClick={handleShare}
      >
        <MessageCircle className="w-4 h-4" />
        Bagikan ke WhatsApp
      </Button>
      
      {'share' in navigator && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700"
          onClick={handleNativeShare}
          aria-label="Bagikan"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
```

**Apply to result section in Wajar Slip:**

```tsx
import { ShareVerdictButton } from '@/components/ShareVerdictButton'

// After the VerdictBadge and before ViolationSummaryBanner:
<ShareVerdictButton
  violationCount={violations.length}
  isSesuai={violations.length === 0}
/>
```

---

## Task 5: Add Confetti for SESUAI Result

Install the confetti library (very small, no runtime impact):

```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

Create file: `src/components/ConfettiEffect.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiEffectProps {
  trigger: boolean
  once?: boolean
}

export function ConfettiEffect({ trigger, once = true }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return

    const duration = 2000
    const end = Date.now() + duration

    const colors = ['#10b981', '#34d399', '#6ee7b7', '#059669']

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        disableForReducedMotion: true,
      })

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        disableForReducedMotion: true,
      })

      requestAnimationFrame(frame)
    }

    frame()
  }, [trigger])

  return null
}
```

**Apply in Wajar Slip result section:**

```tsx
import { ConfettiEffect } from '@/components/ConfettiEffect'

// In the result render:
<ConfettiEffect trigger={violations.length === 0} once />
```

This fires confetti only when violations === 0 (SESUAI result), respects `prefers-reduced-motion`, and runs for 2 seconds then stops.

---

## Task 6: Improve SESUAI State Card Design

Find the SESUAI (all-clear) verdict rendering. Upgrade it from a simple card to a celebration card:

```tsx
// SESUAI verdict card — replace current implementation:
{violations.length === 0 && (
  <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-8 text-center animate-scale-in">
    
    {/* Large checkmark */}
    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
    </div>
    
    {/* Verdict title */}
    <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
      Slip Gaji Kamu SESUAI ✓
    </h2>
    
    {/* Subtext */}
    <p className="text-emerald-700 dark:text-emerald-300 mb-1">
      Semua komponen PPh21 dan BPJS sudah benar.
    </p>
    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-6">
      HRD kamu taat regulasi bulan ini. 🎉
    </p>
    
    {/* Share button */}
    <ShareVerdictButton violationCount={0} isSesuai={true} />
    
    {/* Cross-sell */}
    <div className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800">
      <CrossToolSuggestion fromTool="wajar-slip" />
    </div>
  </div>
)}
```

---

## Task 7: Refine Violation Item Layout

Open the ViolationItem component. Ensure each violation card has:

1. Code badge + severity badge side by side at top
2. Title in bold, 16px
3. Description in 14px muted text
4. IDR details (gated or visible based on tier) with clear label alignment
5. Action recommendation at bottom with a right-arrow

```tsx
// Updated ViolationItem structure:
<div className="rounded-xl border p-4 mb-3">
  {/* Header: code + severity */}
  <div className="flex items-center gap-2 mb-2 flex-wrap">
    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border">
      {violation.code}
    </span>
    <SeverityBadge severity={violation.severity} />
  </div>
  
  {/* Title */}
  <h4 className="font-semibold text-sm text-foreground mb-1">
    {violation.title}
  </h4>
  
  {/* Description */}
  <p className="text-xs text-muted-foreground mb-3">
    {violation.description}
  </p>
  
  {/* IDR breakdown (gated) */}
  {isPaid ? (
    <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Di slip:</span>
        <span className="font-mono">{formatIDR(violation.slipAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Seharusnya:</span>
        <span className="font-mono">{formatIDR(violation.correctAmount)}</span>
      </div>
      <div className="flex justify-between border-t pt-1 mt-1">
        <span className="font-semibold">Selisih:</span>
        <span className={cn('font-mono font-bold', violation.diff > 0 ? 'text-red-600' : 'text-amber-600')}>
          {formatIDR(Math.abs(violation.diff))}
        </span>
      </div>
    </div>
  ) : (
    <PremiumGate
      message={`Lihat selisih IDR untuk ${violation.code}`}
      compact
    />
  )}
  
  {/* Action recommendation */}
  {violation.recommendation && (
    <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
      <span className="text-emerald-500 mt-0.5">→</span>
      <span>{violation.recommendation}</span>
    </div>
  )}
</div>
```

---

## Acceptance Criteria

- [ ] VerdictBadge animates in with `scale-in` (0.3s) on render — both SESUAI and PELANGGARAN states
- [ ] ViolationSummaryBanner shows total count as large text above individual violation cards
- [ ] V06 violation has red pulsing border, "PELANGGARAN HUKUM" header banner
- [ ] WhatsApp share button appears after every verdict (text is pre-populated)
- [ ] Confetti fires on SESUAI result (respects prefers-reduced-motion)
- [ ] SESUAI card shows large checkmark, celebration text, and cross-tool suggestion
- [ ] Each ViolationItem shows: code badge, severity badge, title, description, IDR breakdown (or gate), recommendation
- [ ] `npm run build` passes with zero errors
