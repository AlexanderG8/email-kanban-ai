import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types based on Prisma schema
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  gmailApiKey?: string | null;
  referenceDate?: Date | null;
  lastImportAt?: Date | null;
}

export interface Email {
  id: string;
  gmailId: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  snippet: string;
  category: "Cliente" | "Lead" | "Interno";
  receivedAt: Date;
  hasTask: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  emailId: string;
  title: string;
  description: string;
  priority: "Urgente" | "Alta" | "Media" | "Baja";
  status: "Pendiente" | "En Progreso" | "Completado";
  dueDate?: Date | null;
  aiConfidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  taskId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Filters {
  category: "Cliente" | "Lead" | "Interno" | null;
  priority: "Urgente" | "Alta" | "Media" | "Baja" | null;
  search: string;
}

export interface ImportProgress {
  isImporting: boolean;
  total: number;
  processed: number;
  status: "idle" | "processing" | "completed" | "failed";
  message?: string;
}

interface Store {
  // State
  user: User | null;
  emails: Email[];
  tasks: Task[];
  comments: Comment[];
  filters: Filters;
  selectedTaskId: string | null;
  selectedEmailId: string | null;
  importProgress: ImportProgress;
  isSidebarCollapsed: boolean;
  isPanelOpen: boolean;

  // User Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;

  // Email Actions
  setEmails: (emails: Email[]) => void;
  addEmails: (emails: Email[]) => void;

  // Task Actions
  setTasks: (tasks: Task[]) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Comment Actions
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;

  // Filter Actions
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;

  // Selection Actions
  setSelectedTaskId: (id: string | null) => void;
  setSelectedEmailId: (id: string | null) => void;

  // Import Actions
  setImportProgress: (progress: Partial<ImportProgress>) => void;
  resetImportProgress: () => void;

  // UI Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsPanelOpen: (open: boolean) => void;

  // Reset
  reset: () => void;
}

const initialFilters: Filters = {
  category: null,
  priority: null,
  search: "",
};

const initialImportProgress: ImportProgress = {
  isImporting: false,
  total: 0,
  processed: 0,
  status: "idle",
  message: undefined,
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      emails: [],
      tasks: [],
      comments: [],
      filters: initialFilters,
      selectedTaskId: null,
      selectedEmailId: null,
      importProgress: initialImportProgress,
      isSidebarCollapsed: false,
      isPanelOpen: false,

      // User Actions
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Email Actions
      setEmails: (emails) => set({ emails }),
      addEmails: (newEmails) =>
        set((state) => ({
          emails: [...state.emails, ...newEmails],
        })),

      // Task Actions
      setTasks: (tasks) => set({ tasks }),
      addTasks: (newTasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // Comment Actions
      setComments: (comments) => set({ comments }),
      addComment: (comment) =>
        set((state) => ({
          comments: [...state.comments, comment],
        })),
      updateComment: (id, updates) =>
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === id ? { ...comment, ...updates } : comment
          ),
        })),
      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== id),
        })),

      // Filter Actions
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      clearFilters: () => set({ filters: initialFilters }),

      // Selection Actions
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setSelectedEmailId: (id) => set({ selectedEmailId: id }),

      // Import Actions
      setImportProgress: (progress) =>
        set((state) => ({
          importProgress: { ...state.importProgress, ...progress },
        })),
      resetImportProgress: () => set({ importProgress: initialImportProgress }),

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),
      setIsPanelOpen: (open) => set({ isPanelOpen: open }),

      // Reset
      reset: () =>
        set({
          user: null,
          emails: [],
          tasks: [],
          comments: [],
          filters: initialFilters,
          selectedTaskId: null,
          selectedEmailId: null,
          importProgress: initialImportProgress,
          isSidebarCollapsed: false,
          isPanelOpen: false,
        }),
    }),
    {
      name: "email-kanban-storage",
      partialize: (state) => ({
        user: state.user,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useUser = () => useStore((state) => state.user);
export const useEmails = () => useStore((state) => state.emails);
export const useTasks = () => useStore((state) => state.tasks);
export const useFilters = () => useStore((state) => state.filters);
export const useImportProgress = () => useStore((state) => state.importProgress);

// Filtered data selectors
export const useFilteredEmails = () =>
  useStore((state) => {
    let filtered = state.emails;

    if (state.filters.category) {
      filtered = filtered.filter(
        (email) => email.category === state.filters.category
      );
    }

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.senderName.toLowerCase().includes(searchLower) ||
          email.subject.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  });

export const useFilteredTasks = () =>
  useStore((state) => {
    let filtered = state.tasks;

    if (state.filters.priority) {
      filtered = filtered.filter(
        (task) => task.priority === state.filters.priority
      );
    }

    if (state.filters.category) {
      const emailIds = state.emails
        .filter((email) => email.category === state.filters.category)
        .map((email) => email.id);
      filtered = filtered.filter((task) => emailIds.includes(task.emailId));
    }

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      const matchingEmailIds = state.emails
        .filter(
          (email) =>
            email.senderName.toLowerCase().includes(searchLower) ||
            email.subject.toLowerCase().includes(searchLower)
        )
        .map((email) => email.id);
      filtered = filtered.filter((task) =>
        matchingEmailIds.includes(task.emailId)
      );
    }

    return filtered;
  });

// Task by status selectors
export const useTasksByStatus = (status: Task["status"]) =>
  useStore((state) => state.tasks.filter((task) => task.status === status));
