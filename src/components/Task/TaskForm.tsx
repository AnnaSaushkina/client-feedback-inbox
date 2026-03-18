import { useRef } from "react";
import { Input, Select, DatePicker, Typography, Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
import type { TaskFormValues } from "../../types/TaskForm";

const { TextArea } = Input;
const { Text } = Typography;

const PRIORITY_OPTIONS = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
];

const ASSIGNEE_OPTIONS = [
  { value: "Аня", label: "Аня" },
  { value: "Паша", label: "Паша" },
  { value: "Олег", label: "Олег" },
];

const DISABLED_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 23];
const DISABLED_MINUTES = Array.from({ length: 60 }, (_, i) => i).filter(
  (m) => m !== 0,
);

interface TaskFormProps {
  values: TaskFormValues;
  onChange: (values: TaskFormValues) => void;
  errors?: Partial<Record<keyof TaskFormValues, string>>;
}

const labelStyle = { fontSize: 13, color: "#aaa", marginBottom: 2 };
const fieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 2,
};

export default function TaskForm({ values, onChange, errors }: TaskFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof TaskFormValues, value: unknown) => {
    onChange({ ...values, [field]: value });
  };

  const addScreenshotFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      update("screenshots", [...values.screenshots, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    for (const item of e.clipboardData.items) {
      if (!item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (!file) continue;
      addScreenshotFromFile(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) addScreenshotFromFile(file);
    });
    e.target.value = "";
  };

  const removeScreenshot = (index: number) => {
    update(
      "screenshots",
      values.screenshots.filter((_, i) => i !== index),
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Номер тикета */}
      <div style={fieldStyle}>
        <Text style={labelStyle}>Номер тикета</Text>
        <Input
          value={values.ticketNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            update("ticketNumber", val);
          }}
          placeholder="Например: 1234"
        />
      </div>

      {/* Название задачи */}
      <div style={fieldStyle}>
        <Text style={labelStyle}>
          Название задачи <span style={{ color: "#ff4d4f" }}>*</span>
        </Text>
        <Input
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Кратко опишите задачу"
          status={errors?.title ? "error" : undefined}
        />
        {errors?.title && (
          <Text style={{ color: "#ff4d4f", fontSize: 12 }}>{errors.title}</Text>
        )}
      </div>

      {/* Описание */}
      <div style={fieldStyle}>
        <Text style={labelStyle}>Описание</Text>
        <TextArea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Подробности, контекст, ссылки"
          rows={3}
        />
      </div>

      {/* Дедлайн */}
      <div style={fieldStyle}>
        <Text style={labelStyle}>Дедлайн</Text>
        <DatePicker
          value={values.deadline}
          onChange={(val) => update("deadline", val)}
          showTime={{
            format: "HH",
            hideDisabledOptions: true,
            disabledTime: () => ({
              disabledHours: () => DISABLED_HOURS,
              disabledMinutes: () => DISABLED_MINUTES,
            }),
          }}
          format="DD.MM.YYYY, HH:00"
          placeholder="Выберите дату и время"
          style={{ width: "100%" }}
          inputReadOnly
        />
      </div>

      {/* Приоритет */}
      <div style={fieldStyle}>
        <Text style={labelStyle}>Приоритет</Text>
        <Select
          value={values.priority}
          onChange={(val) => update("priority", val)}
          options={PRIORITY_OPTIONS}
        />
      </div>

      {/* Исполнитель */}
      <div style={fieldStyle}>
        <Text style={labelStyle}>Исполнитель</Text>
        <Select
          value={values.assignee}
          onChange={(val) => update("assignee", val)}
          placeholder="Выберите исполнителя"
          options={ASSIGNEE_OPTIONS}
        />
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
              marginBottom: values.screenshots.length ? 12 : 0,
            }}
          >
            <span style={{ fontSize: 13 }}>
              Ctrl+V / Cmd+V — вставить скриншот
            </span>
            <Button
              size="small"
              // icon={<UploadOutlined />}
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
            {values.screenshots.map((src, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={src}
                  alt={`скриншот ${i + 1}`}
                  style={{ height: 80, borderRadius: 4 }}
                />
                <button
                  onClick={() => removeScreenshot(i)}
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
  );
}
