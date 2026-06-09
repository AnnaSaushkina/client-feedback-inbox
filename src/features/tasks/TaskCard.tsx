import { useState } from "react";
import { Modal, Button } from "antd";
import type { Task, TaskFormValues } from "../../types";
import TaskForm from "./TaskForm";
import TaskViewMode from "./TaskViewMode";
import { useTaskForm } from "./hooks/useTaskForm";

interface TaskCardProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

function TaskCardContent({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { form, setForm, errors, reset, validate, toTask } = useTaskForm(task);

  const handleEditClick = () => {
    reset();
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(toTask());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal
      open
      onCancel={handleCancel}
      title={isEditing ? "Редактировать задачу" : task.title}
      width={700}
      footer={
        isEditing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={() => setIsEditing(false)}>Отмена</Button>
            <Button type="primary" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        ) : (
          <Button onClick={handleEditClick}>Редактировать</Button>
        )
      }
    >
      {isEditing ? (
        <TaskForm
          values={form}
          onChange={(v: TaskFormValues) => setForm(v)}
          errors={errors}
        />
      ) : (
        <TaskViewMode task={task} />
      )}
    </Modal>
  );
}

export default function TaskCard({ task, onClose, onSave }: TaskCardProps) {
  if (!task) return null;
  return <TaskCardContent task={task} onClose={onClose} onSave={onSave} />;
}
