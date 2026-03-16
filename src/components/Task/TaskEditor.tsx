import { useState } from "react";
import { Modal } from "antd";
import type { Task } from "../../types/Task";
import { type TaskFormValues, emptyForm } from "../../types/TaskForm";
import TaskForm from "./TaskForm";

const generateId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

interface TaskEditorProps {
  open: boolean;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskEditor({
  open,
  onSubmit,
  onCancel,
}: TaskEditorProps) {
  const [form, setForm] = useState<TaskFormValues>(emptyForm);

  const handleOk = () => {
    if (!form.title.trim()) return;

    onSubmit({
      id: generateId(),
      title: form.title.trim(),
      completed: false,
      description: form.description,
      ticketNumber: form.ticketNumber,
      deadline: form.deadline ? form.deadline.toISOString() : undefined,
      priority: form.priority,
      assignee: form.assignee ?? undefined,
      screenshots: form.screenshots.length > 0 ? form.screenshots : undefined,
    });

    setForm(emptyForm);
  };

  return (
    <Modal
      open={open}
      title="Создать задачу"
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <TaskForm values={form} onChange={setForm} />
    </Modal>
  );
}
