import dayjs from "dayjs";
import type { Priority, Assignee } from "./Task";

export interface TaskFormValues {
  title: string;
  description: string;
  ticketNumber: string;
  deadline: dayjs.Dayjs | null;
  priority: Priority;
  assignee: Assignee | null;
  screenshots: string[];
}

export const emptyForm: TaskFormValues = {
  title: "",
  description: "",
  ticketNumber: "",
  deadline: null,
  priority: "medium",
  assignee: null,
  screenshots: [],
};
