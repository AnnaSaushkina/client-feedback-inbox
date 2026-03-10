import { Card, List } from "antd";
import type { Task } from "../../types/Task";
import TaskItem from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

const isTomorrow = (deadline?: string) => {
  if (!deadline) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(deadline);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
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

  return (
    <Card title={title} style={{ marginBottom: 16 }}>
      {tasks.length === 0 && <p>Список пуст</p>}

      {tomorrowTasks.length > 0 && (
        <>
          <p style={{ color: "#888", fontSize: 12, margin: "8px 0 4px" }}>
            — Завтра
          </p>
          <List dataSource={tomorrowTasks} renderItem={renderTask} />
        </>
      )}

      {otherTasks.length > 0 && (
        <List dataSource={otherTasks} renderItem={renderTask} />
      )}
    </Card>
  );
}
