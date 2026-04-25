"use client";

import * as React from "react";

export interface CityOption {
  value: string;
  label: string;
  country?: string;
}

interface CityCommandSelectProps {
  cities: CityOption[];
  value?: string;
  onChange?: (city: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Simple city selector with search dropdown - no external dependencies
export function CityCommandSelect({
  cities,
  value,
  onChange,
  placeholder = "Select a city...",
  disabled = false,
}: CityCommandSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedCity = cities.find((city) => city.value === value);

  const filteredCities = cities.filter((city) =>
    city.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedCity ? "text-foreground" : "text-muted-foreground"}>
          {selectedCity ? selectedCity.label : placeholder}
        </span>
        <svg
          className="h-4 w-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredCities.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No cities found.</div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.value}
                  type="button"
                  onClick={() => {
                    onChange?.(city.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <span>{city.label}</span>
                  {city.country && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {city.country}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CityCommandSelect;