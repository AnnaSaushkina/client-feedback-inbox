import { List, Button, Typography } from "antd";
import type { Task } from "../../types/Task";

const { Text } = Typography;

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskItem({ task, onDelete, onToggle }: TaskItemProps) {
  const isDone = task.completed;

  const handleToggle = () => {
    if (confirm(isDone ? "Вернуть в активные?" : "Отметить как выполненную?")) {
      onToggle(task.id);
    }
  };

  const handleDelete = () => {
    if (confirm("Удалить задачу?")) {
      onDelete(task.id);
    }
  };

  return (
    <List.Item
      actions={[
        <Button type="text" size="small" onClick={handleToggle}>
          {isDone ? "Вернуть" : "Выполнено?"}
        </Button>,
        <Button type="text" size="small" danger onClick={handleDelete}>
          Удалить
        </Button>,
      ]}
    >
      <Text delete={isDone}>{task.title}</Text>
    </List.Item>
  );
}
