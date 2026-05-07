# cekwajar.id Brand Assets Specification

**Version:** May 2026
**Status:** Direction A (Check Shield Wordmark) — Recommended
**Reference:** DESIGN_SYSTEM.md Section 2.8 + Section 6 (Export Requirements)

---

## 1. Logo Direction A — Check Shield Wordmark

The cekwajar.id wordmark uses a shield-check motif replacing the dot in `.id`. The shield represents protection ("cek = check"), and the check communicates verified accuracy.

### Construction

```
[shield icon] + "cekwajar" + ".id"

shield:   rounded-square shield, ~16×16px at full logo scale
          fill: accent-solid (#1B65A6 light / #3B8AD4 dark)
          checkmark: white, 2px stroke, centered inside shield

".id":    Inter Semibold or similar sans-serif
          color: accent (#1B65A6 light / #3B8AD4 dark)
          replaces the period before "id" with the shield icon
```

### Typography

| Element | Font | Weight | Color (Light) | Color (Dark) |
|---------|------|--------|----------------|---------------|
| "cekwajar" | Inter | Semibold (600) | `#111318` | `#EDEDED` |
| ".id" | Inter | Semibold (600) | `#1B65A6` | `#3B8AD4` |
| Shield fill | — | — | `#1B65A6` | `#3B8AD4` |
| Checkmark | — | 2px stroke | `#FFFFFF` | `#FFFFFF` |

### Responsive Behavior

| Context | Display |
|---------|--------|
| Desktop header (≥768px) | Full wordmark: `[shield] cekwajar.id` |
| Mobile header (<768px) | Icon only: `[shield]` (linked to home) |
| Favicon (16×16, 32×32) | Shield-check icon only, no text |
| OG image | Full wordmark + tagline below |

---

## 2. Export Specifications

### 2.1 Web Assets

| Asset | Format | Dimensions | Background | Use Case |
|-------|--------|------------|------------|----------|
| Logo full | SVG | scalable (ref ~180px wide) | transparent | Landing page header, marketing |
| Logo full (dark) | SVG | scalable | transparent | Dark mode header |
| Logo icon | SVG | 32×32 | transparent | Mobile nav, compact contexts |
| Favicon | ICO | 16×16 + 32×32 (multi-res) | transparent | Browser tab |
| Favicon PNG fallback | PNG | 32×32 | transparent | Non-ICO fallback |

### 2.2 Social Assets

| Asset | Format | Dimensions | Background | Use Case |
|-------|--------|------------|------------|----------|
| Social preview | PNG | 1200×630 @1x | light/dark variants | OG image, Twitter/X card |
| Apple Touch Icon | PNG | 180×180 @1x | transparent | iOS home screen bookmark |
| Social @2x | PNG | 2400×1260 @2x | matching | High-DPI displays |

### 2.3 Print/Editorial

| Asset | Format | Dimensions | Use Case |
|-------|--------|------------|----------|
| Logo for PDF | SVG or PNG | scalable / 300dpi | Audit letter, official docs |
| Monochrome shield | SVG | scalable | Embossed/watermark use |

---

## 3. OG Image Template

**Dimensions:** 1200×630px (Twitter/X, LinkedIn, Facebook standard)

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [shield-check icon]  cekwajar.id                           │
│                                                              │
│                                                              │
│         "Gaji Anda  Wajar"                                   │
│         Rp 10.500.000 / bulan                               │
│                                                              │
│         ────────────────────────                             │
│         Bandingkan dengan data  12.847  karyawan              │
│                                                              │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  cekwajar.id  ·  Mei 2026                                   │
└──────────────────────────────────────────────────────────────┘
```

### Variants

| Variant | Background | Text Color | Accent |
|---------|-----------|------------|--------|
| Light | `#FFFFFF` | `#111318` | `#1B65A6` |
| Dark | `#0F1117` | `#EDEDED` | `#3B8AD4` |

### Typography in OG

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Verdict headline | Inter | 72px | Bold (700) |
| Amount | Inter | 56px | Semibold (600) |
| Subtext | Inter | 24px | Regular (400) |
| Footer / date | Inter | 18px | Regular (400) |

---

## 4. Color Mode Variants

The shield icon must remain legible in both light and dark contexts.

### Light Mode (default)
- Shield fill: `#1B65A6` (accent-solid)
- Checkmark: `#FFFFFF`
- Wordmark "cekwajar": `#111318` (fg-default)
- ".id": `#1B65A6` (accent)

### Dark Mode
- Shield fill: `#3B8AD4` (accent-solid-dark)
- Checkmark: `#FFFFFF`
- Wordmark "cekwajar": `#EDEDED` (fg-default-dark)
- ".id": `#3B8AD4` (accent-dark)

---

## 5. Clear Space

Minimum clear space = height of the "c" character in "cekwajar" on all sides.

---

## 6. Minimum Sizes

| Context | Minimum Width |
|---------|--------------|
| Desktop header | 120px |
| Mobile nav icon | 24px |
| Favicon | 16px |
| OG image | 1200px (fixed) |

---

## 7. What NOT to Do

- Do not stretch or compress the logo non-uniformly
- Do not place the logo on a busy photographic background without a clear space zone
- Do not recolor the shield to match a campaign theme
- Do not animate the checkmark on load (static only)
- Do not add drop shadows to the shield icon in dark mode (dark surfaces use luminance contrast, not shadow)
- Do not use the logo at sizes below the minimum widths listed above

---

## 8. Asset Checklist

| Asset | Status | File |
|-------|--------|------|
| Logo full (SVG) | To commission | `logo-cekwajar-full.svg` |
| Logo full dark (SVG) | To commission | `logo-cekwajar-full-dark.svg` |
| Logo icon (SVG) | To commission | `logo-cekwajar-icon.svg` |
| Favicon (ICO, 16+32) | To commission | `favicon.ico` |
| Apple Touch Icon (PNG 180×180) | To commission | `apple-touch-icon.png` |
| OG Image light (PNG 1200×630) | To commission | `og-image-light.png` |
| OG Image dark (PNG 1200×630) | To commission | `og-image-dark.png` |
| Monochrome shield (SVG) | Optional | `logo-shield-mono.svg` |

---

## 9. Designer Notes

- All variants should be delivered in a single Figma frame with naming: `Logo / [variant]`
- Export presets should match the table in Section 2 above
- The shield icon is constructed from a rounded-square with a checkmark centered inside — not a stock icon
- Verify the logo renders correctly on both a pure white (`#FFFFFF`) and pure black (`#000000`) background
- Test at 16×16px zoom to ensure the checkmark remains visible at favicon size