import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { Collapse, Card, Typography } from "antd";
import type { AppDispatch } from "../../store";
import { deleteTask, restoreFromArchive } from "../../store";
import type { Task } from "../../types";
import ArchiveItem from "./ArchiveItem";

const { Text } = Typography;

interface ArchiveSectionProps {
  tasks: Task[];
}

export default function ArchiveSection({ tasks }: ArchiveSectionProps) {
  const dispatch = useDispatch<AppDispatch>();

  const byDate = useMemo(
    () =>
      tasks.reduce<Record<string, Task[]>>((acc, task) => {
        const key = task.completedAt
          ? new Date(task.completedAt).toLocaleDateString("ru", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Без даты";
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {}),
    [tasks],
  );

  if (tasks.length === 0) return null;

  return (
    <Collapse
      ghost
      items={[
        {
          key: "archive",
          label: (
            <Text style={{ fontSize: 16, fontWeight: 600, color: "#666" }}>
              Архив ({tasks.length})
            </Text>
          ),
          children: (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(byDate)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, dateTasks]) => (
                  <Card
                    key={date}
                    size="small"
                    title={
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {date}
                      </Text>
                    }
                    styles={{ header: { minHeight: 36 } }}
                  >
                    {dateTasks.map((task) => (
                      <ArchiveItem
                        key={task.id}
                        task={task}
                        onRestore={(id) => dispatch(restoreFromArchive(id))}
                        onDelete={(id) => dispatch(deleteTask(id))}
                      />
                    ))}
                  </Card>
                ))}
            </div>
          ),
        },
      ]}
    />
  );
}
