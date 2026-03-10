import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskItem from "../components/Board/TaskItem";
import type { Task } from "../types/Task";

const mockTask: Task = {
  id: "1",
  title: "Тестовая задача",
  completed: false,
  priority: "high",
  assignee: "Аня",
};

describe("TaskItem", () => {
  it("рендерит заголовок задачи", () => {
    render(
      <TaskItem
        task={mockTask}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText("Тестовая задача")).toBeInTheDocument();
  });

  it("показывает приоритет и исполнителя", () => {
    render(
      <TaskItem
        task={mockTask}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText("Высокий")).toBeInTheDocument();
    expect(screen.getByText("Аня")).toBeInTheDocument();
  });

  it("перечёркивает текст если задача выполнена", () => {
    render(
      <TaskItem
        task={{ ...mockTask, completed: true }}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    const text = screen.getByText("Тестовая задача");
    expect(text).toHaveStyle("text-decoration: line-through");
  });

  it("вызывает onDelete при подтверждении удаления", async () => {
    const onDelete = vi.fn();

    // Мокаем confirm чтобы он всегда возвращал true
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <TaskItem
        task={mockTask}
        onDelete={onDelete}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Удалить"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
