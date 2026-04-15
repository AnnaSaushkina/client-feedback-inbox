import { Card } from "antd";
import type { Task } from "../../types/Task";
import TaskItem from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

// Проверяем, что дедлайн задачи — завтра
const isTomorrow = (deadline?: string): boolean => {
  if (!deadline) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const taskDate = new Date(deadline);

  return (
    taskDate.getDate() === tomorrow.getDate() &&
    taskDate.getMonth() === tomorrow.getMonth() &&
    taskDate.getFullYear() === tomorrow.getFullYear()
  );
};

export default function TaskSection({
  title,
  tasks,
  onDelete,
  onToggle,
  onOpen,
}: TaskSectionProps) {
  const tomorrowTasks = tasks.filter((t) => isTomorrow(t.deadline));
  const otherTasks = tasks.filter((t) => !isTomorrow(t.deadline));

  const renderTask = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      onDelete={onDelete}
      onToggle={onToggle}
      onOpen={onOpen}
    />
  );

  if (tasks.length === 0) {
    return (
      <Card title={title} style={{ marginBottom: 20 }} styles={{ header: { fontSize: 17, fontWeight: 600 } }}>
        <p style={{ color: "#888", margin: 0 }}>Список пуст</p>
      </Card>
    );
  }

  return (
    <Card title={title} style={{ marginBottom: 20 }} styles={{ header: { fontSize: 17, fontWeight: 600 } }}>
      {otherTasks.length > 0 && <div>{otherTasks.map(renderTask)}</div>}
      {tomorrowTasks.length > 0 && (
        <>
          <p style={{ color: "#888", fontSize: 13, margin: "10px 0 4px" }}>
            — Завтра
          </p>
          <div>{tomorrowTasks.map(renderTask)}</div>
        </>
      )}
    </Card>
  );
}
