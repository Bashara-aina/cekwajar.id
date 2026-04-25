"use client";

import { useState, useCallback } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_CITIES = [
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Utara",
  "Jakarta Barat",
  "Jakarta Timur",
  "Bekasi",
  "Tangerang",
  "Tangerang Selatan",
  "Depok",
  "Bogor",
  "Surabaya",
  "Bandung",
  "Medan",
  "Semarang",
  "Makassar",
  "Palembang",
];

interface CityCommandSelectProps {
  cities: string[];
  value: string;
  onValueChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

export function CityCommandSelect({
  cities,
  value,
  onValueChange,
  placeholder = "Cari kota...",
  className,
}: CityCommandSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? cities
        .filter((c) => c.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 50)
    : cities;

  const groupedPopular = POPULAR_CITIES.filter((c) =>
    search ? c.toLowerCase().includes(search.toLowerCase()) : cities.includes(c)
  );
  const groupedOthers = filtered.filter((c) => !POPULAR_CITIES.includes(c));

  const handleSelect = useCallback(
    (city: string) => {
      onValueChange(city);
      setOpen(false);
      setSearch("");
    },
    [onValueChange]
  );

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full h-11 flex items-center justify-between px-4 rounded-xl border bg-background",
          "text-left text-sm transition-colors",
          "hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
          !value && "text-muted-foreground"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              setSearch("");
            }}
          />

          {/* Dropdown */}
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* City list */}
            <div className="max-h-64 overflow-y-auto p-1">
              {groupedPopular.length > 0 && !search && (
                <>
                  <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Kota Populer
                  </p>
                  {groupedPopular.map((city) => (
                    <CityItem
                      key={city}
                      city={city}
                      isSelected={value === city}
                      onSelect={handleSelect}
                    />
                  ))}
                </>
              )}

              {groupedPopular.length > 0 && search && (
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Hasil Pencarian
                </p>
              )}

              {(search ? groupedOthers : groupedOthers).map((city) => (
                <CityItem
                  key={city}
                  city={city}
                  isSelected={value === city}
                  onSelect={handleSelect}
                />
              ))}

              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Kota tidak ditemukan
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CityItem({
  city,
  isSelected,
  onSelect,
}: {
  city: string;
  isSelected: boolean;
  onSelect: (city: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(city)}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left",
        "transition-colors",
        isSelected
          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium"
          : "hover:bg-muted/50 text-foreground"
      )}
    >
      {city}
      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
    </button>
  );
}
