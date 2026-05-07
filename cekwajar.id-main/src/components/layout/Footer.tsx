// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Footer
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { Shield, FileText, Trash2 } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { label: 'Wajar Slip — Audit PPh21 & BPJS', href: '/wajar-slip' },
    { label: 'Wajar Gaji — Benchmark Gaji', href: '/wajar-gaji' },
    { label: 'Wajar Tanah — Cek Harga Properti', href: '/wajar-tanah' },
    { label: 'Wajar Kabur — Perbandingan LN', href: '/wajar-kabur' },
    { label: 'Wajar Hidup — Biaya Hidup Kota', href: '/wajar-hidup' },
  ],
  Regulations: [
    { label: 'PMK 168/2023', href: '/regulasi/pmk-168-2023' },
    { label: 'BPJS Kesehatan', href: '/regulasi/bpjs-kesehatan' },
    { label: 'BPJS Ketenagakerjaan', href: '/regulasi/bpjs' },
    { label: 'UMK 2026', href: '/regulasi/umk-2026' },
    { label: 'Surat Keberatan', href: '/regulasi/audit-letter' },
  ],
  Company: [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Kontak', href: '/kontak' },
    { label: 'Harga', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Legal: [
    { label: 'Kebijakan Privasi', href: '/privacy-policy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Security', href: '/security/policy' },
    { label: 'Insiden', href: '/security/incidents' },
  ],
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.23-5.374 6.23H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-raised)]">
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
        {/* 4-column links grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
            <Shield className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <span>Data dienkripsi end-to-end</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
            <FileText className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <span>citations ke regulasi resmi</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
            <Trash2 className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <span>Slip dihapus otomatis 30 hari</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-[var(--fg-default)]">cekwajar.id</p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              &copy; {new Date().getFullYear()} cekwajar.id &mdash; Hasil kalkulasi bersifat indikatif, bukan nasihat keuangan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/cekwajar.id"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--primary)]"
            >
              <InstagramIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://x.com/cekwajarid"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--primary)]"
            >
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
