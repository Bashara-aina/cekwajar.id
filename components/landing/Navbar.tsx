"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WordmarkLogo } from "@/components/WordmarkLogo";
import { X } from "lucide-react";

const navLinks = [
  { href: "#tools", label: "Tools" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const toolNavLinks = [
  { href: "/slip", label: "Wajar Slip", desc: "Audit PPh21 & BPJS" },
  { href: "/gaji", label: "Wajar Gaji", desc: "Benchmark gaji pasar" },
  { href: "/tanah", label: "Wajar Tanah", desc: "Cek harga properti" },
  { href: "/kabur", label: "Wajar Kabur", desc: "Bandingkan PPP global" },
  { href: "/hidup", label: "Wajar Hidup", desc: "Biaya hidup & gaji" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md shadow-sm"
          : "border-transparent bg-background"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <WordmarkLogo size="md" />

          <nav className="hidden md:flex items-center gap-8">
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

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/slip">Masuk</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="#tools">Coba Gratis</Link>
            </Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Buka menu navigasi">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                  <WordmarkLogo size="sm" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2 px-2">
                    Tool Cekwajar
                  </p>
                  <nav className="flex flex-col gap-1">
                    {toolNavLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {link.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {link.desc}
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="flex flex-col gap-3 mt-4 border-t border-border pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/slip" onClick={() => setIsOpen(false)}>
                      Masuk
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="#tools" onClick={() => setIsOpen(false)}>
                      Coba Gratis
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
