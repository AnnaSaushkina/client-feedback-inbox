export type Priority = "low" | "medium" | "high";
export type Assignee = "Аня" | "Паша" | "Олег";

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
}
