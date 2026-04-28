/**
 * SectionHint — wraps a UI region in a soft pulsing glow + corner ? badge
 * the first time the user encounters it. Click the badge or the region
 * to see a 1-3 step popover explaining what's there. Marking "Got it"
 * persists to localStorage so the glow only fires once per region.
 *
 * When HelpMode is active, every SectionHint glows again regardless of
 * the per-section seen flag — gives the user an "explain everything"
 * button without clearing dismissed-state forever.
 *
 * Animation respects prefers-reduced-motion: glowing becomes a static
 * cyan ring rather than a pulse.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useHelpMode } from "../context/HelpModeContext";

const STORAGE_PREFIX = "score-canvas-v2.section.";

interface Step {
  title: string;
  body: string;
}

interface Props {
  /** Stable id; persisted in localStorage so dismissal sticks across sessions. */
  id: string;
  steps: Step[];
  children: ReactNode;
  /** Tailwind className for the wrapper. Default `relative` so the badge anchors. */
  className?: string;
  /** Place the corner badge. Default top-right. */
  badgeAnchor?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

function seenKey(id: string) { return STORAGE_PREFIX + id + ".seen"; }
function readSeen(id: string): boolean {
  try { return localStorage.getItem(seenKey(id)) === "true"; } catch { return false; }
}
function writeSeen(id: string) {
  try { localStorage.setItem(seenKey(id), "true"); } catch { /* ignore */ }
}

export function SectionHint({ id, steps, children, className = "relative", badgeAnchor = "top-right" }: Props) {
  const { helpMode } = useHelpMode();
  const [seen, setSeen] = useState(() => readSeen(id));
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // If the user re-toggles helpMode, reset the inner step index so the
  // popover starts fresh next click.
  useEffect(() => { if (!helpMode) setStepIndex(0); }, [helpMode]);

  // Click-outside closes the popover.
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onMouse);
    return () => window.removeEventListener("mousedown", onMouse);
  }, [open]);

  const showGlow = helpMode || !seen;
  const isLast = stepIndex >= steps.length - 1;
  const current = steps[stepIndex];

  function dismiss() {
    setOpen(false);
    setStepIndex(0);
    if (!seen) {
      writeSeen(id);
      setSeen(true);
    }
  }

  const anchorClass =
    badgeAnchor === "top-left"     ? "top-1 left-1"   :
    badgeAnchor === "bottom-right" ? "bottom-1 right-1" :
    badgeAnchor === "bottom-left"  ? "bottom-1 left-1" :
    "top-1 right-1";

  return (
    <div className={`${className} ${showGlow ? "sc-hint-glow" : ""}`}>
      {children}
      {showGlow && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); setStepIndex(0); }}
          className={`absolute ${anchorClass} z-30 w-5 h-5 rounded-full bg-canvas-highlight text-canvas-bg text-[11px] font-black flex items-center justify-center shadow-lg border border-canvas-bg/50 hover:scale-110 transition-transform`}
          title="What is this?"
          aria-label={`Show hint for ${id}`}
        >
          ?
        </button>
      )}
      {open && current && (
        <div
          ref={popoverRef}
          className="absolute top-full right-0 mt-2 z-40 w-72 bg-canvas-surface border border-canvas-highlight/40 rounded-lg shadow-2xl p-3.5"
        >
          <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-canvas-highlight mb-1">
            Hint · {stepIndex + 1} / {steps.length}
          </div>
          <div className="text-[12px] font-bold text-canvas-text mb-1.5">{current.title}</div>
          <p className="text-[11px] text-canvas-muted leading-relaxed mb-3">{current.body}</p>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={dismiss}
              className="text-[10px] font-mono text-canvas-muted hover:text-canvas-text transition-colors"
            >
              {isLast ? "Got it" : "Skip"}
            </button>
            {!isLast && (
              <button
                onClick={() => setStepIndex((i) => i + 1)}
                className="px-2.5 py-1 text-[10px] font-bold rounded bg-canvas-highlight text-canvas-bg hover:bg-canvas-highlight/90 transition-colors"
              >
                Next →
              </button>
            )}
            {isLast && (
              <button
                onClick={dismiss}
                className="px-2.5 py-1 text-[10px] font-bold rounded bg-canvas-highlight text-canvas-bg hover:bg-canvas-highlight/90 transition-colors"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
