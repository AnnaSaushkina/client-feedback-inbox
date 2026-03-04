import { useState } from "react";
import { Modal, Input } from "antd";
import type { Task } from "../../types/Task";

interface TaskEditorProps {
  open: boolean;
  initialData: Task | null;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskEditor({
  open,
  initialData,
  onSubmit,
  onCancel,
}: TaskEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");

  const handleOk = () => {
    if (!title.trim()) return;

    const task: Task = {
      id: initialData?.id ?? crypto.randomUUID(),
      title,
      completed: initialData?.completed ?? false,
    };

    onSubmit(task);
  };

  return (
    <Modal
      open={open}
      title={initialData ? "Редактировать задачу" : "Создать задачу"}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
    </Modal>
  );
}
