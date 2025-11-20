"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/useStore";

const categoryOptions = [
  { value: "all", label: "Todas las categorías" },
  { value: "Cliente", label: "Cliente" },
  { value: "Lead", label: "Lead" },
  { value: "Interno", label: "Interno" },
];

const priorityOptions = [
  { value: "all", label: "Todas las prioridades" },
  { value: "Urgente", label: "Urgente" },
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

export function FilterDropdowns() {
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);
  const clearFilters = useStore((state) => state.clearFilters);

  const hasActiveFilters = filters.category || filters.priority || filters.search;

  const handleCategoryChange = (value: string) => {
    setFilters({
      category: value === "all" ? null : (value as "Cliente" | "Lead" | "Interno"),
    });
  };

  const handlePriorityChange = (value: string) => {
    setFilters({
      priority: value === "all" ? null : (value as "Urgente" | "Alta" | "Media" | "Baja"),
    });
  };

  const handleClearCategory = () => {
    setFilters({ category: null });
  };

  const handleClearPriority = () => {
    setFilters({ priority: null });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Category Filter */}
      <Select
        value={filters.category || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[160px] h-9" aria-label="Filtrar por categoría">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority || "all"}
        onValueChange={handlePriorityChange}
      >
        <SelectTrigger className="w-[160px] h-9" aria-label="Filtrar por prioridad">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Filters Chips */}
      {filters.category && (
        <Badge variant="secondary" className="gap-1 pl-2 pr-1">
          {filters.category}
          <button
            onClick={handleClearCategory}
            className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
            aria-label={`Quitar filtro ${filters.category}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.priority && (
        <Badge variant="secondary" className="gap-1 pl-2 pr-1">
          {filters.priority}
          <button
            onClick={handleClearPriority}
            className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
            aria-label={`Quitar filtro ${filters.priority}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs h-8"
        >
          Limpiar todo
        </Button>
      )}
    </div>
  );
}
