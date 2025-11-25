"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TaskDistributionChartProps {
  data: Record<string, number>;
}

const COLORS: Record<string, string> = {
  Pendiente: "#f59e0b", // amber-500
  "En Progreso": "#3b82f6", // blue-500
  Completado: "#10b981", // green-500
  Cancelado: "#ef4444", // red-500
};

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
  // Transform data for Recharts
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribucion por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} tareas`, "Cantidad"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const item = chartData.find((d) => d.name === value);
                  return `${value} (${item?.value || 0})`;
                }}
              />
            </PieChart>
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
