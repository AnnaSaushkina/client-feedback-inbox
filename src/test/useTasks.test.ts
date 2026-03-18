import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTasks } from "../hooks/useTasks";

// очистка хранилища перед каждым тестом
beforeEach(() => localStorage.clear());

// только обязательные поля
const bugFixTask = {
  id: "1",
  title: "Починить форму логина",
  completed: false,
};

describe("useTasks", () => {
  it("начинает с пустого списка если localStorage пустой", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.activeTasks).toEqual([]);
    expect(result.current.doneTasks).toEqual([]);
  });

  it("добавляет задачу в активные", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask(bugFixTask);
    });

    expect(result.current.activeTasks).toHaveLength(1);
    expect(result.current.activeTasks[0].title).toBe("Починить форму логина");
  });

  it("удаляет задачу из списка", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask(bugFixTask);
    });
    act(() => {
      result.current.deleteTask("1");
    });

    expect(result.current.activeTasks).toHaveLength(0);
  });

  it("перемещает задачу в выполненные после toggle", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask(bugFixTask);
    });
    act(() => {
      result.current.toggleTask("1");
    });

    expect(result.current.doneTasks).toHaveLength(1);
    expect(result.current.activeTasks).toHaveLength(0);
  });

  it("обновляет существующую задачу а не создаёт дубль", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask(bugFixTask);
    });
    act(() => {
      result.current.updateTask({
        ...bugFixTask,
        title: "Починить форму регистрации",
      });
    });

    expect(result.current.activeTasks).toHaveLength(1);
    expect(result.current.activeTasks[0].title).toBe(
      "Починить форму регистрации",
    );
  });

  it("сохраняет все поля задачи приоритет и исполнителя", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        ...bugFixTask,
        priority: "high",
        assignee: "Аня",
      });
    });

    expect(result.current.activeTasks[0].priority).toBe("high");
    expect(result.current.activeTasks[0].assignee).toBe("Аня");
  });
});
