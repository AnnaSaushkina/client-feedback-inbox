import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// --- AssigneesContext ---

const ASSIGNEES_KEY = "assignees";
const DEFAULT_ASSIGNEES = ["Аня", "Паша", "Олег"];

function loadAssignees(): string[] {
  try {
    const raw = localStorage.getItem(ASSIGNEES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ASSIGNEES;
  } catch {
    return DEFAULT_ASSIGNEES;
  }
}

interface AssigneesCtx {
  assignees: string[];
  add: (name: string) => void;
  rename: (oldName: string, newName: string) => void;
  remove: (name: string) => void;
}

const AssigneesCtxRef = createContext<AssigneesCtx | null>(null);

export function AssigneesProvider({ children }: { children: ReactNode }) {
  const [assignees, setAssignees] = useState<string[]>(loadAssignees);

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAssignees((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem(ASSIGNEES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const rename = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setAssignees((prev) => {
      const next = prev.map((a) => (a === oldName ? trimmed : a));
      localStorage.setItem(ASSIGNEES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((name: string) => {
    setAssignees((prev) => {
      const next = prev.filter((a) => a !== name);
      localStorage.setItem(ASSIGNEES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return <AssigneesCtxRef.Provider value={{ assignees, add, rename, remove }}>{children}</AssigneesCtxRef.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAssignees(): AssigneesCtx {
  const ctx = useContext(AssigneesCtxRef);
  if (!ctx) throw new Error("useAssignees must be used within AssigneesProvider");
  return ctx;
}

// --- SoundContext ---

const SOUND_KEY = "soundMuted";

interface SoundCtx {
  muted: boolean;
  toggleMuted: () => void;
}

const SoundCtxRef = createContext<SoundCtx | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(() => localStorage.getItem(SOUND_KEY) === "true");

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, String(next));
      return next;
    });
  }, []);

  return <SoundCtxRef.Provider value={{ muted, toggleMuted }}>{children}</SoundCtxRef.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSoundSettings(): SoundCtx {
  const ctx = useContext(SoundCtxRef);
  if (!ctx) throw new Error("useSoundSettings must be used within SoundProvider");
  return ctx;
}
