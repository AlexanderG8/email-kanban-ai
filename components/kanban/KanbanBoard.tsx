"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { useStore, useFilteredTasks, type Task } from "@/store/useStore";

interface KanbanBoardProps {
  onTaskClick: (taskId: string) => void;
}

const COLUMNS: { id: Task["status"]; title: string }[] = [
  { id: "Pendiente", title: "Pendiente" },
  { id: "En Progreso", title: "En Progreso" },
  { id: "Completado", title: "Completado" },
];

export function KanbanBoard({ onTaskClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const emails = useStore((state) => state.emails);
  const tasks = useFilteredTasks();
  const updateTask = useStore((state) => state.updateTask);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get tasks by status
  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  // Get count of tasks for an email
  const getRelatedTasksCount = (emailId: string) => {
    return tasks.filter((task) => task.emailId === emailId).length;
  };

  // Find the active task
  const activeTask = activeId
    ? tasks.find((task) => task.id === activeId)
    : null;

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine the new status
    let newStatus: Task["status"] | null = null;

    // Check if dropped on a column
    if (COLUMNS.some((col) => col.id === overId)) {
      newStatus = overId as Task["status"];
    } else {
      // Dropped on another task - find which column it's in
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // If status changed, update the task
    if (newStatus && newStatus !== task.status) {
      // Optimistic update in Zustand
      updateTask(taskId, { status: newStatus, updatedAt: new Date() });

      // Update in database
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          // Revert on error
          updateTask(taskId, { status: task.status });
          throw new Error("Error al actualizar tarea");
        }

        toast.success(`Tarea movida a "${newStatus}"`);
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Error al mover la tarea");
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            emails={emails}
            onTaskClick={onTaskClick}
            getRelatedTasksCount={getRelatedTasksCount}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              email={emails.find((e) => e.id === activeTask.emailId)}
              onClick={() => {}}
              relatedTasksCount={getRelatedTasksCount(activeTask.emailId)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
