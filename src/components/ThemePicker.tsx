/**
 * ThemePicker — small dropdown in the TopBar that swaps the entire app's
 * color palette between Score Canvas (default) and 7 DAW-inspired alternates.
 *
 * Theme labels are descriptive nods to recognizable audio tools — not
 * affiliations. Color palettes themselves aren't copyrightable.
 */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../themes";

export function ThemePicker() {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onMouse);
    return () => window.removeEventListener("mousedown", onMouse);
  }, [open]);

  const current = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={`Theme · ${current.label}`}
        className="flex items-center gap-2 px-2 py-1 text-[11px] font-mono rounded border border-canvas-accent text-canvas-muted hover:text-canvas-text hover:border-canvas-highlight/50 transition-colors"
      >
        {/* Color swatch made of the 3 critical colors */}
        <span className="flex items-center gap-0.5">
          <span className="w-2 h-2 rounded-sm bg-canvas-bg border border-canvas-muted/40" />
          <span className="w-2 h-2 rounded-sm bg-canvas-surface" />
          <span className="w-2 h-2 rounded-sm bg-canvas-highlight" />
        </span>
        <span className="hidden md:inline truncate max-w-[90px]">{current.label}</span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M0 0l4 5 4-5z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-[#0d0d1a] border border-canvas-accent rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-canvas-accent/50">
            <div className="text-[9px] font-mono uppercase tracking-wider text-canvas-muted">Theme</div>
            <div className="text-[10px] text-canvas-muted/70 italic">Color nods to tools you might recognize.</div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {THEMES.map((t) => {
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-3 ${
                    active ? "bg-canvas-highlight/15 border-l-2 border-l-canvas-highlight" : "hover:bg-canvas-accent/30 border-l-2 border-l-transparent"
                  }`}
                >
                  {/* 4-stripe preview swatch using the theme's actual colors (bypassing CSS vars so each shows its own palette) */}
                  <div className="flex-shrink-0 flex items-center gap-px rounded overflow-hidden border border-canvas-accent/40" style={{ width: 36, height: 18 }}>
                    <div style={{ flex: 1, background: `rgb(${t.vars.bg})` }} />
                    <div style={{ flex: 1, background: `rgb(${t.vars.surface})` }} />
                    <div style={{ flex: 1, background: `rgb(${t.vars.accent})` }} />
                    <div style={{ flex: 1, background: `rgb(${t.vars.highlight})` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-bold truncate ${active ? "text-canvas-highlight" : "text-canvas-text"}`}>{t.label}</div>
                    <div className="text-[9px] text-canvas-muted truncate italic">{t.tagline}</div>
                  </div>
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-canvas-highlight flex-shrink-0">
                      <path d="M1 5l3 3L9 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
