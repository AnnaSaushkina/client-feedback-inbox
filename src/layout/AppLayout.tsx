import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  restoreFromArchive,
  selectTasks,
} from "../store";
import { Button, message, Typography } from "antd";
import {
  SoundOutlined,
  AudioMutedOutlined,
  TeamOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ArchiveSection from "../components/Archive/ArchiveSection";
import DoneSection from "../components/Archive/DoneSection";
import KanbanBoard from "../features/kanban/KanbanBoard";
import AssigneeManager from "../components/Assignees/AssigneeManager";
import type { Task } from "../types";
import { useSoundSettings } from "../contexts";
import { useInstallPrompt } from "../hooks";
import { sortByScore } from "../utils";
import { buildReport } from "../features/tasks/report";

const TaskEditor = lazy(() => import("../features/tasks/TaskEditor"));
const TaskCard = lazy(() => import("../features/tasks/TaskCard"));

const { Text } = Typography;

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
  textarea.style.cssText =
    "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("Не удалось скопировать текст");
}

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector(selectTasks);
  const { muted, toggleMuted } = useSoundSettings();
  const { canInstall, handleInstall } = useInstallPrompt();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [assigneeManagerOpen, setAssigneeManagerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const doneTasks = useMemo(
    () =>
      sortByScore(tasks.filter((t) => t.completed && isToday(t.completedAt))),
    [tasks],
  );
  const archivedTasks = useMemo(
    () => tasks.filter((t) => t.completed && !isToday(t.completedAt)),
    [tasks],
  );

  const handleCopyReport = async () => {
    try {
      await copyToClipboard(buildReport(activeTasks, doneTasks));
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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Text
          type="secondary"
          style={{ fontSize: 18, textTransform: "capitalize" }}
        >
          {today}
        </Text>
        <Button size="large" onClick={() => setIsEditorOpen(true)}>
          Добавить задачу +
        </Button>
        <Button
          size="large"
          icon={muted ? <AudioMutedOutlined /> : <SoundOutlined />}
          onClick={toggleMuted}
          title={muted ? "Включить звук" : "Выключить звук"}
        />
        <Button
          size="large"
          icon={<TeamOutlined />}
          onClick={() => setAssigneeManagerOpen(true)}
          title="Управление исполнителями"
        />
        {canInstall && (
          <Button
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleInstall}
            title="Установить приложение"
          />
        )}
      </div>

      <KanbanBoard
        onOpen={setSelectedTask}
        onToggle={(id) => dispatch(toggleTask(id))}
        onDelete={(id) => dispatch(deleteTask(id))}
      />

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

      <Button
        onClick={handleCopyReport}
        style={{ marginTop: 20, marginBottom: 32 }}
      >
        Скопировать отчёт
      </Button>

      <ArchiveSection tasks={archivedTasks} />

      <AssigneeManager
        open={assigneeManagerOpen}
        onClose={() => setAssigneeManagerOpen(false)}
      />

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
