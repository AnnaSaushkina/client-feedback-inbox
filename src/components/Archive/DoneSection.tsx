import { Collapse, Button, Typography, Popconfirm } from "antd";
import type { Task } from "../../types";

const { Text } = Typography;

interface DoneSectionProps {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

function DoneRow({ task, onOpen, onRestore, onDelete }: { task: Task } & Omit<DoneSectionProps, "tasks">) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
      <Text type="secondary" style={{ fontSize: 13 }}>—</Text>
      <Text style={{ fontSize: 14, flex: 1, cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => onOpen(task)}>
        {task.ticketNumber || task.title}
      </Text>
      <Popconfirm title="Вернуть задачу в активные?" onConfirm={() => onRestore(task.id)} okText="Да" cancelText="Нет">
        <Button type="text" size="small" style={{ color: "#555", fontSize: 12 }}>Вернуть</Button>
      </Popconfirm>
      <Popconfirm title="Удалить задачу?" onConfirm={() => onDelete(task.id)} okText="Удалить" cancelText="Отмена" okButtonProps={{ danger: true }}>
        <Button type="text" size="small" danger style={{ fontSize: 12 }}>Удалить</Button>
      </Popconfirm>
    </div>
  );
}

export default function DoneSection({ tasks, onOpen, onRestore, onDelete }: DoneSectionProps) {
  const rowProps = { onOpen, onRestore, onDelete };

  if (tasks.length === 1) {
    return (
      <div style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>
          Выполнено сегодня (1)
        </Text>
        <DoneRow task={tasks[0]} {...rowProps} />
      </div>
    );
  }

  return (
    <Collapse
      ghost
      items={[{
        key: "done",
        label: <Text style={{ fontSize: 15, fontWeight: 600, color: "#555" }}>Выполнено сегодня ({tasks.length})</Text>,
        children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tasks.map((task) => <DoneRow key={task.id} task={task} {...rowProps} />)}
          </div>
        ),
      }]}
    />
  );
}
