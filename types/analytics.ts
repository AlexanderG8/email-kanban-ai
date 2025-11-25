// Analytics Types

export interface OverviewMetrics {
  activeTasks: number;
  completionRate: number;
  emailsToday: number;
  avgResolutionTime: number;
  trends: {
    activeTasks: number; // % change vs previous period
    completionRate: number;
    emailsToday: number;
    avgResolutionTime: number;
  };
}

export interface TaskDistribution {
  byStatus: Record<string, number>;
  byPriority: Record<
    string,
    {
      total: number;
      byStatus: Record<string, number>;
    }
  >;
}

export interface TimelineData {
  date: string;
  completed: number;
  created: number;
}

export interface TimelineResponse {
  timeline: TimelineData[];
}

export interface EmailsByCategoryData {
  date: string;
  Cliente: number;
  Lead: number;
  Interno: number;
}

export interface EmailsByCategoryResponse {
  timeline: EmailsByCategoryData[];
}

export interface TopSender {
  senderName: string;
  senderId: string;
  emailCount: number;
  tasksGenerated: number;
  tasksCompleted: number;
  completionRate: number;
}

export interface TopSendersResponse {
  senders: TopSender[];
}

export interface UpcomingTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  daysUntilDue: number | null;
  email: {
    subject: string;
    senderName: string;
    category: string;
  } | null;
}

export interface UpcomingTasksResponse {
  tasks: UpcomingTask[];
}

export interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}
