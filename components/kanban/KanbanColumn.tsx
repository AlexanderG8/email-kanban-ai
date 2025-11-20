"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import type { Task, Email } from "@/store/useStore";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  emails: Email[];
  onTaskClick: (taskId: string) => void;
  getRelatedTasksCount: (emailId: string) => number;
}

const columnColors = {
  Pendiente: {
    header: "bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
  },
  "En Progreso": {
    header: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  Completado: {
    header: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
};

export function KanbanColumn({
  id,
  title,
  tasks,
  emails,
  onTaskClick,
  getRelatedTasksCount,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const colors = columnColors[title as keyof typeof columnColors] || columnColors.Pendiente;

  // Get email for a task
  const getEmailForTask = (emailId: string) => {
    return emails.find((e) => e.id === emailId);
  };

  return (
    <div
      className="flex flex-col h-full min-w-[280px] max-w-[350px] flex-1"
      role="region"
      aria-label={`Columna ${title} con ${tasks.length} tareas`}
    >
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-t-lg border-b",
          colors.header
        )}
      >
        <div className={cn("w-2 h-2 rounded-full", colors.dot)} aria-hidden="true" />
        <h3 className="font-semibold text-sm">{title}</h3>
        <span
          className="ml-auto text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full"
          aria-label={`${tasks.length} tareas`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 bg-gray-50/50 rounded-b-lg border border-t-0 transition-colors",
          isOver && "bg-blue-50/50 border-blue-300 border-dashed"
        )}
      >
        <ScrollArea className="h-full">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-2 space-y-2 min-h-[200px]">
              {tasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  Sin tareas
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    email={getEmailForTask(task.emailId)}
                    onClick={() => onTaskClick(task.id)}
                    relatedTasksCount={getRelatedTasksCount(task.emailId)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    </div>
  );
}
