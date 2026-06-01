import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import KanbanCard from "../components/Kanban/KanbanCard";
import type { Task } from "../types";

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

// DndContext нужен потому что KanbanCard использует useDraggable внутри
const wrap = (ui: React.ReactElement) => (
  <DndContext>{ui}</DndContext>
);

describe("KanbanCard", () => {
  it("показывает название задачи", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("прод упал")).toBeInTheDocument();
  });

  it("показывает номер тикета", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("#123")).toBeInTheDocument();
  });

  it("показывает тег высокого приоритета", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("🔴 Высокий")).toBeInTheDocument();
  });

  it("показывает кнопку выполнения ✓", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByTitle("Выполнено")).toBeInTheDocument();
  });

  it("показывает исполнителя", () => {
    render(wrap(<KanbanCard {...defaultProps} />));
    expect(screen.getByText("Аня")).toBeInTheDocument();
  });
});
