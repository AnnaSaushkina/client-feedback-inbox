import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "../store/index";
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  restoreFromArchive,
  selectTasks,
} from "../store/tasksSlice";
import { Button, message, Typography, Card, Collapse, Segmented } from "antd";
import TaskSection from "../components/Board/BoardSection";
import ArchiveItem from "../components/Archive/ArchiveItem";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import type { Task } from "../types/Task";

const TaskEditor = lazy(() => import("../components/Task/TaskEditor"));
const TaskCard = lazy(() => import("../components/Task/TaskCard"));

const { Text } = Typography;

const STATUS_ORDER: Record<string, number> = {
  свободно: 0,
  тестирование: 1,
  в_работе: 2,
  waiting_comment: 3,
};
const PRIORITY_ORDER: Record<string, number> = { high: 0, low: 1 };

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

const getTaskScore = (task: Task): number => {
  const statusScore = STATUS_ORDER[task.status ?? "свободно"] ?? 2;
  const priorityScore = PRIORITY_ORDER[task.priority ?? "low"] ?? 1;
  const diff = task.deadline ? new Date(task.deadline).getTime() - Date.now() : null;
  const deadlineScore = diff === null ? 50 : diff < 0 ? 0 : diff < 864e5 ? 1 : 2;
  return statusScore * 1000 + priorityScore * 100 + deadlineScore;
};

const sortByScore = (tasks: Task[]) =>
  [...tasks].sort((a, b) => getTaskScore(a) - getTaskScore(b));

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector(selectTasks);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.completed && isToday(t.completedAt)),
    [tasks],
  );
  const archivedTasks = useMemo(
    () => tasks.filter((t) => t.completed && !isToday(t.completedAt)),
    [tasks],
  );

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<"board" | "kanban">("board");

  const copyText = (text: string): boolean => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  };

  const handleCopyReport = async () => {
    const today = new Date().toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });

    const label = (t: Task) => {
      const name = t.ticketNumber || t.title;
      if (!t.deadline) return `— ${name}`;
      const date = new Date(t.deadline).toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });
      return `— ${name} · ${date}`;
    };

    const free = activeTasks.filter((t) => (t.status ?? "свободно") === "свободно");
    const inWork = activeTasks.filter((t) => t.status === "в_работе");
    const waiting = activeTasks.filter((t) => t.status === "waiting_comment");
    const testing = activeTasks.filter((t) => t.status === "тестирование");

    const doneLines = doneTasks.map((t) => `— ${t.ticketNumber || t.title}`).join("\n");

    const sections: string[] = [];
    if (free.length)    sections.push(`На завтра.\n${free.map(label).join("\n")}`);
    if (inWork.length)  sections.push(`На завтра. В работе:\n${inWork.map(label).join("\n")}`);
    if (waiting.length) sections.push(`Ждём с ОС:\n${waiting.map((t) => `— ${t.ticketNumber || t.title}`).join("\n")}`);
    if (testing.length) sections.push(`Тестируется:\n${testing.map((t) => `— ${t.ticketNumber || t.title} (сделали. проверяется)`).join("\n")}`);

    const text = `Сегодня [${today}] сделали:\n${doneLines || "—"}\n\n${sections.join("\n\n") || "— нет активных задач"}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else if (!copyText(text)) {
        throw new Error();
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

  const archiveByDate = useMemo(
    () =>
      archivedTasks.reduce<Record<string, Task[]>>((acc, task) => {
        const dateKey = task.completedAt
          ? new Date(task.completedAt).toLocaleDateString("ru", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Без даты";
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
        return acc;
      }, {}),
    [archivedTasks],
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
      <div
        style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
      >
        <Text type="secondary" style={{ fontSize: 18, textTransform: "capitalize" }}>
          {today}
        </Text>
        <Button size="large" onClick={() => setIsEditorOpen(true)}>
          Добавить задачу +
        </Button>
        <Segmented
          value={view}
          onChange={(v) => setView(v as "board" | "kanban")}
          options={[
            { label: "Список", value: "board" },
            { label: "Канбан", value: "kanban" },
          ]}
        />
      </div>

      {view === "kanban" ? (
        <div style={{ marginTop: 8, marginBottom: 32 }}>
          <KanbanBoard onOpen={setSelectedTask} />
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          <TaskSection
            title="Активные задачи"
            tasks={sortByScore(activeTasks)}
            onDelete={(id) => dispatch(deleteTask(id))}
            onToggle={(id) => dispatch(toggleTask(id))}
            onOpen={setSelectedTask}
          />
          <TaskSection
            title="Выполнено сегодня"
            tasks={sortByScore(doneTasks)}
            onDelete={(id) => dispatch(deleteTask(id))}
            onToggle={(id) => dispatch(toggleTask(id))}
            onOpen={setSelectedTask}
          />
        </div>
      )}

      <Button onClick={handleCopyReport} style={{ marginBottom: 32 }}>
        Скопировать отчёт
      </Button>

      {archivedTasks.length > 0 && (
        <Collapse
          ghost
          items={[
            {
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
      )}

      <Suspense fallback={null}>
        <TaskEditor
          open={isEditorOpen}
          onSubmit={(task) => {
            dispatch(addTask(task));
            setIsEditorOpen(false);
          }}
          onCancel={() => setIsEditorOpen(false)}
        />

        <TaskCard
          key={selectedTask?.id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(task) => {
            dispatch(updateTask(task));
            setSelectedTask(null);
          }}
        />
      </Suspense>
    </div>
  );
}
