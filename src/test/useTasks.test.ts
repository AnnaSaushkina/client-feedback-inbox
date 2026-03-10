import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types/Task";

vi.mock("../api/tasks", () => ({
  getTasks: async () => [],
  createTask: async (task: Task) => ({ ...task, completed: false }),
  deleteTask: async () => {},
  toggleTask: async (id: string) => ({ id, completed: true, title: "" }),
  updateTask: async (task: Task) => task,
}));

describe("useTasks", () => {
  it("начинает с пустого списка", async () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.activeTasks).toEqual([]);
    expect(result.current.doneTasks).toEqual([]);
  });

  it("добавляет задачу", async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.saveTask({
        id: "1",
        title: "Тестовая задача",
        completed: false,
      });
    });

    expect(result.current.activeTasks).toHaveLength(1);
    expect(result.current.activeTasks[0].title).toBe("Тестовая задача");
  });

  it("удаляет задачу", async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.saveTask({
        id: "1",
        title: "Задача",
        completed: false,
      });
    });

    await act(async () => {
      await result.current.deleteTask("1");
    });

    expect(result.current.activeTasks).toHaveLength(0);
  });

  it("переключает статус задачи", async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.saveTask({
        id: "1",
        title: "Задача",
        completed: false,
      });
    });

    await act(async () => {
      await result.current.toggleTask("1");
    });

    expect(result.current.doneTasks).toHaveLength(1);
    expect(result.current.activeTasks).toHaveLength(0);
  });

  it("редактирование обновляет задачу а не создаёт новую", async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.saveTask({
        id: "1",
        title: "Старое название",
        completed: false,
      });
    });

    await act(async () => {
      await result.current.saveTask({
        id: "1",
        title: "Новое название",
        completed: false,
      });
    });

    expect(result.current.activeTasks).toHaveLength(1);
    expect(result.current.activeTasks[0].title).toBe("Новое название");
  });

  it("сохраняет приоритет и исполнителя", async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.saveTask({
        id: "1",
        title: "Задача",
        completed: false,
        priority: "high",
        assignee: "Аня",
      });
    });

    expect(result.current.activeTasks[0].priority).toBe("high");
    expect(result.current.activeTasks[0].assignee).toBe("Аня");
  });
});
