'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Global Navigation Bar
// Mobile-first sticky nav with auth-aware user menu
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, LayoutDashboard, Sun, Moon, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TOOLS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/auth/actions'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import type { SubscriptionTier } from '@/types'
import { useRouter } from 'next/navigation'
import { useAppTheme } from '@/components/providers'
import { Logo } from './Logo'

export function GlobalNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, toggleTheme } = useAppTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{
    id: string
    email?: string
    user_metadata?: { full_name?: string; avatar_url?: string }
  } | null>(null)
  const [tier, setTier] = useState<SubscriptionTier>('free')
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user as typeof user)
      if (data.user) {
        // Fetch tier from profile
        supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setTier(profile.subscription_tier as SubscriptionTier)
            }
          })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user as typeof user | null
      setUser(u)
      if (u) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('id', u.id)
          .single()
        setTier((profile?.subscription_tier as SubscriptionTier) ?? 'free')
      } else {
        setTier('free')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function getUserInitials(email?: string): string {
    if (!email) return 'U'
    const name = email.split('@')[0]
    return name.slice(0, 2).toUpperCase()
  }

  async function handleSignOut() {
    setMenuOpen(false)
    setSigningOut(true)
    await signOut()
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setMenuOpen(false)
    }
  }

  return (
    <header
        className="sticky top-4 z-50 w-[calc(100%-2rem)] mx-auto left-4 right-4 rounded-lg border shadow-sm backdrop-blur-md bg-white/90 dark:bg-slate-950/90"
        style={{ borderColor: 'var(--nav-border)' }}
      >
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:h-16 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === tool.href
                  ? 'text-[var(--primary)] bg-[var(--primary-100)] dark:bg-[var(--primary-700)]/20 dark:text-[var(--primary-500)]'
                  : 'hover:bg-[var(--nav-hover-bg)]'
              )}
              style={{ color: pathname === tool.href ? undefined : 'var(--nav-text-muted)' }}
            >
              <tool.Icon className="mr-1.5 h-4 w-4 inline-block" />
              {tool.name}
            </Link>
          ))}
        </div>

        {/* Desktop auth + theme section */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onKeyDown={handleMenuKeyDown}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-[var(--nav-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[var(--primary-100)] text-[var(--primary-700)] text-xs">
                    {getUserInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <SubscriptionBadge tier={tier} />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border py-1 shadow-lg" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--card-foreground)' }}>{user.user_metadata?.full_name ?? user.email}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--nav-hover-bg)]"
                      style={{ color: 'var(--card-foreground)' }}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 disabled:opacity-50"
                      style={{ color: 'var(--destructive)' }}
                    >
                      {signingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-50)]">
                  Masuk
                </Button>
              </Link>
              <Link href="/wajar-slip">
                <Button size="sm" className="bg-[var(--primary)] hover:bg-[var(--primary-700)]">
                  Cek Gratis
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm p-5" style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}>
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Logo size="md" />
                </div>
                {/* Theme toggle in mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Tutup menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors',
                    pathname === tool.href
                      ? 'text-[var(--primary)] bg-[var(--primary-100)] dark:bg-[var(--primary-700)]/20 dark:text-[var(--primary-500)]'
                      : ''
                  )}
                  style={{ color: pathname === tool.href ? undefined : 'var(--muted-foreground)' }}
                >
                  <tool.Icon className="h-5 w-5" />
                  {tool.name}
                </Link>
              ))}

              <div className="mt-6 flex flex-col gap-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[var(--primary-100)] text-[var(--primary-700)] text-xs">
                          {getUserInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--card-foreground)' }}>
                          {user.user_metadata?.full_name ?? user.email}
                        </p>
                        <SubscriptionBadge tier={tier} />
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full border-[var(--primary)] text-[var(--primary)]">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full"
                      style={{ color: 'var(--destructive)' }}
                    >
                      {signingOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full border-[var(--primary)] text-[var(--primary)]">
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/wajar-slip" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary-700)]">
                        Cek Gratis
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
