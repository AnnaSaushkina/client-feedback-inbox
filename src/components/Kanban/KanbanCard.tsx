import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Tag, Typography, Popconfirm } from "antd";
import type { Task } from "../../types";
import { getDeadlineColor, formatDeadline } from "../../utils";

const { Text } = Typography;

interface KanbanCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onToggle: (id: string) => void;
}

function KanbanCard({ task, onOpen, onToggle }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</Text>
          <Popconfirm
            title="Отметить как выполненную?"
            onConfirm={(e) => { e?.stopPropagation(); onToggle(task.id); }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Да"
            cancelText="Нет"
          >
            <span
              onClick={(e) => e.stopPropagation()}
              title="Выполнено"
              style={{
                flexShrink: 0,
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
                (e.currentTarget as HTMLSpanElement).style.borderColor = "#52c41a";
                (e.currentTarget as HTMLSpanElement).style.color = "#52c41a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.borderColor = "#555";
                (e.currentTarget as HTMLSpanElement).style.color = "#666";
              }}
            >
              ✓
            </span>
          </Popconfirm>
        </div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {task.ticketNumber && (
            <Tag style={{ fontSize: 11, margin: 0 }}>#{task.ticketNumber}</Tag>
          )}
          {task.priority === "high" && (
            <Tag color="red" style={{ fontSize: 11, margin: 0 }}>🔴 Высокий</Tag>
          )}
          {task.deadline && (
            <Tag color={getDeadlineColor(task.deadline)} style={{ fontSize: 11, margin: 0 }}>
              ⏰ {formatDeadline(task.deadline)}
            </Tag>
          )}
          {task.assignee && (
            <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>{task.assignee}</Tag>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KanbanCard);
