export type Priority = "low" | "medium" | "high";
export type Assignee = "Аня" | "Паша" | "Олег";
export type TaskStatus = "свободно" | "в_работе" | "waiting_comment";

export interface HistoryEntry {
  text: string;
  date: string; // ISO
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
  completedAt?: string; // ISO — когда выполнена
}
