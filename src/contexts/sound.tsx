import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "soundMuted";

interface SoundCtx {
  muted: boolean;
  toggleMuted: () => void;
}

const SoundContext = createContext<SoundCtx | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ muted, toggleMuted }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundSettings(): SoundCtx {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSoundSettings вызван вне SoundProvider");
  return ctx;
}
