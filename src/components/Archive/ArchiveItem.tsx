import { Button, Tag, Typography, Popconfirm } from "antd";
import type { Task } from "../../types/Task";
import { renderWithLinks } from "../../utils/links";

const { Text } = Typography;

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ArchiveItemProps {
  task: Task;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ArchiveItem({ task, onRestore, onDelete }: ArchiveItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "14px 14px 14px 12px",
        borderBottom: "1px solid rgba(5,5,5,0.06)",
        borderLeft: "3px solid #555",
        opacity: 0.8,
      }}
    >
      <div style={{ flex: 1, display: "flex", gap: 16 }}>
        {/* Левая колонка */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: 600 }}>
              {task.title}
            </Text>
            {task.ticketNumber && (
              <Tag style={{ fontSize: 12 }}>#{task.ticketNumber}</Tag>
            )}
            {task.completedAt && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ✓ {formatDate(task.completedAt)}
              </Text>
            )}
          </div>

          {/* История */}
          {task.history && task.history.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {task.history.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, whiteSpace: "nowrap", marginTop: 2, minWidth: 80 }}
                  >
                    {formatShortDate(entry.date)}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5, whiteSpace: "pre-wrap" }}
                  >
                    {renderWithLinks(entry.text)}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginLeft: 12, flexShrink: 0 }}>
        <Popconfirm
          title="Вернуть задачу в работу?"
          onConfirm={() => onRestore(task.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="text" size="small">Вернуть</Button>
        </Popconfirm>
        <Popconfirm
          title="Удалить из архива?"
          description="Это действие нельзя отменить"
          onConfirm={() => onDelete(task.id)}
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" size="small" danger>Удалить</Button>
        </Popconfirm>
      </div>
    </div>
  );
}
