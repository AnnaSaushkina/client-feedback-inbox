import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Tag, Typography } from "antd";
import type { Task } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";

const { Text } = Typography;

interface KanbanCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

function KanbanCard({ task, onOpen }: KanbanCardProps) {
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
        <Text style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</Text>

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
