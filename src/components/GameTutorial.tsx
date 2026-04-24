/**
 * GameTutorial — a game-tutorial-style onboarding flow.
 *
 * Inspired by modern game tutorials (Portal's opening, Celeste's chapter 1 guide):
 * - Dim overlay with spotlight on the target element
 * - Narrator-style text in a corner card
 * - Step advances when the user performs the action (click, toggle, etc.)
 * - Progress indicator top-right
 * - Skippable but not dismissible by accident
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useViewMode } from "../context/ViewModeContext";

// Bumped from v2-tutorial-seen when transition-check + email steps were added,
// so returning users see the updated tutorial.
const STORAGE_KEY = "score-canvas-v2-tutorial-seen-v2";

export function hasTutorialBeenSeen(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
}

export function markTutorialSeen() {
  try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
}

interface Rect { top: number; left: number; width: number; height: number }

interface Step {
  id: string;
  title: string;
  narrator: string;
  body: string;
  targetSelector?: string;      // CSS selector of the element to spotlight
  waitFor?: "click" | "viewMode:detailed" | "viewMode:simple" | "next" | "email";
  highlightPadding?: number;
  cardPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  actionLabel?: string;         // Text for the "got it / next" button
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Welcome, designer.",
    narrator: "Narrator",
    body: "You are looking at a real, auditionable adaptive music system for a fictional game. Let's walk through it together. This will take about 90 seconds.",
    waitFor: "next",
    cardPosition: "center",
    actionLabel: "Begin tutorial →",
  },
  {
    id: "canvas",
    title: "This is the Canvas.",
    narrator: "The Canvas",
    body: "Every node here is a music element — a music state, a transition, a stinger, an event, or an RTPC parameter. Connections show how the music flows during gameplay. Drag to pan, scroll to zoom.",
    targetSelector: "[data-tour='canvas']",
    waitFor: "next",
    cardPosition: "top-right",
    actionLabel: "Got it →",
  },
  {
    id: "sidebar",
    title: "Projects & Levels live here.",
    narrator: "The Sidebar",
    body: "Six complete demo projects are loaded. You can switch between them — or lock onto one if your studio ships a single game for three years straight.",
    targetSelector: "[data-tour='sidebar']",
    waitFor: "next",
    cardPosition: "top-right",
    actionLabel: "Continue →",
  },
  {
    id: "play",
    title: "Press play. Hear the system.",
    narrator: "The Transport",
    body: "This is the heart of Score Canvas — click Play to walk the graph and audition every state and transition. In-browser. No DAW. No middleware build.",
    targetSelector: "[data-tour='transport-play']",
    waitFor: "click",
    cardPosition: "top-right",
    actionLabel: "Waiting for you to press Play...",
  },
  {
    id: "transition-check",
    title: "Transition Check — the secret weapon.",
    narrator: "Playback Mode",
    body: "Click this toggle to switch from 'Full Score' to 'Transition Check' mode. Instead of playing each node in full, you'll hear only the first and last 10 seconds — so you can audition every crossfade and seam in the system in about a minute. No one else has this.",
    targetSelector: "[data-tour='mode-toggle']",
    waitFor: "click",
    cardPosition: "top-right",
    actionLabel: "Click the toggle to try it...",
    highlightPadding: 10,
  },
  {
    id: "detail-toggle",
    title: "Now let's see the details.",
    narrator: "View Mode",
    body: "You're in Simple Mode. Clean, minimal, great for overviews. But every node has rich data underneath — stems, director notes, status, connections. Click 'Detailed' to reveal it all.",
    targetSelector: "[data-tour='view-mode']",
    waitFor: "viewMode:detailed",
    cardPosition: "bottom-right",
    actionLabel: "Waiting for Detailed Mode...",
  },
  {
    id: "double-click",
    title: "Deep-dive any node.",
    narrator: "Node Detail Panel",
    body: "Double-click any node on the canvas to open the full detail panel — director notes, stems, asset info, connected edges. This is where the real work happens.",
    waitFor: "next",
    cardPosition: "center",
    actionLabel: "I'll remember that →",
  },
  {
    id: "integrations",
    title: "Ship it.",
    narrator: "Integrations",
    body: "Export Wwise-ready schemas, FMOD templates, or JSON. And watch the top-right — Live Wwise Sync is coming. Click the orange Ww pill any time to see the roadmap.",
    targetSelector: "[data-tour='integrations']",
    waitFor: "next",
    cardPosition: "bottom-left",
    actionLabel: "One last thing →",
  },
  {
    id: "email",
    title: "Stay in the loop.",
    narrator: "Early Access",
    body: "Score Canvas is in active development. Drop your email to get early access to Wwise Live Sync (at cost, for the first cohort) and a heads-up when new projects ship. Then you can start exploring.",
    waitFor: "email",
    cardPosition: "center",
  },
];

interface GameTutorialProps {
  onDismiss: () => void;
}

export function GameTutorial({ onDismiss }: GameTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);
  const [typed, setTyped] = useState("");
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { mode } = useViewMode();
  const viewModeRef = useRef(mode);
  const currentStep = STEPS[stepIndex];

  useEffect(() => { viewModeRef.current = mode; }, [mode]);

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Compute spotlight rect when step changes or window resizes
  useEffect(() => {
    function updateRect() {
      if (!currentStep.targetSelector) {
        setSpotlight(null);
        return;
      }
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (!el) { setSpotlight(null); return; }
      const r = el.getBoundingClientRect();
      const pad = currentStep.highlightPadding ?? 8;
      setSpotlight({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
    }
    updateRect();
    const ro = new ResizeObserver(updateRect);
    document.body && ro.observe(document.body);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const interval = setInterval(updateRect, 500); // catch layout shifts
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearInterval(interval);
    };
  }, [stepIndex, currentStep.targetSelector, currentStep.highlightPadding]);

  // Typewriter effect for the narrator body text
  useEffect(() => {
    setTyped("");
    const text = currentStep.body;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [stepIndex, currentStep.body]);

  // Action-triggered step progression
  useEffect(() => {
    const waitFor = currentStep.waitFor;
    if (!waitFor || waitFor === "next") return;

    if (waitFor === "click" && currentStep.targetSelector) {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (!el) return;
      const handler = () => advance();
      el.addEventListener("click", handler, { once: true });
      return () => el.removeEventListener("click", handler);
    }

    if (waitFor === "viewMode:detailed") {
      if (mode === "detailed") {
        const t = setTimeout(advance, 400);
        return () => clearTimeout(t);
      }
    }
    if (waitFor === "viewMode:simple") {
      if (mode === "simple") {
        const t = setTimeout(advance, 400);
        return () => clearTimeout(t);
      }
    }
  }, [stepIndex, mode, currentStep.waitFor, currentStep.targetSelector]);

  const advance = () => {
    if (stepIndex >= STEPS.length - 1) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const finish = () => {
    markTutorialSeen();
    setMounted(false);
    setTimeout(onDismiss, 200);
  };

  const skip = () => finish();

  // Submit email to Netlify Forms (same form name as Landing page)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      setEmailError("Please enter a valid email.");
      return;
    }
    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("form-name", "waitlist");
      formData.append("email", email);
      formData.append("source", "tutorial");
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      // success — advance (this is the last step, so it will finish)
      setEmailSubmitting(false);
      finish();
    } catch {
      // still let them through — don't block on network error
      setEmailSubmitting(false);
      finish();
    }
  };

  // Card position
  const cardStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = { position: "fixed", zIndex: 10010 };
    switch (currentStep.cardPosition) {
      case "center":
        return { ...base, left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
      case "top-left":
        return { ...base, top: 80, left: 24 };
      case "top-right":
        return { ...base, top: 80, right: 24 };
      case "bottom-left":
        return { ...base, bottom: 24, left: 24 };
      case "bottom-right":
      default:
        return { ...base, bottom: 90, right: 24 };
    }
  }, [currentStep.cardPosition]);

  if (!currentStep) return null;

  return (
    <div className={`pointer-events-none transition-opacity duration-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Full-screen overlay with a spotlight cutout — always visual-only so
          the highlighted element stays interactive. Blocking clicks outside
          the spotlight would prevent users from toggling view mode or pressing play. */}
      <svg
        className="fixed inset-0 z-[10000] pointer-events-none"
        width="100%" height="100%"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(5, 5, 15, 0.78)"
          mask={spotlight ? "url(#spotlight-mask)" : undefined}
        />
        {/* Pulsing ring around spotlight */}
        {spotlight && (
          <rect
            x={spotlight.left}
            y={spotlight.top}
            width={spotlight.width}
            height={spotlight.height}
            rx="12"
            fill="none"
            stroke="#4ecdc4"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 16px rgba(78,205,196,0.6))" }}
          >
            <animate attributeName="stroke-opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
          </rect>
        )}
      </svg>

      {/* Progress HUD — top-center, game-style */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10010] pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#0d0d1a]/95 border border-canvas-highlight/40 backdrop-blur-md shadow-2xl">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-canvas-highlight">Tutorial</span>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-5 h-1 rounded-full transition-all duration-300 ${
                  i < stepIndex ? "bg-canvas-highlight/80" :
                  i === stepIndex ? "bg-canvas-highlight shadow-[0_0_6px_#4ecdc4]" :
                  "bg-canvas-accent/30"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-canvas-muted">{stepIndex + 1}/{STEPS.length}</span>
          <button
            onClick={skip}
            className="ml-2 text-[10px] font-mono text-canvas-muted/70 hover:text-canvas-text transition-colors"
          >
            skip
          </button>
        </div>
      </div>

      {/* Narrator Card */}
      <div style={cardStyle} className="pointer-events-auto w-[400px] max-w-[92vw]">
        <div className="bg-[#0a0a18]/98 border-2 border-canvas-highlight/60 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
          {/* Title bar with narrator label */}
          <div className="flex items-center gap-2 px-4 py-2 bg-canvas-highlight/10 border-b border-canvas-highlight/30">
            <div className="w-2 h-2 rounded-full bg-canvas-highlight animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-canvas-highlight">{currentStep.narrator}</span>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-black text-canvas-text mb-2 leading-tight">{currentStep.title}</h3>
            <p className="text-[13px] text-canvas-muted leading-relaxed font-mono min-h-[4.5rem]">
              {typed}
              {typed.length < currentStep.body.length && (
                <span className="inline-block w-1.5 h-3 bg-canvas-highlight ml-0.5 animate-pulse align-middle" />
              )}
            </p>

            {/* Action area */}
            <div className="mt-4 flex flex-col gap-2">
              {currentStep.waitFor === "next" && (
                <button
                  onClick={advance}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-colors shadow-lg shadow-canvas-highlight/25"
                >
                  {currentStep.actionLabel ?? "Next →"}
                </button>
              )}
              {currentStep.waitFor === "click" && (
                <div className="w-full px-4 py-2.5 text-xs font-mono rounded-lg bg-canvas-accent/20 border border-canvas-accent/40 text-canvas-highlight animate-pulse text-center">
                  {currentStep.actionLabel ?? "Click the highlighted element..."}
                </div>
              )}
              {(currentStep.waitFor === "viewMode:detailed" || currentStep.waitFor === "viewMode:simple") && (
                <div className="w-full px-4 py-2.5 text-xs font-mono rounded-lg bg-canvas-accent/20 border border-canvas-accent/40 text-canvas-highlight animate-pulse text-center">
                  {currentStep.actionLabel ?? "Change the view mode..."}
                </div>
              )}
              {currentStep.waitFor === "email" && (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                      placeholder="you@studio.com"
                      required
                      autoFocus
                      disabled={emailSubmitting}
                      className="flex-1 bg-[#0d0d1a] border border-canvas-accent rounded-lg px-3 py-2 text-xs text-canvas-text placeholder:text-canvas-muted/50 focus:outline-none focus:border-canvas-highlight disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 disabled:opacity-60 disabled:cursor-wait transition-colors shadow-lg shadow-canvas-highlight/25 whitespace-nowrap"
                    >
                      {emailSubmitting ? "Submitting..." : "Join & Explore →"}
                    </button>
                  </div>
                  {emailError && (
                    <div className="text-[10px] text-red-400 font-mono">{emailError}</div>
                  )}
                  <button
                    type="button"
                    onClick={skip}
                    className="text-[10px] text-canvas-muted/60 hover:text-canvas-muted transition-colors self-center mt-1"
                  >
                    Skip and just try the demo
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
