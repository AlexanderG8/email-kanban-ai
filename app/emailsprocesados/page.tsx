"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { FilterBar, type EmailFilters } from "@/components/emails/FilterBar";
import { EmailsTable } from "@/components/emails/EmailsTable";
import { PaginationControls } from "@/components/emails/PaginationControls";
import { EmailsTableSkeleton } from "@/components/emails/EmailsTableSkeleton";
import { EmailDetailModal } from "@/components/emails/EmailDetailModal";
import { DetailPanel } from "@/components/panel/DetailPanel";
import { useStore } from "@/store/useStore";
import type { EmailWithTasks } from "@/types/emails";

export default function EmailsProcessedPage() {
  const [emails, setEmails] = useState<EmailWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<EmailFilters>({
    startDate: undefined,
    endDate: undefined,
    category: "Todas",
    taskStatus: "Todas",
  });
  const [selectedEmail, setSelectedEmail] = useState<EmailWithTasks | null>(
    null
  );

  const selectedTaskId = useStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useStore((state) => state.setSelectedTaskId);
  const setIsPanelOpen = useStore((state) => state.setIsPanelOpen);

  const fetchEmails = async (newFilters: EmailFilters, page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (newFilters.startDate) {
        params.append("startDate", newFilters.startDate.toISOString());
      }

      if (newFilters.endDate) {
        params.append("endDate", newFilters.endDate.toISOString());
      }

      if (newFilters.category && newFilters.category !== "Todas") {
        params.append("category", newFilters.category);
      }

      if (newFilters.taskStatus && newFilters.taskStatus !== "Todas") {
        params.append("taskStatus", newFilters.taskStatus);
      }

      const response = await fetch(`/api/emails/processed?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar emails");
      }

      const data = await response.json();

      setEmails(data.emails);
      setPagination({
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Error al cargar emails procesados");
      setEmails([]);
      setPagination({ page: 1, total: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails(filters, 1);
  }, []);

  const handleSearch = (newFilters: EmailFilters) => {
    setFilters(newFilters);
    fetchEmails(newFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchEmails(filters, newPage);
  };

  const handleEmailClick = (email: EmailWithTasks) => {
    setSelectedEmail(email);
  };

  const handleCloseEmailModal = () => {
    setSelectedEmail(null);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedEmail(null);
    setSelectedTaskId(taskId);
    setIsPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setSelectedTaskId(null);
    setIsPanelOpen(false);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Emails Procesados</h1>
          <p className="text-muted-foreground">
            Historial de todos los emails importados y clasificados
          </p>
        </div>

        <FilterBar onSearch={handleSearch} isLoading={isLoading} />

        {isLoading ? (
          <EmailsTableSkeleton />
        ) : emails.length > 0 ? (
          <>
            <EmailsTable emails={emails} onEmailClick={handleEmailClick} />
            <div className="mt-6">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {emails.length} de {pagination.total} emails
            </div>
          </>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron emails
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o sincronizar nuevos emails desde el
              dashboard.
            </p>
          </div>
        )}

        {/* Email Detail Modal */}
        <EmailDetailModal
          email={selectedEmail}
          onClose={handleCloseEmailModal}
          onTaskClick={handleTaskClick}
        />

        {/* Task Detail Panel */}
        <DetailPanel taskId={selectedTaskId} onClose={handleCloseDetailPanel} />
      </div>
    </>
  );
}
