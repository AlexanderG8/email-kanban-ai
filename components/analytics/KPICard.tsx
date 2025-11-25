"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  suffix?: string;
  trendLabel?: string;
}

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  suffix = "",
  trendLabel = "vs mes anterior",
}: KPICardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;
  const hasNoChange = trend === 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold">
            {value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>

          {trend !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {!hasNoChange && (
                <>
                  {isPositiveTrend ? (
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      isPositiveTrend && "text-green-600",
                      isNegativeTrend && "text-red-600"
                    )}
                  >
                    {Math.abs(trend)}%
                  </span>
                </>
              )}
              {hasNoChange && (
                <span className="font-medium text-muted-foreground">
                  Sin cambios
                </span>
              )}
              <span className="text-muted-foreground ml-1">{trendLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
