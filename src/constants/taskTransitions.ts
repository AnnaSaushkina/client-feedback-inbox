import type { TaskStatus } from "../types/Task";

// свободно ↔ в_работе ↔ waiting_comment, в_работе ↔ тестирование
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
