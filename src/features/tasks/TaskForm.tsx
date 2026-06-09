import { useState } from "react";
import { Input, Select, DatePicker, Typography, Button } from "antd";
import type { TaskFormValues } from "../../types";
import { isUrgentDeadline } from "../../utils";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  labelStyle,
  fieldStyle,
  rowStyle,
} from "./tasks.constants";
import { useAssignees } from "../../contexts";
import AssigneeManager from "../../components/Assignees/AssigneeManager";
import ScreenshotField from "./ScreenshotField";
import type { Dayjs } from "dayjs";

const { TextArea } = Input;
const { Text } = Typography;

interface TaskFormProps {
  values: TaskFormValues;
  onChange: (values: TaskFormValues) => void;
  errors?: Partial<Record<keyof TaskFormValues, string>>;
}

export default function TaskForm({ values, onChange, errors }: TaskFormProps) {
  const { assignees } = useAssignees();
  const [managerOpen, setManagerOpen] = useState(false);

  const update = (field: keyof TaskFormValues, value: unknown) =>
    onChange({ ...values, [field]: value });

  const handleDeadlineChange = (val: Dayjs | null) => {
    const updates: Partial<TaskFormValues> = { deadline: val };
    if (isUrgentDeadline(val)) updates.priority = "high";
    onChange({ ...values, ...updates });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={fieldStyle}>
        <Input
          value={values.ticketNumber}
          onChange={(e) =>
            update("ticketNumber", e.target.value.replace(/\D/g, ""))
          }
          placeholder="Номер тикета"
          prefix={<Text style={{ color: "#aaa" }}>#</Text>}
          size="large"
          style={
            values.ticketNumber
              ? { borderColor: "#4096ff", fontWeight: 600 }
              : undefined
          }
        />
      </div>

      <div style={fieldStyle}>
        <Text style={labelStyle}>
          Название <span style={{ color: "#ff4d4f" }}>*</span>
        </Text>
        <Input
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Кратко опишите задачу"
          size="large"
          status={errors?.title ? "error" : undefined}
        />
        {errors?.title && (
          <Text style={{ color: "#ff4d4f", fontSize: 12 }}>{errors.title}</Text>
        )}
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

      <div style={rowStyle}>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <Text style={labelStyle}>Статус</Text>
          <Select
            value={values.status}
            onChange={(val) => update("status", val)}
            options={STATUS_OPTIONS}
            size="large"
          />
        </div>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <Text style={labelStyle}>Приоритет</Text>
          <Select
            value={values.priority}
            onChange={(val) => update("priority", val)}
            options={PRIORITY_OPTIONS}
            placeholder="Не задан"
            allowClear
            size="large"
          />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <Text style={labelStyle}>Дедлайн</Text>
          <DatePicker
            value={values.deadline}
            onChange={handleDeadlineChange}
            showTime={{ format: "HH", hideDisabledOptions: true }}
            format="DD.MM"
            placeholder="Дата"
            inputReadOnly
            size="large"
          />
        </div>
        <div style={{ ...fieldStyle, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text style={labelStyle}>Исполнитель</Text>
            <Button
              type="link"
              size="small"
              style={{ padding: 0, fontSize: 12, height: "auto" }}
              onClick={() => setManagerOpen(true)}
            >
              управление
            </Button>
          </div>
          <Select
            value={values.assignee}
            onChange={(val) => update("assignee", val)}
            placeholder="Кто"
            options={assignees.map((a) => ({ value: a, label: a }))}
            allowClear
            size="large"
          />
        </div>
        <AssigneeManager
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
        />
      </div>

      <ScreenshotField
        screenshots={values.screenshots}
        onChange={(screenshots) => update("screenshots", screenshots)}
      />
    </div>
  );
}
