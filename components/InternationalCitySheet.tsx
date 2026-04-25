"use client";

import { useState } from "react";
import { Search, Check, ChevronDown, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InternationalCity {
  value: string;
  label: string;
  country: string;
  region: "asia_pacific" | "europe" | "americas" | "middle_east";
}

const INTERNATIONAL_CITIES: InternationalCity[] = [
  { value: "singapore", label: "Singapore", country: "Singapura", region: "asia_pacific" },
  { value: "kuala_lumpur", label: "Kuala Lumpur", country: "Malaysia", region: "asia_pacific" },
  { value: "bangkok", label: "Bangkok", country: "Thailand", region: "asia_pacific" },
  { value: "jakarta", label: "Jakarta", country: "Indonesia", region: "asia_pacific" },
  { value: "bali", label: "Bali", country: "Indonesia", region: "asia_pacific" },
  { value: "surabaya", label: "Surabaya", country: "Indonesia", region: "asia_pacific" },
  { value: "bandung", label: "Bandung", country: "Indonesia", region: "asia_pacific" },
  { value: "tokyo", label: "Tokyo", country: "Jepang", region: "asia_pacific" },
  { value: "hong_kong", label: "Hong Kong", country: "Tiongkong", region: "asia_pacific" },
  { value: "seoul", label: "Seoul", country: "Korea Selatan", region: "asia_pacific" },
  { value: "shanghai", label: "Shanghai", country: "China", region: "asia_pacific" },
  { value: "taipei", label: "Taipei", country: "Taiwan", region: "asia_pacific" },
  { value: "manila", label: "Manila", country: "Filipina", region: "asia_pacific" },
  { value: "ho_chi_minh", label: "Ho Chi Minh City", country: "Vietnam", region: "asia_pacific" },
  { value: "sydney", label: "Sydney", country: "Australia", region: "asia_pacific" },
  { value: "auckland", label: "Auckland", country: "Selandia Baru", region: "asia_pacific" },
  { value: "london", label: "London", country: "Inggris", region: "europe" },
  { value: "berlin", label: "Berlin", country: "Jerman", region: "europe" },
  { value: "amsterdam", label: "Amsterdam", country: "Belanda", region: "europe" },
  { value: "paris", label: "Paris", country: "Prancis", region: "europe" },
  { value: "dubai", label: "Dubai", country: "UAE", region: "middle_east" },
  { value: "new_york", label: "New York", country: "Amerika Serikat", region: "americas" },
  { value: "los_angeles", label: "Los Angeles", country: "Amerika Serikat", region: "americas" },
  { value: "san_francisco", label: "San Francisco", country: "Amerika Serikat", region: "americas" },
  { value: "vancouver", label: "Vancouver", country: "Kanada", region: "americas" },
];

const REGION_LABELS: Record<InternationalCity["region"], string> = {
  asia_pacific: "Asia Pacific",
  europe: "Europe",
  americas: "Americas",
  middle_east: "Middle East",
};

interface InternationalCitySheetProps {
  value: string;
  onValueChange: (city: string) => void;
  placeholder?: string;
}

export function InternationalCitySheet({
  value,
  onValueChange,
  placeholder = "Pilih kota",
}: InternationalCitySheetProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCity = INTERNATIONAL_CITIES.find((c) => c.value === value);

  const filtered = search
    ? INTERNATIONAL_CITIES.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.country.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const grouped = INTERNATIONAL_CITIES.reduce(
    (acc, city) => {
      if (!acc[city.region]) acc[city.region] = [];
      acc[city.region].push(city);
      return acc;
    },
    {} as Record<InternationalCity["region"], InternationalCity[]>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-14 flex items-center justify-between px-4 rounded-xl border bg-background",
            "text-left text-sm transition-colors",
            "hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
            !value && "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{selectedCity ? `${selectedCity.label}, ${selectedCity.country}` : placeholder}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh] px-0 pb-0">
        <SheetHeader className="px-4 pb-3 border-b">
          <SheetTitle className="text-base">Pilih Kota Internasional</SheetTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kota atau negara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
              autoFocus
            />
          </div>
        </SheetHeader>

        <div className="overflow-y-auto flex-1 h-full pb-safe">
          {filtered ? (
            <div className="px-2 py-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Kota tidak ditemukan. Coba kata kunci lain.
                </p>
              ) : (
                filtered.map((city) => (
                  <CityItem
                    key={city.value}
                    city={city}
                    isSelected={value === city.value}
                    onSelect={() => {
                      onValueChange(city.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="py-2">
              {(Object.keys(grouped) as InternationalCity["region"][]).map((region) => (
                <div key={region}>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {REGION_LABELS[region]}
                    </p>
                  </div>
                  <div className="px-2 pb-2">
                    {grouped[region].map((city) => (
                      <CityItem
                        key={city.value}
                        city={city}
                        isSelected={value === city.value}
                        onSelect={() => {
                          onValueChange(city.value);
                          setOpen(false);
                          setSearch("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CityItem({
  city,
  isSelected,
  onSelect,
}: {
  city: InternationalCity;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm text-left",
        "transition-colors active:scale-[0.98]",
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-medium"
          : "hover:bg-muted/50 text-foreground"
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-medium">{city.label}</span>
        <span className="text-xs text-muted-foreground">{city.country}</span>
      </span>
      {isSelected && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
    </button>
  );
}
