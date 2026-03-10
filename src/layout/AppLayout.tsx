import { Button, message, Typography } from "antd";
const { Text } = Typography;
import { useState } from "react";
import TaskSection from "../components/Board/TaskSection";
import TaskEditorWindow from "../components/TaskEditorWindow/TaskEditorWindow";
import TaskCard from "../components/Board/TaskCard";
import Filter from "../components/Filter/Filter";
import type { Task, Priority, Assignee } from "../types/Task";
import { useTasks } from "../hooks/useTasks";

const priorityOrder = { high: 0, medium: 1, low: 2 };

export default function AppLayout() {
  const { activeTasks, doneTasks, saveTask, deleteTask, toggleTask } =
    useTasks();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Состояние фильтров
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<Assignee | null>(null);

  // Применяем фильтры и сортировку
  const applyFilters = (tasks: Task[]) => {
    let result = tasks;

    if (search) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filterPriority) {
      result = result.filter((t) => t.priority === filterPriority);
    }

    if (filterAssignee) {
      result = result.filter((t) => t.assignee === filterAssignee);
    }

    // Автосортировка по срочности
    return [...result].sort((a, b) => {
      const now = Date.now();

      const getScore = (task: Task) => {
        const priorityScore = priorityOrder[task.priority ?? "low"]; // 0, 1, 2

        if (!task.deadline) return priorityScore * 100 + 50; // без дедлайна — по приоритету

        const diff = new Date(task.deadline).getTime() - now;

        if (diff < 0) return priorityScore * 100 + 0; // просрочен — наверх в своём приоритете
        if (diff < 1000 * 60 * 60 * 24) return priorityScore * 100 + 1; // горит
        return priorityScore * 100 + 2; // обычный
      };

      return getScore(a) - getScore(b);
    });
  };

  const filteredActive = applyFilters(activeTasks);
  const filteredDone = applyFilters(doneTasks);

  const handleSubmit = async (task: Task) => {
    await saveTask(task);
    setIsEditorOpen(false);
  };

  const handleCopyReport = () => {
    const today = new Date().toLocaleDateString("ru", {
      day: "2-digit",
      month: "2-digit",
    });

    const doneLines = doneTasks
      .map((t) => `— ${t.ticketNumber || t.title}`)
      .join("\n");

    const activeLines = activeTasks
      .filter((t) => t.deadline)
      .map((t) => {
        const date = new Date(t.deadline!).toLocaleDateString("ru", {
          day: "2-digit",
          month: "2-digit",
        });
        return `— ${t.ticketNumber || t.title} · ${date}`;
      })
      .join("\n");

    const report = `Сегодня [${today}] сделали:\n${doneLines || "—"}\n\nНа завтра:\n${activeLines || "— нет задач"}`;

    navigator.clipboard.writeText(report);
    message.success("Отчёт скопирован", 1.5); // 1.5 секунды
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
      <Button
        onClick={() => setIsEditorOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Добавить задачу
      </Button>

      <Filter
        onSearch={setSearch}
        onPriority={setFilterPriority}
        onAssignee={setFilterAssignee}
      />

      <div style={{ marginTop: 8 }}>
        <TaskSection
          title="Активные задачи"
          tasks={filteredActive}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onOpen={setSelectedTask}
        />
        <TaskSection
          title="Выполненные задачи"
          tasks={filteredDone}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onOpen={setSelectedTask}
        />
      </div>

      <TaskEditorWindow
        open={isEditorOpen}
        onSubmit={handleSubmit}
        onCancel={() => setIsEditorOpen(false)}
      />

      <TaskCard
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={async (task) => {
          await saveTask(task);
          setSelectedTask(null);
        }}
      />
      <Button onClick={handleCopyReport}>Скопировать отчёт</Button>
    </div>
  );
}
