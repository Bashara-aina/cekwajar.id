// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Environment Variable Validator
// Throws on missing required env vars at startup
// ══════════════════════════════════════════════════════════════════════════════

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_VISION_API_KEY',
  'MIDTRANS_SERVER_KEY',
  'NEXT_PUBLIC_MIDTRANS_CLIENT_KEY',
]

export function validateEnvVars(): void {
  // Skip validation during build (env vars injected at deploy time)
  if (process.env.SKIP_ENV_VALIDATION === '1') return
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}