import { useEffect, useState } from "react";

const STORAGE_KEY = "score-canvas-v2-intro-seen";

export function hasIntroBeenSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}

interface IntroOverlayProps {
  onDismiss: () => void;
  onStartTour: () => void;
}

export function IntroOverlay({ onDismiss, onStartTour }: IntroOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    markIntroSeen();
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  const handleTour = () => {
    markIntroSeen();
    setVisible(false);
    setTimeout(() => {
      onDismiss();
      onStartTour();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={handleDismiss}
    >
      <div
        className="bg-[#0d0d1a] border border-canvas-highlight/50 rounded-2xl shadow-2xl max-w-[520px] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-canvas-highlight/40 bg-canvas-highlight/10 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-canvas-highlight animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-canvas-highlight">First 60 seconds</span>
          </div>
          <h2 className="text-2xl font-black text-canvas-text mb-1">Welcome to Score Canvas.</h2>
          <p className="text-sm text-canvas-muted leading-relaxed">
            You're looking at a real, auditionable adaptive music system. Here's what you can do right now:
          </p>
        </div>

        {/* Three quick steps */}
        <div className="px-6 pb-5 space-y-2.5">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-canvas-accent/20 border border-canvas-accent/30">
            <div className="w-7 h-7 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center text-canvas-highlight text-xs font-black flex-shrink-0">▶</div>
            <div>
              <div className="text-[13px] font-bold text-canvas-text">Press <span className="font-mono bg-canvas-bg border border-canvas-accent/50 rounded px-1.5 py-0.5 text-[11px]">Play Sequence</span> in the transport bar</div>
              <div className="text-[11px] text-canvas-muted">Hear the music system play through — states, transitions, and all.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-canvas-accent/20 border border-canvas-accent/30">
            <div className="w-7 h-7 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center text-canvas-highlight text-xs font-black flex-shrink-0">✎</div>
            <div>
              <div className="text-[13px] font-bold text-canvas-text">Double-click any node</div>
              <div className="text-[11px] text-canvas-muted">See its full detail — asset, stems, director notes, and connections.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-canvas-accent/20 border border-canvas-accent/30">
            <div className="w-7 h-7 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center text-canvas-highlight text-xs font-black flex-shrink-0">⇄</div>
            <div>
              <div className="text-[13px] font-bold text-canvas-text">Switch projects in the sidebar</div>
              <div className="text-[11px] text-canvas-muted">Six full demo games: Journey 2, Bloodborne 2, COD, Meditation Retreat, more.</div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 text-xs font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-colors shadow-lg shadow-canvas-highlight/25"
          >
            Start Exploring →
          </button>
          <button
            onClick={handleTour}
            className="px-4 py-2.5 text-xs font-semibold rounded-lg border border-canvas-accent text-canvas-text hover:border-canvas-highlight/50 hover:text-canvas-highlight transition-colors"
          >
            Take the Full Tour
          </button>
        </div>
      </div>
    </div>
  );
}
