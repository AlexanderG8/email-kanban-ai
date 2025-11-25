"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductivityHeatmapProps {
  data: { day: number; hour: number; count: number }[];
}

const DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
  // Find max count for color scaling
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach((item) => {
    dataMap.set(`${item.day}-${item.hour}`, item.count);
  });

  // Get color intensity based on count
  const getColorIntensity = (count: number): string => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    const intensity = count / maxCount;
    if (intensity <= 0.2) return "bg-green-200 dark:bg-green-900";
    if (intensity <= 0.4) return "bg-green-300 dark:bg-green-800";
    if (intensity <= 0.6) return "bg-green-400 dark:bg-green-700";
    if (intensity <= 0.8) return "bg-green-500 dark:bg-green-600";
    return "bg-green-600 dark:bg-green-500";
  };

  const hasData = data.some((d) => d.count > 0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Mapa de Productividad</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tareas completadas por dia y hora
        </p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header with hours */}
              <div className="flex mb-1">
                <div className="w-12 flex-shrink-0" />
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="w-6 text-center text-xs text-muted-foreground"
                  >
                    {hour % 6 === 0 ? hour : ""}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {DAYS.map((dayName, dayIndex) => (
                <div key={dayIndex} className="flex mb-1">
                  <div className="w-12 flex-shrink-0 text-xs text-muted-foreground flex items-center">
                    {dayName}
                  </div>
                  {HOURS.map((hour) => {
                    const key = `${dayIndex}-${hour}`;
                    const count = dataMap.get(key) || 0;
                    const colorClass = getColorIntensity(count);

                    return (
                      <div
                        key={hour}
                        className={cn(
                          "w-6 h-6 rounded-sm cursor-pointer transition-all hover:scale-110 hover:shadow-md",
                          colorClass
                        )}
                        title={`${dayName} ${hour}:00 - ${count} tareas`}
                      />
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Menos</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-sm" />
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded-sm" />
                  <div className="w-4 h-4 bg-green-300 dark:bg-green-800 rounded-sm" />
                  <div className="w-4 h-4 bg-green-400 dark:bg-green-700 rounded-sm" />
                  <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded-sm" />
                  <div className="w-4 h-4 bg-green-600 dark:bg-green-500 rounded-sm" />
                </div>
                <span>Mas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No hay datos disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
