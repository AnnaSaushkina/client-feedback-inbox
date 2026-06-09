export const STATUS_OPTIONS = [
  { value: "свободно", label: "🟢 Можно взять в работу" },
  { value: "в_работе", label: "🔵 В работе" },
  { value: "ожидание", label: "💬 Ждём с ОС" },
  { value: "тестирование", label: "✅ Сделано. Тестируется" },
];

export const PRIORITY_OPTIONS = [
  { value: "high", label: "🔴 Высокий" },
  { value: "low", label: "⚪ Низкий" },
];

export const labelStyle = { fontSize: 14, color: "#aaa", marginBottom: 4 };
export const fieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 4,
};
export const rowStyle = { display: "flex", gap: 12 };
export const fieldStyleFlex = { ...fieldStyle, flex: 1 };

export const screenshotZoneStyle = {
  border: "1px dashed #444",
  borderRadius: 8,
  padding: 16,
  color: "#888",
};
export const screenshotThumbStyle = {
  width: 100,
  height: 100,
  objectFit: "cover" as const,
  borderRadius: 6,
};
export const screenshotDeleteBtnStyle = {
  position: "absolute" as const,
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
};
