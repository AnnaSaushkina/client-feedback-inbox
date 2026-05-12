import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Typography } from "antd";
import type { Task, TaskStatus } from "../../types/Task";
import KanbanCard from "./KanbanCard";

const { Text } = Typography;

const COLUMN_COLORS: Record<TaskStatus, string> = {
  свободно: "#52c41a",
  в_работе: "#1677ff",
  waiting_comment: "#555",
  тестирование: "#722ed1",
};

const COLUMN_LABELS: Record<TaskStatus, string> = {
  свободно: "🟢 Можно взять в работу",
  в_работе: "🔵 В работе",
  waiting_comment: "💬 Ждём с ОС",
  тестирование: "✅ Сделано. Тестируется",
};

export type ColumnValidity = "valid" | "invalid" | "same" | null;

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onOpen: (task: Task) => void;
  validity: ColumnValidity;
}

const VALIDITY_STYLE: Record<Exclude<ColumnValidity, null>, React.CSSProperties> = {
  valid:   { borderColor: "#52c41a", background: "rgba(82,196,26,0.07)" },
  invalid: { borderColor: "#ff4d4f", background: "rgba(255,77,79,0.07)", opacity: 0.6 },
  same:    { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" },
};

function KanbanColumn({ status, tasks, onOpen, validity }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: validity === "invalid" });

  const borderColor = validity
    ? VALIDITY_STYLE[validity].borderColor
    : isOver
    ? COLUMN_COLORS[status]
    : "rgba(255,255,255,0.06)";

  const background = validity
    ? VALIDITY_STYLE[validity].background
    : isOver
    ? "rgba(255,255,255,0.03)"
    : "rgba(255,255,255,0.01)";

  return (
    <div
      className="kanban-column"
      style={{
        flex: 1,
        minWidth: 160,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: validity === "invalid" ? 0.55 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "nowrap", overflow: "hidden" }}>
        <div style={{ flexShrink: 0, width: 3, height: 18, borderRadius: 2, background: COLUMN_COLORS[status] }} />
        <Text style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {COLUMN_LABELS[status]}
        </Text>
        <Text type="secondary" style={{ fontSize: 13, flexShrink: 0, whiteSpace: "nowrap" }}>
          ({tasks.length})
        </Text>
        {validity === "valid" && (
          <Text style={{ fontSize: 11, color: "#52c41a", flexShrink: 0 }}>← сюда</Text>
        )}
        {validity === "invalid" && (
          <Text style={{ fontSize: 11, color: "#ff4d4f", flexShrink: 0 }}>✕</Text>
        )}
      </div>

      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: 120,
          padding: 8,
          borderRadius: 10,
          border: `1px solid ${borderColor}`,
          background,
          transition: "border-color 0.15s, background 0.15s",
          position: "relative",
        }}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onOpen={onOpen} />
        ))}

        {tasks.length === 0 && (
          <Text type="secondary" style={{ fontSize: 12, padding: "8px 4px", display: "block" }}>
            {validity === "valid" ? "Перетащи сюда" : "Список пуст"}
          </Text>
        )}
      </div>
    </div>
  );
}

export default memo(KanbanColumn);
