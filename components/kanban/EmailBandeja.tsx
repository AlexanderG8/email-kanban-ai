"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useStore, useFilteredEmails, type Email } from "@/store/useStore";

interface EmailBandejaProps {
  onImportClick: () => void;
  onEmailClick: (emailId: string) => void;
}

const categoryColors = {
  Cliente: "bg-blue-100 text-blue-700",
  Lead: "bg-purple-100 text-purple-700",
  Interno: "bg-gray-100 text-gray-700",
};

export function EmailBandeja({ onImportClick, onEmailClick }: EmailBandejaProps) {
  const isSidebarCollapsed = useStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const tasks = useStore((state) => state.tasks);
  const selectedEmailId = useStore((state) => state.selectedEmailId);
  const importProgress = useStore((state) => state.importProgress);

  // Get filtered emails that have tasks
  const allFilteredEmails = useFilteredEmails();
  const emailsWithTasks = allFilteredEmails.filter((email) => email.hasTask);

  // Get task count for an email
  const getTaskCount = (emailId: string) => {
    return tasks.filter((task) => task.emailId === emailId).length;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Collapsed state
  if (isSidebarCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 w-12 border-r bg-gray-50/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Mail className="h-5 w-5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-1">
          {emailsWithTasks.length}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-72 border-r bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Bandeja</h2>
          <Badge variant="secondary" className="text-xs">
            {emailsWithTasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Import Button */}
      <div className="p-3 border-b">
        <Button
          onClick={onImportClick}
          className="w-full"
          disabled={importProgress.isImporting}
        >
          {importProgress.isImporting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Importando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Importar Gmails
            </>
          )}
        </Button>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {emailsWithTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Mail className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay emails con tareas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Importa emails para comenzar
              </p>
            </div>
          ) : (
            emailsWithTasks.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                taskCount={getTaskCount(email.id)}
                isSelected={selectedEmailId === email.id}
                onClick={() => onEmailClick(email.id)}
                getInitials={getInitials}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface EmailItemProps {
  email: Email;
  taskCount: number;
  isSelected: boolean;
  onClick: () => void;
  getInitials: (name: string) => string;
}

function EmailItem({
  email,
  taskCount,
  isSelected,
  onClick,
  getInitials,
}: EmailItemProps) {
  const timeAgo = formatDistanceToNow(new Date(email.receivedAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded-lg transition-colors",
        "hover:bg-white hover:shadow-sm",
        isSelected && "bg-white shadow-sm ring-1 ring-blue-200"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
            {getInitials(email.senderName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Sender name */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium truncate">
              {email.senderName}
            </span>
            {taskCount > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-blue-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>{taskCount}</span>
              </div>
            )}
          </div>

          {/* Subject */}
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {email.subject}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-1.5 mt-1">
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1 py-0", categoryColors[email.category])}
            >
              {email.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
