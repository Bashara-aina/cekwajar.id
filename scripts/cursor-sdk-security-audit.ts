#!/usr/bin/env tsx
/**
 * cursor-sdk-security-audit.ts
 *
 * Runs a Cursor agent to audit cekwajar.id for security issues:
 *   - Exposed secrets / hardcoded credentials
 *   - SQL injection vectors (string concatenation in DB queries)
 *   - Missing auth checks on API routes
 *   - XSS vectors in React (dangerouslySetInnerHTML, innerHTML usage)
 *
 * Usage: CURSOR_API_KEY=cursor_... npx tsx scripts/cursor-sdk-security-audit.ts
 */

import { Agent } from "@cursor/sdk";
import { exists } from "node:fs";
import { join } from "node:path";

const CURSOR_KEY = process.env.CURSOR_API_KEY;
if (!CURSOR_KEY) {
  console.error("CURSOR_API_KEY env var is required");
  process.exit(1);
}

const PROJECT_ROOT = join(import.meta.dirname, "..", "cekwajar.id-main", "cekwajar.id");

const projectExists = await exists(PROJECT_ROOT);
if (!projectExists) {
  console.error(`Project not found at ${PROJECT_ROOT}`);
  process.exit(1);
}

console.log(`[audit] Starting security audit on ${PROJECT_ROOT}`);
console.log("[audit] This run uses the local runtime against your checked-out files.\n");

try {
  const result = await Agent.prompt(
    `You are a security auditor. Audit the codebase at ${PROJECT_ROOT} for:

1. **Secrets / hardcoded credentials**: Search for API keys, tokens, passwords, or connection strings hardcoded in source files (not .env.example, not commented-out examples).
2. **SQL injection**: Parameterized queries vs string concatenation in any file under src/lib/db/ or any repository file.
3. **Missing auth on API routes**: Any route handler in src/app/api/ that does NOT call any auth/session check (e.g. no supabase server client, no getUser, no session verification).
4. **XSS vectors**: Usage of dangerouslySetInnerHTML, innerHTML assignment, or unsanitized user input in JSX.
5. **Missing rate limiting**: API routes that handle user input but have no rate-limit decorator or check.

Report each finding as:
  - FILE: <path>
  - ISSUE: <one-line description>
  - SEVERITY: Critical | High | Medium | Low

If no issues are found in a category, say "No issues found". Be precise about file paths and line numbers when you find issues.`,
    {
      apiKey: CURSOR_KEY,
      model: { id: "composer-2" },
      local: { cwd: process.cwd() },
    }
  );

  console.log(`\n[audit] Status: ${result.status}`);
  console.log(`\n[audit] Result:\n${result.result}`);
} catch (err) {
  console.error("[audit] Startup error:", (err as Error).message);
  process.exit(1);
}
