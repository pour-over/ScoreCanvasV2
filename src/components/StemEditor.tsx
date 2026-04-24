import { useState, useCallback } from "react";
import type { MusicAsset } from "../data/projects";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StemState {
  name: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  fadeIn: number;   // seconds
  fadeOut: number;  // seconds
  trimStart: number; // seconds
  trimEnd: number;   // seconds (from end)
}

interface StemEditorProps {
  asset: MusicAsset;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

// ─── Waveform visualization (decorative) ────────────────────────────────────

function MiniWaveform({ stem, color, muted }: { stem: string; color: string; muted: boolean }) {
  // Generate deterministic "waveform" from stem name
  const bars: number[] = [];
  for (let i = 0; i < 48; i++) {
    const seed = stem.charCodeAt(i % stem.length) * (i + 1);
    bars.push(0.15 + (((seed * 9301 + 49297) % 233280) / 233280) * 0.85);
  }

  return (
    <div className={`flex items-center gap-px h-6 ${muted ? "opacity-20" : "opacity-80"}`}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full transition-opacity"
          style={{ height: `${h * 100}%`, background: color }}
        />
      ))}
    </div>
  );
}

// ─── Color palette for stems ────────────────────────────────────────────────

const STEM_COLORS = ["#4ecdc4", "#e94560", "#a855f7", "#f59e0b", "#818cf8", "#22c55e"];

// ─── Component ──────────────────────────────────────────────────────────────

export function StemEditor({ asset, expanded, onExpand, onCollapse }: StemEditorProps) {
  const [stems, setStems] = useState<StemState[]>(() =>
    asset.stems.map((name) => ({
      name,
      muted: false,
      solo: false,
      volume: 0.8,
      fadeIn: 0,
      fadeOut: 0,
      trimStart: 0,
      trimEnd: 0,
    }))
  );

  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  const toggleMute = useCallback((idx: number) => {
    setStems((s) => s.map((st, i) => i === idx ? { ...st, muted: !st.muted } : st));
  }, []);

  const toggleSolo = useCallback((idx: number) => {
    setStems((s) => s.map((st, i) => i === idx ? { ...st, solo: !st.solo } : st));
  }, []);

  const setVolume = useCallback((idx: number, v: number) => {
    setStems((s) => s.map((st, i) => i === idx ? { ...st, volume: v } : st));
  }, []);

  // AI generation is coming in v2.5 — buttons are disabled in V2
  // Kept the setAiGenerating state to minimize diff; will be wired up later
  void setAiGenerating;

  const hasSoloActive = stems.some((s) => s.solo);

  if (stems.length === 0) return null;

  // ─── Collapsed inline view (under asset in browser) ─────────────────────

  if (!expanded) {
    return (
      <div className="ml-6 mt-0.5 mb-1">
        <div className="flex flex-col gap-0.5">
          {stems.slice(0, 4).map((stem, i) => (
            <div
              key={stem.name}
              className="flex items-center gap-1 group cursor-pointer hover:bg-canvas-accent/20 rounded px-1 py-0.5"
              onClick={onExpand}
            >
              {/* Mini mute/solo */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(i); }}
                className={`w-3.5 h-3.5 rounded text-[7px] font-bold flex items-center justify-center transition-colors ${
                  stem.muted ? "bg-red-500/40 text-red-300" : "bg-canvas-bg/60 text-canvas-muted/50 hover:text-canvas-text"
                }`}
                title={stem.muted ? "Unmute" : "Mute"}
              >
                M
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleSolo(i); }}
                className={`w-3.5 h-3.5 rounded text-[7px] font-bold flex items-center justify-center transition-colors ${
                  stem.solo ? "bg-amber-500/40 text-amber-300" : "bg-canvas-bg/60 text-canvas-muted/50 hover:text-canvas-text"
                }`}
                title={stem.solo ? "Unsolo" : "Solo"}
              >
                S
              </button>

              {/* Mini waveform */}
              <div className="flex-1 h-4 overflow-hidden">
                <MiniWaveform
                  stem={stem.name}
                  color={STEM_COLORS[i % STEM_COLORS.length]}
                  muted={stem.muted || (hasSoloActive && !stem.solo)}
                />
              </div>

              {/* Stem name */}
              <span className="text-[8px] font-mono text-canvas-muted/60 truncate max-w-[80px]">{stem.name}</span>
            </div>
          ))}
          {stems.length > 4 && (
            <button onClick={onExpand} className="text-[8px] text-canvas-muted/50 hover:text-canvas-highlight ml-1 text-left">
              +{stems.length - 4} more stems…
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Expanded full editor ─────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8" onClick={onCollapse}>
      <div
        className="bg-[#0d0d1a] border border-canvas-accent rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-canvas-accent">
          <div>
            <h2 className="text-sm font-semibold text-canvas-text">{asset.filename}</h2>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-canvas-muted font-mono">
              <span>{asset.duration}</span>
              <span>{asset.bpm} BPM</span>
              <span>{asset.key}</span>
              <span className="text-canvas-highlight">{stems.length} stems</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Generate buttons — honest labeling: coming v2.5 */}
            <button
              title="AI generation is coming in v2.5"
              disabled
              className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-purple-900/30 text-purple-300 border border-purple-500/30 opacity-60 cursor-not-allowed flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
              Generate Intro
              <span className="ml-0.5 text-[8px] font-mono bg-purple-500/30 rounded px-1 text-purple-200">SOON</span>
            </button>
            <button
              title="AI generation is coming in v2.5"
              disabled
              className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-purple-900/30 text-purple-300 border border-purple-500/30 opacity-60 cursor-not-allowed flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
              Generate Endtag
              <span className="ml-0.5 text-[8px] font-mono bg-purple-500/30 rounded px-1 text-purple-200">SOON</span>
            </button>
            <button
              onClick={onCollapse}
              className="w-7 h-7 rounded-lg bg-canvas-bg text-canvas-muted hover:text-white hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Master waveform */}
        <div className="px-4 pt-3 pb-2">
          <div className="bg-canvas-bg/60 rounded-lg p-2 border border-canvas-accent/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-canvas-muted uppercase">Master Output</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-canvas-muted">0:00</span>
                <div className="w-48 h-1 bg-canvas-accent/50 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-canvas-highlight rounded-full" />
                </div>
                <span className="text-[9px] font-mono text-canvas-muted">{asset.duration}</span>
              </div>
            </div>
            <div className="h-10 flex items-center">
              <MiniWaveform stem={asset.filename + "_master"} color="#4ecdc4" muted={false} />
            </div>
          </div>
        </div>

        {/* Stem tracks */}
        <div className="px-4 pb-4 flex flex-col gap-1.5">
          {stems.map((stem, i) => {
            const color = STEM_COLORS[i % STEM_COLORS.length];
            const isEffectivelyMuted = stem.muted || (hasSoloActive && !stem.solo);
            // isGenerating removed — AI Variation is disabled until v2.5
            void aiGenerating;

            return (
              <div
                key={stem.name}
                className={`rounded-lg border p-2.5 transition-all ${
                  isEffectivelyMuted
                    ? "bg-canvas-bg/30 border-canvas-accent/30 opacity-50"
                    : "bg-canvas-bg/60 border-canvas-accent/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Mute / Solo */}
                  <button
                    onClick={() => toggleMute(i)}
                    className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                      stem.muted
                        ? "bg-red-500/60 text-white"
                        : "bg-canvas-bg text-canvas-muted hover:bg-red-500/20 hover:text-red-300"
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(i)}
                    className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                      stem.solo
                        ? "bg-amber-500/60 text-white"
                        : "bg-canvas-bg text-canvas-muted hover:bg-amber-500/20 hover:text-amber-300"
                    }`}
                  >
                    S
                  </button>

                  {/* Stem name */}
                  <span className="text-[10px] font-mono font-semibold truncate flex-1" style={{ color }}>
                    {stem.name}
                  </span>

                  {/* AI Generate Variation — coming soon */}
                  <button
                    disabled
                    title="AI variation generation is coming in v2.5"
                    className="px-2 py-0.5 text-[9px] font-semibold rounded border flex items-center gap-1 bg-purple-900/20 text-purple-400/70 border-purple-500/20 opacity-60 cursor-not-allowed"
                  >
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/>
                    </svg>
                    AI Variation
                    <span className="ml-0.5 text-[7px] font-mono bg-purple-500/30 rounded px-1 text-purple-200">SOON</span>
                  </button>

                  {/* Volume slider */}
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={stem.volume}
                      onChange={(e) => setVolume(i, parseFloat(e.target.value))}
                      className="w-14 h-1 accent-canvas-highlight"
                    />
                    <span className="text-[8px] font-mono text-canvas-muted w-5 text-right">
                      {Math.round(stem.volume * 100)}
                    </span>
                  </div>
                </div>

                {/* Waveform with edit controls */}
                <div className="relative rounded bg-canvas-bg/40 p-1">
                  {/* Trim handles */}
                  {stem.trimStart > 0 && (
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-black/50 rounded-l"
                      style={{ width: `${(stem.trimStart / 30) * 100}%` }}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-400/60" />
                    </div>
                  )}
                  {stem.trimEnd > 0 && (
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-black/50 rounded-r"
                      style={{ width: `${(stem.trimEnd / 30) * 100}%` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-400/60" />
                    </div>
                  )}
                  {/* Fade in indicator */}
                  {stem.fadeIn > 0 && (
                    <div
                      className="absolute top-0 bottom-0 left-0 rounded-l"
                      style={{
                        width: `${(stem.fadeIn / 30) * 100}%`,
                        background: `linear-gradient(to right, ${color}33, transparent)`,
                      }}
                    />
                  )}
                  {/* Fade out indicator */}
                  {stem.fadeOut > 0 && (
                    <div
                      className="absolute top-0 bottom-0 right-0 rounded-r"
                      style={{
                        width: `${(stem.fadeOut / 30) * 100}%`,
                        background: `linear-gradient(to left, ${color}33, transparent)`,
                      }}
                    />
                  )}
                  <MiniWaveform stem={stem.name} color={color} muted={isEffectivelyMuted} />
                </div>

                {/* Edit controls row */}
                <div className="flex items-center gap-3 mt-1.5 px-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-canvas-muted/60">Fade In</span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={stem.fadeIn}
                      onChange={(e) => setStems((s) => s.map((st, j) => j === i ? { ...st, fadeIn: parseFloat(e.target.value) } : st))}
                      className="w-10 h-0.5 accent-canvas-highlight"
                    />
                    <span className="text-[7px] font-mono text-canvas-muted/50 w-4">{stem.fadeIn.toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-canvas-muted/60">Fade Out</span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={stem.fadeOut}
                      onChange={(e) => setStems((s) => s.map((st, j) => j === i ? { ...st, fadeOut: parseFloat(e.target.value) } : st))}
                      className="w-10 h-0.5 accent-canvas-highlight"
                    />
                    <span className="text-[7px] font-mono text-canvas-muted/50 w-4">{stem.fadeOut.toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-canvas-muted/60">Trim Start</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={stem.trimStart}
                      onChange={(e) => setStems((s) => s.map((st, j) => j === i ? { ...st, trimStart: parseFloat(e.target.value) } : st))}
                      className="w-10 h-0.5 accent-canvas-highlight"
                    />
                    <span className="text-[7px] font-mono text-canvas-muted/50 w-4">{stem.trimStart.toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-canvas-muted/60">Trim End</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={stem.trimEnd}
                      onChange={(e) => setStems((s) => s.map((st, j) => j === i ? { ...st, trimEnd: parseFloat(e.target.value) } : st))}
                      className="w-10 h-0.5 accent-canvas-highlight"
                    />
                    <span className="text-[7px] font-mono text-canvas-muted/50 w-4">{stem.trimEnd.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-canvas-accent bg-canvas-bg/30">
          <div className="flex items-center gap-2">
            <button disabled title="Coming in v2.5" className="px-3 py-1.5 text-[10px] font-semibold rounded-md bg-canvas-accent text-canvas-muted opacity-60 cursor-not-allowed">
              Reset All <span className="ml-1 text-[8px] font-mono">SOON</span>
            </button>
            <button disabled title="Coming in v2.5" className="px-3 py-1.5 text-[10px] font-semibold rounded-md bg-canvas-accent text-canvas-muted opacity-60 cursor-not-allowed">
              Export Stems <span className="ml-1 text-[8px] font-mono">SOON</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button disabled title="Real-time stem mixing coming in v2.5" className="px-3 py-1.5 text-[10px] font-semibold rounded-md bg-green-900/30 text-green-400 border border-green-500/30 opacity-60 cursor-not-allowed flex items-center gap-1">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor"><polygon points="1,0 10,5 1,10" /></svg>
              Preview Mix <span className="ml-1 text-[8px] font-mono bg-green-500/30 rounded px-1">SOON</span>
            </button>
            <button disabled title="Coming in v2.5" className="px-3 py-1.5 text-[10px] font-semibold rounded-md bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 opacity-60 cursor-not-allowed">
              Apply Changes <span className="ml-1 text-[8px] font-mono bg-canvas-highlight/30 rounded px-1">SOON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
