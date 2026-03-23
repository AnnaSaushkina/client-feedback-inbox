import { useState } from "react";
import { Modal } from "antd";
import type { Task, Priority, TaskStatus } from "../../types/Task";
import { type TaskFormValues, emptyForm } from "../../types/TaskForm";
import TaskForm from "./TaskForm";

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
    const isWaiting = form.combinedStatus === "waiting_comment";
    onSubmit({
      id: "",
      title: form.title.trim(),
      completed: false,
      description: form.description,
      ticketNumber: form.ticketNumber,
      deadline: form.deadline ? form.deadline.toISOString() : undefined,
      priority: isWaiting ? undefined : (form.combinedStatus as Priority),
      status: isWaiting ? ("waiting_comment" as TaskStatus) : undefined,
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
      width={600}
    >
      <TaskForm values={form} onChange={setForm} errors={errors} />
    </Modal>
  );
}
