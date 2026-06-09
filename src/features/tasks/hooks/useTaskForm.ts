import { useState } from "react";
import dayjs from "dayjs";
import type { Task, TaskFormValues } from "../../../types";

function taskToForm(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? "",
    ticketNumber: task.ticketNumber ?? "",
    deadline: task.deadline ? dayjs(task.deadline) : null,
    status: task.status ?? "свободно",
    priority: task.priority ?? null,
    assignee: task.assignee ?? null,
    screenshots: task.screenshots ?? [],
  };
}

export function useTaskForm(task: Task) {
  const [form, setForm] = useState<TaskFormValues>(() => taskToForm(task));
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormValues, string>>
  >({});

  const reset = () => {
    setForm(taskToForm(task));
    setErrors({});
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof TaskFormValues, string>> = {};
    if (!form.title.trim()) next.title = "Название задачи обязательно";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toTask = (): Task => ({
    ...task,
    title: form.title.trim(),
    description: form.description || undefined,
    ticketNumber: form.ticketNumber || undefined,
    deadline: form.deadline ? form.deadline.toISOString() : undefined,
    status: form.status,
    priority: form.priority ?? undefined,
    assignee: form.assignee ?? undefined,
    screenshots: form.screenshots.length > 0 ? form.screenshots : undefined,
  });

  return { form, setForm, errors, reset, validate, toTask };
}
