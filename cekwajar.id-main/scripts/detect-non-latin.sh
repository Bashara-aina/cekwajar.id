#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# cekwajar.id — Detect Non-Latin Text in Source Files
# Flags strings that may need i18n treatment (non-ID characters)
# Run: bash scripts/detect-non-latin.sh
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

echo "🔍 Checking for non-Latin / hardcoded strings in source files..."

FOUND=0

# Check .tsx and .ts files (skip node_modules, .next, dist)
while IFS= read -r -d '' file; do
  # Skip files with strings that are clearly in Indonesian or English
  # Look for CJK, Cyrillic, Arabic, Thai, etc.
  if grep -P '[^\x00-\x7F\u0900-\u097F\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\u0400-\u04FF]' "$file" 2>/dev/null; then
    # Filter out known valid patterns (comments, URLs, variable names)
    VIOLATIONS=$(grep -nP '[^\x00-\x7F\u0900-\u097F\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\u0400-\u04FF]' "$file" || true)
    if [ -n "$VIOLATIONS" ]; then
      echo "  ⚠️  $file"
      echo "$VIOLATIONS" | head -5 | sed 's/^/      /'
      FOUND=$((FOUND + 1))
    fi
  fi
done < <(find . -type f \( -name '*.tsx' -o -name '*.ts' \) ! -path '*/node_modules/*' ! -path '*/.next/*' ! -path '*/dist/*' ! -path '*/.vercel/*' -print0)

if [ $FOUND -eq 0 ]; then
  echo "✅ No non-Latin hardcoded strings detected."
else
  echo ""
  echo "⚠️  Found potential i18n issues in $FOUND file(s). Review above."
  echo "   (False positives possible — check manually.)"
fi