import { useState } from "react";
import { Modal, Tag, Image, Button, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import type { Task, Priority, Assignee } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";

const { TextArea } = Input;

const priorityColor = { low: "green", medium: "orange", high: "red" };
const priorityLabel = { low: "Низкий", medium: "Средний", high: "Высокий" };

interface TaskCardProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskCard({ task, onClose, onSave }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);

  if (!task) return null;

  const handleEditClick = () => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setTicketNumber(task.ticketNumber ?? "");
    setDeadline(task.deadline ? dayjs(task.deadline) : null);
    setPriority(task.priority ?? "medium");
    setAssignee(task.assignee ?? null);
    setScreenshots(task.screenshots ?? []);
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log("handleSave вызван", { title, deadline });
    onSave({
      ...task,
      title,
      description,
      ticketNumber,
      deadline: deadline ? deadline.toISOString() : undefined,
      priority,
      assignee: assignee ?? undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });
    setIsEditing(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () =>
          setScreenshots((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <Modal
      open={!!task}
      onCancel={() => {
        setIsEditing(false);
        onClose();
      }}
      title={isEditing ? "Редактировать задачу" : task.title}
      width={700}
      footer={
        isEditing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={() => setIsEditing(false)}>Отмена</Button>
            <Button type="primary" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        ) : (
          <Button onClick={handleEditClick}>Редактировать</Button>
        )
      }
    >
      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="Номер тикета"
          />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название *"
          />

          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={3}
          />

          <DatePicker
            value={deadline}
            onChange={setDeadline}
            showTime={{
              format: "HH",
              disabledTime: () => ({
                disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 23],
                disabledMinutes: () =>
                  Array.from({ length: 60 }, (_, i) => i).filter(
                    (m) => m !== 0,
                  ),
              }),
            }}
            format="dd, DD.MM, HH:00"
            placeholder="Дедлайн"
            style={{ width: "100%" }}
          />

          <Select
            value={priority}
            onChange={setPriority}
            options={[
              { value: "low", label: "Низкий" },
              { value: "medium", label: "Средний" },
              { value: "high", label: "Высокий" },
            ]}
          />
          <Select
            value={assignee}
            onChange={setAssignee}
            placeholder="Исполнитель"
            options={[
              { value: "Аня", label: "Аня" },
              { value: "Паша", label: "Паша" },
              { value: "Олег", label: "Олег" },
            ]}
          />

          <div
            onPaste={handlePaste}
            style={{
              border: "1px dashed #444",
              borderRadius: 8,
              padding: 16,
              color: "#888",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: screenshots.length ? 12 : 0,
              }}
            >
              Вставьте скриншот (Ctrl+V) — можно несколько
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {screenshots.map((src, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={src} style={{ height: 80, borderRadius: 4 }} />
                  <button
                    onClick={() =>
                      setScreenshots((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      cursor: "pointer",
                      fontSize: 10,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {task.ticketNumber && <Tag>#{task.ticketNumber}</Tag>}
            {task.priority && (
              <Tag color={priorityColor[task.priority]}>
                {priorityLabel[task.priority]}
              </Tag>
            )}
            {task.assignee && <Tag color="blue">{task.assignee}</Tag>}
            {task.deadline && (
              <Tag color={getDeadlineColor(task.deadline)}>
                ⏰ {formatDeadline(task.deadline)}
              </Tag>
            )}
          </div>
          {task.description && <p style={{ margin: 0 }}>{task.description}</p>}
          {task.screenshots && task.screenshots.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {task.screenshots.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  style={{ height: 120, objectFit: "cover", borderRadius: 4 }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
