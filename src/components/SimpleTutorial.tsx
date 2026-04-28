/**
 * SimpleTutorial — lightweight spotlight-and-card walkthrough engine.
 *
 * Smaller cousin of GameTutorial. Each step has a title, narrator label, body,
 * optional `targetSelector` to spotlight, and an optional `actionLabel` for
 * the next button. No `waitFor: viewMode:detailed` or email-gate variants —
 * just next-button progression.
 *
 * Used by PostSigninTutorial (post-magic-link onboarding) and ProTutorial
 * (advanced curriculum). Can be reused by future per-section walkthroughs.
 */

import { useEffect, useRef, useState } from "react";

interface Rect { top: number; left: number; width: number; height: number }

export interface SimpleStep {
  id: string;
  title: string;
  narrator: string;
  body: string;
  /** CSS selector of the element to spotlight. If omitted the card is centered. */
  targetSelector?: string;
  /** Override the next-button label for this step. */
  actionLabel?: string;
  /** Padding around the spotlight rect. Default 8. */
  highlightPadding?: number;
  /** Card placement relative to the spotlight target. Default "auto". */
  cardPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

interface Props {
  steps: SimpleStep[];
  onDismiss: () => void;
  /** Optional badge text shown above the title (e.g. "Pro" or "Welcome back"). */
  curriculumLabel?: string;
}

export function SimpleTutorial({ steps, onDismiss, curriculumLabel }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Compute the spotlight rect when the step changes or the window resizes.
  useEffect(() => {
    function update() {
      if (!current.targetSelector) {
        setSpotlight(null);
        return;
      }
      const el = document.querySelector(current.targetSelector);
      if (!el) {
        setSpotlight(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const pad = current.highlightPadding ?? 8;
      setSpotlight({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
    }
    update();
    const t = setTimeout(update, 100);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current.targetSelector, current.highlightPadding, stepIndex]);

  // Compute card position based on spotlight + cardPosition hint.
  function cardStyle(): React.CSSProperties {
    if (!spotlight || current.cardPosition === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }
    const margin = 16;
    const cardW = 380;
    const cardH = cardRef.current?.offsetHeight ?? 200;
    let top = spotlight.top + spotlight.height + margin;
    let left = spotlight.left;
    const pos = current.cardPosition;
    if (pos === "top-left") {
      top = Math.max(margin, spotlight.top - cardH - margin);
      left = spotlight.left;
    } else if (pos === "top-right") {
      top = Math.max(margin, spotlight.top - cardH - margin);
      left = spotlight.left + spotlight.width - cardW;
    } else if (pos === "bottom-left") {
      top = spotlight.top + spotlight.height + margin;
      left = spotlight.left;
    } else if (pos === "bottom-right") {
      top = spotlight.top + spotlight.height + margin;
      left = spotlight.left + spotlight.width - cardW;
    }
    // Clamp to viewport.
    top = Math.max(margin, Math.min(top, window.innerHeight - cardH - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - cardW - margin));
    return { position: "fixed", top, left, width: cardW };
  }

  function handleNext() {
    if (isLast) {
      onDismiss();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-200 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Dim backdrop with optional spotlight cut-out */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <mask id="simple-tutorial-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#simple-tutorial-mask)" />
        {spotlight && (
          <rect
            x={spotlight.left}
            y={spotlight.top}
            width={spotlight.width}
            height={spotlight.height}
            rx={10}
            fill="none"
            stroke="rgb(var(--c-highlight))"
            strokeWidth={2}
            strokeOpacity={0.8}
          />
        )}
      </svg>

      {/* Card */}
      <div
        ref={cardRef}
        style={cardStyle()}
        className="bg-canvas-surface border border-canvas-highlight/50 rounded-xl shadow-2xl p-5 max-w-md"
      >
        {curriculumLabel && (
          <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-canvas-highlight mb-1">
            {curriculumLabel} · {stepIndex + 1} / {steps.length}
          </div>
        )}
        {!curriculumLabel && (
          <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-canvas-muted mb-1">
            {stepIndex + 1} / {steps.length}
          </div>
        )}
        <div className="text-[10px] font-mono uppercase tracking-wider text-canvas-muted mb-1">{current.narrator}</div>
        <h3 className="text-lg font-black text-canvas-text mb-2">{current.title}</h3>
        <p className="text-[12px] text-canvas-muted leading-relaxed mb-4">{current.body}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onDismiss}
            className="text-[10px] font-mono text-canvas-muted hover:text-canvas-text transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-canvas-highlight text-canvas-bg hover:bg-canvas-highlight/90 transition-colors"
          >
            {current.actionLabel ?? (isLast ? "Done" : "Next →")}
          </button>
        </div>
      </div>
    </div>
  );
}
