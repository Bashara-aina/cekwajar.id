'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Theme Customizer Panel
// Sheet-based floating panel for real-time theme/radius/accent customization
// Shadboard-style: persist to cookie via SettingsContext
// ══════════════════════════════════════════════════════════════════════════════

import { Settings2, Palette, Circle } from 'lucide-react'
import { Settings, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useSettings, type AccentColor, type BorderRadius } from '@/contexts/settings-context'
import { cn } from '@/lib/utils'

/* ─── Accent Color Picker ─────────────────────────────────────────────── */

const accentOptions: { value: AccentColor; label: string; className: string }[] = [
  { value: 'emerald', label: 'Emerald', className: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', className: 'bg-amber-500' },
  { value: 'violet', label: 'Violet', className: 'bg-violet-500' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
]

function AccentColorPicker() {
  const { settings, setAccentColor } = useSettings()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Palette className="h-4 w-4 text-slate-400" />
        Accent Color
      </div>
      <div className="flex gap-2">
        {accentOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAccentColor(opt.value)}
            title={opt.label}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150',
              'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              opt.className,
              settings.accentColor === opt.value
                ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                : 'opacity-60 hover:opacity-100'
            )}
            aria-label={`Set accent to ${opt.label}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Border Radius Picker ────────────────────────────────────────────── */

const radiusOptions: { value: BorderRadius; label: string; className: string }[] = [
  { value: 'none', label: 'None', className: 'rounded-none' },
  { value: 'sm', label: 'SM', className: 'rounded-sm' },
  { value: 'md', label: 'MD', className: 'rounded-md' },
  { value: 'lg', label: 'LG', className: 'rounded-lg' },
  { value: 'xl', label: 'XL', className: 'rounded-xl' },
  { value: 'full', label: 'Full', className: 'rounded-full' },
]

function RadiusPicker() {
  const { settings, setBorderRadius } = useSettings()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Circle className="h-4 w-4 text-slate-400" />
        Border Radius
      </div>
      <div className="flex gap-2">
        {radiusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setBorderRadius(opt.value)}
            title={opt.label}
            className={cn(
              'flex h-10 w-10 items-center justify-center border-2 border-slate-200 bg-white text-xs font-medium transition-all duration-150',
              'hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
              opt.className,
              settings.borderRadius === opt.value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                : 'text-slate-500'
            )}
            aria-label={`Set radius to ${opt.label}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Preview Card ─────────────────────────────────────────────────────── */

function PreviewCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm', className)}>
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-8 rounded-lg bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-emerald-100" />
          <div className="h-6 w-16 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

/* ─── Main Customizer Sheet ───────────────────────────────────────────── */

export function Customizer() {
  const { settings } = useSettings()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-40 shadow-lg"
          aria-label="Open theme customizer"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetHeader className="space-y-0 pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">Customize Theme</SheetTitle>
            <SheetDescription className="sr-only" />
          </div>
          <p className="text-sm text-slate-500">
            Personalize your dashboard experience
          </p>
        </SheetHeader>

        <div className="flex flex-col gap-8">
          {/* Live preview */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Preview
            </p>
            <PreviewCard />
          </div>

          {/* Accent color */}
          <AccentColorPicker />

          {/* Border radius */}
          <RadiusPicker />

          {/* Current config summary */}
          <div className="rounded-lg border border-dashed border-slate-200 p-3">
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-600">
                {settings.accentColor.charAt(0).toUpperCase() + settings.accentColor.slice(1)}
              </span>{' '}
              ·{' '}
              <span className="font-medium text-slate-600">
                {settings.borderRadius}
              </span>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
