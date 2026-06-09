import type { TaskStatus } from "../../types";

export const KANBAN_COLUMNS: TaskStatus[] = [
  "свободно",
  "в_работе",
  "ожидание",
  "тестирование",
];

export const COLUMN_COLORS: Record<TaskStatus, string> = {
  свободно: "#52c41a",
  в_работе: "#1677ff",
  ожидание: "#555",
  тестирование: "#722ed1",
};

export const COLUMN_LABELS: Record<TaskStatus, string> = {
  свободно: "🟢 Можно взять в работу",
  в_работе: "🔵 В работе",
  ожидание: "💬 Ждём с ОС",
  тестирование: "✅ Сделано. Тестируется",
};
