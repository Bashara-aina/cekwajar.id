"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WordmarkLogo } from "@/components/WordmarkLogo";
import { cn } from "@/lib/utils";

const toolLinks = [
  { href: "/slip",  label: "Wajar Slip",  desc: "Audit PPh21 & BPJS",        dot: "bg-amber-500" },
  { href: "/gaji",  label: "Wajar Gaji",  desc: "Benchmark gaji industri",    dot: "bg-blue-500" },
  { href: "/tanah", label: "Wajar Tanah", desc: "Cek harga properti",         dot: "bg-stone-500" },
  { href: "/kabur", label: "Wajar Kabur", desc: "Daya beli 20+ negara",       dot: "bg-indigo-500" },
  { href: "/hidup", label: "Wajar Hidup", desc: "Biaya hidup vs gajimu",      dot: "bg-teal-500" },
];

const navLinks = [
  { href: "#pricing", label: "Harga" },
  { href: "#faq",     label: "FAQ" },
];

function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Tools
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full pt-2 z-50 w-72">
          <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/8 p-2">
            {toolLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150",
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full shrink-0", link.dot)} />
                  <div>
                    <p className={cn("text-sm font-semibold", isActive && "text-primary")}>
                      {link.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-[10px] font-bold text-primary uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "border-b border-border/60 bg-card/90 backdrop-blur-xl shadow-sm"
          : "border-b border-transparent bg-background"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <WordmarkLogo size="md" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <ToolsDropdown />
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button
              size="sm"
              className="h-9 bg-primary text-primary-foreground font-semibold hover:bg-primary-hover shadow-sm shadow-primary/20"
              asChild
            >
              <Link href="/slip">
                Cek Gratis <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[88vw] max-w-sm bg-card p-0 border-l border-border">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <WordmarkLogo size="sm" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setIsOpen(false)}
                    aria-label="Tutup menu"
                  >
                    <X className="h-4.5 w-4.5" />
                  </Button>
                </div>

                {/* Tools section */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Tools
                  </p>
                  <nav className="space-y-0.5">
                    {toolLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors"
                      >
                        <span className={cn("h-2 w-2 rounded-full shrink-0", link.dot)} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{link.label}</p>
                          <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-4 border-t border-border pt-4 px-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Navigasi
                    </p>
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Mobile CTAs */}
                <div className="flex flex-col gap-2 px-4 py-4 border-t border-border">
                  <Button variant="outline" className="w-full h-11" asChild>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      Masuk ke Akun
                    </Link>
                  </Button>
                  <Button
                    className="w-full h-11 bg-primary font-bold shadow-brand"
                    asChild
                  >
                    <Link href="/slip" onClick={() => setIsOpen(false)}>
                      Cek Slip Gaji — Gratis →
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
