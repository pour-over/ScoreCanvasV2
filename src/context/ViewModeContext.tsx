import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ViewMode = "detailed" | "simple";

interface ViewModeContextType {
  mode: ViewMode;
  toggle: () => void;
  setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({ mode: "simple", toggle: () => {}, setMode: () => {} });

const STORAGE_KEY = "score-canvas-v2-view-mode";

export function ViewModeProvider({ children }: { children: ReactNode }) {
  // Default to "simple" for a beautiful, uncluttered first impression.
  // Once the user toggles, remember their preference.
  const [mode, setModeState] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "detailed" || stored === "simple") return stored;
    } catch { /* localStorage unavailable */ }
    return "simple";
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  const toggle = () => setModeState((m) => (m === "detailed" ? "simple" : "detailed"));
  const setMode = (next: ViewMode) => setModeState(next);

  return (
    <ViewModeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
