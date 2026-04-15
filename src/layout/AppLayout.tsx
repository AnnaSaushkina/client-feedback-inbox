import { useState } from "react";
import { Button, message, Typography, Card, Collapse } from "antd";
import { useTasks } from "../hooks/useTasks";
import TaskSection from "../components/Board/TaskSection";
import TaskEditor from "../components/Task/TaskEditor";
import TaskCard from "../components/Task/TaskCard";
import ArchiveItem from "../components/Archive/ArchiveItem";
import type { Task } from "../types/Task";

const { Text } = Typography;

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const getTaskScore = (task: Task): number => {
  const priorityScore = PRIORITY_ORDER[task.priority ?? "low"];
  if (!task.deadline) return priorityScore * 100 + 50;
  const diff = new Date(task.deadline).getTime() - Date.now();
  if (diff < 0) return priorityScore * 100 + 0;
  if (diff < 1000 * 60 * 60 * 24) return priorityScore * 100 + 1;
  return priorityScore * 100 + 2;
};

export default function AppLayout() {
  const {
    activeTasks,
    doneTasks,
    archivedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    restoreFromArchive,
  } = useTasks();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortByScore = (tasks: Task[]) =>
    [...tasks].sort((a, b) => getTaskScore(a) - getTaskScore(b));

  const handleCopyReport = async () => {
    const today = new Date().toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });
    const doneLines = doneTasks.map((t) => `— ${t.ticketNumber || t.title}`).join("\n");
    const activeLines = activeTasks
      .filter((t) => t.status !== "waiting_comment")
      .map((t) => {
        const label = t.ticketNumber || t.title;
        if (!t.deadline) return `— ${label}`;
        const date = new Date(t.deadline).toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });
        return `— ${label} · ${date}`;
      })
      .join("\n");
    const text = `Сегодня [${today}] сделали:\n${doneLines || "—"}\n\nНа завтра:\n${activeLines || "— нет задач"}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      message.success("Отчёт скопирован", 1.5);
    } catch {
      message.error("Не удалось скопировать отчёт", 2);
    }
  };

  const today = new Date().toLocaleDateString("ru", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Группируем архив по дате выполнения
  const archiveByDate = archivedTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = task.completedAt
      ? new Date(task.completedAt).toLocaleDateString("ru", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "Без даты";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
      {/* Шапка */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Text type="secondary" style={{ fontSize: 18, textTransform: "capitalize" }}>
          {today}
        </Text>
        <Button size="large" onClick={() => setIsEditorOpen(true)}>Добавить задачу</Button>
      </div>

      {/* Основной реестр */}
      <div style={{ marginTop: 8 }}>
        <TaskSection
          title="Активные задачи"
          tasks={sortByScore(activeTasks)}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onOpen={setSelectedTask}
        />
        <TaskSection
          title={`Выполнено сегодня`}
          tasks={sortByScore(doneTasks)}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onOpen={setSelectedTask}
        />
      </div>

      <Button onClick={handleCopyReport} style={{ marginBottom: 32 }}>
        Скопировать отчёт
      </Button>

      {/* Архив */}
      {archivedTasks.length > 0 && (
        <Collapse
          ghost
          items={[{
            key: "archive",
            label: (
              <Text style={{ fontSize: 16, fontWeight: 600, color: "#666" }}>
                Архив ({archivedTasks.length})
              </Text>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(archiveByDate)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([date, tasks]) => (
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
                      {tasks.map((task) => (
                        <ArchiveItem
                          key={task.id}
                          task={task}
                          onRestore={restoreFromArchive}
                          onDelete={deleteTask}
                        />
                      ))}
                    </Card>
                  ))}
              </div>
            ),
          }]}
        />
      )}

      <TaskEditor
        open={isEditorOpen}
        onSubmit={(task) => { addTask(task); setIsEditorOpen(false); }}
        onCancel={() => setIsEditorOpen(false)}
      />

      <TaskCard
        key={selectedTask?.id}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={(task) => { updateTask(task); setSelectedTask(null); }}
      />
    </div>
  );
}
