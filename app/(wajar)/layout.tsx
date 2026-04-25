"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Banknote,
  Plane,
  Scale,
  Landmark,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    name: "Wajar Slip",
    href: "/slip",
    icon: FileText,
    description: "Audit slip gaji PPh21 & BPJS",
  },
  {
    name: "Wajar Gaji",
    href: "/gaji",
    icon: Banknote,
    description: "Benchmark gaji industri",
  },
  {
    name: "Wajar Kabur",
    href: "/kabur",
    icon: Plane,
    description: "Analisis PPP antar kota",
  },
  {
    name: "Wajar Hidup",
    href: "/hidup",
    icon: Scale,
    description: "Perbandingan biaya hidup",
  },
  {
    name: "Wajar Tanah",
    href: "/tanah",
    icon: Landmark,
    description: "Cek harga properti",
  },
];

export default function WajarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L10 5.5L14.5 6L11 9.5L12 14L8 11.5L4 14L5 9.5L1.5 6L6 5.5L8 1Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-base font-bold">cekwajar.id</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tools
            </p>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebar"
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to home */}
        <div className="p-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card md:hidden">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M8 1L10 5.5L14.5 6L11 9.5L12 14L8 11.5L4 14L5 9.5L1.5 6L6 5.5L8 1Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-bold">cekwajar.id</span>
                  </Link>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <div>
                              <p>{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="p-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link href="/" onClick={() => setIsMobileOpen(false)}>
                      <ChevronLeft className="h-4 w-4" />
                      Kembali ke Beranda
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Active tool name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {activeItem && (
              <>
                <activeItem.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-semibold truncate">
                  {activeItem.name}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}