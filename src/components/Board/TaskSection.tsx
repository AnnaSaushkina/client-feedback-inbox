import { Card, List, Empty, Grid } from "antd";
import type { Task } from "../../types/Task";
import TaskItem from "./TaskItem";

const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      title={title}
      size={isMobile ? "small" : "default"}
      style={{
        marginBottom: isMobile ? 16 : 24,
      }}
      bodyStyle={{
        padding: isMobile ? 12 : 24,
      }}
      headStyle={{
        padding: isMobile ? "0 12px" : undefined,
      }}
    >
      {tasks.length === 0 ? (
        <Empty
          description="Список пуст"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            margin: isMobile ? "12px 0" : "24px 0",
          }}
        />
      ) : (
        <List
          size={isMobile ? "small" : "default"}
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
      )}
    </Card>
  );
}
