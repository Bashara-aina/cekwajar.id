'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function GlobalNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/wajar-slip', label: 'Cek Slip' },
    { href: '/wajar-gaji', label: 'Cek Gaji' },
    { href: '/wajar-tanah', label: 'Cek Tanah' },
    { href: '/wajar-kabur', label: 'Cek Kabur' },
    { href: '/upgrade', label: 'Upgrade' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-emerald-700">
            cekwajar.id
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block">
              Dashboard
            </Link>
            <Link href="/upgrade">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Mulai Gratis
              </Button>
            </Link>
          </div>

          <button
            className="sm:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 py-3 sm:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
