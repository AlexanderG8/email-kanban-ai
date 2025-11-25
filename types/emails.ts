export interface ProcessedEmailsResponse {
  emails: EmailWithTasks[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EmailWithTasks {
  id: string;
  userId: string;
  gmailId: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  snippet: string;
  category: string;
  receivedAt: Date | string;
  hasTask: boolean;
  createdAt: Date | string;
  tasks: TaskBasic[];
}

export interface TaskBasic {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | string | null;
}
