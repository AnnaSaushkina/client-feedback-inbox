import { Tag } from "antd";
import type { Task } from "../../types";
import { getDeadlineColor, formatDeadline } from "../../utils";

const PRIORITY_COLOR: Record<string, string> = { low: "default", high: "red" };
const PRIORITY_LABEL: Record<string, string> = {
  low: "⚪ Низкий",
  high: "🔴 Высокий",
};

const STATUS_TAG: Record<string, { color?: string; label: string }> = {
  свободно: { color: "success", label: "🟢 Можно взять в работу" },
  в_работе: { color: "processing", label: "🔵 В работе" },
  ожидание: { label: "💬 Ждём с ОС" },
  тестирование: { color: "purple", label: "✅ Сделано. Тестируется" },
};

const tagStyle = { fontSize: 14 };

interface TaskStatusProps {
  task: Task;
}

export default function TaskStatus({ task }: TaskStatusProps) {
  const status = task.status ?? "свободно";
  const statusTag = STATUS_TAG[status];

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {task.ticketNumber && (
        <Tag style={{ fontSize: 15, fontWeight: 600, padding: "3px 12px" }}>
          #{task.ticketNumber}
        </Tag>
      )}
      {statusTag && (
        <Tag color={statusTag.color} style={tagStyle}>
          {statusTag.label}
        </Tag>
      )}
      {task.priority && (
        <Tag color={PRIORITY_COLOR[task.priority]} style={tagStyle}>
          {PRIORITY_LABEL[task.priority]}
        </Tag>
      )}
      {task.assignee && (
        <Tag color="blue" style={tagStyle}>
          {task.assignee}
        </Tag>
      )}
      {task.deadline && (
        <Tag color={getDeadlineColor(task.deadline)} style={tagStyle}>
          ⏰ {formatDeadline(task.deadline)}
        </Tag>
      )}
    </div>
  );
}
