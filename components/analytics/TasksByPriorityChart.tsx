"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TasksByPriorityChartProps {
  data: Record<
    string,
    {
      total: number;
      byStatus: Record<string, number>;
    }
  >;
}

const STATUS_COLORS: Record<string, string> = {
  Pendiente: "#f59e0b", // amber-500
  "En Progreso": "#3b82f6", // blue-500
  Completado: "#10b981", // green-500
  Cancelado: "#ef4444", // red-500
};

export function TasksByPriorityChart({ data }: TasksByPriorityChartProps) {
  // Transform data for stacked bar chart
  const chartData = Object.entries(data).map(([priority, info]) => ({
    priority,
    Pendiente: info.byStatus["Pendiente"] || 0,
    "En Progreso": info.byStatus["En Progreso"] || 0,
    Completado: info.byStatus["Completado"] || 0,
    Cancelado: info.byStatus["Cancelado"] || 0,
    total: info.total,
  }));

  // Sort by priority (Urgente > Alta > Media > Baja)
  const priorityOrder: Record<string, number> = {
    Urgente: 0,
    Alta: 1,
    Media: 2,
    Baja: 3,
  };

  chartData.sort((a, b) => {
    return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
  });

  const hasData = chartData.length > 0 && chartData.some((d) => d.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tareas por Prioridad</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="priority" width={80} />
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              />
              <Legend />
              <Bar
                dataKey="Pendiente"
                stackId="a"
                fill={STATUS_COLORS.Pendiente}
              />
              <Bar
                dataKey="En Progreso"
                stackId="a"
                fill={STATUS_COLORS["En Progreso"]}
              />
              <Bar
                dataKey="Completado"
                stackId="a"
                fill={STATUS_COLORS.Completado}
              />
              <Bar
                dataKey="Cancelado"
                stackId="a"
                fill={STATUS_COLORS.Cancelado}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No hay datos disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
