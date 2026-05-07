// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Anonymous Session Management
// Enables guest flows before auth — stored in localStorage + httpOnly cookie
// ══════════════════════════════════════════════════════════════════════════════

import { cookies } from 'next/headers'

const ANON_COOKIE_NAME = 'anon_session_id'
const ANON_STORAGE_KEY = 'cekwajar_anon_id'

/**
 * Get or create an anonymous session ID.
 * On client: reads/writes to localStorage + sets cookie.
 * On server: reads from cookie.
 * Returns a stable UUID that persists across page refreshes.
 */
export async function ensureAnonSession(): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: read from cookie
    const cookieStore = await cookies()
    const existing = cookieStore.get(ANON_COOKIE_NAME)
    if (existing?.value) {
      return existing.value
    }
    // Fallback — generate new one (cookies set by client)
    return crypto.randomUUID()
  }

  // Client-side
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(ANON_STORAGE_KEY)
    if (stored) return stored
  }

  const id = crypto.randomUUID()

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ANON_STORAGE_KEY, id)
  }

  // Set cookie for server-side access
  document.cookie = `${ANON_COOKIE_NAME}=${id}; path=/; max-age=604800; SameSite=Lax`

  return id
}

/**
 * Get current anon session ID without creating one.
 * Returns null if no session exists.
 */
export async function getAnonSession(): Promise<string | null> {
  if (typeof window === 'undefined') {
    const cookieStore = await cookies()
    return cookieStore.get(ANON_COOKIE_NAME)?.value ?? null
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(ANON_STORAGE_KEY)
  }

  return null
}

/**
 * Clear anonymous session (called after account claim).
 */
export function clearAnonSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ANON_STORAGE_KEY)
    document.cookie = `${ANON_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  }
}
