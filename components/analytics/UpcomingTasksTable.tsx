"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UpcomingTask } from "@/types/analytics";

interface UpcomingTasksTableProps {
  data: UpcomingTask[];
  onTaskClick?: (taskId: string) => void;
}

const priorityColors = {
  Urgente: "bg-red-100 text-red-700 border-red-200",
  Alta: "bg-orange-100 text-orange-700 border-orange-200",
  Media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Baja: "bg-green-100 text-green-700 border-green-200",
};

const statusColors = {
  Pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  "En Progreso": "bg-blue-100 text-blue-700 border-blue-200",
};

export function UpcomingTasksTable({ data, onTaskClick }: UpcomingTasksTableProps) {
  const getDaysUntilBadge = (days: number | null) => {
    if (days === null) return null;
    if (days === 0) return { text: "Vence hoy", color: "bg-red-100 text-red-700 border-red-200" };
    if (days === 1) return { text: "Vence manana", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (days <= 3) return { text: `${days} dias`, color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    return { text: `${days} dias`, color: "bg-green-100 text-green-700 border-green-200" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tareas Proximas a Vencer</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tareas con fecha de vencimiento en los proximos 7 dias
        </p>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((task) => {
              const daysUntilBadge = getDaysUntilBadge(task.daysUntilDue);

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 border rounded-lg transition-colors",
                    onTaskClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                  onClick={() => onTaskClick?.(task.id)}
                >
                  {/* Task title and badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm flex-1 line-clamp-2">
                      {task.title}
                    </h4>
                    {daysUntilBadge && (
                      <Badge
                        variant="outline"
                        className={cn("text-xs flex-shrink-0", daysUntilBadge.color)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {daysUntilBadge.text}
                      </Badge>
                    )}
                  </div>

                  {/* Task metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className={cn(
                        statusColors[task.status as keyof typeof statusColors] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                      )}
                    >
                      {task.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        priorityColors[task.priority as keyof typeof priorityColors] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                      )}
                    >
                      {task.priority}
                    </Badge>

                    {task.email && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {task.email.senderName}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Email subject if available */}
                  {task.email && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      {task.email.subject}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay tareas proximas a vencer</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
