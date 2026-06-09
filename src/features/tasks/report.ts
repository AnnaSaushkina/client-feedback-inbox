import type { Task } from "../../types";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });

const ticketName = (t: Task) => t.ticketNumber || t.title;

const labelWithDeadline = (t: Task) =>
  t.deadline
    ? `— ${ticketName(t)} · ${shortDate(t.deadline)}`
    : `— ${ticketName(t)}`;

const REPORT_SECTIONS: Array<{
  status: Task["status"];
  heading: string;
  format?: (t: Task) => string;
}> = [
  { status: "свободно", heading: "На завтра." },
  { status: "в_работе", heading: "На завтра. В работе:" },
  {
    status: "ожидание",
    heading: "Ждём с ОС:",
    format: (t) => `— ${ticketName(t)}`,
  },
  {
    status: "тестирование",
    heading: "Тестируется:",
    format: (t) => `— ${ticketName(t)} (сделали. проверяется)`,
  },
];

export function buildReport(activeTasks: Task[], doneTasks: Task[]): string {
  const today = shortDate(new Date().toISOString());
  const doneLines = doneTasks.map((t) => `— ${ticketName(t)}`).join("\n");

  const sections = REPORT_SECTIONS.map(({ status, heading, format }) => {
    const group = activeTasks.filter(
      (t) => (t.status ?? "свободно") === status,
    );
    if (!group.length) return null;
    return `${heading}\n${group.map(format ?? labelWithDeadline).join("\n")}`;
  }).filter(Boolean) as string[];

  return `Сегодня [${today}] сделали:\n${doneLines || "—"}\n\n${sections.join("\n\n") || "— нет активных задач"}`;
}
