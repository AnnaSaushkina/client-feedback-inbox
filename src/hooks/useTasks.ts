import { useState, useEffect } from "react";
import type { Task } from "../types/Task";
import * as api from "../api/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Загружаем задачи с сервера при старте
  useEffect(() => {
    api.getTasks().then(setTasks);
  }, []);

  const saveTask = async (task: Task) => {
    const exists = tasks.find((t) => t.id === task.id);

    if (exists) {
      const updated = await api.updateTask(task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } else {
      const created = await api.createTask(task);
      setTasks((prev) => [...prev, created]);
    }
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleTask = async (id: string) => {
    const updated = await api.toggleTask(id);
    setTasks((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  return {
    activeTasks: tasks.filter((item) => !item.completed),
    doneTasks: tasks.filter((item) => item.completed),
    saveTask,
    deleteTask,
    toggleTask,
  };
}
