import { useState } from "react";
import { Modal } from "antd";
import type { Task } from "../../types/Task";
import { type TaskFormValues, emptyForm } from "../../types/TaskForm";
import TaskForm from "./TaskForm";

interface TaskEditorProps {
  open: boolean;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskEditor({ open, onSubmit, onCancel }: TaskEditorProps) {
  const [form, setForm] = useState<TaskFormValues>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormValues, string>> = {};
    if (!form.title.trim()) {
      newErrors.title = "Название задачи обязательно";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = () => {
    if (!validate()) return;
    onSubmit({
      id: "",
      title: form.title.trim(),
      completed: false,
      description: form.description || undefined,
      ticketNumber: form.ticketNumber || undefined,
      deadline: form.deadline ? form.deadline.toISOString() : undefined,
      priority: form.priority ?? undefined,
      status: form.status,
      assignee: form.assignee ?? undefined,
      screenshots: form.screenshots.length > 0 ? form.screenshots : undefined,
    });
    setForm(emptyForm);
    setErrors({});
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setErrors({});
    onCancel();
  };

  return (
    <Modal
      open={open}
      title="Создать задачу"
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Создать"
      cancelText="Отмена"
      width={640}
    >
      <TaskForm values={form} onChange={setForm} errors={errors} />
    </Modal>
  );
}
