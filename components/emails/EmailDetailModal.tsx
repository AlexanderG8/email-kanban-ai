"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DOMPurify from "dompurify";
import { X, Mail, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { EmailWithTasks } from "@/types/emails";

interface EmailDetailModalProps {
  email: EmailWithTasks | null;
  onClose: () => void;
  onTaskClick: (taskId: string) => void;
}

const categoryColors = {
  Cliente: "bg-blue-100 text-blue-700 border-blue-200",
  Lead: "bg-purple-100 text-purple-700 border-purple-200",
  Interno: "bg-gray-100 text-gray-700 border-gray-200",
};

const priorityColors = {
  Urgente: "bg-red-100 text-red-700 border-red-200",
  Alta: "bg-orange-100 text-orange-700 border-orange-200",
  Media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Baja: "bg-green-100 text-green-700 border-green-200",
};

export function EmailDetailModal({
  email,
  onClose,
  onTaskClick,
}: EmailDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (email) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [email]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "b",
        "i",
        "u",
        "strong",
        "em",
        "a",
        "ul",
        "ol",
        "li",
        "div",
        "span",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  };

  if (!email) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[600px] bg-white dark:bg-gray-950 shadow-xl z-50",
          "transform transition-transform duration-300 ease-out overflow-hidden",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Detalle del Email</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 h-0">
            <div className="p-4 space-y-6">
              {/* Email Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(email.senderName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base truncate">
                      {email.senderName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {email.senderId}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={categoryColors[email.category as keyof typeof categoryColors]}
                  >
                    {email.category}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Asunto</p>
                  <h3 className="font-medium text-base break-words">
                    {email.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {format(new Date(email.receivedAt), "PPP 'a las' p", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Email Body */}
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Contenido del Email
                </h4>
                <div
                  className="text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }}
                />
              </div>

              {/* Tasks */}
              {email.tasks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Tareas Asociadas ({email.tasks.length})
                    </h4>
                    <div className="space-y-2">
                      {email.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                          onClick={() => {
                            onTaskClick(task.id);
                          }}
                        >
                          <p className="font-medium text-sm truncate mb-2">
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                priorityColors[task.priority as keyof typeof priorityColors]
                              )}
                            >
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(task.dueDate), "PP", {
                                  locale: es,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {email.tasks.length === 0 && (
                <>
                  <Separator />
                  <div className="text-center py-6 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Este email no tiene tareas asociadas
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
