"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { EmailWithTasks } from "@/types/emails";

interface EmailsTableProps {
  emails: EmailWithTasks[];
  onEmailClick: (email: EmailWithTasks) => void;
}

const categoryColors = {
  Cliente: "bg-blue-100 text-blue-700 border-blue-200",
  Lead: "bg-purple-100 text-purple-700 border-purple-200",
  Interno: "bg-gray-100 text-gray-700 border-gray-200",
};

export function EmailsTable({ emails, onEmailClick }: EmailsTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTasksStatus = (tasks: any[]) => {
    const completed = tasks.filter((t) => t.status === "Completado").length;
    return { completed, total: tasks.length };
  };

  return (
    <div className="space-y-4">
      {emails.map((email) => {
        const tasksStatus = getTasksStatus(email.tasks);

        return (
          <div
            key={email.id}
            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
            onClick={() => onEmailClick(email)}
          >
            {/* Header: Remitente y Categoria */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(email.senderName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {email.senderName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email.senderId}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={cn("flex-shrink-0", categoryColors[email.category as keyof typeof categoryColors])}
              >
                {email.category}
              </Badge>
            </div>

            {/* Asunto y Snippet */}
            <div className="space-y-1 mb-3">
              <h3 className="font-medium text-sm line-clamp-1">
                {email.subject}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {email.snippet}
              </p>
            </div>

            {/* Footer: Fecha y Tareas */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(email.receivedAt), "PPP", { locale: es })}
                </span>
              </div>

              {email.tasks.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    {tasksStatus.completed}/{tasksStatus.total} tareas
                  </span>
                </div>
              )}

              {email.tasks.length === 0 && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>Sin tareas</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
