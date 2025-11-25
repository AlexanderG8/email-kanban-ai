"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

const PRIORITY_COLORS: Record<string, string> = {
  Urgente: "#ef4444", // red-500
  Alta: "#f59e0b", // amber-500
  Media: "#3b82f6", // blue-500
  Baja: "#10b981", // green-500
};

export function TasksByPriorityChart({ data }: TasksByPriorityChartProps) {
  // Transform data for bar chart by priority
  const chartData = Object.entries(data).map(([priority, info]) => ({
    priority,
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
                formatter={(value: number) => [value, "Tareas"]}
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              />
              <Bar
                dataKey="total"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PRIORITY_COLORS[entry.priority] || "#8b5cf6"}
                  />
                ))}
              </Bar>
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
