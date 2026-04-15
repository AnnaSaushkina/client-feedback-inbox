import dayjs from "dayjs";
import type { Priority, Assignee, TaskStatus } from "./Task";

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
