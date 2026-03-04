import { List, Button, Typography, Popconfirm, Grid, Space } from "antd";
import type { Task } from "../../types/Task";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskItem({ task, onDelete, onToggle }: TaskItemProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isDone = task.completed;

  const buttonStyle = {
    fontSize: isMobile ? 11 : 12,
    lineHeight: 1,
    padding: isMobile ? "0 2px" : "0 4px",
    height: "auto",
  };

  const toggleButton = (
    <Popconfirm
      overlayClassName="compact-popconfirm"
      title={isDone ? "Вернуть в активные?" : "Отметить как выполненную?"}
      onConfirm={() => onToggle(task.id)}
      okText="Да"
      cancelText="Нет"
    >
      <Button type="text" size="small" style={buttonStyle}>
        {isDone ? "Вернуть" : "Выполнено?"}
      </Button>
    </Popconfirm>
  );

  const deleteButton = isDone ? (
    <Button
      danger
      type="text"
      size="small"
      style={buttonStyle}
      onClick={() => onDelete(task.id)}
    >
      Удалить
    </Button>
  ) : (
    <Popconfirm
      overlayClassName="compact-popconfirm"
      title="Удалить задачу?"
      description="Это действие нельзя отменить"
      onConfirm={() => onDelete(task.id)}
      okText="Удалить"
      cancelText="Отмена"
      okButtonProps={{ danger: true }}
    >
      <Button danger type="text" size="small" style={buttonStyle}>
        Удалить
      </Button>
    </Popconfirm>
  );

  // Мобильная версия
  if (isMobile) {
    return (
      <List.Item style={{ padding: "6px 0" }}>
        <div style={{ width: "100%" }}>
          <Text delete={isDone} style={{ fontSize: 14 }}>
            {task.title}
          </Text>

          <Space size={4} style={{ marginTop: 4 }}>
            {toggleButton}
            {deleteButton}
          </Space>
        </div>
      </List.Item>
    );
  }

  // Десктоп
  return (
    <List.Item actions={[toggleButton, deleteButton]}>
      <Text delete={isDone} style={{ fontSize: 16 }}>
        {task.title}
      </Text>
    </List.Item>
  );
}
