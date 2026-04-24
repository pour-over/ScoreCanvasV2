import { useState, useEffect, useRef, useCallback } from "react";
import type { Node } from "@xyflow/react";

// ─── Sprite definitions ──────────────────────────────────────────────────────

type SpriteFrame = string[][];

const JOURNEY_SPRITES: Record<string, SpriteFrame> = {
  // Cat in a Journey scarf — pointy ears, round head, flowing red scarf tail
  run1: [
    ["", "w", "", "", "w", "", "", ""],
    ["", "w", "w", "w", "w", "", "", ""],
    ["", "w", "g", "w", "g", "", "", ""],
    ["", "", "w", "w", "w", "", "", ""],
    ["", "r", "w", "w", "r", "r", "r", ""],
    ["", "", "w", "w", "", "", "", "r"],
    ["", "", "w", "", "", "", "", ""],
    ["", "w", "", "w", "", "", "", ""],
  ],
  run2: [
    ["", "w", "", "", "w", "", "", ""],
    ["", "w", "w", "w", "w", "", "", ""],
    ["", "w", "g", "w", "g", "", "", ""],
    ["", "", "w", "w", "w", "", "", ""],
    ["", "r", "w", "w", "r", "r", "", ""],
    ["", "", "w", "w", "", "", "r", ""],
    ["", "", "w", "", "", "", "", "r"],
    ["", "", "w", "w", "", "", "", ""],
  ],
};

const BLOODBORNE_SPRITES: Record<string, SpriteFrame> = {
  run1: [
    ["", "p", "p", "p", "", ""],
    ["", "p", "g", "p", "", ""],
    ["", "", "p", "", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "", "b", "", "b", ""],
  ],
  run2: [
    ["", "p", "p", "p", "", ""],
    ["", "p", "g", "p", "", ""],
    ["", "", "p", "", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "", "b", "b", "", ""],
  ],
};

const COLOR_MAP: Record<string, string> = {
  r: "#e94560", w: "#e0d6c8", y: "#fbbf24",
  p: "#f0abfc", g: "#4ade80", b: "#93c5fd", t: "#facc15", c: "#c084fc",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface TransportBarProps {
  sequencePlaying: boolean;
  sequenceNodeId: string | null;
  sequenceNodeIndex: number;
  sequenceTotalNodes: number;
  sequenceQuickMode: boolean;
  sequenceOrder: Node[];
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaySequence: () => void;
  onStopAll: () => void;
  onSkipNext: () => void;
  onToggleQuickMode: () => void;
  onRewind: (targetIndex: number) => void;
  projectId: string;
}

// ─── Helper: type icon / color ───────────────────────────────────────────────

function typeIcon(t: string) {
  if (t === "transition") return "→";
  if (t === "stinger") return "◆";
  if (t === "event") return "★";
  if (t === "parameter") return "◎";
  return "♪";
}

function typeColor(t: string) {
  if (t === "transition") return "text-red-400";
  if (t === "stinger") return "text-orange-400";
  if (t === "event") return "text-cyan-400";
  if (t === "parameter") return "text-purple-400";
  return "text-green-300";
}

// ─── Sprite Runner (own dedicated lane) ─────────────────────────────────────

function SpriteRunner({ progress, isJourney, playing, nodeLabels, currentIndex }: {
  progress: number;
  isJourney: boolean;
  playing: boolean;
  nodeLabels: { label: string; type: string }[];
  currentIndex: number;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setFrame((f) => (f + 1) % 2), 220);
    return () => clearInterval(interval);
  }, [playing]);

  const sprites = isJourney ? JOURNEY_SPRITES : BLOODBORNE_SPRITES;
  const spriteData = frame % 2 === 0 ? sprites.run1 : sprites.run2;
  const px = 3;
  const accentColor = isJourney ? "#e94560" : "#c084fc";

  return (
    <div className="relative h-8 mx-2 mb-1 rounded-md overflow-hidden" style={{ background: "#080814" }}>
      {/* Terrain gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2" style={{
        background: `linear-gradient(to top, ${isJourney ? "#1a150e" : "#0e0a14"}, transparent)`,
      }} />

      {/* Ground line */}
      <div className="absolute left-0 right-0" style={{
        bottom: 4, height: 1,
        background: isJourney ? "#d4a76a30" : "#6b728030",
      }} />

      {/* Node markers along the path */}
      {nodeLabels.map((nd, i) => {
        const x = nodeLabels.length > 1 ? 4 + (i / (nodeLabels.length - 1)) * 92 : 50;
        const isPast = i < currentIndex;
        const isCurrent = i === currentIndex;
        const markerColor = isCurrent ? "#4ade80" : isPast ? `${accentColor}66` : "#3a3a5c";
        return (
          <div key={i} className="absolute" style={{ left: `${x}%`, bottom: 1, transform: "translateX(-50%)" }}>
            {/* Marker tick */}
            <div style={{
              width: nd.type === "transition" ? 4 : 2,
              height: isCurrent ? 6 : 3,
              background: markerColor,
              borderRadius: 1,
              margin: "0 auto",
            }} />
          </div>
        );
      })}

      {/* Scenery */}
      {[8, 22, 38, 52, 68, 82, 95].map((x, i) => (
        <div key={i} className="absolute" style={{
          left: `${x}%`, bottom: 5,
          width: i % 2 === 0 ? 3 : 1,
          height: i % 2 === 0 ? 3 : 5,
          background: isJourney ? "#d4a76a15" : "#6b728015",
          borderRadius: i % 2 === 0 ? "1px 1px 0 0" : 0,
        }} />
      ))}

      {/* Character */}
      {playing && (
        <div
          className="absolute transition-all duration-500 ease-out"
          style={{
            left: `${4 + progress * 92}%`,
            bottom: 6,
            transform: "translateX(-50%)",
            filter: `drop-shadow(0 0 4px ${accentColor}88)`,
          }}
        >
          <div style={{ imageRendering: "pixelated" as const }}>
            {spriteData.map((row, ri) => (
              <div key={ri} className="flex">
                {row.map((pixel, ci) => (
                  <div key={ci} style={{
                    width: px, height: px,
                    background: pixel ? COLOR_MAP[pixel] ?? "transparent" : "transparent",
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idle state */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-mono text-canvas-muted/30 tracking-wider">READY</span>
        </div>
      )}
    </div>
  );
}

// ─── Transport Bar ───────────────────────────────────────────────────────────

export function TransportBar({
  sequencePlaying,
  sequenceNodeId,
  sequenceNodeIndex,
  sequenceTotalNodes,
  sequenceQuickMode,
  sequenceOrder,
  volume,
  onVolumeChange,
  onPlaySequence,
  onStopAll,
  onSkipNext,
  onToggleQuickMode,
  onRewind,
  projectId,
}: TransportBarProps) {
  const [minimized, setMinimized] = useState(false);
  const [spriteVisible, setSpriteVisible] = useState(true);
  const isJourney = projectId === "journey-2";

  // ─── Draggable transport ──────────────────────────────────────────────────
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number }>({ mx: 0, my: 0, ox: 0, oy: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    isDragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: dragOffset.x, oy: dragOffset.y };
    e.preventDefault();
  }, [dragOffset]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setDragOffset({
        x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
        y: dragStart.current.oy + (e.clientY - dragStart.current.my),
      });
    };
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  const currentNode = sequenceOrder[sequenceNodeIndex];
  const nextNode = sequenceOrder[sequenceNodeIndex + 1];

  const currentLabel = currentNode ? (currentNode.data as Record<string, unknown>).label as string : "";
  const currentType = currentNode?.type ?? "musicState";
  const nextLabel = nextNode ? (nextNode.data as Record<string, unknown>).label as string : null;
  const nextType = nextNode?.type ?? "musicState";

  let upcomingMsg = "";
  if (nextType === "transition") upcomingMsg = "→ transition next";
  else if (nextType === "event") upcomingMsg = "★ event next";
  else if (nextLabel) upcomingMsg = `next: ${nextLabel}`;

  const progress = sequenceTotalNodes > 0 ? sequenceNodeIndex / Math.max(sequenceTotalNodes - 1, 1) : 0;

  const nodeLabels = sequenceOrder.map((n) => ({
    label: (n.data as Record<string, unknown>).label as string,
    type: n.type ?? "musicState",
  }));

  // Minimized
  if (minimized) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a18]/95 border border-canvas-accent/60 backdrop-blur-md shadow-2xl"
        style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}>
        <button onClick={onPlaySequence} className={`w-6 h-6 flex items-center justify-center rounded ${
          sequencePlaying ? "text-red-400" : "text-green-400"
        }`}>
          {sequencePlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="8" height="8" rx="1" /></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="1,0 10,5 1,10" /></svg>
          )}
        </button>
        {sequencePlaying && (
          <span className="text-[9px] font-mono text-green-300 truncate max-w-[120px]">♪ {currentLabel}</span>
        )}
        {sequencePlaying && sequenceTotalNodes > 0 && (
          <div className="flex gap-px items-center">
            {sequenceOrder.map((_, idx) => (
              <div key={idx} className="rounded-full" style={{
                width: idx === sequenceNodeIndex ? 4 : 2,
                height: idx === sequenceNodeIndex ? 4 : 2,
                background: idx === sequenceNodeIndex ? "#4ade80" : idx < sequenceNodeIndex ? "#4ade8066" : "#3a3a5c",
              }} />
            ))}
          </div>
        )}
        <button onClick={() => setMinimized(false)} className="text-canvas-muted hover:text-canvas-text text-[10px] ml-1" title="Expand">▲</button>
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      data-tour="transport"
      onMouseDown={handleDragStart}
      className="rounded-xl bg-[#0a0a18]/95 border border-canvas-accent/60 backdrop-blur-md shadow-2xl select-none"
      style={{ minWidth: 580, maxWidth: 780, transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`, cursor: "grab" }}
    >
      {/* ═══ Row 1: Controls ═══ */}
      <div className="flex items-center gap-1.5 px-3 py-2">

        {/* Play / Stop */}
        <button
          data-tour="transport-play"
          onClick={onPlaySequence}
          className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all ${
            sequencePlaying
              ? "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
              : "bg-green-900/30 text-green-400 border-green-500/50 hover:bg-green-500/20"
          }`}
          title={sequencePlaying ? "Stop sequence" : "Play sequence"}
        >
          {sequencePlaying ? (
            <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><polygon points="2,0 12,6 2,12" /></svg>
          )}
        </button>

        {/* Skip */}
        <button
          onClick={onSkipNext}
          disabled={!sequencePlaying || sequenceNodeIndex >= sequenceTotalNodes - 1}
          className={`w-7 h-9 flex items-center justify-center rounded-lg border transition-all ${
            sequencePlaying && sequenceNodeIndex < sequenceTotalNodes - 1
              ? "text-canvas-text border-canvas-accent/50 hover:bg-canvas-accent/20"
              : "text-canvas-muted/25 border-canvas-accent/20 cursor-not-allowed"
          }`}
          title="Skip to next"
        >
          <svg width="11" height="10" viewBox="0 0 14 10" fill="currentColor">
            <polygon points="0,0 8,5 0,10" />
            <rect x="9" y="0" width="2.5" height="10" rx="0.5" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-canvas-accent/30" />

        {/* Volume */}
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-canvas-muted flex-shrink-0">
            <path d="M8 1.5l-4 3H1v7h3l4 3V1.5z"/>
            {volume > 0 && <path d="M11 4.5c1.2 1.2 1.2 5.8 0 7" fill="none" stroke="currentColor" strokeWidth="1.5"/>}
            {volume > 0.5 && <path d="M13 2.5c2 2.5 2 8.5 0 11" fill="none" stroke="currentColor" strokeWidth="1.5"/>}
          </svg>
          <input
            type="range" min="0" max="1" step="0.05" value={volume}
            onChange={onVolumeChange}
            className="w-16 h-1 accent-canvas-highlight cursor-pointer"
          />
          <span className="text-[8px] font-mono text-canvas-muted/50 w-7">{Math.round(volume * 100)}%</span>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-canvas-accent/30" />

        {/* Now Playing text */}
        <div className="flex-1 min-w-0 px-1">
          {sequencePlaying && sequenceNodeId ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <span className={`text-[11px] font-bold truncate ${typeColor(currentType)}`}>
                  {typeIcon(currentType)} {currentLabel}
                </span>
                <span className="text-[9px] text-canvas-muted font-mono ml-auto flex-shrink-0">
                  {sequenceNodeIndex + 1}/{sequenceTotalNodes}
                </span>
              </div>
              {upcomingMsg && (
                <span className="text-[8px] text-amber-400/60 font-mono italic truncate pl-3">{upcomingMsg}</span>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-canvas-muted/40 font-mono text-center">
              Press play to start
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-canvas-accent/30" />

        {/* Mode toggle */}
        <button
          data-tour="mode-toggle"
          onClick={onToggleQuickMode}
          className={`px-2 py-1.5 text-[9px] font-semibold rounded-md border transition-colors whitespace-nowrap ${
            sequenceQuickMode
              ? "bg-cyan-900/30 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
              : "bg-amber-900/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
          }`}
          title={sequenceQuickMode ? "Transitions Only (~20s per node)" : "Full Score (entire file)"}
        >
          {sequenceQuickMode ? "Transition Check" : "Full Score"}
        </button>

        {/* Sprite toggle */}
        <button
          onClick={() => setSpriteVisible((v) => !v)}
          className={`w-6 h-6 flex items-center justify-center rounded text-[10px] transition-colors ${
            spriteVisible ? "text-canvas-muted/60 hover:text-canvas-text" : "text-canvas-muted/20 hover:text-canvas-muted/40"
          }`}
          title={spriteVisible ? "Hide sprite" : "Show sprite"}
        >
          🎮
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-canvas-accent/30" />

        {/* Stop All */}
        <button
          data-tour="stop-all"
          onClick={onStopAll}
          className="px-2.5 py-1.5 text-[9px] font-bold rounded-md bg-red-950/40 text-red-400/70 border border-red-500/20 hover:bg-red-500/25 hover:text-red-300 transition-colors whitespace-nowrap"
          title="Stop all audio"
        >
          ⏹ Stop All
        </button>

        {/* Minimize */}
        <button
          onClick={() => setMinimized(true)}
          className="w-5 h-5 flex items-center justify-center text-canvas-muted/30 hover:text-canvas-muted text-[9px] transition-colors"
          title="Minimize"
        >
          ▼
        </button>
      </div>

      {/* ═══ Row 2: Sprite runner + rewind dots (dedicated lane, separate from text) ═══ */}
      {spriteVisible && (
        <SpriteRunner
          progress={progress}
          isJourney={isJourney}
          playing={sequencePlaying}
          nodeLabels={nodeLabels}
          currentIndex={sequenceNodeIndex}
        />
      )}

      {/* ═══ Row 3: Rewind dots ═══ */}
      {sequencePlaying && sequenceTotalNodes > 0 && (
        <div className="flex items-center gap-0.5 px-3 pb-1.5 pt-0.5 justify-center">
          {sequenceOrder.map((nd, idx) => {
            const isCurrent = idx === sequenceNodeIndex;
            const isPast = idx < sequenceNodeIndex;
            const nType = nd?.type ?? "musicState";
            return (
              <button
                key={idx}
                onClick={() => onRewind(idx)}
                title={(nd?.data as Record<string, unknown>)?.label as string ?? `Node ${idx + 1}`}
                className="hover:scale-150 transition-transform p-0.5"
              >
                <div style={{
                  width: isCurrent ? 8 : nType === "transition" ? 6 : 4,
                  height: isCurrent ? 8 : nType === "transition" ? 3 : 4,
                  borderRadius: nType === "transition" ? 1 : 999,
                  background: isCurrent ? "#4ade80" : isPast ? "#4ade8055" : "#3a3a5c",
                  boxShadow: isCurrent ? "0 0 6px #4ade80" : "none",
                  transition: "all 0.3s",
                }} />
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Progress bar ═══ */}
      {sequencePlaying && (
        <div className="h-0.5 bg-canvas-accent/10 rounded-b-xl overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${((sequenceNodeIndex + 1) / Math.max(sequenceTotalNodes, 1)) * 100}%`,
              background: `linear-gradient(90deg, ${isJourney ? "#e94560" : "#c084fc"}, ${isJourney ? "#fbbf24" : "#f0abfc"})`,
            }}
          />
        </div>
      )}
    </div>
  );
}
