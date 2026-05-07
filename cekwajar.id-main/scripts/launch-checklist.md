# cekwajar.id — Pre-Launch Checklist
# Execute in order before pointing domain to production

## PRE-LAUNCH (do these before going live)

### Build & Type Safety
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm lint` → zero errors
- [ ] `pnpm build` → successful build, no warnings
- [ ] All 5 tool pages load and calculate correctly

### Authentication
- [ ] Auth (Google + email) works in production Supabase project
- [ ] Session refresh middleware active on all routes
- [ ] Protected routes redirect properly

### Legal Pages
- [ ] Privacy Policy at /privacy-policy
- [ ] Terms of Service at /terms
- [ ] Cookie consent shows on first visit
- [ ] KJPP disclaimer shows on Wajar Tanah
- [ ] PPP disclaimer shows on Wajar Kabur
- [ ] Tax disclaimer shows on Wajar Slip

### Database & Data
- [ ] UMK data loaded: `SELECT COUNT(*) FROM umk_2026` >= 50
- [ ] TER rate data loaded: `SELECT COUNT(*) FROM pph21_ter_rates` >= 30
- [ ] BPJS rates loaded: `SELECT COUNT(*) FROM bpjs_rates` = 12
- [ ] PTKP values loaded: `SELECT COUNT(*) FROM ptkp_values` = 12
- [ ] Col indices loaded: `SELECT COUNT(*) FROM col_indices` = 20
- [ ] PPP reference loaded: `SELECT COUNT(*) FROM ppp_reference` = 15
- [ ] RLS enabled on ALL tables (check from Supabase Studio)
- [ ] payslips storage bucket is PRIVATE (not public)

### Security
- [ ] Security headers active (HSTS, CSP, X-Frame-Options)
- [ ] Rate limiting active on API routes
- [ ] Sentry DSN configured, error tracking working
- [ ] No secrets in source code
- [ ] .env files in .gitignore

### Monitoring
- [ ] Uptime Robot configured and monitoring https://cekwajar.id/api/health
- [ ] Alert contacts set (email + optional Telegram)
- [ ] Health endpoint returns `{"status": "ok"}` in production

---

## PAYMENT LAUNCH (only when ready to accept real money)

- [ ] PSE Kominfo registration completed
- [ ] Midtrans production keys in Vercel (not sandbox)
- [ ] Midtrans webhook URL updated to https://cekwajar.id/api/webhooks/midtrans
- [ ] CSP updated to remove sandbox URLs (keep only production)
- [ ] Test one real payment (your own card/GoPay) for Rp 1 → verify subscription activates
- [ ] Test webhook with real Midtrans production event
- [ ] Confirm email arrives after payment

---

## DOMAIN + DNS

- [ ] Domain cekwajar.id purchased (niagahoster.co.id or pandi.id)
- [ ] DNS A record → Vercel IPs: 76.76.21.21
- [ ] CNAME www → cekwajar.id.vercel-dns.com (or Vercel alias)
- [ ] Vercel project → Domains → Add custom domain
- [ ] SSL certificate active (Vercel handles this automatically)
- [ ] Update NEXT_PUBLIC_APP_URL in Vercel: https://cekwajar.id
- [ ] Update Supabase Site URL: https://cekwajar.id
- [ ] Update Supabase Redirect URLs: https://cekwajar.id/auth/callback

---

## POST-LAUNCH DAY 1

- [ ] Monitor Sentry for new errors (first 24h)
- [ ] Monitor Uptime Robot for any downtime
- [ ] Check Supabase Logs for unusual queries
- [ ] Post launch on r/finansialku (use template)
- [ ] Share beta link in WhatsApp HRD group
- [ ] Monitor signup count in Supabase auth.users
- [ ] Post first TikTok video (Week 1)

---

## VERIFICATION COMMANDS

```bash
# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build
pnpm build

# Run security audit
bash scripts/security-audit.sh

# Check DB data counts
psql $DATABASE_URL -c "SELECT COUNT(*) FROM umk_2026;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pph21_ter_rates;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM bpjs_rates;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM ptkp_values;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM col_indices;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM ppp_reference;"

# Check RLS
psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

# Health check
curl -s https://cekwajar.id/api/health | jq .
```