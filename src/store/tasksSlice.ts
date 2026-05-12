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

const now = () => new Date().toISOString();

const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 11);
};

export interface TasksState {
  items: Task[];
  loading: boolean;
}

type TasksRootState = { tasks: TasksState };

const getTaskById = (state: TasksRootState, id: string) =>
  state.tasks.items.find((t) => t.id === id)!;

// объединение дублирующего тикета — склеивает описания, дополняет историю
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

// загрузка
export const fetchTasks = createAsyncThunk<Task[]>("tasks/fetch", () =>
  USE_API ? api.getTasks().catch(() => loadFromStorage()) : Promise.resolve(loadFromStorage()),
);

type AddTaskResult = { type: "create" | "update"; task: Task };

// создание или объединение по номеру тикета
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

// обновление
export const updateTask = createAsyncThunk<Task, Task>(
  "tasks/update",
  (task) => USE_API ? api.updateTask(task) : Promise.resolve(task),
);

// удаление
export const deleteTask = createAsyncThunk<string, string>(
  "tasks/delete",
  async (id) => {
    if (USE_API) await api.deleteTask(id);
    return id;
  },
);

// переключение статуса выполнения
export const toggleTask = createAsyncThunk<
  Task,
  string,
  { state: TasksRootState }
>("tasks/toggle", async (id, { getState }) => {
  const task = getTaskById(getState(), id);
  const completing = !task.completed;
  if (USE_API) {
    const updated = await api.toggleTask(id);
    return { ...updated, completedAt: completing ? now() : undefined };
  }
  return { ...task, completed: completing, completedAt: completing ? now() : undefined };
});

// разархивирование
export const restoreFromArchive = createAsyncThunk<
  Task,
  string,
  { state: TasksRootState }
>("tasks/restore", async (id, { getState }) => {
  const restored: Task = {
    ...getTaskById(getState(), id),
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
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addMatcher(
        isAnyOf(updateTask.fulfilled, toggleTask.fulfilled, restoreFromArchive.fulfilled),
        (state, action) => {
          state.items = state.items.map((t) =>
            t.id === action.payload.id ? action.payload : t,
          );
        },
      );
  },
});

export const selectTasks = (state: TasksRootState) => state.tasks.items;
export const selectLoading = (state: TasksRootState) => state.tasks.loading;

export const isTaskMutationAction = isAnyOf(
  addTask.fulfilled,
  updateTask.fulfilled,
  deleteTask.fulfilled,
  toggleTask.fulfilled,
  restoreFromArchive.fulfilled,
);

export default tasksSlice.reducer;
