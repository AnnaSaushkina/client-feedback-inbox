import { taskStore } from "../../state/TaskStore";

export default function Board() {
  return (
    <div>
      <h2>Все задачи:</h2>

      {taskStore.tasks.map((task) => (
        <div key={task.id}>
          {task.title} [{task.completed ? "done" : "active"}]
        </div>
      ))}
    </div>
  );
}
