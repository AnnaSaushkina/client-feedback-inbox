import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Task } from "../types";
import * as api from "../api";
import { loadFromStorage } from "./storage";

export const USE_API = !!import.meta.env.VITE_API_URL;

const now = () => new Date().toISOString();

const generateId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 11)
  );
};

interface TasksRootState {
  tasks: { items: Task[] };
}

function mergeTask(existing: Task, incoming: Task): Task {
  const mergedDescription = [existing.description, incoming.description]
    .filter(Boolean)
    .join("\n\n—\n\n");
  const newEntry = incoming.description
    ? [{ text: incoming.description, date: now() }]
    : [];
  return {
    ...existing,
    description: mergedDescription || undefined,
    status: "свободно",
    history: [...(existing.history ?? []), ...newEntry],
  };
}

export const fetchTasks = createAsyncThunk<Task[]>("tasks/fetch", () =>
  USE_API
    ? api.getTasks().catch(() => loadFromStorage())
    : Promise.resolve(loadFromStorage()),
);

export type AddTaskResult = { type: "create" | "update"; task: Task };

export const addTask = createAsyncThunk<
  AddTaskResult,
  Task,
  { state: TasksRootState }
>("tasks/add", async (task, { getState }) => {
  const tasks = getState().tasks.items;
  if (task.ticketNumber) {
    const existing = tasks.find(
      (t) => t.ticketNumber === task.ticketNumber && !t.completed,
    );
    if (existing) {
      const merged = mergeTask(existing, task);
      const saved = USE_API ? await api.updateTask(merged) : merged;
      return { type: "update", task: saved };
    }
  }
  const newTask: Task = {
    ...task,
    id: generateId(),
    history: task.description ? [{ text: task.description, date: now() }] : [],
  };
  const saved = USE_API ? await api.createTask(newTask) : newTask;
  return { type: "create", task: saved };
});

export const updateTask = createAsyncThunk<Task, Task>(
  "tasks/update",
  (task) => (USE_API ? api.updateTask(task) : Promise.resolve(task)),
);

export const deleteTask = createAsyncThunk<string, string>(
  "tasks/delete",
  async (id) => {
    if (USE_API) await api.deleteTask(id);
    return id;
  },
);

export const toggleTask = createAsyncThunk<
  Task,
  string,
  { state: TasksRootState }
>("tasks/toggle", async (id, { getState }) => {
  const task = getState().tasks.items.find((t) => t.id === id)!;
  const completing = !task.completed;
  if (USE_API) {
    const updated = await api.toggleTask(id);
    return { ...updated, completedAt: completing ? now() : undefined };
  }
  return {
    ...task,
    completed: completing,
    completedAt: completing ? now() : undefined,
  };
});

export const restoreFromArchive = createAsyncThunk<
  Task,
  string,
  { state: TasksRootState }
>("tasks/restore", async (id, { getState }) => {
  const restored: Task = {
    ...getState().tasks.items.find((t) => t.id === id)!,
    completed: false,
    completedAt: undefined,
    status: "в_работе",
  };
  if (USE_API) {
    const updated = await api.updateTask(restored);
    return { ...updated, completed: false, completedAt: undefined };
  }
  return restored;
});
