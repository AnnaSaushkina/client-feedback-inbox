import { useState, useEffect, useMemo } from "react";
import type { Task } from "../types/Task";
import * as api from "../api/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    api.getTasks().then(setTasks);
  }, []);

  const addTask = async (task: Task): Promise<void> => {
    const created = await api.createTask(task);
    setTasks((prev) => [...prev, created]);
  };

  const updateTask = async (updatedTask: Task): Promise<void> => {
    const updated = await api.updateTask(updatedTask);
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updated : task)),
    );
  };

  const deleteTask = async (id: string): Promise<void> => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = async (id: string): Promise<void> => {
    const updated = await api.toggleTask(id);
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
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
