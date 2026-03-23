import { useState, useEffect, useMemo } from "react";
import type { Task, TaskStatus } from "../types/Task";
import * as api from "../api/tasks";

const USE_API = !!import.meta.env.VITE_API_URL;
const STORAGE_KEY = "tasks";
const STATUS_STORAGE_KEY = "task_statuses";

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

// Хранит статусы отдельно — для случая когда сервер не знает о поле status
function loadStatuses(): Record<string, TaskStatus> {
  try {
    const raw = localStorage.getItem(STATUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStatuses(tasks: Task[]): void {
  const statuses: Record<string, TaskStatus> = {};
  for (const task of tasks) {
    if (task.status) {
      statuses[task.id] = task.status;
    }
  }
  localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statuses));
}

function applyStatuses(tasks: Task[]): Task[] {
  const statuses = loadStatuses();
  return tasks.map((task) => ({
    ...task,
    status: statuses[task.id],
  }));
}

const generateId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    USE_API ? [] : loadFromStorage(),
  );

  useEffect(() => {
    if (USE_API) {
      api.getTasks().then((serverTasks) => {
        setTasks(applyStatuses(serverTasks));
      });
    }
  }, []);

  useEffect(() => {
    if (!USE_API) {
      saveToStorage(tasks);
    } else if (tasks.length > 0) {
      // Сохраняем только после загрузки — иначе пустой начальный стейт затрёт localStorage
      saveStatuses(tasks);
    }
  }, [tasks]);

  const addTask = async (task: Task): Promise<void> => {
    if (USE_API) {
      const created = await api.createTask(task);
      setTasks((prev) => [...prev, { ...created, status: task.status }]);
    } else {
      const newTask = { ...task, id: generateId() };
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const updateTask = async (updatedTask: Task): Promise<void> => {
    if (USE_API) {
      const updated = await api.updateTask(updatedTask);
      const merged = { ...updatedTask, ...updated, status: updatedTask.status };
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
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...updated, status: task.status } : task,
        ),
      );
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
