import { v4 as uuidv4 } from 'uuid'

const KEY = 'cekwajar_anon'
const COOKIE = 'cekwajar_anon_id'

export function ensureAnonSession(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = uuidv4()
    localStorage.setItem(KEY, id)
    document.cookie = `${COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
  }
  return id
}

export function getAnonSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY)
}