## Learned User Preferences

- User prefers fast, directive responses — show the implementation first, explain after if needed
- User approves subagent manifests quickly and expects execution to follow immediately
- When multiple async subagents are running, user wants status updates at completion
- No console.log in production code; use proper logger instead
- No `any` types; always use explicit types with `unknown` narrowed appropriately
- Always implement loading, empty, and error states for UI components
- Use shadcn/ui components exclusively; never raw HTML inputs or inline styles
- User created detailed v3.0 `.cursorrules` with specific MCP tool protocols — filesystem, sequential-thinking, crawl4ai, browser-use, gitnexus are all active
- Subagent manifest trigger is strict: prompts with "all", "everything", "entire", "full feature" always require manifest output before any code action
- Use the user's MiniMax API key from .env when AI calls are needed

## Learned Workspace Facts

### Project Structure
- cekwajar.id is at `cekwajar.id-main/` (NOT nested — the app is directly in the cekwajar.id-main subdirectory, not in a further subdirectory)
- Root `cekwajar_id-main` contains block_*.md (business/strategy docs) and build_guide_*.md (implementation specs)
- Audit files (audit-components.md, audit-pages.md, audit-design-tokens.md) live at workspace root
- pnpm workspace structure — packages managed via pnpm
- Active rules: `.cursor/rules/anti-slop.mdc`, `.cursor/rules/multi-agent-context.mdc`, `.cursorrules`
- cekwajar.id-specific .env is at `cekwajar.id-main/.env` — contains SUPABASE, MIDTRANS, Vercel KV, Groq API keys
- Vercel project: cekwajarid (connected to account basharaaina56-4493)

### Tech Stack
- Next.js App Router (frontend + API routes)
- Supabase (auth + database)
- Sentry (error tracking)
- MiniMax-M2.7 via OpenAI-compatible SDK (AI/LLM calls) — baseURL: api.minimax.io/v1
- TypeScript strict mode, Vitest for testing
- Midtrans (payment gateway), Turso (edge DB), Upstash Redis, Groq API (objection letter AI)
- pnpm workspaces — root `cekwajar.id-main/` contains the Next.js app directly (not further nested)

### Multi-Agent Workflow
- UI/UX overhaul used 8 subagents: 3 parallel readers → 5 parallel implementers
- Reader subagents write audit files (audit-components.md, audit-pages.md, audit-design-tokens.md) then die — implementers use audit findings to patch source files
- Implementer subagents apply fixes to actual source files based on audit findings
- All implementers run `npx tsc --noEmit` after changes to verify no new TypeScript errors
- TypeScript errors in test files (__tests__/) are pre-existing and not introduced by feature work
- User approves subagent manifests quickly and expects execution immediately after approval
- When multiple async subagents are running, user wants status updates at completion
- User wants comprehensive, real-file changes — not just documentation or analysis
- After large multi-agent work, user asks "how is it" and "everything completed?" to track progress

### Key File Locations
- Global CSS/design tokens: `src/app/globals.css` (motion durations, CSS vars, animations)
- Layout components: `src/components/layout/GlobalNav.tsx`, `src/components/layout/Footer.tsx`
- Shared components: `src/components/shared/` (Paywall, etc.)
- shadcn/ui: `src/components/ui/` (Button, Input, etc.)
- Dashboard: `src/components/dashboard/` (BentoCard, DashboardStats, AuditHistoryCard, etc.)
- Home components: `src/components/home/` (ObjectionFAQ, SocialProofTestimonials, StickyMobileCTA, etc.)
- Forms: `src/components/forms/IDRInput.tsx`
- AI agents: `src/lib/agents/surat-keberatan.ts` (Groq API + fallback templates)
- Seed scripts: `scripts/seed-umk-2026.ts` (519 cities), `scripts/seed-property-benchmarks.ts` (100 rows), `scripts/seed-job-categories.ts`
- Audit reports: written to workspace root (not inside cekwajar.id) as `audit-*.md`
- Cursor SDK security audit script: `scripts/cursor-sdk-security-audit.ts` (created but not committed)

### MCP Tools (active in this workspace)
- `filesystem` — read/write files directly, never ask user to paste content
- `git` — blame, log, diff for context; not just for committing
- `sequential-thinking` — mandatory for engine changes, schema changes, multi-file tasks
- `crawl4ai` — live data: UMR (gajimu.com), BPS salary data, NJOP land values, PPh21 brackets
- `browser-use` — smoke testing only; NOT for scraping (use crawl4ai instead)
- `gitnexus` — cross-repo code search before writing new utilities

### API / Response Conventions
- Every API route returns: `{ success: boolean, data?: T, error?: string }`
- Supabase: never INSERT into generated columns (`violation_count`, `shortfall_idr`) — SELECT what Postgres generates
- Error handling: custom classes in `lib/errors/` (AppError, ValidationError, NotFoundError, UpgradeRequiredError) — never expose raw DB errors to client

### UI/UX Pro Max Conventions (from ui-ux-pro-max skill)
- Floating navbar: `top-4 left-4 right-4` + `w-[calc(100%-2rem)]` (NOT `top-0 w-full`)
- Content padding: `pt-16` on main content for fixed navbar height (navbar is ~64px)
- Touch targets: 44x44px minimum — shadcn `size="icon"` produces 36px; override to `h-11 w-11 min-w-[44px] min-h-[44px]`
- Body text contrast: `text-slate-600` (#475569) minimum; `text-slate-500` (#64748b) is borderline
- Dark mode `--muted-foreground`: use `slate-500` (#64748b), NOT `slate-400` (#94a3b8)
- Animation durations: 150–300ms max for micro-interactions; 700ms was too slow (changed to 300ms)
- Hover effects: prefer shadow/color over scale (scale causes layout shift — BentoCard hover changed from `scale: 1.01` to `boxShadow`)
- Glass cards light mode: `bg-white/80` NOT `bg-white/10`
- Light mode borders: `border-gray-200` NOT `border-white/10`
- Line height body text: 1.5–1.75 minimum (leading-relaxed = 1.625 was below min, changed to leading-7 = 1.75)
- No emoji icons — SVG only (Lucide, Heroicons)
- Marquee animations should pause on `prefers-reduced-motion` (was `animation-play-state: paused`)
- Avatar images: `object-cover` not `object-contain`
- Paywall blur: `blur-[6px] saturate-[0.6]` too aggressive — changed to `blur-3px saturate-[0.8]`
