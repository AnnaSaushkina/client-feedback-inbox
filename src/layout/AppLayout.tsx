import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { fetchTasks, addTask, updateTask, deleteTask, toggleTask, restoreFromArchive, selectTasks } from "../store";
import { Button, message, Typography } from "antd";
import { SoundOutlined, AudioMutedOutlined, TeamOutlined, DownloadOutlined } from "@ant-design/icons";
import ArchiveSection from "../components/Archive/ArchiveSection";
import DoneSection from "../components/Archive/DoneSection";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import AssigneeManager from "../components/Assignees/AssigneeManager";
import type { Task } from "../types";
import { useSoundSettings } from "../contexts";
import { sortByScore } from "../utils";

const TaskEditor = lazy(() => import("../components/Task/TaskEditor"));
const TaskCard = lazy(() => import("../components/Task/TaskCard"));

const { Text } = Typography;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("copy failed");
}

function buildReport(activeTasks: Task[], doneTasks: Task[]): string {
  const today = new Date().toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });
  const label = (t: Task) => {
    const name = t.ticketNumber || t.title;
    if (!t.deadline) return `— ${name}`;
    const date = new Date(t.deadline).toLocaleDateString("ru", { day: "2-digit", month: "2-digit" });
    return `— ${name} · ${date}`;
  };
  const free    = activeTasks.filter((t) => (t.status ?? "свободно") === "свободно");
  const inWork  = activeTasks.filter((t) => t.status === "в_работе");
  const waiting = activeTasks.filter((t) => t.status === "waiting_comment");
  const testing = activeTasks.filter((t) => t.status === "тестирование");
  const doneLines = doneTasks.map((t) => `— ${t.ticketNumber || t.title}`).join("\n");
  const sections: string[] = [];
  if (free.length)    sections.push(`На завтра.\n${free.map(label).join("\n")}`);
  if (inWork.length)  sections.push(`На завтра. В работе:\n${inWork.map(label).join("\n")}`);
  if (waiting.length) sections.push(`Ждём с ОС:\n${waiting.map((t) => `— ${t.ticketNumber || t.title}`).join("\n")}`);
  if (testing.length) sections.push(`Тестируется:\n${testing.map((t) => `— ${t.ticketNumber || t.title} (сделали. проверяется)`).join("\n")}`);
  return `Сегодня [${today}] сделали:\n${doneLines || "—"}\n\n${sections.join("\n\n") || "— нет активных задач"}`;
}

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector(selectTasks);

  const activeTasks   = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const doneTasks     = useMemo(() => sortByScore(tasks.filter((t) => t.completed && isToday(t.completedAt))), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter((t) => t.completed && !isToday(t.completedAt)), [tasks]);

  useEffect(() => { dispatch(fetchTasks()); }, [dispatch]);

  const { muted, toggleMuted } = useSoundSettings();
  const [isEditorOpen, setIsEditorOpen]             = useState(false);
  const [selectedTask, setSelectedTask]             = useState<Task | null>(null);
  const [assigneeManagerOpen, setAssigneeManagerOpen] = useState(false);
  const [installPrompt, setInstallPrompt]           = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const handleCopyReport = async () => {
    try {
      await copyToClipboard(buildReport(activeTasks, doneTasks));
      message.success("Отчёт скопирован", 1.5);
    } catch {
      message.error("Не удалось скопировать отчёт", 2);
    }
  };

  const today = new Date().toLocaleDateString("ru", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Тулбар */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Text type="secondary" style={{ fontSize: 18, textTransform: "capitalize" }}>{today}</Text>
        <Button size="large" onClick={() => setIsEditorOpen(true)}>Добавить задачу +</Button>
        <Button size="large" icon={muted ? <AudioMutedOutlined /> : <SoundOutlined />} onClick={toggleMuted} title={muted ? "Включить звук" : "Выключить звук"} />
        <Button size="large" icon={<TeamOutlined />} onClick={() => setAssigneeManagerOpen(true)} title="Управление исполнителями" />
        {installPrompt && (
          <Button size="large" icon={<DownloadOutlined />} onClick={handleInstall} title="Установить приложение" />
        )}
      </div>

      {/* Канбан */}
      <KanbanBoard
        onOpen={setSelectedTask}
        onToggle={(id) => dispatch(toggleTask(id))}
      />

      {/* Выполнено сегодня */}
      {doneTasks.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <DoneSection
            tasks={doneTasks}
            onOpen={setSelectedTask}
            onRestore={(id) => dispatch(restoreFromArchive(id))}
            onDelete={(id) => dispatch(deleteTask(id))}
          />
        </div>
      )}

      {/* Кнопка отчёта */}
      <Button onClick={handleCopyReport} style={{ marginTop: 20, marginBottom: 32 }}>
        Скопировать отчёт
      </Button>

      {/* Архив */}
      <ArchiveSection tasks={archivedTasks} />

      <AssigneeManager open={assigneeManagerOpen} onClose={() => setAssigneeManagerOpen(false)} />

      <Suspense fallback={null}>
        <TaskEditor
          open={isEditorOpen}
          onSubmit={(task) => { dispatch(addTask(task)); setIsEditorOpen(false); }}
          onCancel={() => setIsEditorOpen(false)}
        />
        <TaskCard
          key={selectedTask?.id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(task) => { dispatch(updateTask(task)); setSelectedTask(null); }}
        />
      </Suspense>
    </div>
  );
}
