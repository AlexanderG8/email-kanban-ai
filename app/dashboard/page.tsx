"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { EmailBandeja } from "@/components/kanban/EmailBandeja";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ImportModal } from "@/components/modals/ImportModal";
import { DetailPanel } from "@/components/panel/DetailPanel";
import { DashboardSkeleton } from "@/components/skeletons/KanbanSkeleton";
import { useStore, type Email, type Task } from "@/store/useStore";

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const setEmails = useStore((state) => state.setEmails);
  const setTasks = useStore((state) => state.setTasks);
  const selectedTaskId = useStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useStore((state) => state.setSelectedTaskId);
  const setSelectedEmailId = useStore((state) => state.setSelectedEmailId);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      if (status !== "authenticated") return;

      try {
        // Check configuration
        const configResponse = await fetch("/api/user/gmail-config");
        const configData = await configResponse.json();

        if (configResponse.ok && !configData.isConfigured) {
          router.push("/integracion");
          return;
        }

        // Load emails and tasks in parallel
        const [emailsRes, tasksRes] = await Promise.all([
          fetch("/api/emails"),
          fetch("/api/tasks"),
        ]);

        if (emailsRes.ok) {
          const emailsData = await emailsRes.json();
          // Parse dates from ISO strings
          const emails: Email[] = (emailsData.emails || []).map((e: Email & { receivedAt: string; createdAt: string }) => ({
            ...e,
            receivedAt: new Date(e.receivedAt),
            createdAt: new Date(e.createdAt),
          }));
          setEmails(emails);
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          // Parse dates from ISO strings
          const tasks: Task[] = (tasksData.tasks || []).map((t: Task & { createdAt: string; updatedAt: string; dueDate: string | null }) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
          }));
          setTasks(tasks);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [status, router, setEmails, setTasks]);

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  // Handle panel close
  const handlePanelClose = () => {
    setSelectedTaskId(null);
  };

  // Handle email click
  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
    // TODO: Filter tasks by email or show email detail
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
        <Header showSearch showFilters />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      <Header showSearch showFilters />

      <div className="flex flex-1 h-0 overflow-hidden">
        {/* Email Sidebar */}
        <EmailBandeja
          onImportClick={() => setIsImportModalOpen(true)}
          onEmailClick={handleEmailClick}
        />

        {/* Kanban Board */}
        <div className="flex-1 h-full p-4 overflow-hidden">
          <div className="h-full">
            <KanbanBoard onTaskClick={handleTaskClick} />
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />

      {/* Detail Panel */}
      <DetailPanel
        taskId={selectedTaskId}
        onClose={handlePanelClose}
      />
    </div>
  );
}
