import { useState } from "react";
import { Modal, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import type { Task, Priority, Assignee } from "../../types/Task";

const { TextArea } = Input;

interface TaskEditorProps {
  open: boolean;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

const generateId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function TaskEditor({
  open,
  onSubmit,
  onCancel,
}: TaskEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]); // ← массив строк

  const handleOk = () => {
    if (!title.trim()) return;

    onSubmit({
      id: generateId(),
      title: title.trim(),
      completed: false,
      description,
      ticketNumber,
      deadline: deadline ? deadline.toISOString() : undefined,
      priority,
      assignee: assignee ?? undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });

    setTitle("");
    setDescription("");
    setTicketNumber("");
    setDeadline(null);
    setPriority("medium");
    setAssignee(null);
    setScreenshots([]); // ← сбрасываем массив
  };

  // Каждый Ctrl+V добавляет новый скриншот в массив
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
      open={open}
      title="Создать задачу"
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          placeholder="Номер тикета"
        />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название задачи *"
        />

        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание задачи"
          rows={3}
        />

        <DatePicker
          value={deadline}
          onChange={setDeadline}
          showTime={{
            format: "HH",
            hideDisabledOptions: true,
            disabledTime: () => ({
              disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 23],
              disabledMinutes: () =>
                Array.from({ length: 60 }, (_, i) => i).filter((m) => m !== 0),
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

        {/* Зона вставки скриншотов через Ctrl+V — можно несколько */}
        <div
          onPaste={handlePaste}
          style={{
            border: "1px dashed #444",
            borderRadius: 8,
            padding: 16,
            color: "#888",
            cursor: "text",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: screenshots.length ? 12 : 0,
            }}
          >
            Вставьте скриншот сюда (Ctrl+V) — можно несколько
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {screenshots.map((src, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={src}
                  alt={`скриншот ${i + 1}`}
                  style={{ height: 80, borderRadius: 4 }}
                />
                <button
                  onClick={() =>
                    setScreenshots((prev) => prev.filter((_, idx) => idx !== i))
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
    </Modal>
  );
}
