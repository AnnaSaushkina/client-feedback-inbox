import { Layout, Button } from "antd";
import { useState, useEffect } from "react";
import Board from "../components/Board/Board";
import TaskEditor from "../components/TaskEditor/TaskEditor";
import type { Task } from "../types/Task";

const { Content } = Layout;

export default function AppLayout() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("tasks");

    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsEditorOpen(true);
  };

  const handleSubmit = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);

      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }

      return [...prev, task];
    });

    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Button type="default" onClick={handleCreateClick}>
          Добавить задачу
        </Button>

        <Board
          activeTasks={activeTasks}
          doneTasks={doneTasks}
          onDelete={handleDelete}
          onToggle={handleToggle}
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
