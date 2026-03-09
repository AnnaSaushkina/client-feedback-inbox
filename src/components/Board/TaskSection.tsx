import { Card, List } from "antd";
import type { Task } from "../../types/Task";
import TaskItem from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskSection({
  title,
  tasks,
  onDelete,
  onToggle,
}: TaskSectionProps) {
  return (
    <Card title={title} style={{ marginBottom: 16 }}>
      {tasks.length === 0 && <p>Список пуст</p>}

      <List
        dataSource={tasks}
        renderItem={(task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        )}
      />
    </Card>
  );
}
