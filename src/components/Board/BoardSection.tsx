import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card } from "antd";
import type { Task } from "../../types/Task";
import TaskItem from "./BoardItem";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

type ListProps = Omit<TaskSectionProps, "title">;

const isTomorrow = (deadline?: string): boolean => {
  if (!deadline) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(deadline).toDateString() === tomorrow.toDateString();
};

function FlatList({ tasks, onDelete, onToggle, onOpen }: ListProps) {
  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function VirtualList({ tasks, onDelete, onToggle, onOpen }: ListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ maxHeight: 600, overflowY: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const task = tasks[virtualItem.index];
          return (
            <div
              key={task.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TaskItem
                task={task}
                onDelete={onDelete}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TaskList = import.meta.env.MODE === "test" ? FlatList : VirtualList;

export default function BoardSection({
  title,
  tasks,
  onDelete,
  onToggle,
  onOpen,
}: TaskSectionProps) {
  const tomorrowTasks = tasks.filter((t) => isTomorrow(t.deadline));
  const otherTasks = tasks.filter((t) => !isTomorrow(t.deadline));

  if (tasks.length === 0) {
    return (
      <Card
        title={title}
        style={{ marginBottom: 20 }}
        styles={{ header: { fontSize: 17, fontWeight: 600 } }}
      >
        <p style={{ color: "#888", margin: 0 }}>Список пуст</p>
      </Card>
    );
  }

  return (
    <Card
      title={title}
      style={{ marginBottom: 20 }}
      styles={{ header: { fontSize: 17, fontWeight: 600 } }}
    >
      {otherTasks.length > 0 && (
        <TaskList
          tasks={otherTasks}
          onDelete={onDelete}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      )}
      {tomorrowTasks.length > 0 && (
        <>
          <p style={{ color: "#888", fontSize: 13, margin: "10px 0 4px" }}>
            — Завтра
          </p>
          <TaskList
            tasks={tomorrowTasks}
            onDelete={onDelete}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        </>
      )}
    </Card>
  );
}
