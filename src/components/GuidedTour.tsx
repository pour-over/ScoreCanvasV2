import { useState, useEffect, useCallback, useRef } from "react";

// ─── Tour step definitions ──────────────────────────────────────────────────

export interface TourStep {
  /** CSS selector for the target element */
  target: string;
  /** Title shown in tooltip */
  title: string;
  /** Description text */
  content: string;
  /** Tooltip placement relative to target */
  placement?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='sidebar']",
    title: "Projects & Levels",
    content: "Switch between game projects and their levels. Each level has its own music graph with unique nodes and audio.",
    placement: "right",
  },
  {
    target: "[data-tour='canvas']",
    title: "The Music Graph",
    content: "This is your interactive music state machine. Nodes represent music states, transitions, events, stingers, and parameters. Drag to pan, scroll to zoom.",
    placement: "bottom",
  },
  {
    target: "[data-tour='node-play']",
    title: "Preview Audio",
    content: "Every node has a play button. Click it to audition the audio assigned to that node — great for spot-checking individual cues.",
    placement: "bottom",
  },
  {
    target: "[data-tour='transport']",
    title: "Transport Controls",
    content: "The playback engine. Press play to walk the entire graph as a sequence, hearing each node's audio in order. Skip forward, rewind to any node, and toggle between modes.",
    placement: "top",
  },
  {
    target: "[data-tour='mode-toggle']",
    title: "Transition Check vs Full Score",
    content: "Transition Check plays the first and last 10 seconds of each track — perfect for checking transitions. Full Score plays the entire file.",
    placement: "top",
  },
  {
    target: "[data-tour='stop-all']",
    title: "Panic Button",
    content: "Stops all audio immediately. Use this if things get noisy!",
    placement: "top",
  },
  {
    target: "[data-tour='jump-node']",
    title: "Jump to Node",
    content: "Search for any node by name or type. During playback, it jumps the sequence there. When stopped, it auditions that node directly.",
    placement: "bottom",
  },
  {
    target: "[data-tour='view-mode']",
    title: "Simple / Detailed Mode",
    content: "Toggle between a compact view (just names) and detailed view (stems, intensity bars, director notes, status badges).",
    placement: "bottom",
  },
  {
    target: "[data-tour='project-assets']",
    title: "Project Assets",
    content: "Browse all audio assets across levels. Preview tracks, view stems, and access AI generation tools for variations, intros, transitions, and more.",
    placement: "bottom",
  },
  {
    target: "[data-tour='export']",
    title: "Export Schema",
    content: "Export your music graph as JSON for Wwise, FMOD, or custom game engine integration.",
    placement: "bottom",
  },
  {
    target: "[data-tour='integrations']",
    title: "Tool Integrations",
    content: "Connect to Wwise, Unreal Engine, Perforce, and JIRA. Sync your music design directly with your production pipeline.",
    placement: "bottom",
  },
];

// ─── Spotlight overlay + tooltip ────────────────────────────────────────────

const STORAGE_KEY = "scorecanvas-tour-seen";
const PADDING = 8;
const TOOLTIP_GAP = 12;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function tooltipPosition(rect: Rect, placement: string, tipW: number, tipH: number) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  switch (placement) {
    case "right":
      return { top: cy - tipH / 2, left: rect.left + rect.width + PADDING + TOOLTIP_GAP };
    case "left":
      return { top: cy - tipH / 2, left: rect.left - PADDING - TOOLTIP_GAP - tipW };
    case "top":
      return { top: rect.top - PADDING - TOOLTIP_GAP - tipH, left: cx - tipW / 2 };
    case "bottom":
    default:
      return { top: rect.top + rect.height + PADDING + TOOLTIP_GAP, left: cx - tipW / 2 };
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function GuidedTour({ onClose }: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tipPos, setTipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[stepIndex];

  const updatePosition = useCallback(() => {
    if (!step) return;
    const rect = getRect(step.target);
    setTargetRect(rect);
    if (rect && tipRef.current) {
      const tipW = tipRef.current.offsetWidth;
      const tipH = tipRef.current.offsetHeight;
      let pos = tooltipPosition(rect, step.placement ?? "bottom", tipW, tipH);
      // Clamp to viewport
      pos.left = Math.max(12, Math.min(pos.left, window.innerWidth - tipW - 12));
      pos.top = Math.max(12, Math.min(pos.top, window.innerHeight - tipH - 12));
      setTipPos(pos);
    }
  }, [step]);

  useEffect(() => {
    // Small delay for entrance animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    updatePosition();
    // Re-position on resize/scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const timer = setTimeout(updatePosition, 100); // re-measure after render
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      clearTimeout(timer);
    };
  }, [updatePosition, stepIndex]);

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const isLast = stepIndex === TOUR_STEPS.length - 1;

  // Spotlight cutout path
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let clipPath = `M0,0 L${vw},0 L${vw},${vh} L0,${vh} Z`;
  if (targetRect) {
    const { top, left, width, height } = targetRect;
    const p = PADDING;
    const r = 8; // border radius
    // Cutout rectangle (counter-clockwise for hole)
    clipPath += ` M${left - p + r},${top - p}`;
    clipPath += ` L${left + width + p - r},${top - p}`;
    clipPath += ` Q${left + width + p},${top - p} ${left + width + p},${top - p + r}`;
    clipPath += ` L${left + width + p},${top + height + p - r}`;
    clipPath += ` Q${left + width + p},${top + height + p} ${left + width + p - r},${top + height + p}`;
    clipPath += ` L${left - p + r},${top + height + p}`;
    clipPath += ` Q${left - p},${top + height + p} ${left - p},${top + height + p - r}`;
    clipPath += ` L${left - p},${top - p + r}`;
    clipPath += ` Q${left - p},${top - p} ${left - p + r},${top - p}`;
    clipPath += ` Z`;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={handleFinish}>
        <path
          d={clipPath}
          fill="rgba(0,0,0,0.75)"
          fillRule="evenodd"
        />
      </svg>

      {/* Spotlight ring glow */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-lg"
          style={{
            top: targetRect.top - PADDING,
            left: targetRect.left - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
            boxShadow: "0 0 0 2px rgba(78, 205, 196, 0.6), 0 0 20px rgba(78, 205, 196, 0.3)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tipRef}
        className="absolute pointer-events-auto"
        style={{ top: tipPos.top, left: tipPos.left, maxWidth: 340, minWidth: 260 }}
      >
        <div className="bg-[#0f0f2a]/98 border border-canvas-highlight/50 rounded-xl shadow-2xl backdrop-blur-md p-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIndex ? 16 : 5,
                    height: 5,
                    background: i === stepIndex ? "#4ecdc4" : i < stepIndex ? "#4ecdc466" : "#3a3a5c",
                    borderRadius: 999,
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono text-canvas-muted ml-auto">
              {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Content */}
          <h3 className="text-sm font-bold text-canvas-highlight mb-1">{step.title}</h3>
          <p className="text-[11px] text-canvas-text/80 leading-relaxed mb-3">{step.content}</p>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="text-[10px] text-canvas-muted hover:text-canvas-text transition-colors"
            >
              Skip tour
            </button>
            <div className="flex-1" />
            {stepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-canvas-accent text-canvas-text hover:bg-canvas-accent/30 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-[10px] font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-colors shadow-lg shadow-canvas-highlight/20"
            >
              {isLast ? "Get Started!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: check if tour has been seen ────────────────────────────────────

export function hasTourBeenSeen(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEY);
}
