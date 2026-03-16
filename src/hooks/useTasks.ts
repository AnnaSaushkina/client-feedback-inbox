import { useState, useEffect, useMemo } from "react";
import type { Task } from "../types/Task";

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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage());

  // сохранение задач в локал сторадж
  useEffect(() => {
    saveToStorage(tasks);
  }, [tasks]);

  const addTask = (task: Task): void => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const updateTask = (updatedTask: Task): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );
  };

  const deleteTask = (id: string): void => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
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
