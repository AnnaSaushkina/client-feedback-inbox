import { useState } from "react";
import { Button, message, Typography } from "antd";
import { useTasks } from "../hooks/useTasks";
import TaskSection from "../components/Board/TaskSection";
import TaskEditor from "../components/Task/TaskEditor";
import TaskCard from "../components/Task/TaskCard";
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
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTasks();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortByScore = (tasks: Task[]) =>
    [...tasks].sort(
      (taskA, taskB) => getTaskScore(taskA) - getTaskScore(taskB),
    );

  const handleCopyReport = () => {
    const today = new Date().toLocaleDateString("ru", {
      day: "2-digit",
      month: "2-digit",
    });

    const doneLines = doneTasks
      .map((task) => `— ${task.ticketNumber || task.title}`)
      .join("\n");

    const activeLines = activeTasks
      .filter((task) => task.deadline)
      .map((task) => {
        const date = new Date(task.deadline!).toLocaleDateString("ru", {
          day: "2-digit",
          month: "2-digit",
        });
        return `— ${task.ticketNumber || task.title} · ${date}`;
      })
      .join("\n");

    navigator.clipboard.writeText(
      `Сегодня [${today}] сделали:\n${doneLines || "—"}\n\nНа завтра:\n${activeLines || "— нет задач"}`,
    );
    message.success("Отчёт скопирован", 1.5);
  };

  const today = new Date().toLocaleDateString("ru", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Text
          type="secondary"
          style={{ fontSize: 16, textTransform: "capitalize" }}
        >
          {today}
        </Text>
        <Button onClick={() => setIsEditorOpen(true)}>Добавить задачу</Button>
      </div>

      <div style={{ marginTop: 8 }}>
        <TaskSection
          title="Активные задачи"
          tasks={sortByScore(activeTasks)}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onOpen={setSelectedTask}
        />
        <TaskSection
          title="Выполненные задачи"
          tasks={sortByScore(doneTasks)}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onOpen={setSelectedTask}
        />
      </div>

      <TaskEditor
        open={isEditorOpen}
        onSubmit={(task) => {
          addTask(task);
          setIsEditorOpen(false);
        }}
        onCancel={() => setIsEditorOpen(false)}
      />

      <TaskCard
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={(task) => {
          updateTask(task);
          setSelectedTask(null);
        }}
      />

      <Button onClick={handleCopyReport}>Скопировать отчёт</Button>
    </div>
  );
}
