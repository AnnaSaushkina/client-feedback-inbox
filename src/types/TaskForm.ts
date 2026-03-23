import dayjs from "dayjs";
import type { Priority, Assignee, TaskStatus } from "./Task";

export type CombinedStatus = Priority | TaskStatus;

export interface TaskFormValues {
  title: string;
  description: string;
  ticketNumber: string;
  deadline: dayjs.Dayjs | null;
  combinedStatus: CombinedStatus;
  assignee: Assignee | null;
  screenshots: string[];
}

export const emptyForm: TaskFormValues = {
  title: "",
  description: "",
  ticketNumber: "",
  deadline: null,
  combinedStatus: "medium",
  assignee: null,
  screenshots: [],
};
