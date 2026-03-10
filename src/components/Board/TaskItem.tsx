import { useState } from "react";
import { List, Button, Typography, Tag, Tooltip, Popconfirm } from "antd";
import type { Task } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";

const { Text } = Typography;

const priorityColor = { low: "green", medium: "orange", high: "red" };
const priorityLabel = { low: "Низкий", medium: "Средний", high: "Высокий" };

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
  const isDone = task.completed;
  const [hovered, setHovered] = useState(false);

  // Выполненная задача
  if (isDone) {
    return (
      <List.Item
        style={{
          borderLeft:
            task.priority === "high"
              ? "3px solid #ff4d4f"
              : "3px solid transparent",
          paddingLeft: task.priority === "high" ? 10 : 10,
        }}
        actions={[
          <Popconfirm
            title="Вернуть в активные?"
            onConfirm={(e) => {
              e?.stopPropagation();
              onToggle(task.id);
            }}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              size="small"
              onClick={(e) => e.stopPropagation()}
            >
              Вернуть
            </Button>
          </Popconfirm>,
          <Popconfirm
            title="Удалить задачу?"
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete(task.id);
            }}
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
        ]}
      >
        <Tooltip title="Посмотреть подробнее">
          <div
            onClick={() => onOpen(task)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              cursor: "pointer",
              transition: "transform 0.15s ease",
              transform: hovered ? "scale(1.02)" : "scale(1)",
              display: "flex",
              gap: 8,
              alignItems: "baseline",
            }}
          >
            <Text type="secondary">—</Text>
            <Text>{task.ticketNumber || task.title}</Text>
            {task.description && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {task.description.slice(0, 60)}
                {task.description.length > 60 ? "..." : ""}
              </Text>
            )}
          </div>
        </Tooltip>
      </List.Item>
    );
  }

  return (
    <List.Item
      style={{
        borderLeft:
          task.priority === "high"
            ? "3px solid #ff4d4f"
            : "3px solid transparent",
        paddingLeft: task.priority === "high" ? 10 : 10,
      }}
      actions={[
        <Popconfirm
          title={isDone ? "Вернуть в активные?" : "Отметить как выполненную?"}
          onConfirm={(e) => {
            e?.stopPropagation();
            onToggle(task.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="text" size="small" onClick={(e) => e.stopPropagation()}>
            {isDone ? "Вернуть" : "Выполнено?"}
          </Button>
        </Popconfirm>,

        <Popconfirm
          title="Удалить задачу?"
          description="Это действие нельзя отменить"
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(task.id);
          }}
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
      ]}
    >
      <Tooltip title="Посмотреть подробнее">
        <div
          onClick={() => onOpen(task)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            cursor: "pointer",
            transition: "transform 0.15s ease",
            transform: hovered ? "scale(1.02)" : "scale(1)",
          }}
        >
          <Text delete={isDone}>{task.title}</Text>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {task.ticketNumber && <Tag>#{task.ticketNumber}</Tag>}
            {task.priority && (
              <Tag color={priorityColor[task.priority]}>
                {priorityLabel[task.priority]}
              </Tag>
            )}
            {task.assignee && <Tag color="blue">{task.assignee}</Tag>}
            {task.deadline && (
              <Tag color={getDeadlineColor(task.deadline)}>
                ⏰ {formatDeadline(task.deadline)}
              </Tag>
            )}
          </div>

          {task.screenshots && task.screenshots.length > 0 && (
            <img
              src={task.screenshots[0]}
              alt="превью"
              style={{ height: 60, borderRadius: 4, objectFit: "cover" }}
            />
          )}
        </div>
      </Tooltip>
    </List.Item>
  );
}
