# 03 — Form UX & Progressive Disclosure
**Feed this entire file to Claude Code. Execute all tasks in order.**

---

## Context
Current state: Wajar Slip has ~10 fields on a single page. All other tools also use single-page forms. City selection uses a standard `<Select>` with 514 cities in alphabetical order. No inline help for technical terms (PTKP, JP Karyawan, BPJS). First-time users face a wall of inputs with no guidance.

## Objective
Transform Wajar Slip into a 3-step wizard using the existing state machine. Replace all city `<Select>` components with `<Command>` searchable dropdowns. Add `<Tooltip>` inline help for every technical field. Apply smart defaults.

---

## Task 1: Create FormProgress Component

Create file: `src/components/FormProgress.tsx`

```tsx
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface FormProgressProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function FormProgress({ currentStep, totalSteps, steps }: FormProgressProps) {
  return (
    <div className="w-full mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Connector line behind */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-emerald-500 z-0 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep
          
          return (
            <div key={step} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-emerald-500 text-white',
                  isActive && 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900',
                  !isCompleted && !isActive && 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium hidden sm:block',
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Mobile step label */}
      <p className="text-center text-xs text-muted-foreground mt-3 sm:hidden">
        Langkah {currentStep} dari {totalSteps}: <strong>{steps[currentStep - 1]}</strong>
      </p>
    </div>
  )
}
```

---

## Task 2: Create FieldTooltip Component

Create file: `src/components/FieldTooltip.tsx`

```tsx
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FieldTooltipProps {
  content: string
}

export function FieldTooltip({ content }: FieldTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors ml-1"
            aria-label="Bantuan"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-xs leading-relaxed"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

---

## Task 3: Create FieldTooltipMap Constants File

Create file: `src/lib/field-tooltips.ts`

```ts
export const FIELD_TOOLTIPS = {
  ptkp: 'Status pajak penghasilan kamu. TK = Tidak Kawin, K = Kawin. Angka setelah huruf = jumlah tanggungan. Contoh: K/1 = Kawin dengan 1 anak tanggungan.',
  npwp: 'Nomor Pokok Wajib Pajak. Karyawan dengan NPWP dikenakan tarif PPh21 normal. Tanpa NPWP, tarif lebih tinggi 20%.',
  gapok: 'Gaji pokok (base salary) — tidak termasuk tunjangan atau bonus.',
  tunjangan: 'Semua tunjangan tetap di luar gaji pokok: tunjangan jabatan, transport, makan, dll. Tidak termasuk THR atau bonus.',
  jht_karyawan: 'Jaminan Hari Tua — dipotong 2% dari gaji bulanan (gapok + tunjangan tetap). Dibayar kembali saat pensiun atau resign.',
  jht_perusahaan: 'Kontribusi JHT dari perusahaan — 3.7% dari gaji. Ini tidak mengurangi gajimu, tapi tertera di slip untuk transparansi.',
  jp_karyawan: 'Jaminan Pensiun — 1% dari gaji (maks Rp 95.596/bulan). Berbeda dari JHT. Wajib bagi karyawan swasta terdaftar BPJS TK.',
  jp_perusahaan: 'Kontribusi JP dari perusahaan — 2% dari gaji. Tidak dipotong dari gajimu.',
  jkk: 'Jaminan Kecelakaan Kerja — ditanggung perusahaan, bukan dipotong dari karyawan. Tarif 0.24–1.74% tergantung risiko pekerjaan.',
  jkm: 'Jaminan Kematian — ditanggung perusahaan, 0.3% dari gaji. Tidak dipotong dari karyawan.',
  bpjs_kes_karyawan: 'BPJS Kesehatan — 1% dari gaji (maks Rp 12.000/bulan untuk batas atas). Memberikan hak akses fasilitas kesehatan.',
  bpjs_kes_perusahaan: 'Kontribusi BPJS Kesehatan dari perusahaan — 4% dari gaji.',
  pph21: 'Pajak Penghasilan Pasal 21 — pajak atas penghasilan karyawan. Dihitung dengan metode TER (PMK 168/2023) berdasarkan gaji bruto tahunan.',
  kota: 'Kota tempat kamu bekerja (bukan tinggal). Digunakan untuk menentukan UMK (Upah Minimum Kota) yang berlaku.',
  bulan: 'Bulan slip gaji yang ingin diaudit. Tarif UMK dan TER bisa berbeda antar periode.',
}
```

---

## Task 4: Create CityCommandSelect Component

Create file: `src/components/CityCommandSelect.tsx`

```tsx
'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Top cities by traffic - always shown first
const TOP_CITIES = [
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur',
  'Bekasi', 'Tangerang', 'Tangerang Selatan', 'Depok', 'Bogor',
  'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar',
]

interface CityCommandSelectProps {
  cities: string[]          // full list from your existing data source
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CityCommandSelect({
  cities,
  value,
  onValueChange,
  placeholder = 'Pilih kota...',
  disabled = false,
}: CityCommandSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  
  const topCitiesInList = TOP_CITIES.filter(c => cities.includes(c))
  const otherCities = cities.filter(c => !TOP_CITIES.includes(c))
  
  const filteredTop = search
    ? topCitiesInList.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : topCitiesInList
    
  const filteredOther = search
    ? otherCities.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : otherCities

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-12 text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Ketik nama kota..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-72">
            <CommandEmpty>
              Kota tidak ditemukan. Coba kata kunci lain.
            </CommandEmpty>
            
            {filteredTop.length > 0 && (
              <CommandGroup heading="Kota Populer">
                {filteredTop.map(city => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onValueChange(city)
                      setOpen(false)
                      setSearch('')
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4', value === city ? 'opacity-100 text-emerald-600' : 'opacity-0')}
                    />
                    {city}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {filteredTop.length > 0 && filteredOther.length > 0 && <CommandSeparator />}
            
            {filteredOther.length > 0 && (
              <CommandGroup heading={search ? 'Hasil pencarian' : 'Semua kota'}>
                {filteredOther.slice(0, 100).map(city => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onValueChange(city)
                      setOpen(false)
                      setSearch('')
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4', value === city ? 'opacity-100 text-emerald-600' : 'opacity-0')}
                    />
                    {city}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

**Apply `CityCommandSelect` everywhere a city `<Select>` exists:**
- `src/app/wajar-slip/page.tsx` or relevant form component
- `src/app/wajar-gaji/page.tsx`
- `src/app/wajar-tanah/page.tsx`
- `src/app/wajar-hidup/page.tsx`

Replace:
```tsx
// OLD:
<Select value={city} onValueChange={setCity}>
  <SelectContent>
    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
  </SelectContent>
</Select>

// NEW:
<CityCommandSelect cities={cities} value={city} onValueChange={setCity} />
```

---

## Task 5: Refactor Wajar Slip Form to 3-Step Wizard

Open the Wajar Slip form component (in `src/app/wajar-slip/` — find the main form component or page file).

The existing state machine has phases. Add a `formStep` state alongside it:

```tsx
const [formStep, setFormStep] = React.useState(1) // 1 | 2 | 3
```

**Step 1 fields (Info Dasar):** gapok, kota, bulan, ptkp_status, has_npwp
**Step 2 fields (Potongan & Tunjangan):** tunjangan, jht_karyawan, jp_karyawan, bpjs_kes_karyawan, pph21_dipotong, other_deductions
**Step 3 fields (Review):** Read-only summary of all entered values with "Cek Sekarang" submit button

```tsx
// Wrap form content with conditional rendering:
<FormProgress
  currentStep={formStep}
  totalSteps={3}
  steps={['Info Dasar', 'Potongan', 'Review']}
/>

{formStep === 1 && (
  <div className="space-y-5 animate-fade-in-up">
    {/* PTKP field with tooltip */}
    <div>
      <Label htmlFor="ptkp_status" className="flex items-center gap-1">
        Status PTKP
        <FieldTooltip content={FIELD_TOOLTIPS.ptkp} />
      </Label>
      {/* existing PTKP select */}
    </div>
    
    {/* Kota with CityCommandSelect */}
    <div>
      <Label className="flex items-center gap-1">
        Kota Kerja
        <FieldTooltip content={FIELD_TOOLTIPS.kota} />
      </Label>
      <CityCommandSelect cities={cities} value={kota} onValueChange={setKota} />
    </div>

    {/* Gaji Pokok */}
    <div>
      <Label className="flex items-center gap-1">
        Gaji Pokok
        <FieldTooltip content={FIELD_TOOLTIPS.gapok} />
      </Label>
      {/* existing IDRInput */}
    </div>

    {/* Bulan + Tahun */}
    {/* existing month/year selects */}

    {/* NPWP */}
    <div>
      <Label className="flex items-center gap-1">
        Punya NPWP?
        <FieldTooltip content={FIELD_TOOLTIPS.npwp} />
      </Label>
      {/* existing NPWP toggle/select */}
    </div>
    
    <Button
      type="button"
      className="w-full h-12"
      onClick={() => setFormStep(2)}
      disabled={!kota || !gapok}
    >
      Lanjut ke Potongan →
    </Button>
  </div>
)}

{formStep === 2 && (
  <div className="space-y-5 animate-fade-in-up">
    {/* Tunjangan */}
    <div>
      <Label className="flex items-center gap-1">
        Total Tunjangan Tetap
        <FieldTooltip content={FIELD_TOOLTIPS.tunjangan} />
      </Label>
      {/* IDRInput + "Tidak ada tunjangan" checkbox */}
    </div>

    {/* JHT Karyawan */}
    <div>
      <Label className="flex items-center gap-1">
        JHT Karyawan (dipotong dari slip)
        <FieldTooltip content={FIELD_TOOLTIPS.jht_karyawan} />
      </Label>
      {/* IDRInput + "Tidak tahu" option */}
    </div>

    {/* JP Karyawan */}
    <div>
      <Label className="flex items-center gap-1">
        JP Karyawan (Jaminan Pensiun)
        <FieldTooltip content={FIELD_TOOLTIPS.jp_karyawan} />
      </Label>
      {/* IDRInput + "Tidak tahu" option */}
    </div>

    {/* BPJS Kes Karyawan */}
    <div>
      <Label className="flex items-center gap-1">
        BPJS Kesehatan (1%)
        <FieldTooltip content={FIELD_TOOLTIPS.bpjs_kes_karyawan} />
      </Label>
      {/* IDRInput + "Tidak tahu" option */}
    </div>

    {/* PPh21 dipotong */}
    <div>
      <Label className="flex items-center gap-1">
        PPh21 Dipotong di Slip
        <FieldTooltip content={FIELD_TOOLTIPS.pph21} />
      </Label>
      {/* IDRInput */}
    </div>

    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 h-12"
        onClick={() => setFormStep(1)}
      >
        ← Kembali
      </Button>
      <Button
        type="button"
        className="flex-1 h-12"
        onClick={() => setFormStep(3)}
      >
        Review →
      </Button>
    </div>
  </div>
)}

{formStep === 3 && (
  <div className="space-y-4 animate-fade-in-up">
    <h3 className="font-semibold text-sm">Ringkasan Data Kamu</h3>
    
    {/* Summary table - read only display of all values */}
    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Kota Kerja</span>
        <span className="font-medium">{kota}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Gaji Pokok</span>
        <span className="font-medium">{formatIDR(gapok)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Status PTKP</span>
        <span className="font-medium">{ptkp_status}</span>
      </div>
      {/* Add all other filled fields */}
    </div>
    
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 h-12"
        onClick={() => setFormStep(2)}
      >
        ← Edit
      </Button>
      <Button
        type="submit"
        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
        disabled={isCalculating}
      >
        {isCalculating ? 'Lagi ngitung PPh21... ⚡' : 'Cek Slip Gaji Sekarang'}
      </Button>
    </div>
  </div>
)}
```

---

## Task 6: Add "Tidak Tahu" Option for Optional BPJS Fields

For each BPJS/deduction field in Step 2, add a small link below the input:

```tsx
<div>
  <Label>JHT Karyawan</Label>
  <IDRInput value={jhtKaryawan} onChange={setJhtKaryawan} />
  <button
    type="button"
    className="text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors"
    onClick={() => {
      setJhtKaryawan(0)
      // optionally set a flag to show "Asumsi 0" in the result
    }}
  >
    Tidak ada / tidak tahu → gunakan nilai 0
  </button>
</div>
```

---

## Task 7: Apply Smart Defaults on Form Init

In the Wajar Slip form, on component mount, set these defaults using `useEffect`:

```tsx
useEffect(() => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1  // 1-based
  const currentYear = now.getFullYear()
  
  // Set defaults if not already set
  if (!bulan) setBulan(currentMonth.toString())
  if (!tahun) setTahun(currentYear.toString())
  if (hasNpwp === undefined) setHasNpwp(true)  // most formal employees have NPWP
}, [])
```

---

## Task 8: Increase Input Heights on Mobile

In `src/app/globals.css`, add:

```css
@media (max-width: 640px) {
  /* Bigger touch targets for all form inputs on mobile */
  input[type="text"],
  input[type="number"],
  input[type="email"],
  select,
  .h-10 {
    min-height: 56px;
  }
  
  /* Bigger buttons */
  button[type="submit"],
  button[type="button"] {
    min-height: 52px;
  }
}
```

---

## Acceptance Criteria

- [ ] Wajar Slip form has 3 distinct steps with a visible progress bar
- [ ] Step 1 shows: PTKP, Kota, Gapok, Bulan, NPWP — and nothing else
- [ ] Step 2 shows: all deduction fields with "Tidak tahu" option per field
- [ ] Step 3 shows a read-only summary + submit button
- [ ] Every technical field (PTKP, JP, JHT, BPJS, NPWP) has a ⓘ tooltip with Indonesian explanation
- [ ] All city selects replaced with `CityCommandSelect` — searchable with top cities pinned
- [ ] Bulan defaults to current month, NPWP defaults to "Ya" on first render
- [ ] Loading submit button text shows "Lagi ngitung PPh21... ⚡" not "Menghitung..."
- [ ] `npm run build` passes with zero errors
