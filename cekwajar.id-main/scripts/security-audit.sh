#!/bin/bash
# cekwajar.id — Security Audit Script
# Run this before every production deploy

echo "=== cekwajar.id Pre-Launch Security Audit ==="
echo ""

# 1. Check for secrets in codebase
echo "1. Checking for secrets in source code..."
SECRETS_FOUND=$(grep -r "service_role\|sk_live\|secret\|password.*=" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "validateEnvVars\|getServiceClient\|process.env\|//.*password" || true)
if [ -n "$SECRETS_FOUND" ]; then
  echo "FAIL — Potential secret found in source code:"
  echo "$SECRETS_FOUND"
else
  echo "PASS — No obvious secrets found in source code"
fi

# 2. Check .gitignore covers all sensitive files
echo ""
echo "2. Checking .gitignore coverage..."
git check-ignore .env .env.local agents/.env 2>/dev/null
if [ $? -eq 0 ]; then
  echo "PASS — .env, .env.local, agents/.env are ignored"
else
  echo "FAIL — Some env files are NOT ignored by .gitignore"
fi

# 3. Verify no console.log with user data
echo ""
echo "3. Checking for PII in console.log..."
PII_LOGS=$(grep -r "console.log" src/app/api/ --include="*.ts" 2>/dev/null | grep -i "email\|salary\|user\|password\|token" || true)
if [ -n "$PII_LOGS" ]; then
  echo "REVIEW — Possible PII in console.log:"
  echo "$PII_LOGS"
else
  echo "PASS — No PII detected in API console.log calls"
fi

# 4. Check RLS is enabled
echo ""
echo "4. Run this in Supabase SQL editor to verify RLS:"
echo "   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
echo "   ALL tables must show rowsecurity=t"

# 5. Check rate limiting middleware exists
echo ""
echo "5. Checking rate limiting..."
if [ -f "src/lib/rate-limit.ts" ]; then
  echo "PASS — Rate limiting module exists"
else
  echo "FAIL — Rate limiting module missing"
fi

# 6. Check no direct DB connection strings exposed
echo ""
echo "6. Checking for exposed connection strings..."
DB_CONN=$(grep -r "postgresql://" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
if [ -n "$DB_CONN" ]; then
  echo "FAIL — Direct connection string found:"
  echo "$DB_CONN"
else
  echo "PASS — No direct connection strings found"
fi

# 7. Check security headers in next.config
echo ""
echo "7. Checking security headers..."
if grep -q "Strict-Transport-Security" next.config.ts; then
  echo "PASS — Security headers configured"
else
  echo "FAIL — Security headers missing in next.config.ts"
fi

# 8. Verify Sentry is configured
echo ""
echo "8. Checking Sentry configuration..."
if [ -f "sentry.client.config.ts" ] && [ -f "sentry.server.config.ts" ]; then
  echo "PASS — Sentry config files exist"
else
  echo "WARN — Sentry config files may be missing"
fi

echo ""
echo "=== Audit complete. Fix any FAIL items before launch. ==="
echo "For full database RLS check, run the SQL query in step 4 in Supabase SQL Editor."