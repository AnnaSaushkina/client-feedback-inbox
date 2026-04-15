import { useState, useRef } from "react";
import { Modal, Tag, Image, Button, Input, Select, DatePicker, Typography } from "antd";
import dayjs from "dayjs";
import type { Task, Priority, Assignee, TaskStatus } from "../../types/Task";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";
import { renderWithLinks } from "../../utils/links";

const { TextArea } = Input;
const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "свободно", label: "🟢 Свободно" },
  { value: "в_работе", label: "🔵 В работе" },
  { value: "waiting_comment", label: "💬 Ждём коммента" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "🔴 Высокий" },
  { value: "medium", label: "🟡 Средний" },
  { value: "low", label: "⚪ Низкий" },
];

const ASSIGNEE_OPTIONS = [
  { value: "Аня", label: "Аня" },
  { value: "Паша", label: "Паша" },
  { value: "Олег", label: "Олег" },
];

const priorityColor = { low: "default", medium: "orange", high: "red" };
const priorityLabel = { low: "⚪ Низкий", medium: "🟡 Средний", high: "🔴 Высокий" };

const DISABLED_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 23];
const DISABLED_MINUTES = Array.from({ length: 60 }, (_, i) => i).filter((m) => m !== 0);

const labelStyle = { fontSize: 14, color: "#aaa", marginBottom: 4 };
const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };

interface TaskCardProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskCard({ task, onClose, onSave }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [ticketNumber, setTicketNumber] = useState(task?.ticketNumber ?? "");
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(
    task?.deadline ? dayjs(task.deadline) : null,
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "свободно");
  const [priority, setPriority] = useState<Priority | null>(task?.priority ?? null);
  const [assignee, setAssignee] = useState<Assignee | null>(task?.assignee ?? null);
  const [screenshots, setScreenshots] = useState<string[]>(task?.screenshots ?? []);
  const [titleError, setTitleError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task) return null;

  const handleEditClick = () => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setTicketNumber(task.ticketNumber ?? "");
    setDeadline(task.deadline ? dayjs(task.deadline) : null);
    setStatus(task.status ?? "свободно");
    setPriority(task.priority ?? null);
    setAssignee(task.assignee ?? null);
    setScreenshots(task.screenshots ?? []);
    setTitleError("");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError("Название задачи обязательно");
      return;
    }
    onSave({
      ...task,
      title: title.trim(),
      description: description || undefined,
      ticketNumber: ticketNumber || undefined,
      deadline: deadline ? deadline.toISOString() : undefined,
      status,
      priority: priority ?? undefined,
      assignee: assignee ?? undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });
    setIsEditing(false);
    setTitleError("");
  };

  const addScreenshotsFromFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    let completed = 0;
    const results: string[] = new Array(imageFiles.length);
    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        results[index] = reader.result as string;
        completed++;
        if (completed === imageFiles.length) {
          setScreenshots((prev) => [...prev, ...results]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const imageFiles: File[] = [];
    for (const item of e.clipboardData.items) {
      if (!item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (file) imageFiles.push(file);
    }
    if (imageFiles.length > 0) addScreenshotsFromFiles(imageFiles);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addScreenshotsFromFiles(Array.from(files));
    e.target.value = "";
  };

  const taskStatus = task.status ?? "свободно";

  return (
    <Modal
      open={!!task}
      onCancel={() => { setIsEditing(false); onClose(); }}
      title={isEditing ? "Редактировать задачу" : task.title}
      width={700}
      footer={
        isEditing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={() => setIsEditing(false)}>Отмена</Button>
            <Button type="primary" onClick={handleSave}>Сохранить</Button>
          </div>
        ) : (
          <Button onClick={handleEditClick}>Редактировать</Button>
        )
      }
    >
      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="Номер тикета"
            prefix={<Text style={{ color: "#aaa" }}>#</Text>}
            size="large"
            style={ticketNumber ? { borderColor: "#4096ff", fontWeight: 600 } : undefined}
          />

          <div style={fieldStyle}>
            <Text style={labelStyle}>Название <span style={{ color: "#ff4d4f" }}>*</span></Text>
            <Input
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(""); }}
              size="large"
              status={titleError ? "error" : undefined}
            />
            {titleError && <Text style={{ color: "#ff4d4f", fontSize: 12 }}>{titleError}</Text>}
          </div>

          <div style={fieldStyle}>
            <Text style={labelStyle}>Описание</Text>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Статус</Text>
              <Select<TaskStatus> value={status} onChange={setStatus} options={STATUS_OPTIONS} size="large" />
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Приоритет</Text>
              <Select<Priority | null> value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} placeholder="Не задан" allowClear size="large" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Дедлайн</Text>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                showTime={{ format: "HH", hideDisabledOptions: true, disabledTime: () => ({ disabledHours: () => DISABLED_HOURS, disabledMinutes: () => DISABLED_MINUTES }) }}
                format="DD.MM, HH:00"
                placeholder="Дата"
                inputReadOnly
                size="large"
              />
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Исполнитель</Text>
              <Select value={assignee} onChange={setAssignee} placeholder="Кто" options={ASSIGNEE_OPTIONS} allowClear size="large" />
            </div>
          </div>

          <div style={fieldStyle}>
            <Text style={labelStyle}>Скриншоты</Text>
            <div onPaste={handlePaste} style={{ border: "1px dashed #444", borderRadius: 8, padding: 16, color: "#888" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: screenshots.length ? 12 : 0 }}>
                <span style={{ fontSize: 13 }}>Ctrl+V / Cmd+V — вставить скриншот</span>
                <Button size="small" onClick={() => fileInputRef.current?.click()}>Загрузить файл</Button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileUpload} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {screenshots.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }} />
                    <button
                      onClick={() => setScreenshots((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {task.ticketNumber && (
              <Tag style={{ fontSize: 15, fontWeight: 600, padding: "3px 12px" }}>#{task.ticketNumber}</Tag>
            )}
            {taskStatus === "свободно" && <Tag color="success" style={{ fontSize: 14 }}>🟢 Свободно</Tag>}
            {taskStatus === "в_работе" && <Tag color="processing" style={{ fontSize: 14 }}>🔵 В работе</Tag>}
            {taskStatus === "waiting_comment" && <Tag style={{ fontSize: 14 }}>💬 Ждём коммента</Tag>}
            {task.priority && (
              <Tag color={priorityColor[task.priority]} style={{ fontSize: 14 }}>{priorityLabel[task.priority]}</Tag>
            )}
            {task.assignee && <Tag color="blue" style={{ fontSize: 14 }}>{task.assignee}</Tag>}
            {task.deadline && (
              <Tag color={getDeadlineColor(task.deadline)} style={{ fontSize: 14 }}>⏰ {formatDeadline(task.deadline)}</Tag>
            )}
          </div>

          {task.history && task.history.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {task.history.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap", marginTop: 3, minWidth: 90 }}>
                    {new Date(entry.date).toLocaleDateString("ru", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {renderWithLinks(entry.text)}
                  </p>
                </div>
              ))}
            </div>
          ) : task.description ? (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {renderWithLinks(task.description)}
            </p>
          ) : null}

          {task.screenshots && task.screenshots.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {task.screenshots.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 6 }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
