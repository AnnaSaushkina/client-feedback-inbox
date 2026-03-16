import { Input, Select, DatePicker } from "antd";
import type { TaskFormValues } from "../../types/TaskForm";

const { TextArea } = Input;

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
}

export default function TaskForm({ values, onChange }: TaskFormProps) {
  const update = (field: keyof TaskFormValues, value: unknown) => {
    onChange({ ...values, [field]: value });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    for (const item of e.clipboardData.items) {
      if (!item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (!file) continue;
      const reader = new FileReader();
      reader.onload = () =>
        update("screenshots", [...values.screenshots, reader.result as string]);
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = (index: number) => {
    update(
      "screenshots",
      values.screenshots.filter((_, i) => i !== index),
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input
        value={values.ticketNumber}
        onChange={(e) => update("ticketNumber", e.target.value)}
        placeholder="Номер тикета"
      />
      <Input
        value={values.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Название задачи *"
      />
      <TextArea
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="Описание задачи"
        rows={3}
      />
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
        format="dd, DD.MM, HH:00"
        placeholder="Дедлайн"
        style={{ width: "100%" }}
      />
      <Select
        value={values.priority}
        onChange={(val) => update("priority", val)}
        options={PRIORITY_OPTIONS}
      />
      <Select
        value={values.assignee}
        onChange={(val) => update("assignee", val)}
        placeholder="Исполнитель"
        options={ASSIGNEE_OPTIONS}
      />

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
            marginBottom: values.screenshots.length ? 12 : 0,
          }}
        >
          Вставьте скриншот сюда (Ctrl+V)
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
  );
}
