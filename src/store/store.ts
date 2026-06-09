import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import type { Task } from "../types";
import { tasksReducer, isTaskMutationAction } from "./tasksSlice";
import { saveToStorage } from "./storage";

const localStorageMiddleware: Middleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);
    if (isTaskMutationAction(action)) {
      saveToStorage((getState() as { tasks: { items: Task[] } }).tasks.items);
    }
    return result;
  };

export const store = configureStore({
  reducer: { tasks: tasksReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type AppDispatch = typeof store.dispatch;
