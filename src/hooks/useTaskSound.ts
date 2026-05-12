import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectTasks } from "../store/tasksSlice";
import type { Task } from "../types/Task";

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

// Новая задача: C5 → E5, громко
const playNewTask = () => playChime(523, 659, 0.6, 0.8);
// Переход в тестирование: E5 → G5 → C6, чуть тише и мягче
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
  const prevTasksRef = useRef<Task[] | null>(null);

  useEffect(() => {
    const prev = prevTasksRef.current;
    prevTasksRef.current = tasks;
    if (prev === null) return;

    const prevActive = prev.filter((t) => !t.completed);
    const currActive = tasks.filter((t) => !t.completed);

    // Новая задача добавлена
    if (currActive.length > prevActive.length) {
      playNewTask();
      return;
    }

    // Задача перешла в тестирование
    const movedToTesting = currActive.some((t) => {
      const was = prevActive.find((p) => p.id === t.id);
      return t.status === "тестирование" && was?.status !== "тестирование";
    });
    if (movedToTesting) playTesting();
  }, [tasks]);
}
