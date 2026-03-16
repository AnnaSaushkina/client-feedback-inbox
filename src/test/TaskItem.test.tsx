import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskItem from "../components/Board/TaskItem";
import type { Task } from "../types/Task";

// Задача с высоким приоритетом и исполнителем
const urgentTask: Task = {
  id: "1",
  title: "прод упал",
  completed: false,
  priority: "high",
  assignee: "Аня",
};

const defaultProps = {
  task: urgentTask,
  onDelete: vi.fn(),
  onToggle: vi.fn(),
  onOpen: vi.fn(),
};

describe("TaskItem", () => {
  it("показывает название задачи", () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.getByText("прод упал")).toBeInTheDocument();
  });

  it("показывает теги приоритета и исполнителя", () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.getByText("Высокий")).toBeInTheDocument();
    expect(screen.getByText("Аня")).toBeInTheDocument();
  });

  it("скрывает теги когда задача выполнена, только название и тире", () => {
    render(
      <TaskItem {...defaultProps} task={{ ...urgentTask, completed: true }} />,
    );
    expect(screen.getByText("прод упал")).toBeInTheDocument();
    expect(screen.queryByText("Высокий")).not.toBeInTheDocument();
  });
});
