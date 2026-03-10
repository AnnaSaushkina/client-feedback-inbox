import { Input, Select, Space } from "antd";
import type { Priority, Assignee } from "../../types/Task";

interface FilterProps {
  onSearch: (text: string) => void;
  onPriority: (priority: Priority | null) => void;
  onAssignee: (assignee: Assignee | null) => void;
}

export default function Filter({
  onSearch,
  onPriority,
  onAssignee,
}: FilterProps) {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Input.Search
        placeholder="Поиск по названию"
        onChange={(e) => onSearch(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />

      <Select
        placeholder="Приоритет"
        allowClear
        style={{ width: 140 }}
        onChange={(val) => onPriority(val ?? null)}
        options={[
          { value: "high", label: "🔴 Высокий" },
          { value: "medium", label: "🟡 Средний" },
          { value: "low", label: "🟢 Низкий" },
        ]}
      />

      <Select
        placeholder="Исполнитель"
        allowClear
        style={{ width: 140 }}
        onChange={(val) => onAssignee(val ?? null)}
        options={[
          { value: "Аня", label: "Аня" },
          { value: "Паша", label: "Паша" },
          { value: "Олег", label: "Олег" },
        ]}
      />
    </Space>
  );
}
