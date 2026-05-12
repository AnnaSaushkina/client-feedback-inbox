import type { Task } from "../types/Task";

const API_URL = import.meta.env.VITE_API_URL;

const headers = {
  "Content-Type": "application/json",
  "bypass-tunnel-reminder": "true",
};

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const getTasks = (): Promise<Task[]> =>
  fetch(`${API_URL}/tasks`, { headers }).then(parseResponse<Task[]>);

export const createTask = (task: Task): Promise<Task> =>
  fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(task),
  }).then(parseResponse<Task>);

export const updateTask = (task: Task): Promise<Task> =>
  fetch(`${API_URL}/tasks/${task.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(task),
  }).then(parseResponse<Task>);

export const deleteTask = (id: string): Promise<void> =>
  fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

export const toggleTask = (id: string): Promise<Task> =>
  fetch(`${API_URL}/tasks/${id}/toggle`, {
    method: "PATCH",
    headers,
  }).then(parseResponse<Task>);
