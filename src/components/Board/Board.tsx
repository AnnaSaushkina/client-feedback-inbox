import type { Task } from "../../types/Task";
import TaskSection from "./TaskSection";

interface BoardProps {
  activeTasks: Task[];
  doneTasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function Board({
  activeTasks,
  doneTasks,
  onDelete,
  onToggle,
}: BoardProps) {
  return (
    <div style={{ marginTop: 24 }}>
      <TaskSection
        title="Активные задачи"
        tasks={activeTasks}
        onDelete={onDelete}
        onToggle={onToggle}
      />

      <TaskSection
        title="Выполненные задачи"
        tasks={doneTasks}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    </div>
  );
}
