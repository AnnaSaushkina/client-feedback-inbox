import { useState } from "react";
import { Button, Typography, Tag, Tooltip, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { Task } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";
import { renderWithLinks } from "../../utils/links";

const { Text } = Typography;

const STATUS_BORDER: Record<string, string> = {
  свободно: "#52c41a",
  в_работе: "#1677ff",
  waiting_comment: "transparent",
  тестирование: "#722ed1",
};

const STATUS_BG: Record<string, string> = {
  свободно: "rgba(82,196,26,0.07)",
  в_работе: "rgba(22,119,255,0.07)",
  waiting_comment: "transparent",
  тестирование: "rgba(114,46,209,0.07)",
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
        style={{ fontSize: 13, fontWeight: 600, padding: "2px 10px" }}
      >
        🟢 Можно взять
      </Tag>
    ),
    !isDone && taskStatus === "в_работе" && (
      <Tag key="status" color="processing" style={{ fontSize: 13, fontWeight: 600, padding: "2px 10px" }}>
        🔵 В работе
      </Tag>
    ),
    !isDone && isWaiting && (
      <Tag key="status" style={{ fontSize: 13 }}>💬 Ждём с ОС</Tag>
    ),
    !isDone && taskStatus === "тестирование" && (
      <Tag key="status" color="purple" style={{ fontSize: 13, fontWeight: 600, padding: "2px 10px" }}>
        ✅ Тестируется
      </Tag>
    ),
    task.priority && (
      <Tag
        key="priority"
        style={{ fontSize: 12, opacity: 0.55, border: "1px solid #555", color: "#999", background: "transparent" }}
      >
        {task.priority === "high" ? "🔴" : "⚪"}{" "}
        {task.priority === "high" ? "Высокий" : "Низкий"}
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
      <Button
        type="text"
        size="small"
        danger
        icon={<CloseOutlined />}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "0 4px" }}
      />
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <Text type="secondary">—</Text>
              <Text style={{ fontSize: 16, whiteSpace: "nowrap" }}>{task.ticketNumber || task.title}</Text>
              {shortDescription && (
                <Text type="secondary" style={{ fontSize: 13 }}>{shortDescription}</Text>
              )}
            </div>
          ) : (
            <>
              {/* Левая колонка: название + теги */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <Text style={{ fontSize: 17, fontWeight: 600 }}>{task.title}</Text>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{tags}</div>
              </div>

              {/* Правая колонка: скриншоты + описание */}
              {(task.screenshots?.length || shortDescription) ? (
                <div style={{ flexShrink: 0, maxWidth: 240, display: "flex", flexDirection: "column", gap: 6, marginLeft: 4 }}>
                  {task.screenshots && task.screenshots.length > 0 && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {task.screenshots.slice(0, 3).map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt="превью"
                          style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        />
                      ))}
                      {task.screenshots.length > 3 && (
                        <div style={{
                          width: 68, height: 68, borderRadius: 6, flexShrink: 0,
                          background: "rgba(255,255,255,0.07)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, color: "#777",
                        }}>
                          +{task.screenshots.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  {shortDescription && (
                    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.5, wordBreak: "break-word",
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
                    }}>
                      {renderWithLinks(shortDescription)}
                    </div>
                  )}
                  {task.history && task.history.length > 0 && (
                    <span style={{ fontSize: 11, color: "#555" }}>
                      {new Date(task.history[task.history.length - 1].date).toLocaleDateString("ru", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ) : null}
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
