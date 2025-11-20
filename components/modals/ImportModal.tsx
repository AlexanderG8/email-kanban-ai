"use client";

import { useState } from "react";
import { Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/store/useStore";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportSummary {
  emailsProcessed: number;
  emailsWithTasks: number;
  tasksCreated: number;
  emailsSkipped: number;
}

type ImportState = "confirm" | "importing" | "success" | "error";

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [importState, setImportState] = useState<ImportState>("confirm");
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const setImportProgress = useStore((state) => state.setImportProgress);
  const setEmails = useStore((state) => state.setEmails);
  const setTasks = useStore((state) => state.setTasks);

  const handleImport = async () => {
    setImportState("importing");
    setProgress(10);
    setImportProgress({ isImporting: true, status: "processing" });

    try {
      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch("/api/emails/import", {
        method: "POST",
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error de importación");
      }

      setProgress(100);
      setSummary(data.summary);
      setImportState("success");
      setImportProgress({ isImporting: false, status: "completed" });

      // Fetch updated data
      await fetchUpdatedData();
    } catch (error) {
      console.error("Import error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
      setImportState("error");
      setImportProgress({ isImporting: false, status: "failed" });
    }
  };

  const fetchUpdatedData = async () => {
    try {
      // Fetch emails
      const emailsResponse = await fetch("/api/emails");
      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json();
        setEmails(emailsData.emails || []);
      }

      // Fetch tasks
      const tasksResponse = await fetch("/api/tasks");
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching updated data:", error);
    }
  };

  const handleClose = () => {
    setImportState("confirm");
    setProgress(0);
    setSummary(null);
    setErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {importState === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Importar Emails
              </DialogTitle>
              <DialogDescription>
                Se importarán hasta 20 emails nuevos de tu cuenta de Gmail y se
                clasificarán automáticamente con IA.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium">Nota:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Solo se importan emails no procesados</li>
                  <li>Los emails spam se descartan automáticamente</li>
                  <li>Las tareas se crean según la clasificación de IA</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleImport}>Iniciar Importación</Button>
            </DialogFooter>
          </>
        )}

        {importState === "importing" && (
          <>
            <DialogHeader>
              <DialogTitle>Importando emails...</DialogTitle>
              <DialogDescription>
                Por favor espera mientras procesamos tus emails.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                Clasificando con IA...
              </div>
            </div>
          </>
        )}

        {importState === "success" && summary && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Importación Completada
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.emailsProcessed}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emails procesados
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.tasksCreated}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tareas creadas
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {summary.emailsWithTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emails con tareas
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-500">
                    {summary.emailsSkipped}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emails omitidos
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </>
        )}

        {importState === "error" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Error de Importación
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
              <Button onClick={handleImport}>Reintentar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
