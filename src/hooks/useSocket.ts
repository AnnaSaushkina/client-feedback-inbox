import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io as connectSocket } from "socket.io-client";
import type { AppDispatch } from "../store";
import { fetchTasks, USE_API } from "../store";

export function useSocket() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!USE_API) return;
    const socket = connectSocket(new URL(import.meta.env.VITE_API_URL).origin);
    socket.on("tasks:update", () => {
      dispatch(fetchTasks());
    });
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
}
