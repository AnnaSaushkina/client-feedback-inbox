import { useState, useEffect } from "react";
import type { Task } from "../types/Task";

export function useTasks() {
  // Загружаем задачи из браузера при старте
  const [tasks, setTasks] = useState<Task[]>(() => {
    return JSON.parse(localStorage.getItem("tasks") ?? "[]");
  });

  // Сохраняем в браузер каждый раз когда tasks меняется
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const saveTask = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.find((item) => item.id === task.id);
      if (exists)
        return prev.map((item) => (item.id === task.id ? task : item));
      return [...prev, task];
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  return {
    activeTasks: tasks.filter((item) => !item.completed),
    doneTasks: tasks.filter((item) => item.completed),
    saveTask,
    deleteTask,
    toggleTask,
  };
}
