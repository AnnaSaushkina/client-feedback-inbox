import { useEffect } from "react";
import { io as connectSocket } from "socket.io-client";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/index";
import { fetchTasks, USE_API } from "../store/tasksSlice";

// подписка на обновления задач с сервера
export function useSocket() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!USE_API) return;

    const socket = connectSocket(new URL(import.meta.env.VITE_API_URL).origin);
    socket.on("tasks:update", () => { dispatch(fetchTasks()); });
    return () => { socket.disconnect(); };
  }, [dispatch]);
}
