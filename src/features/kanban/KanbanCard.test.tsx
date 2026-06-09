import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";
import type { Task } from "../../types";

const task: Task = {
  id: "1",
  title: "прод упал",
  completed: false,
  priority: "high",
  assignee: "Аня",
  ticketNumber: "123",
};

const defaultProps = {
  task,
  onOpen: vi.fn(),
  onToggle: vi.fn(),
  onDelete: vi.fn(),
};

const wrap = (ui: React.ReactElement) => <DndContext>{ui}</DndContext>;

describe("KanbanCard", () => {
  it("показывает название задачи", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("прод упал")).toBeDefined();
  });

  it("показывает номер тикета", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("#123")).toBeDefined();
  });

  it("показывает тег высокого приоритета", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("🔴 Высокий")).toBeDefined();
  });

  it("показывает кнопку выполнения ✓", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByTitle("Выполнено")).toBeDefined();
  });

  it("показывает исполнителя", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("Аня")).toBeDefined();
  });
});
