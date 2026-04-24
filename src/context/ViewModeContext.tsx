import { createContext, useContext, useState, type ReactNode } from "react";

type ViewMode = "detailed" | "simple";

interface ViewModeContextType {
  mode: ViewMode;
  toggle: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({ mode: "detailed", toggle: () => {} });

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("detailed");
  const toggle = () => setMode((m) => (m === "detailed" ? "simple" : "detailed"));
  return (
    <ViewModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
