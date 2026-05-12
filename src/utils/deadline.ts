// РЕФАКТОРИНГ: обе функции рабочие, но их импорт закомментирован в TaskCard.tsx и BoardItem.tsx.
// Дедлайн нигде не отображается. Нужно либо раскомментировать импорт, либо удалить этот файл.

const HOURS_IN_DAY = 24;
const MS_IN_HOUR = 1000 * 60 * 60;

// Цвет тега по срочности: red = просрочен, orange = горит (< 24ч), purple = ок
export const getDeadlineColor = (deadline?: string): string => {
  if (!deadline) return "purple";

  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / MS_IN_HOUR;

  if (hoursLeft < 0) return "red";
  if (hoursLeft < HOURS_IN_DAY) return "orange";
  return "purple";
};

// Форматирует дедлайн для отображения: "пт, 16.05, 10:00"
export const formatDeadline = (deadline?: string): string | null => {
  if (!deadline) return null;

  return new Date(deadline).toLocaleString("ru", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
