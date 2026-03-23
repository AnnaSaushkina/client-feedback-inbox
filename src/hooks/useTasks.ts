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

const generateId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    USE_API ? [] : loadFromStorage(),
  );

  useEffect(() => {
    if (USE_API) {
      api.getTasks().then(setTasks);
    }
  }, []);

  useEffect(() => {
    if (!USE_API) {
      saveToStorage(tasks);
    }
  }, [tasks]);

  const addTask = async (task: Task): Promise<void> => {
    if (USE_API) {
      const created = await api.createTask(task);
      setTasks((prev) => [...prev, created]);
    } else {
      const newTask = { ...task, id: generateId() };
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const updateTask = async (updatedTask: Task): Promise<void> => {
    if (USE_API) {
      const updated = await api.updateTask(updatedTask);
      // Мержим: сохраняем локальные поля которых нет на сервере (например status)
      const merged = { ...updatedTask, ...updated };
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? merged : task)),
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
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } else {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      );
    }
  };

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  const doneTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks],
  );

  return {
    activeTasks,
    doneTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
