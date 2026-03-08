import { Layout, Button } from "antd";
import { useState } from "react";
import Board from "../components/Board/Board";
import TaskEditor from "../components/TaskEditor/TaskEditor";
import type { Task } from "../types/Task";
import { useTasks } from "../hooks/useTasks";

const { Content } = Layout;

export default function AppLayout() {
  const { activeTasks, doneTasks, saveTask, deleteTask, toggleTask } =
    useTasks();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsEditorOpen(true);
  };

  const handleSubmit = (task: Task) => {
    saveTask(task);
    setIsEditorOpen(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Button type="default" onClick={handleCreateClick}>
          Добавить задачу
        </Button>

        <Board
          activeTasks={activeTasks}
          doneTasks={doneTasks}
          onDelete={deleteTask}
          onToggle={toggleTask}
        />

        <TaskEditor
          open={isEditorOpen}
          initialData={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditorOpen(false)}
        />
      </Content>
    </Layout>
  );
}
