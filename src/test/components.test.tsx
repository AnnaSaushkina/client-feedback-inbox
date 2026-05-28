import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BoardItem from "../components/Board/BoardItem";
import BoardSection from "../components/Board/BoardSection";
import type { Task } from "../types";

// --- BoardItem ---

const urgentTask: Task = {
  id: "1",
  title: "прод упал",
  completed: false,
  priority: "high",
  assignee: "Аня",
};

const defaultItemProps = {
  task: urgentTask,
  onDelete: vi.fn(),
  onToggle: vi.fn(),
  onOpen: vi.fn(),
};

describe("BoardItem", () => {
  it("показывает название задачи", () => {
    render(<BoardItem {...defaultItemProps} />);
    expect(screen.getByText("прод упал")).toBeInTheDocument();
  });

  it("показывает тег приоритета", () => {
    render(<BoardItem {...defaultItemProps} />);
    expect(screen.getByText("🔴 Высокий")).toBeInTheDocument();
  });

  it("скрывает теги когда задача выполнена, только название и тире", () => {
    render(
      <BoardItem {...defaultItemProps} task={{ ...urgentTask, completed: true }} />
    );
    expect(screen.getByText("прод упал")).toBeInTheDocument();
    expect(screen.queryByText("Высокий")).not.toBeInTheDocument();
  });
});

// --- BoardSection ---

const basicTask: Task = {
  id: "1",
  title: "Починить баг с авторизацией",
  completed: false,
  priority: "low",
};

const defaultSectionProps = {
  title: "Активные задачи",
  tasks: [],
  onDelete: vi.fn(),
  onToggle: vi.fn(),
  onOpen: vi.fn(),
};

const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return tomorrow.toISOString();
};

describe("BoardSection", () => {
  it("показывает заглушку когда список пустой", () => {
    render(<BoardSection {...defaultSectionProps} />);
    expect(screen.getByText("Список пуст")).toBeInTheDocument();
  });

  it("показывает задачу если она есть в списке", () => {
    render(<BoardSection {...defaultSectionProps} tasks={[basicTask]} />);
    expect(screen.getByText("Починить баг с авторизацией")).toBeInTheDocument();
  });

  it("выделяет задачи с дедлайном завтра в отдельную группу", () => {
    const taskDueTomorrow = { ...basicTask, deadline: getTomorrow() };
    render(<BoardSection {...defaultSectionProps} tasks={[taskDueTomorrow]} />);
    expect(screen.getByText("— Завтра")).toBeInTheDocument();
  });
});
