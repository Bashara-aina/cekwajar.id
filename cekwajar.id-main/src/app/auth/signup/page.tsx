// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Sign Up Page (redirects to login with signup intent)
// Guest signup is handled via magic link in the login page
// ══════════════════════════════════════════════════════════════════════════════

import { redirect } from 'next/navigation'

export default function SignupPage() {
  redirect('/auth/login?intent=signup')
}
