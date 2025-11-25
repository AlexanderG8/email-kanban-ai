"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { TimelineData } from "@/types/analytics";

interface CompletionTimelineChartProps {
  data: TimelineData[];
}

export function CompletionTimelineChart({ data }: CompletionTimelineChartProps) {
  // Format dates for display
  const chartData = data.map((item) => ({
    ...item,
    dateFormatted: format(parseISO(item.date), "dd/MM", { locale: es }),
  }));

  const hasData = data.length > 0 && data.some((d) => d.completed > 0 || d.created > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timeline de Tareas</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dateFormatted"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const date = parseISO(payload[0].payload.date);
                    return format(date, "PPP", { locale: es });
                  }
                  return label;
                }}
                formatter={(value: number, name: string) => [value, name === "completed" ? "Completadas" : "Creadas"]}
              />
              <Legend
                formatter={(value) => value === "completed" ? "Completadas" : "Creadas"}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
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
