"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { GripVertical, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Task, Email } from "@/store/useStore";

interface TaskCardProps {
  task: Task;
  email: Email | undefined;
  onClick: () => void;
  relatedTasksCount?: number;
}

const priorityColors = {
  Urgente: "bg-red-100 text-red-700 border-red-200",
  Alta: "bg-orange-100 text-orange-700 border-orange-200",
  Media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Baja: "bg-green-100 text-green-700 border-green-200",
};

const categoryColors = {
  Cliente: "bg-blue-100 text-blue-700 border-blue-200",
  Lead: "bg-purple-100 text-purple-700 border-purple-200",
  Interno: "bg-gray-100 text-gray-700 border-gray-200",
};

export function TaskCard({ task, email, onClick, relatedTasksCount = 0 }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get sender initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format relative time
  const timeAgo = formatDistanceToNow(new Date(task.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200 border",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
        isDragging && "opacity-50 shadow-lg rotate-2"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Tarea: ${task.title}. Prioridad: ${task.priority}. ${email ? `De: ${email.senderName}` : ""}`}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header: Drag handle + Priority */}
        <div className="flex items-start justify-between gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-gray-100 rounded touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
        </div>

        {/* Title */}
        <p className="text-sm font-medium line-clamp-2 leading-snug">
          {task.title}
        </p>

        {/* Sender info */}
        {email && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {getInitials(email.senderName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate flex-1">
              {email.senderName}
            </span>
          </div>
        )}

        {/* Footer: Category + Related tasks + Time */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {email && (
              <Badge
                variant="outline"
                className={cn("text-xs", categoryColors[email.category])}
              >
                {email.category}
              </Badge>
            )}
            {relatedTasksCount > 1 && (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" />
                <span>{relatedTasksCount}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
