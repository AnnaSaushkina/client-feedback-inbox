import { describe, it, expect, beforeEach } from "vitest";
import tasksReducer, {
  fetchTasks,
  addTask,
  deleteTask,
  updateTask,
  toggleTask,
  restoreFromArchive,
  type TasksState,
} from "../store/tasksSlice";
import type { Task } from "../types/Task.tsx";

const initialState: TasksState = { items: [], loading: false };

const task1: Task = { id: "1", title: "Починить форму логина", completed: false };
const task2: Task = { id: "2", title: "Добавить пагинацию", completed: false };

const withItems = (...items: Task[]): TasksState => ({ ...initialState, items });

beforeEach(() => localStorage.clear());

describe("tasksSlice reducer", () => {
  it("начинает с пустого стейта", () => {
    const state = tasksReducer(undefined, { type: "@@init" });
    expect(state).toEqual(initialState);
  });

  it("fetchTasks.pending ставит loading: true", () => {
    const action = fetchTasks.pending("req", undefined);
    const state = tasksReducer(initialState, action);
    expect(state.loading).toBe(true);
  });

  it("fetchTasks.fulfilled загружает задачи", () => {
    const action = fetchTasks.fulfilled([task1, task2], "req", undefined);
    const state = tasksReducer(initialState, action);
    expect(state.items).toHaveLength(2);
    expect(state.loading).toBe(false);
  });

  it("addTask.fulfilled type=create добавляет задачу", () => {
    const action = addTask.fulfilled({ type: "create", task: task1 }, "req", task1);
    const state = tasksReducer(initialState, action);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe("Починить форму логина");
  });

  it("addTask.fulfilled type=update заменяет существующую задачу", () => {
    const updated = { ...task1, title: "Починить форму регистрации" };
    const action = addTask.fulfilled({ type: "update", task: updated }, "req", task1);
    const state = tasksReducer(withItems(task1, task2), action);
    expect(state.items).toHaveLength(2);
    expect(state.items[0].title).toBe("Починить форму регистрации");
  });

  it("deleteTask.fulfilled удаляет задачу по id", () => {
    const action = deleteTask.fulfilled("1", "req", "1");
    const state = tasksReducer(withItems(task1, task2), action);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("2");
  });

  it("updateTask.fulfilled заменяет задачу по id", () => {
    const updated = { ...task1, title: "Обновлённый заголовок" };
    const action = updateTask.fulfilled(updated, "req", updated);
    const state = tasksReducer(withItems(task1, task2), action);
    expect(state.items[0].title).toBe("Обновлённый заголовок");
    expect(state.items).toHaveLength(2);
  });

  it("toggleTask.fulfilled меняет задачу на выполненную", () => {
    const completed = { ...task1, completed: true, completedAt: new Date().toISOString() };
    const action = toggleTask.fulfilled(completed, "req", "1");
    const state = tasksReducer(withItems(task1), action);
    expect(state.items[0].completed).toBe(true);
    expect(state.items[0].completedAt).toBeDefined();
  });

  it("restoreFromArchive.fulfilled сбрасывает completed и completedAt", () => {
    const archived: Task = { ...task1, completed: true, completedAt: "2026-05-01T10:00:00Z" };
    const restored = { ...task1, completed: false, completedAt: undefined, status: "в_работе" as const };
    const action = restoreFromArchive.fulfilled(restored, "req", "1");
    const state = tasksReducer(withItems(archived), action);
    expect(state.items[0].completed).toBe(false);
    expect(state.items[0].completedAt).toBeUndefined();
    expect(state.items[0].status).toBe("в_работе");
  });
});
