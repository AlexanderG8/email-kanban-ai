"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { EmailsByCategoryData } from "@/types/analytics";

interface EmailsByCategoryChartProps {
  data: EmailsByCategoryData[];
}

const CATEGORY_COLORS = {
  Cliente: "#3b82f6", // blue-500
  Lead: "#a855f7", // purple-500
  Interno: "#6b7280", // gray-500
};

export function EmailsByCategoryChart({ data }: EmailsByCategoryChartProps) {
  // Format dates for display
  const chartData = data.map((item) => ({
    ...item,
    dateFormatted: format(parseISO(item.date), "dd/MM", { locale: es }),
  }));

  const hasData = data.length > 0 && data.some((d) => d.Cliente > 0 || d.Lead > 0 || d.Interno > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Emails por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
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
                formatter={(value: number) => value}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Cliente"
                stackId="1"
                stroke={CATEGORY_COLORS.Cliente}
                fill={CATEGORY_COLORS.Cliente}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="Lead"
                stackId="1"
                stroke={CATEGORY_COLORS.Lead}
                fill={CATEGORY_COLORS.Lead}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="Interno"
                stackId="1"
                stroke={CATEGORY_COLORS.Interno}
                fill={CATEGORY_COLORS.Interno}
                fillOpacity={0.6}
              />
            </AreaChart>
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
