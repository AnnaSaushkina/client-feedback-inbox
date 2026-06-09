import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "assignees";
const DEFAULT_ASSIGNEES = ["Аня", "Паша", "Олег"];

function loadAssignees(): string[] {
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

const AssigneesContext = createContext<AssigneesCtx | null>(null);

export function AssigneesProvider({ children }: { children: ReactNode }) {
  const [assignees, setAssignees] = useState<string[]>(loadAssignees);

  const persist = (next: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAssignees((prev) =>
      prev.includes(trimmed) ? prev : persist([...prev, trimmed]),
    );
  }, []);

  const rename = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setAssignees((prev) =>
      persist(prev.map((a) => (a === oldName ? trimmed : a))),
    );
  }, []);

  const remove = useCallback((name: string) => {
    setAssignees((prev) => persist(prev.filter((a) => a !== name)));
  }, []);

  return (
    <AssigneesContext.Provider value={{ assignees, add, rename, remove }}>
      {children}
    </AssigneesContext.Provider>
  );
}

export function useAssignees(): AssigneesCtx {
  const ctx = useContext(AssigneesContext);
  if (!ctx) throw new Error("useAssignees вызван вне AssigneesProvider");
  return ctx;
}
