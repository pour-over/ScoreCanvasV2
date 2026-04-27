/**
 * ThemeContext — runtime DAW-themed color palette swap.
 *
 * Selected theme persists to localStorage, applies to <html data-theme="...">
 * which CSS variables key off of, and Tailwind's canvas-* colors are wired
 * to those variables — so changing themes re-skins the entire app instantly.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME_ID, getTheme, type ThemeId, THEMES } from "../themes";

const STORAGE_KEY = "score-canvas-theme";

interface ThemeContextValue {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  setTheme: () => {},
});

function applyTheme(id: ThemeId) {
  const theme = getTheme(id);
  const root = document.documentElement;
  root.setAttribute("data-theme", id);
  // Set the CSS variables. Tailwind's canvas-* utilities read these.
  root.style.setProperty("--c-bg", theme.vars.bg);
  root.style.setProperty("--c-surface", theme.vars.surface);
  root.style.setProperty("--c-accent", theme.vars.accent);
  root.style.setProperty("--c-highlight", theme.vars.highlight);
  root.style.setProperty("--c-text", theme.vars.text);
  root.style.setProperty("--c-muted", theme.vars.muted);
  root.style.setProperty("--c-accent-alt", theme.accentAlt);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES.some((t) => t.id === stored)) return stored;
    } catch {
      /* localStorage unavailable */
    }
    return DEFAULT_THEME_ID;
  });

  // Apply on mount + on every change
  useEffect(() => {
    applyTheme(themeId);
    try { localStorage.setItem(STORAGE_KEY, themeId); } catch { /* ignore */ }
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme: setThemeIdState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
