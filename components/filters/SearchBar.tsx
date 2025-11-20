"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Buscar por remitente o asunto..." }: SearchBarProps) {
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);

  const [inputValue, setInputValue] = useState(filters.search);

  // Sync input with store when filters change externally
  useEffect(() => {
    setInputValue(filters.search);
  }, [filters.search]);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== filters.search) {
        setFilters({ search: inputValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, filters.search, setFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = useCallback(() => {
    setInputValue("");
    setFilters({ search: "" });
  }, [setFilters]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 h-9 w-[250px]"
          aria-label="Buscar emails y tareas"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Active Search Chip */}
      {filters.search && (
        <Badge variant="secondary" className="gap-1 pl-2 pr-1">
          &quot;{filters.search}&quot;
          <button
            onClick={handleClear}
            className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
            aria-label="Quitar búsqueda"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
