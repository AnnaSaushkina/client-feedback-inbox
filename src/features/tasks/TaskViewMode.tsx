import { Image } from "antd";
import type { Task } from "../../types";
import { renderWithLinks } from "../../utils";
import TaskStatus from "./TaskStatus";

const columnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

interface TaskViewModeProps {
  task: Task;
}

function renderBody(task: Task) {
  if (task.history && task.history.length > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {task.history.map((entry, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#555",
                whiteSpace: "nowrap",
                marginTop: 3,
                minWidth: 90,
              }}
            >
              {new Date(entry.date).toLocaleDateString("ru", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {renderWithLinks(entry.text)}
            </p>
          </div>
        ))}
      </div>
    );
  }
  if (task.description) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {renderWithLinks(task.description)}
      </p>
    );
  }
  return null;
}

export default function TaskViewMode({ task }: TaskViewModeProps) {
  return (
    <div style={columnStyle}>
      <TaskStatus task={task} />

      {renderBody(task)}

      {task.screenshots && task.screenshots.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {task.screenshots.map((src, i) => (
            <Image
              key={i}
              src={src}
              style={{
                width: 140,
                height: 140,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
