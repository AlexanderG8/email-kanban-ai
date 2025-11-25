"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopSender } from "@/types/analytics";

interface TopSendersTableProps {
  data: TopSender[];
}

export function TopSendersTable({ data }: TopSendersTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCompletionRateBadge = (rate: number) => {
    if (rate >= 80)
      return "bg-green-100 text-green-700 border-green-200";
    if (rate >= 50)
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Remitentes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Remitentes con mayor actividad
        </p>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((sender, index) => (
              <div
                key={sender.senderId}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {/* Position */}
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-lg font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(sender.senderName)}
                  </AvatarFallback>
                </Avatar>

                {/* Sender Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {sender.senderName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {sender.senderId}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{sender.emailCount}</p>
                    <p className="text-xs text-muted-foreground">emails</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{sender.tasksGenerated}</p>
                    <p className="text-xs text-muted-foreground">tareas</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getCompletionRateBadge(sender.completionRate))}
                  >
                    {sender.completionRate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay datos disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
