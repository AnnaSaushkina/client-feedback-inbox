const HOURS_IN_DAY = 24;
const MS_IN_HOUR = 1000 * 60 * 60;

export const getDeadlineColor = (deadline?: string): string => {
  if (!deadline) return "purple";

  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / MS_IN_HOUR;

  if (hoursLeft < 0) return "red"; // просрочен
  if (hoursLeft < HOURS_IN_DAY) return "orange"; // горит
  return "purple"; // ок
};

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
