import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectTasks } from "../store";
import type { Task } from "../types";
import { useSoundSettings } from "../contexts";

const NEW_TASK_FREQ_1 = 523;
const NEW_TASK_FREQ_2 = 659;
const NEW_TASK_VOLUME = 0.6;
const NEW_TASK_DURATION = 0.8;
const NOTE_TRANSITION_OFFSET = 0.15;

const TESTING_NOTES = [659, 784, 1047];
const TESTING_VOLUME = 0.45;
const TESTING_TOTAL_DURATION = 1.0;
const TESTING_NOTE_STEP = 0.18;
const TESTING_NOTE_DURATION = 0.5;

function createAudioContext(volume: number, totalDuration: number) {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + totalDuration,
  );
  return { ctx, gain };
}

function playNewTask() {
  try {
    const { ctx, gain } = createAudioContext(
      NEW_TASK_VOLUME,
      NEW_TASK_DURATION,
    );
    const osc = ctx.createOscillator();
    osc.connect(gain);
    osc.type = "sine";
    osc.frequency.setValueAtTime(NEW_TASK_FREQ_1, ctx.currentTime);
    osc.frequency.setValueAtTime(
      NEW_TASK_FREQ_2,
      ctx.currentTime + NOTE_TRANSITION_OFFSET,
    );
    osc.start();
    osc.stop(ctx.currentTime + NEW_TASK_DURATION);
  } catch {
    console.warn("AudioContext недоступен");
  }
}

function playTesting() {
  try {
    const { ctx, gain } = createAudioContext(
      TESTING_VOLUME,
      TESTING_TOTAL_DURATION,
    );
    TESTING_NOTES.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.start(ctx.currentTime + i * TESTING_NOTE_STEP);
      osc.stop(ctx.currentTime + i * TESTING_NOTE_STEP + TESTING_NOTE_DURATION);
    });
  } catch {
    console.warn("AudioContext недоступен");
  }
}

export function useTaskSound() {
  const tasks = useSelector(selectTasks);
  const { muted } = useSoundSettings();
  const prevRef = useRef<Task[] | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = tasks;
    if (prev === null || muted) return;

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
