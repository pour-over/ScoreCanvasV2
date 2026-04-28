/**
 * HelpModeContext — global "Show me hints" toggle.
 *
 * When `helpMode` is true, every <SectionHint> renders its glowing-pulse
 * affordance regardless of whether the user has dismissed it before.
 * Toggled from the Help dropdown.
 *
 * Persisted to localStorage so refreshes don't drop the help state.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "score-canvas-v2-help-mode";

interface HelpModeContextValue {
  helpMode: boolean;
  setHelpMode: (next: boolean) => void;
  toggle: () => void;
}

const HelpModeContext = createContext<HelpModeContextValue>({
  helpMode: false,
  setHelpMode: () => {},
  toggle: () => {},
});

export function HelpModeProvider({ children }: { children: ReactNode }) {
  const [helpMode, setHelpModeState] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, helpMode ? "true" : "false"); } catch { /* ignore */ }
  }, [helpMode]);

  const value: HelpModeContextValue = {
    helpMode,
    setHelpMode: setHelpModeState,
    toggle: () => setHelpModeState((m) => !m),
  };

  return <HelpModeContext.Provider value={value}>{children}</HelpModeContext.Provider>;
}

export function useHelpMode() {
  return useContext(HelpModeContext);
}
