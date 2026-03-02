export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export const taskStore = {
  tasks: [] as Task[],

  addTask(title: string) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };
    this.tasks.push(newTask);
  },

  deleteTask(id: string) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  },

  toggleTask(id: string) {
    const task = this.tasks.find((task) => task.id === id);

    if (task) {
      task.completed = !task.completed;
    }
  },
};
