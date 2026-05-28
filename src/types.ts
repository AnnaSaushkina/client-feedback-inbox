import dayjs from "dayjs";

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

export interface TaskFormValues {
  title: string;
  description: string;
  ticketNumber: string;
  deadline: dayjs.Dayjs | null;
  status: TaskStatus;
  priority: Priority | null;
  assignee: Assignee | null;
  screenshots: string[];
}

export const emptyForm: TaskFormValues = {
  title: "",
  description: "",
  ticketNumber: "",
  deadline: null,
  status: "свободно",
  priority: null,
  assignee: null,
  screenshots: [],
};
