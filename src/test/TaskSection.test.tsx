import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskSection from "../components/Board/TaskSection";
import type { Task } from "../types/Task";

// обычная задача без дедлайна используем в большинстве тестов
const basicTask: Task = {
  id: "1",
  title: "Починить баг с авторизацией",
  completed: false,
  priority: "medium",
};

//  переопределяем только то что нужно в конкретном тесте
const defaultProps = {
  title: "Активные задачи",
  tasks: [],
  onDelete: vi.fn(),
  onToggle: vi.fn(),
  onOpen: vi.fn(),
};

// возвращает завтрашнюю дату в 10:00
const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return tomorrow.toISOString();
};

describe("TaskSection", () => {
  it("показывает заглушку когда список пустой", () => {
    render(<TaskSection {...defaultProps} />);
    expect(screen.getByText("Список пуст")).toBeInTheDocument();
  });

  it("показывает задачу если она есть в списке", () => {
    render(<TaskSection {...defaultProps} tasks={[basicTask]} />);
    expect(screen.getByText("Починить баг с авторизацией")).toBeInTheDocument();
  });

  it("выделяет задачи с дедлайном завтра в отдельную группу", () => {
    const taskDueTomorrow = { ...basicTask, deadline: getTomorrow() };

    render(<TaskSection {...defaultProps} tasks={[taskDueTomorrow]} />);

    expect(screen.getByText("— Завтра")).toBeInTheDocument();
  });
});
