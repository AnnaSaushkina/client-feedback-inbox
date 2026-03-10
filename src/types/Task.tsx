export type Priority = "low" | "medium" | "high";
export type Assignee = "Аня" | "Паша" | "Олег";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  ticketNumber?: string;
  deadline?: string; // ISO строка: "2026-03-14T15:00:00.000Z"
  priority?: Priority;
  assignee?: Assignee;
  screenshots?: string[];
}
