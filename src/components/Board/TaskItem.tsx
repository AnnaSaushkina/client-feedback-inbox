import { useState } from "react";
import { Button, Typography, Tag, Tooltip, Popconfirm } from "antd";
import type { Task } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";

const { Text } = Typography;

const PRIORITY_COLOR: Record<string, string> = {
  low: "green",
  medium: "orange",
  high: "red",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

export default function TaskItem({
  task,
  onDelete,
  onToggle,
  onOpen,
}: TaskItemProps) {
  const [hovered, setHovered] = useState(false);
  const isDone = task.completed;
  const isWaiting = task.status === "waiting_comment";


  // Теги для активной задачи
  const tags = [
    task.ticketNumber && <Tag key="ticket">#{task.ticketNumber}</Tag>,
    isWaiting
      ? <Tag key="status" color="default">💬 Ждём коммента</Tag>
      : task.priority && (
          <Tag key="priority" color={PRIORITY_COLOR[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Tag>
        ),
    task.assignee && (
      <Tag key="assignee" color="blue">
        {task.assignee}
      </Tag>
    ),
    task.deadline && (
      <Tag key="deadline" color={getDeadlineColor(task.deadline)}>
        ⏰ {formatDeadline(task.deadline)}
      </Tag>
    ),
  ].filter(Boolean);

  const shortDescription = task.description
    ? task.description.slice(0, 60) +
      (task.description.length > 60 ? "..." : "")
    : null;

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggle(task.id);
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onDelete(task.id);
  };

  const actions = [
    <Popconfirm
      key="toggle"
      title={isDone ? "Вернуть в активные?" : "Отметить как выполненную?"}
      onConfirm={handleToggle}
      onCancel={(e) => e?.stopPropagation()}
      okText="Да"
      cancelText="Нет"
    >
      <Button type="text" size="small" onClick={(e) => e.stopPropagation()}>
        {isDone ? "Вернуть" : "Выполнено?"}
      </Button>
    </Popconfirm>,

    <Popconfirm
      key="delete"
      title="Удалить задачу?"
      description={!isDone ? "Это действие нельзя отменить" : undefined}
      onConfirm={handleDelete}
      onCancel={(e) => e?.stopPropagation()}
      okText="Удалить"
      cancelText="Отмена"
      okButtonProps={{ danger: true }}
    >
      <Button
        type="text"
        size="small"
        danger
        onClick={(e) => e.stopPropagation()}
      >
        Удалить
      </Button>
    </Popconfirm>,
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid rgba(5,5,5,0.06)",
        borderLeft:
          task.priority === "high"
            ? "3px solid #ff4d4f"
            : "3px solid transparent",
        paddingLeft: 10,
        opacity: isWaiting ? 0.45 : 1,
      }}
    >
      <Tooltip title="Посмотреть подробнее">
        <div
          onClick={() => onOpen(task)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: isDone ? "row" : "column",
            alignItems: isDone ? "baseline" : undefined,
            gap: isDone ? 8 : 4,
            cursor: "pointer",
            transition: "transform 0.15s ease",
            transform: hovered ? "scale(1.02)" : "scale(1)",
          }}
        >
          {isDone ? (
            <>
              <Text type="secondary">—</Text>
              <Text>{task.ticketNumber || task.title}</Text>
              {shortDescription && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {shortDescription}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text>{task.title}</Text>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {tags}
              </div>
              {task.screenshots?.[0] && (
                <img
                  src={task.screenshots[0]}
                  alt="превью"
                  style={{ height: 60, borderRadius: 4, objectFit: "cover" }}
                />
              )}
            </>
          )}
        </div>
      </Tooltip>
      <div style={{ display: "flex", gap: 4, marginLeft: 8, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  );
}
