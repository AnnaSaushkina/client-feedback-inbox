import { useState, useEffect, useMemo } from "react";
import type { Task } from "../types/Task";
import * as api from "../api/tasks";

const USE_API = !!import.meta.env.VITE_API_URL;
const STORAGE_KEY = "tasks";

function loadFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

const generateId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const now = () => new Date().toISOString();

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    USE_API ? [] : loadFromStorage(),
  );

  useEffect(() => {
    if (USE_API) {
      api.getTasks()
        .then(setTasks)
        .catch(() => setTasks(loadFromStorage()));
    }
  }, []);

  useEffect(() => {
    if (!USE_API) {
      saveToStorage(tasks);
    }
  }, [tasks]);

  const addTask = async (task: Task): Promise<void> => {
    // Если тикет совпадает — обновляем существующую задачу
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
          const result = await api.updateTask(updated);
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? result : t)));
        } else {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }
        return;
      }
    }

    // Новая задача
    const initialHistory = task.description
      ? [{ text: task.description, date: now() }]
      : [];

    if (USE_API) {
      const taskWithId = { ...task, id: generateId(), history: initialHistory };
      const created = await api.createTask(taskWithId);
      setTasks((prev) => [...prev, created]);
    } else {
      const newTask = { ...task, id: generateId(), history: initialHistory };
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const updateTask = async (updatedTask: Task): Promise<void> => {
    if (USE_API) {
      const updated = await api.updateTask(updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updated : task)),
      );
    } else {
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (USE_API) {
      await api.deleteTask(id);
    }
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = async (id: string): Promise<void> => {
    if (USE_API) {
      const updated = await api.toggleTask(id);
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          const completing = !task.completed;
          return {
            ...updated,
            completedAt: completing ? now() : undefined,
          };
        }),
      );
    } else {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          const completing = !task.completed;
          return {
            ...task,
            completed: completing,
            completedAt: completing ? now() : undefined,
          };
        }),
      );
    }
  };

  const restoreFromArchive = async (id: string): Promise<void> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const restored: Task = {
      ...task,
      completed: false,
      completedAt: undefined,
      status: "в_работе",
    };
    if (USE_API) {
      const updated = await api.updateTask(restored);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...updated, completed: false, completedAt: undefined } : t)));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === id ? restored : t)));
    }
  };

  // Активные задачи
  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  // Выполненные СЕГОДНЯ — временный список для отчёта
  const doneTasks = useMemo(
    () => tasks.filter((task) => task.completed && isToday(task.completedAt)),
    [tasks],
  );

  // Архив — выполненные НЕ сегодня (постоянное хранилище)
  const archivedTasks = useMemo(
    () => tasks.filter((task) => task.completed && !isToday(task.completedAt)),
    [tasks],
  );

  return {
    activeTasks,
    doneTasks,
    archivedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    restoreFromArchive,
  };
}
