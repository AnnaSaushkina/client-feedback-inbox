import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "assignees";
const DEFAULT_ASSIGNEES = ["Аня", "Паша", "Олег"];

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

const Ctx = createContext<AssigneesCtx | null>(null);

export function AssigneesProvider({ children }: { children: ReactNode }) {
  const [assignees, setAssignees] = useState<string[]>(load);

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAssignees((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const rename = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setAssignees((prev) => {
      const next = prev.map((a) => (a === oldName ? trimmed : a));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((name: string) => {
    setAssignees((prev) => {
      const next = prev.filter((a) => a !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ assignees, add, rename, remove }}>{children}</Ctx.Provider>;
}

export function useAssignees(): AssigneesCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssignees must be used within AssigneesProvider");
  return ctx;
}
