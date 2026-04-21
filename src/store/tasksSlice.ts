import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import type { Task } from "../types/Task";
import * as api from "../api/tasks";

export const USE_API = !!import.meta.env.VITE_API_URL;
const STORAGE_KEY = "tasks";

export function loadFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToStorage(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const generateId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const now = () => new Date().toISOString();

export interface TasksState {
  items: Task[];
  loading: boolean;
}

// Локальный тип чтобы избежать circular import с index.ts
type TasksRootState = { tasks: TasksState };

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk<Task[]>("tasks/fetch", async () => {
  if (USE_API) {
    try {
      return await api.getTasks();
    } catch {
      return loadFromStorage();
    }
  }
  return loadFromStorage();
});

type AddTaskResult = { type: "create" | "update"; task: Task };

export const addTask = createAsyncThunk<
  AddTaskResult,
  Task,
  { state: TasksRootState }
>("tasks/add", async (task, { getState }) => {
  const tasks = getState().tasks.items;

  // Если тикет совпадает — объединяем с существующей задачей
  if (task.ticketNumber) {
    const existing = tasks.find(
      (t) => t.ticketNumber === task.ticketNumber && !t.completed,
    );
    if (existing) {
      const mergedDescription = [existing.description, task.description]
        .filter(Boolean)
        .join("\n\n—\n\n");
      const newEntry = task.description
        ? [{ text: task.description, date: now() }]
        : [];
      const updated: Task = {
        ...existing,
        description: mergedDescription || undefined,
        status: "свободно",
        history: [...(existing.history ?? []), ...newEntry],
      };
      if (USE_API) {
        return { type: "update", task: await api.updateTask(updated) };
      }
      return { type: "update", task: updated };
    }
  }

  const initialHistory = task.description
    ? [{ text: task.description, date: now() }]
    : [];

  if (USE_API) {
    const taskWithId = { ...task, id: generateId(), history: initialHistory };
    const created = await api.createTask(taskWithId);
    return { type: "create", task: created };
  }

  return {
    type: "create",
    task: { ...task, id: generateId(), history: initialHistory },
  };
});

export const updateTask = createAsyncThunk<Task, Task>(
  "tasks/update",
  async (task) => {
    if (USE_API) return await api.updateTask(task);
    return task;
  },
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
  return { ...task, completed: completing, completedAt: completing ? now() : undefined };
});

export const restoreFromArchive = createAsyncThunk<
  Task,
  string,
  { state: TasksRootState }
>("tasks/restore", async (id, { getState }) => {
  const task = getState().tasks.items.find((t) => t.id === id)!;
  const restored: Task = {
    ...task,
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

// ─── Slice ───────────────────────────────────────────────────────────────────

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], loading: false } as TasksState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { type, task } = action.payload;
        if (type === "update") {
          state.items = state.items.map((t) => (t.id === task.id ? task : t));
        } else {
          state.items.push(task);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.items = state.items.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        );
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        state.items = state.items.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        );
      })
      .addCase(restoreFromArchive.fulfilled, (state, action) => {
        state.items = state.items.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        );
      });
  },
});

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectTasks = (state: TasksRootState) => state.tasks.items;
export const selectLoading = (state: TasksRootState) => state.tasks.loading;

// Матчер для всех действий, которые изменяют список задач (используется в middleware)
export const isTaskMutationAction = isAnyOf(
  addTask.fulfilled,
  updateTask.fulfilled,
  deleteTask.fulfilled,
  toggleTask.fulfilled,
  restoreFromArchive.fulfilled,
);

export default tasksSlice.reducer;
