import { useState, useMemo } from "react";
import "./KanbanBoard.css";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd";
import type { AppDispatch } from "../../store/index";
import { selectTasks, updateTask } from "../../store/tasksSlice";
import type { Task, TaskStatus } from "../../types/Task";
import { isValidTransition, TRANSITION_BLOCK_REASON } from "../../constants/taskTransitions";
import KanbanColumn from "./KanbanColumn";
import type { ColumnValidity } from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const COLUMNS: TaskStatus[] = ["свободно", "в_работе", "waiting_comment", "тестирование"];

interface KanbanBoardProps {
  onOpen: (task: Task) => void;
}

export default function KanbanBoard({ onOpen }: KanbanBoardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector(selectTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticMove, setOptimisticMove] = useState<{ id: string | number; status: TaskStatus } | null>(null);

  // distance: 8 — перетаскивание начинается только после 8px движения, клики проходят насквозь
  // TouchSensor: задержка 250ms перед началом перетаскивания на мобильных
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  );

  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);

  const tasksByColumn = useMemo(() => {
    const result: Record<TaskStatus, Task[]> = { свободно: [], в_работе: [], waiting_comment: [], тестирование: [] };
    for (const t of activeTasks) {
      const status = optimisticMove?.id === t.id ? optimisticMove.status : (t.status ?? "свободно");
      result[status].push(t);
    }
    return result;
  }, [activeTasks, optimisticMove]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = activeTasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const task = activeTasks.find((t) => t.id === active.id);
    const newStatus = over.id as TaskStatus;
    if (!task || !COLUMNS.includes(newStatus) || task.status === newStatus) return;

    const from = task.status ?? "свободно";

    if (!isValidTransition(from, newStatus)) {
      const reason = TRANSITION_BLOCK_REASON[from]?.[newStatus] ?? "Этот переход недопустим";
      message.error(reason, 3);
      return;
    }

    setOptimisticMove({ id: task.id, status: newStatus });
    dispatch(updateTask({ ...task, status: newStatus })).finally(() => setOptimisticMove(null));
  };

  const columnValidity = (status: TaskStatus): ColumnValidity => {
    if (!activeTask) return null;
    const from = activeTask.status ?? "свободно";
    if (status === from) return "same";
    return isValidTransition(from, status) ? "valid" : "invalid";
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByColumn[status]}
            onOpen={onOpen}
            validity={columnValidity(status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} onOpen={onOpen} />}
      </DragOverlay>
    </DndContext>
  );
}
