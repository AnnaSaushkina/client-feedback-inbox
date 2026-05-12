import { useRef, useState } from "react";
import { Input, Select, DatePicker, Typography, Button } from "antd";
import type { TaskFormValues } from "../../types/TaskForm";
import { readImageFiles, getImagesFromClipboard } from "../../utils/screenshots";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../constants/taskOptions";
import { useAssignees } from "../../contexts/AssigneesContext";
import AssigneeManager from "../Assignees/AssigneeManager";

const { TextArea } = Input;
const { Text } = Typography;

interface TaskFormProps {
  values: TaskFormValues;
  onChange: (values: TaskFormValues) => void;
  errors?: Partial<Record<keyof TaskFormValues, string>>;
}

const labelStyle = { fontSize: 14, color: "#aaa", marginBottom: 4 };
const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };

export default function TaskForm({ values, onChange, errors }: TaskFormProps) {
  const { assignees } = useAssignees();
  const assigneeOptions = assignees.map((a) => ({ value: a, label: a }));
  const [managerOpen, setManagerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof TaskFormValues, value: unknown) => {
    onChange({ ...values, [field]: value });
  };

  const addScreenshots = (base64s: string[]) => {
    update("screenshots", [...values.screenshots, ...base64s]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = getImagesFromClipboard(e);
    if (files.length) readImageFiles(files, addScreenshots);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    readImageFiles(Array.from(e.target.files), addScreenshots);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={fieldStyle}>
        <Input
          value={values.ticketNumber}
          onChange={(e) => update("ticketNumber", e.target.value.replace(/\D/g, ""))}
          placeholder="Номер тикета"
          prefix={<Text style={{ color: "#aaa" }}>#</Text>}
          size="large"
          style={values.ticketNumber ? { borderColor: "#4096ff", fontWeight: 600 } : undefined}
        />
      </div>

      <div style={fieldStyle}>
        <Text style={labelStyle}>Название <span style={{ color: "#ff4d4f" }}>*</span></Text>
        <Input
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Кратко опишите задачу"
          size="large"
          status={errors?.title ? "error" : undefined}
        />
        {errors?.title && <Text style={{ color: "#ff4d4f", fontSize: 12 }}>{errors.title}</Text>}
      </div>

      <div style={fieldStyle}>
        <Text style={labelStyle}>Описание</Text>
        <TextArea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Подробности, контекст, ссылки"
          rows={6}
          style={{ resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <Text style={labelStyle}>Статус</Text>
          <Select value={values.status} onChange={(val) => update("status", val)} options={STATUS_OPTIONS} size="large" />
        </div>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <Text style={labelStyle}>Приоритет</Text>
          <Select value={values.priority} onChange={(val) => update("priority", val)} options={PRIORITY_OPTIONS} placeholder="Не задан" allowClear size="large" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <Text style={labelStyle}>Дедлайн</Text>
          <DatePicker
            value={values.deadline}
            onChange={(val) => {
              const updates: Partial<TaskFormValues> = { deadline: val };
              if (val) {
                const diff = val.valueOf() - Date.now();
                if (diff > 0 && diff <= 24 * 60 * 60 * 1000) updates.priority = "high";
              }
              onChange({ ...values, ...updates });
            }}
            showTime={{ format: "HH", hideDisabledOptions: true }}
            format="DD.MM"
            placeholder="Дата"
            inputReadOnly
            size="large"
          />
        </div>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Text style={labelStyle}>Исполнитель</Text>
            <Button type="link" size="small" style={{ padding: 0, fontSize: 12, height: "auto" }} onClick={() => setManagerOpen(true)}>
              управление
            </Button>
          </div>
          <Select value={values.assignee} onChange={(val) => update("assignee", val)} placeholder="Кто" options={assigneeOptions} allowClear size="large" />
        </div>
        <AssigneeManager open={managerOpen} onClose={() => setManagerOpen(false)} />
      </div>

      <div style={fieldStyle}>
        <Text style={labelStyle}>Скриншоты</Text>
        <div onPaste={handlePaste} style={{ border: "1px dashed #444", borderRadius: 8, padding: 16, color: "#888" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: values.screenshots.length ? 12 : 0 }}>
            <span style={{ fontSize: 13 }}>Ctrl+V / Cmd+V — вставить скриншот</span>
            <Button size="small" onClick={() => fileInputRef.current?.click()}>Загрузить файл</Button>
            <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" multiple style={{ display: "none" }} onChange={handleFileUpload} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {values.screenshots.map((src, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={src} alt={`скриншот ${i + 1}`} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }} />
                <button
                  onClick={() => update("screenshots", values.screenshots.filter((_, idx) => idx !== i))}
                  style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10 }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
