import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import tasksReducer, {
  isTaskMutationAction,
  saveToStorage,
} from "./tasksSlice";
import type { Task } from "../types/Task";

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
  reducer: {
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
