const API_URL = import.meta.env.VITE_API_URL;
import type { Task } from "../types/Task";

// localtunnel требует этот заголовок чтобы пропускать запросы
const headers = {
  "Content-Type": "application/json",
  "bypass-tunnel-reminder": "true",
};

export const getTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`, { headers });
  return res.json();
};

export const createTask = async (task: { id: string; title: string }) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(task),
  });
  return res.json();
};

export const deleteTask = async (id: string) => {
  await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers });
};

export const toggleTask = async (id: string) => {
  const res = await fetch(`${API_URL}/tasks/${id}/toggle`, {
    method: "PATCH",
    headers,
  });
  return res.json();
};

export const updateTask = async (task: Task) => {
  const res = await fetch(`${API_URL}/tasks/${task.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(task),
  });
  return res.json();
};
