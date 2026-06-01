import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io as connectSocket } from "socket.io-client";
import type { AppDispatch } from "./store";
import { fetchTasks, USE_API, selectTasks } from "./store";
import type { Task } from "./types";
import { useSoundSettings } from "./contexts";
import { readImageFiles, getImagesFromClipboard } from "./utils";

// --- useSocket ---

export function useSocket() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!USE_API) return;
    const socket = connectSocket(new URL(import.meta.env.VITE_API_URL).origin);
    socket.on("tasks:update", () => { dispatch(fetchTasks()); });
    return () => { socket.disconnect(); };
  }, [dispatch]);
}

// --- useTaskSound ---

function playChime(freq1: number, freq2: number, volume: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc.frequency.setValueAtTime(freq2, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext недоступен
  }
}

const playNewTask = () => playChime(523, 659, 0.6, 0.8);

const playTesting = () => {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    const notes = [659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.5);
    });
  } catch {
    // AudioContext недоступен
  }
};

export function useTaskSound() {
  const tasks = useSelector(selectTasks);
  const { muted } = useSoundSettings();
  const prevTasksRef = useRef<Task[] | null>(null);

  useEffect(() => {
    const prev = prevTasksRef.current;
    prevTasksRef.current = tasks;
    if (prev === null) return;
    if (muted) return;

    const prevActive = prev.filter((t) => !t.completed);
    const currActive = tasks.filter((t) => !t.completed);

    if (currActive.length > prevActive.length) {
      playNewTask();
      return;
    }

    const movedToTesting = currActive.some((t) => {
      const was = prevActive.find((p) => p.id === t.id);
      return t.status === "тестирование" && was?.status !== "тестирование";
    });
    if (movedToTesting) playTesting();
  }, [tasks, muted]);
}

// --- useScreenshotHandlers ---

export function useScreenshotHandlers(onAdd: (base64s: string[]) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = getImagesFromClipboard(e);
    if (files.length) readImageFiles(files, onAdd);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    readImageFiles(Array.from(e.target.files), onAdd);
    e.target.value = "";
  };

  return { fileInputRef, handlePaste, handleFileUpload };
}
