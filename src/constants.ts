import type { TaskStatus } from "./types";

export const labelStyle = { fontSize: 14, color: "#aaa", marginBottom: 4 };
export const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };

export const STATUS_OPTIONS = [
  { value: "свободно", label: "🟢 Можно взять в работу" },
  { value: "в_работе", label: "🔵 В работе" },
  { value: "waiting_comment", label: "💬 Ждём с ОС" },
  { value: "тестирование", label: "✅ Сделано. Тестируется" },
];

export const PRIORITY_OPTIONS = [
  { value: "high", label: "🔴 Высокий" },
  { value: "low", label: "⚪ Низкий" },
];

export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  свободно:        ["в_работе"],
  в_работе:        ["свободно", "waiting_comment", "тестирование"],
  waiting_comment: ["в_работе"],
  тестирование:    ["в_работе"],
};

export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  return from === to || (VALID_TRANSITIONS[from]?.includes(to) ?? false);
}

export const TRANSITION_BLOCK_REASON: Partial<Record<TaskStatus, Partial<Record<TaskStatus, string>>>> = {
  свободно: {
    waiting_comment: "Нельзя ждать комментарий для задачи, которая ещё не взята в работу",
    тестирование:   "Нельзя отправить на тестирование задачу, которая не взята в работу",
  },
  waiting_comment: {
    свободно:     "Сначала верни задачу в работу, потом освобождай",
    тестирование: "Сначала верни задачу в работу, потом отправляй на тестирование",
  },
  тестирование: {
    свободно:        "Сначала верни задачу в работу, потом освобождай",
    waiting_comment: "Нельзя ждать комментарий для задачи, которая уже на тестировании",
  },
};
