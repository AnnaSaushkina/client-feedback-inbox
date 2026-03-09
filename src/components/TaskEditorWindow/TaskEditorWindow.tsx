import { useState } from "react";
import { Modal, Input } from "antd";
import type { Task } from "../../types/Task";

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
  const [title, setTitle] = useState("");

  const handleOk = () => {
    if (!title.trim()) return;

    onSubmit({
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
    });

    setTitle(""); // очищаем поле после сохранения
  };

  return (
    <Modal
      open={open}
      title="Создать задачу"
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название задачи"
      />
    </Modal>
  );
}
