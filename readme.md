# cekwajar_id-main

Root workspace for cekwajar.id — Indonesian wage rights compliance SaaS.

## Structure

```
cekwajar_id-main/
├── cekwajar.id-main/        ← Next.js application source
├── docs/                    ← All reference documentation
│   ├── req/                ← Product requirements (req_01–12)
│   ├── build/               ← Build guides (build_guide_00–08)
│   ├── block/               ← Business/strategy blocks (block_01–10)
│   ├── audits/              ← UI, component & design audits
│   └── reviews/             ← Architecture & gap analyses
├── assets/                 ← Visual & collateral assets
│   ├── slides/              ← Pitch deck PNG exports
│   └── collateral/           ← PDFs, XLSX, DOCX, RTF
├── archive/                 ← Superseded or inactive material
│   ├── legacy-planning/     ← Stage-by-stage Claude Code prompts
│   ├── old-revisions/        ← Prior design & UX explorations
│   └── slip_cekwajar_id/    ← Deprecated app draft (Slip)
└── scripts/                 ← Build, seed & audit scripts
```

## Key Docs

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent behavior rules & learned preferences |
| `.cursorrules` | Cursor AI backend config (MiniMax-M2.7) |
| `docs/req/req_01_master_prd.md` | Master PRD |
| `docs/build/build_guide_00_overview.md` | Build starting point |
| `cekwajar.id-main/` | **Production app** — start here for any code work |

## Deprecated

Do not use files in `archive/` — kept only for reference during transition.
