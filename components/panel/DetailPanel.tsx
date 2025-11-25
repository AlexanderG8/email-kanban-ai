"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import DOMPurify from "dompurify";
import { useSession } from "next-auth/react";
import {
  X,
  Mail,
  Calendar,
  CalendarClock,
  Tag,
  AlertCircle,
  MessageSquare,
  Send,
  Pencil,
  Check,
  Loader2,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStore, useTasks, useEmails, type Task, type Email, type Comment } from "@/store/useStore";

interface DetailPanelProps {
  taskId: string | null;
  onClose: () => void;
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

const statusOptions = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "En Progreso", label: "En Progreso" },
  { value: "Completado", label: "Completado" },
];

export function DetailPanel({ taskId, onClose }: DetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSavingDate, setIsSavingDate] = useState(false);

  const { data: session } = useSession();
  const tasks = useTasks();
  const emails = useEmails();
  const comments = useStore((state) => state.comments);
  const updateTask = useStore((state) => state.updateTask);
  const addComment = useStore((state) => state.addComment);
  const updateComment = useStore((state) => state.updateComment);
  const setComments = useStore((state) => state.setComments);

  const user = session?.user;

  // Find the task and email
  const task = tasks.find((t) => t.id === taskId);
  const email = task ? emails.find((e) => e.id === task.emailId) : null;

  // Get comments for this task
  const taskComments = comments.filter((c) => c.taskId === taskId);

  // Get related tasks (same email)
  const relatedTasks = task
    ? tasks.filter((t) => t.emailId === task.emailId && t.id !== task.id)
    : [];

  // Animation effect
  useEffect(() => {
    if (taskId) {
      setIsVisible(true);
      // Set initial status and date
      if (task) {
        setSelectedStatus(task.status);
        setSelectedDate(task.dueDate ? new Date(task.dueDate) : undefined);
      }
      // Load comments
      loadComments();
    } else {
      setIsVisible(false);
    }
  }, [taskId, task]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Load comments from API
  const loadComments = useCallback(async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`/api/comments?taskId=${taskId}`);

      if (response.ok) {
        const data = await response.json();

        // Parse dates
        const parsedComments = (data.comments || []).map((c: Comment & { createdAt: string; updatedAt: string }) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }));
        setComments(parsedComments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }, [taskId, setComments]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get due date status with color coding
  const getDueDateStatus = (dueDate: Date | null) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: "text-red-600", label: "Vencida", bg: "bg-red-50" };
    if (diffDays === 0) return { color: "text-red-600", label: "Vence hoy", bg: "bg-red-50" };
    if (diffDays <= 2) return { color: "text-orange-600", label: "Muy próxima", bg: "bg-orange-50" };
    if (diffDays <= 7) return { color: "text-yellow-600", label: "Próxima", bg: "bg-yellow-50" };
    return { color: "text-green-600", label: "A tiempo", bg: "bg-green-50" };
  };

  // Handle date change
  const handleDateChange = async (date: Date | undefined) => {
    if (!task || !date) return;

    // Validar fecha no pasada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay < today) {
      toast.error("No se puede asignar una fecha pasada");
      return;
    }

    setIsSavingDate(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: date.toISOString() }),
      });

      if (!response.ok) throw new Error("Error al actualizar fecha");

      updateTask(task.id, { dueDate: date, updatedAt: new Date() });
      setSelectedDate(date);
      setIsEditingDate(false);
      toast.success("Fecha de expiración actualizada");
    } catch (error) {
      console.error("Error updating date:", error);
      toast.error("Error al actualizar fecha");
    } finally {
      setIsSavingDate(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !taskId || !user) {
      if (!newComment.trim()) {
        toast.error("El comentario no puede estar vacío");
      } else if (!user) {
        toast.error("Debes iniciar sesión para comentar");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || "Error al guardar comentario");
      }

      const data = await response.json();

      addComment({
        ...data.comment,
        createdAt: new Date(data.comment.createdAt),
        updatedAt: new Date(data.comment.updatedAt),
      });

      setNewComment("");
      toast.success("Comentario agregado exitosamente");
    } catch (error) {
      console.error("Error adding comment:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al agregar comentario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || "Error al editar comentario");
      }

      updateComment(commentId, {
        content: editingContent.trim(),
        updatedAt: new Date(),
      });

      setEditingCommentId(null);
      setEditingContent("");
      toast.success("Comentario actualizado exitosamente");
    } catch (error) {
      console.error("Error editing comment:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al editar comentario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!task || selectedStatus === task.status) return;

    setIsSavingStatus(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      updateTask(task.id, { status: selectedStatus as Task["status"], updatedAt: new Date() });
      toast.success(`Estado cambiado a "${selectedStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar estado");
      setSelectedStatus(task.status);
    } finally {
      setIsSavingStatus(false);
    }
  };

  // Sanitize HTML
  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li", "div", "span"],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  };

  if (!taskId || !task) return null;

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

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white dark:bg-gray-950 shadow-xl z-50",
          "transform transition-transform duration-300 ease-out overflow-hidden",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Detalle de Tarea</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 h-0">
            <div className="p-4 space-y-6">
              {/* Task Title & Badges */}
              <div className="space-y-3">
                <h3 className="font-medium text-base leading-tight break-words">{task.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  {email && (
                    <Badge variant="outline" className={categoryColors[email.category]}>
                      {email.category}
                    </Badge>
                  )}
                  {/* Nota: Por implementar para la versión 2
                  <Badge variant="secondary" className="text-xs">
                    {task.aiConfidence}% confianza IA
                  </Badge> */}
                </div>

                {/* Fecha de Expiración */}
                {task.dueDate && (
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {format(new Date(task.dueDate), "PPP", { locale: es })}
                      </span>
                      {getDueDateStatus(task.dueDate) && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getDueDateStatus(task.dueDate)?.color,
                            getDueDateStatus(task.dueDate)?.bg
                          )}
                        >
                          {getDueDateStatus(task.dueDate)?.label}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto"
                      onClick={() => setIsEditingDate(true)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* DatePicker Popover */}
                <Popover open={isEditingDate} onOpenChange={setIsEditingDate}>
                  <PopoverTrigger asChild>
                    <span />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date);
                        checkDate.setHours(0, 0, 0, 0);
                        return checkDate < today;
                      }}
                      initialFocus
                      locale={es}
                    />
                    <div className="p-3 border-t flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDateChange(selectedDate)}
                        disabled={isSavingDate || !selectedDate}
                      >
                        {isSavingDate ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Guardar"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingDate(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              {/* Email Information */}
              {email && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Original
                  </h4>

                  {/* Sender */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(email.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{email.senderName}</p>
                      <p className="text-xs text-muted-foreground truncate">{email.senderId}</p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Asunto</p>
                    <p className="text-sm font-medium break-words">{email.subject}</p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words">{format(new Date(email.receivedAt), "PPP 'a las' p", { locale: es })}</span>
                  </div>

                  {/* Body */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Contenido</p>
                    <div
                      className="text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto prose prose-sm dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }}
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* Task Description */}
              {task.description && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Descripción de Tarea
                    </h4>
                    <p className="text-sm text-muted-foreground break-words">{task.description}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Status Change */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Estado
                </h4>
                <div className="flex items-center gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStatus !== task.status && (
                    <Button
                      size="sm"
                      onClick={handleStatusChange}
                      disabled={isSavingStatus}
                    >
                      {isSavingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Related Tasks */}
              {relatedTasks.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      Tareas Relacionadas ({relatedTasks.length})
                    </h4>
                    <div className="space-y-2">
                      {relatedTasks.map((rt) => (
                        <div
                          key={rt.id}
                          className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <p className="font-medium truncate">{rt.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {rt.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", priorityColors[rt.priority])}
                            >
                              {rt.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Comments Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Comentarios ({taskComments.length})
                </h4>

                {/* Comment List */}
                {taskComments.length > 0 ? (
                  <div className="space-y-3">
                    {taskComments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {user ? getInitials(user.name) : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                              {comment.updatedAt > comment.createdAt && " (editado)"}
                            </span>
                          </div>
                          {editingCommentId !== comment.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingContent(comment.content);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-h-[60px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment.id)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Guardar"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingContent("");
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-2 break-words">{comment.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay comentarios aún
                  </p>
                )}

                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Agregar Comentario
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
