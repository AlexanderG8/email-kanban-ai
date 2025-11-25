"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface EmailFilters {
  startDate: Date | undefined;
  endDate: Date | undefined;
  category: string;
  taskStatus: string;
}

interface FilterBarProps {
  onSearch: (filters: EmailFilters) => void;
  isLoading?: boolean;
}

export function FilterBar({ onSearch, isLoading = false }: FilterBarProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [category, setCategory] = useState<string>("Todas");
  const [taskStatus, setTaskStatus] = useState<string>("Todas");

  const handleSearch = () => {
    onSearch({
      startDate,
      endDate,
      category,
      taskStatus,
    });
  };

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCategory("Todas");
    setTaskStatus("Todas");
    onSearch({
      startDate: undefined,
      endDate: undefined,
      category: "Todas",
      taskStatus: "Todas",
    });
  };

  const hasFilters = startDate || endDate || category !== "Todas" || taskStatus !== "Todas";

  return (
    <div className="bg-white dark:bg-gray-950 border rounded-lg p-3 mb-6">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Fecha Inicio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha Inicio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha Fin */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha Fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => {
                    if (!startDate) return false;
                    return date < startDate;
                  }}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={category} onValueChange={setCategory} >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Interno">Interno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado de Tareas */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Estado de Tareas</label>
            <Select value={taskStatus} onValueChange={setTaskStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Con Tareas">Con Tareas</SelectItem>
                <SelectItem value="Sin Tareas">Sin Tareas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
