import { Button } from "antd";
import { useState } from "react";
import TaskSection from "../components/Board/TaskSection";
import TaskEditorWindow from "../components/TaskEditorWindow/TaskEditorWindow";
import type { Task } from "../types/Task";
import { useTasks } from "../hooks/useTasks";

export default function AppLayout() {
  const { activeTasks, doneTasks, saveTask, deleteTask, toggleTask } =
    useTasks();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSubmit = (task: Task) => {
    saveTask(task);
    setIsEditorOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => setIsEditorOpen(true)}>Добавить задачу</Button>

      <div style={{ marginTop: 24 }}>
        <TaskSection
          title="Активные задачи"
          tasks={activeTasks}
          onDelete={deleteTask}
          onToggle={toggleTask}
        />
        <TaskSection
          title="Выполненные задачи"
          tasks={doneTasks}
          onDelete={deleteTask}
          onToggle={toggleTask}
        />
      </div>

      <TaskEditorWindow
        open={isEditorOpen}
        onSubmit={handleSubmit}
        onCancel={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
