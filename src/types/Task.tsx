export type Priority = "low" | "high";
export type Assignee = string;
export type TaskStatus = "свободно" | "в_работе" | "waiting_comment" | "тестирование";

export interface HistoryEntry {
  text: string;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  ticketNumber?: string;
  deadline?: string;
  priority?: Priority;
  assignee?: Assignee;
  screenshots?: string[];
  status?: TaskStatus;
  history?: HistoryEntry[];
  completedAt?: string;
}
