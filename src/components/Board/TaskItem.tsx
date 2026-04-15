import { useState } from "react";
import { Button, Typography, Tag, Tooltip, Popconfirm } from "antd";
import type { Task } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";
import { renderWithLinks } from "../../utils/links";

const { Text } = Typography;

const STATUS_BORDER: Record<string, string> = {
  свободно: "#52c41a",
  в_работе: "#1677ff",
  waiting_comment: "transparent",
};

const STATUS_BG: Record<string, string> = {
  свободно: "rgba(82,196,26,0.07)",
  в_работе: "rgba(22,119,255,0.07)",
  waiting_comment: "transparent",
};

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

export default function TaskItem({ task, onDelete, onToggle, onOpen }: TaskItemProps) {
  const [hovered, setHovered] = useState(false);
  const isDone = task.completed;
  const taskStatus = task.status ?? "свободно";
  const isWaiting = taskStatus === "waiting_comment";

  const shortDescription = task.description
    ? task.description.slice(0, 120) + (task.description.length > 120 ? "..." : "")
    : null;

  const tags = [
    task.ticketNumber && (
      <Tag key="ticket" style={{ fontSize: 13, fontWeight: 600 }}>
        #{task.ticketNumber}
      </Tag>
    ),
    !isDone && taskStatus === "свободно" && (
      <Tag
        key="status"
        color="success"
        style={{ fontSize: 14, fontWeight: 700, padding: "2px 12px", letterSpacing: 0.3 }}
      >
        🆕 Свободно
      </Tag>
    ),
    !isDone && taskStatus === "в_работе" && (
      <Tag key="status" color="processing" style={{ fontSize: 13, fontWeight: 600, padding: "2px 10px" }}>
        🔵 В работе
      </Tag>
    ),
    !isDone && isWaiting && (
      <Tag key="status" style={{ fontSize: 13 }}>💬 Ждём коммента</Tag>
    ),
    task.priority && (
      <Tag
        key="priority"
        style={{ fontSize: 12, opacity: 0.55, border: "1px solid #555", color: "#999", background: "transparent" }}
      >
        {task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "⚪"}{" "}
        {task.priority === "high" ? "Высокий" : task.priority === "medium" ? "Средний" : "Низкий"}
      </Tag>
    ),
    task.assignee && (
      <Tag key="assignee" color="blue" style={{ fontSize: 13 }}>{task.assignee}</Tag>
    ),
    task.deadline && (
      <Tag key="deadline" color={getDeadlineColor(task.deadline)} style={{ fontSize: 13 }}>
        ⏰ {formatDeadline(task.deadline)}
      </Tag>
    ),
  ].filter(Boolean);

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
      <Button type="text" size="small" danger onClick={(e) => e.stopPropagation()}>
        Удалить
      </Button>
    </Popconfirm>,
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "16px 14px 16px 12px",
        borderBottom: "1px solid rgba(5,5,5,0.06)",
        borderLeft: isDone
          ? "3px solid transparent"
          : `3px solid ${STATUS_BORDER[taskStatus] ?? "transparent"}`,
        background: isDone ? "transparent" : (STATUS_BG[taskStatus] ?? "transparent"),
        borderRadius: 4,
        opacity: isWaiting && !isDone ? 0.5 : 1,
        transition: "background 0.2s",
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
            gap: 16,
            cursor: "pointer",
            transition: "transform 0.15s ease",
            transform: hovered ? "scale(1.005)" : "scale(1)",
          }}
        >
          {isDone ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <Text type="secondary">—</Text>
              <Text style={{ fontSize: 16 }}>{task.ticketNumber || task.title}</Text>
              {shortDescription && (
                <Text type="secondary" style={{ fontSize: 13 }}>{shortDescription}</Text>
              )}
            </div>
          ) : (
            <>
              {/* Левая колонка: название + теги + скриншоты */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Text style={{ fontSize: 17, fontWeight: 600 }}>{task.title}</Text>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{tags}</div>
                {task.screenshots && task.screenshots.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {task.screenshots.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="превью"
                        style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Правая колонка: описание + дата последнего коммента */}
              {shortDescription && (
                <div
                  style={{
                    width: 220,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {renderWithLinks(shortDescription)}
                  </div>
                  {task.history && task.history.length > 0 && (
                    <span style={{ fontSize: 11, color: "#555" }}>
                      {new Date(task.history[task.history.length - 1].date).toLocaleDateString("ru", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Tooltip>

      <div style={{ display: "flex", gap: 4, marginLeft: 12, flexShrink: 0, paddingTop: 2 }}>
        {actions}
      </div>
    </div>
  );
}
