#!/bin/bash
# cekwajar.id — Deploy Script
# Usage:
#   bash scripts/deploy.sh              # interactive (human-friendly)
#   bash scripts/deploy.sh --dry-run     # preview only, no changes
#   bash scripts/deploy.sh --yes         # skip confirmation (agent-friendly)
#   bash scripts/deploy.sh --help

set -e

DRY_RUN=false
SKIP_CONFIRM=false

show_help() {
  cat << 'EOF'
cekwaar.id Deploy Script

Usage:
  bash scripts/deploy.sh [options]

Options:
  --dry-run    Preview changes without committing or pushing
  --yes        Skip confirmation prompt (agents, CI)
  --help       Show this help message

Examples:
  bash scripts/deploy.sh                    # interactive
  bash scripts/deploy.sh --dry-run           # preview only
  bash scripts/deploy.sh --yes               # fully automated
  bash scripts/deploy.sh --dry-run --yes    # preview without confirm
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --yes) SKIP_CONFIRM=true; shift ;;
    --help) show_help; exit 0 ;;
    *) echo "Unknown option: $1"; show_help; exit 1 ;;
  esac
done

if [[ "$DRY_RUN" == true ]]; then
  echo "🔍 Dry-run mode — no changes will be committed or pushed"
fi

echo "🚀 Deploying cekwajar.id to production..."

# Run TypeScript check
echo "Running TypeScript check..."
pnpm tsc --noEmit

# Run lint
echo "Running lint..."
pnpm lint

# Build
echo "Building..."
pnpm build

echo "All checks passed!"

# Show git status
echo ""
echo "Git status:"
git status --short

# Commit message (idempotent — empty commit if nothing changed)
COMMIT_MSG="deploy: stage 10 production hardening

- Security headers (HSTS, CSP, X-Frame-Options)
- Vercel KV rate limiting
- Sentry error monitoring configured
- Env validation at startup
- Security audit script
- Launch checklist
- Deploy script"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "Would commit: $COMMIT_MSG"
  echo "Would push to origin/main"
  echo ""
  echo "Dry-run complete. Remove --dry-run to deploy."
  exit 0
fi

# Confirmation (skipped with --yes)
if [[ "$SKIP_CONFIRM" != true ]]; then
  echo ""
  read -p "Continue with commit and push? [y/N] " confirm
  if [[ "$confirm" != [yY] ]]; then
    echo "Cancelled."
    exit 1
  fi
fi

# Commit
echo "Committing..."
git add .
if git diff --cached --quiet && [[ "$SKIP_CONFIRM" != true ]]; then
  echo "Nothing to commit (idempotent)."
else
  git commit -m "$COMMIT_MSG"
fi

# Push
echo "Pushing to origin main..."
git push origin main

echo ""
echo "✅ Pushed to GitHub. Vercel will auto-deploy."
echo "url: https://cekwajar.id"
echo "Monitor: https://vercel.com/dashboard"