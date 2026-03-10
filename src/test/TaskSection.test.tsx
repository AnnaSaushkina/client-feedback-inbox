import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskSection from "../components/Board/TaskSection";
import type { Task } from "../types/Task";

const mockTask: Task = {
  id: "1",
  title: "Тестовая задача",
  completed: false,
  priority: "medium",
};

describe("TaskSection", () => {
  it("показывает 'Список пуст' если задач нет", () => {
    render(
      <TaskSection
        title="Активные"
        tasks={[]}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText("Список пуст")).toBeInTheDocument();
  });

  it("рендерит задачи", () => {
    render(
      <TaskSection
        title="Активные"
        tasks={[mockTask]}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText("Тестовая задача")).toBeInTheDocument();
  });

  it("показывает подкатегорию Завтра если есть задача с завтрашним дедлайном", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const taskWithTomorrow: Task = {
      ...mockTask,
      deadline: tomorrow.toISOString(),
    };

    render(
      <TaskSection
        title="Активные"
        tasks={[taskWithTomorrow]}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText("— Завтра")).toBeInTheDocument();
  });
});
