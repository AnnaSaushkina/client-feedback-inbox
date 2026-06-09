import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Tag, Typography, Popconfirm, Dropdown } from "antd";
import type { Task } from "../../types";
import { getDeadlineColor, formatDeadline } from "../../utils";

const { Text } = Typography;

const tagStyle = { fontSize: 11, margin: 0 };

interface KanbanCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function KanbanCard({ task, onOpen, onToggle, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  const menu = {
    items: [
      {
        key: "delete",
        label: (
          <Popconfirm
            title="Удалить задачу?"
            description="Это действие нельзя отменить"
            onConfirm={() => onDelete(task.id)}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
          >
            <span style={{ color: "#ff4d4f" }}>Удалить</span>
          </Popconfirm>
        ),
      },
    ],
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        opacity: isDragging ? 0 : 1,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        onClick={isDragging ? undefined : () => onOpen(task)}
        style={{
          background: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "10px 12px",
          marginBottom: 8,
          cursor: isDragging ? "grabbing" : "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          transition: "border-color 0.15s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
            {task.title}
          </Text>

          <div
            style={{ display: "flex", gap: 4, flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Popconfirm
              title="Отметить как выполненную?"
              onConfirm={() => onToggle(task.id)}
              okText="Да"
              cancelText="Нет"
            >
              <span
                title="Выполнено"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "1.5px solid #555",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#666",
                  cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLSpanElement).style.borderColor =
                    "#52c41a";
                  (e.currentTarget as HTMLSpanElement).style.color = "#52c41a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLSpanElement).style.borderColor =
                    "#555";
                  (e.currentTarget as HTMLSpanElement).style.color = "#666";
                }}
              >
                ✓
              </span>
            </Popconfirm>

            <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
              <span
                title="Настройки"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#444",
                  cursor: "pointer",
                  lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLSpanElement).style.color = "#aaa")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLSpanElement).style.color = "#444")
                }
              >
                ⋯
              </span>
            </Dropdown>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {task.ticketNumber && (
            <Tag style={tagStyle}>#{task.ticketNumber}</Tag>
          )}
          {task.priority === "high" && (
            <Tag color="red" style={tagStyle}>
              🔴 Высокий
            </Tag>
          )}
          {task.deadline && (
            <Tag color={getDeadlineColor(task.deadline)} style={tagStyle}>
              ⏰ {formatDeadline(task.deadline)}
            </Tag>
          )}
          {task.assignee && (
            <Tag color="blue" style={tagStyle}>
              {task.assignee}
            </Tag>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KanbanCard);
