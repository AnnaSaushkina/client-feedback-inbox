import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { Task } from "../types";
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  restoreFromArchive,
} from "./tasksThunks";

export interface TasksState {
  items: Task[];
  loading: boolean;
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], loading: false } as TasksState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { type, task } = action.payload;
        if (type === "update") {
          state.items = state.items.map((t) => (t.id === task.id ? task : t));
        } else {
          state.items.push(task);
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addMatcher(
        isAnyOf(
          updateTask.fulfilled,
          toggleTask.fulfilled,
          restoreFromArchive.fulfilled,
        ),
        (state, action) => {
          state.items = state.items.map((t) =>
            t.id === action.payload.id ? action.payload : t,
          );
        },
      );
  },
});

export const tasksReducer = tasksSlice.reducer;
export default tasksSlice.reducer;

export const selectTasks = (state: { tasks: TasksState }) => state.tasks.items;

export const isTaskMutationAction = isAnyOf(
  addTask.fulfilled,
  updateTask.fulfilled,
  deleteTask.fulfilled,
  toggleTask.fulfilled,
  restoreFromArchive.fulfilled,
);
