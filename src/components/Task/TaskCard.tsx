import { useState, useRef } from "react";
import {
  Modal,
  Tag,
  Image,
  Button,
  Input,
  Select,
  DatePicker,
  Typography,
} from "antd";
// import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Task, Priority, Assignee } from "../../types/Task";
import type { CombinedStatus } from "../../types/TaskForm";
import { getDeadlineColor, formatDeadline } from "../../utils/deadline";

const { TextArea } = Input;
const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "high", label: "🔴 Высокий" },
  { value: "medium", label: "🟡 Средний" },
  { value: "low", label: "🟢 Низкий" },
  { value: "waiting_comment", label: "💬 Ждём коммента" },
];

const ASSIGNEE_OPTIONS = [
  { value: "Аня", label: "Аня" },
  { value: "Паша", label: "Паша" },
  { value: "Олег", label: "Олег" },
];

const priorityColor = { low: "green", medium: "orange", high: "red" };
const priorityLabel = { low: "🟢 Низкий", medium: "🟡 Средний", high: "🔴 Высокий" };

const DISABLED_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 23];
const DISABLED_MINUTES = Array.from({ length: 60 }, (_, i) => i).filter(
  (m) => m !== 0,
);

const labelStyle = { fontSize: 13, color: "#aaa", marginBottom: 2 };
const fieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 2,
};

interface TaskCardProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskCard({ task, onClose, onSave }: TaskCardProps) {
  const getCombinedStatus = (t: Task): CombinedStatus =>
    t.status === "waiting_comment" ? "waiting_comment" : (t.priority ?? "medium");

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [ticketNumber, setTicketNumber] = useState(task?.ticketNumber ?? "");
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(
    task?.deadline ? dayjs(task.deadline) : null,
  );
  const [combinedStatus, setCombinedStatus] = useState<CombinedStatus>(
    task ? getCombinedStatus(task) : "medium",
  );
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
    setCombinedStatus(getCombinedStatus(task));
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
    const isWaiting = combinedStatus === "waiting_comment";
    const saved = {
      ...task,
      title: title.trim(),
      description,
      ticketNumber,
      deadline: deadline ? deadline.toISOString() : undefined,
      priority: isWaiting ? undefined : (combinedStatus as Priority),
      status: isWaiting ? ("waiting_comment" as const) : undefined,
      assignee: assignee ?? undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    };
    onSave(saved);
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
          {/* Номер тикета */}
          <Input
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="Номер тикета"
            prefix={<Text style={{ color: "#aaa" }}>#</Text>}
            size="large"
            style={ticketNumber ? { borderColor: "#4096ff", fontWeight: 600 } : undefined}
          />

          {/* Название */}
          <div style={fieldStyle}>
            <Text style={labelStyle}>
              Название задачи <span style={{ color: "#ff4d4f" }}>*</span>
            </Text>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError("");
              }}
              placeholder="Кратко опишите задачу"
              status={titleError ? "error" : undefined}
            />
            {titleError && (
              <Text style={{ color: "#ff4d4f", fontSize: 12 }}>{titleError}</Text>
            )}
          </div>

          {/* Описание */}
          <div style={fieldStyle}>
            <Text style={labelStyle}>Описание</Text>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробности, контекст, ссылки"
              rows={3}
            />
          </div>

          {/* Статус + Дедлайн + Исполнитель — горизонтально */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Статус</Text>
              <Select<CombinedStatus>
                value={combinedStatus}
                onChange={setCombinedStatus}
                options={STATUS_OPTIONS}
              />
            </div>

            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Дедлайн</Text>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                showTime={{
                  format: "HH",
                  hideDisabledOptions: true,
                  disabledTime: () => ({
                    disabledHours: () => DISABLED_HOURS,
                    disabledMinutes: () => DISABLED_MINUTES,
                  }),
                }}
                format="DD.MM, HH:00"
                placeholder="Дата"
                inputReadOnly
              />
            </div>

            <div style={{ ...fieldStyle, flex: 1 }}>
              <Text style={labelStyle}>Исполнитель</Text>
              <Select
                value={assignee}
                onChange={setAssignee}
                placeholder="Кто"
                options={ASSIGNEE_OPTIONS}
                allowClear
              />
            </div>
          </div>

          {/* Скриншоты */}
          <div style={fieldStyle}>
            <Text style={labelStyle}>Скриншоты</Text>
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
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: screenshots.length ? 12 : 0,
                }}
              >
                <span style={{ fontSize: 13 }}>
                  Ctrl+V / Cmd+V — вставить скриншот
                </span>
                <Button
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Загрузить файл
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {screenshots.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} style={{ height: 80, borderRadius: 4 }} />
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
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {task.ticketNumber && (
              <Tag style={{ fontSize: 14, fontWeight: 600, padding: "2px 10px" }}>
                #{task.ticketNumber}
              </Tag>
            )}
            {task.status === "waiting_comment" ? (
              <Tag color="default">💬 Ждём коммента</Tag>
            ) : (
              task.priority && (
                <Tag color={priorityColor[task.priority]}>
                  {priorityLabel[task.priority]}
                </Tag>
              )
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
