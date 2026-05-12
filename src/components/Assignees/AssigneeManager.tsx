import { useState } from "react";
import { Modal, Button, Input, Space, Typography, Popconfirm } from "antd";
import { useAssignees } from "../../contexts/AssigneesContext";

const { Text } = Typography;

interface AssigneeManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function AssigneeManager({ open, onClose }: AssigneeManagerProps) {
  const { assignees, add, rename, remove } = useAssignees();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");

  const handleStartEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };

  const handleSaveRename = () => {
    if (editingName) rename(editingName, editValue);
    setEditingName(null);
  };

  const handleAdd = () => {
    add(newName);
    setNewName("");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Управление исполнителями"
      footer={<Button onClick={onClose}>Закрыть</Button>}
      width={400}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {assignees.map((name) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {editingName === name ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onPressEnter={handleSaveRename}
                  autoFocus
                  size="small"
                  style={{ flex: 1 }}
                />
                <Button size="small" type="primary" onClick={handleSaveRename}>
                  Сохранить
                </Button>
                <Button size="small" onClick={() => setEditingName(null)}>
                  Отмена
                </Button>
              </>
            ) : (
              <>
                <Text style={{ flex: 1 }}>{name}</Text>
                <Button size="small" onClick={() => handleStartEdit(name)}>
                  Переименовать
                </Button>
                <Popconfirm
                  title={`Удалить «${name}»?`}
                  onConfirm={() => remove(name)}
                  okText="Удалить"
                  cancelText="Отмена"
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger>
                    Удалить
                  </Button>
                </Popconfirm>
              </>
            )}
          </div>
        ))}
      </div>

      <Space.Compact style={{ width: "100%" }}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleAdd}
          placeholder="Новый исполнитель"
        />
        <Button type="primary" onClick={handleAdd} disabled={!newName.trim()}>
          Добавить
        </Button>
      </Space.Compact>
    </Modal>
  );
}
