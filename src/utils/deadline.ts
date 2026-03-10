export const getDeadlineColor = (deadline?: string) => {
  if (!deadline) return "purple";
  const now = new Date();
  const date = new Date(deadline);
  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours < 0) return "red";
  if (diffHours < 24) return "orange";
  return "purple";
};

export const formatDeadline = (deadline?: string) => {
  if (!deadline) return null;
  const date = new Date(deadline);
  return date.toLocaleString("ru", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
