import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 8-bit platformer character that runs across the screen during sequence playback.
 * Journey 2: Scarf figure running through desert/mountains
 * Bloodborne 2: Cat in pajamas bouncing through gothic cat environments
 */

interface PixelRunnerProps {
  playing: boolean;
  currentNodeId: string | null;
  currentNodeType: string | null;
  projectId: string; // "journey-2" | "bloodborne-2"
  totalNodes: number;
  currentNodeIndex: number;
  onRewind?: (targetIndex: number) => void;
  nodeLabels?: string[];
}

// ─── Sprite definitions (CSS pixel art) ─────────────────────────────────────

type SpriteFrame = string[][]; // rows of pixel colors

const JOURNEY_SPRITES: Record<string, SpriteFrame> = {
  run1: [
    ["", "", "r", "r", "", ""],
    ["", "r", "r", "r", "r", ""],
    ["", "", "w", "w", "", ""],
    ["", "w", "w", "w", "", ""],
    ["", "", "w", "", "", ""],
    ["", "w", "", "w", "", ""],
    ["", "w", "", "", "w", ""],
  ],
  run2: [
    ["", "", "r", "r", "", ""],
    ["", "r", "r", "r", "r", ""],
    ["", "", "w", "w", "", ""],
    ["", "w", "w", "w", "", ""],
    ["", "", "w", "", "", ""],
    ["", "", "w", "w", "", ""],
    ["", "w", "", "", "w", ""],
  ],
  jump: [
    ["r", "r", "r", "r", "r", ""],
    ["", "r", "r", "r", "r", "r"],
    ["", "", "w", "w", "", ""],
    ["", "w", "w", "w", "", ""],
    ["", "w", "", "w", "", ""],
    ["w", "", "", "", "w", ""],
  ],
  duck: [
    ["", "", "", "", "", ""],
    ["", "", "r", "r", "", ""],
    ["", "r", "r", "r", "r", ""],
    ["", "w", "w", "w", "w", ""],
    ["", "w", "w", "w", "w", ""],
  ],
  power: [
    ["y", "", "r", "r", "", "y"],
    ["", "y", "r", "r", "y", ""],
    ["", "r", "w", "w", "r", ""],
    ["", "w", "w", "w", "w", ""],
    ["", "", "w", "w", "", ""],
    ["", "w", "", "", "w", ""],
    ["y", "", "", "", "", "y"],
  ],
};

const BLOODBORNE_SPRITES: Record<string, SpriteFrame> = {
  run1: [
    ["", "p", "p", "p", "", ""],
    ["", "p", "g", "p", "", ""],
    ["", "", "p", "", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "", "b", "", "", ""],
    ["", "b", "", "b", "", ""],
  ],
  run2: [
    ["", "p", "p", "p", "", ""],
    ["", "p", "g", "p", "", ""],
    ["", "", "p", "", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "", "b", "", "", ""],
    ["", "", "b", "b", "", ""],
  ],
  jump: [
    ["", "p", "p", "p", "", ""],
    ["", "p", "g", "p", "", ""],
    ["t", "", "p", "", "t", ""],
    ["", "b", "b", "b", "", ""],
    ["", "b", "", "b", "", ""],
    ["b", "", "", "", "b", ""],
  ],
  duck: [
    ["", "", "", "", "", ""],
    ["", "p", "p", "p", "", ""],
    ["", "p", "g", "p", "", ""],
    ["", "b", "b", "b", "b", ""],
    ["", "b", "b", "b", "b", ""],
  ],
  power: [
    ["c", "", "", "", "", "c"],
    ["", "p", "p", "p", "", ""],
    ["c", "p", "g", "p", "", "c"],
    ["", "b", "b", "b", "", ""],
    ["", "b", "b", "b", "", ""],
    ["", "b", "", "b", "", ""],
    ["c", "", "", "", "", "c"],
  ],
};

const COLOR_MAP: Record<string, string> = {
  r: "#e94560", // red (Journey scarf)
  w: "#e0d6c8", // white/tan (Journey body)
  y: "#fbbf24", // yellow (power sparkle)
  p: "#f0abfc", // pink (cat ears/head)
  g: "#4ade80", // green (cat eyes)
  b: "#93c5fd", // blue (pajamas)
  t: "#facc15", // tail
  c: "#c084fc", // catnip sparkle
};

// ─── Ground tile patterns ───────────────────────────────────────────────────

function GroundTile({ variant }: { variant: "desert" | "gothic" }) {
  const colors = variant === "desert"
    ? { ground: "#d4a76a", detail: "#c4955a", accent: "#b8854a" }
    : { ground: "#374151", detail: "#4b5563", accent: "#6b21a8" };

  return (
    <div className="flex-shrink-0" style={{ width: 16, height: 8 }}>
      <div style={{ width: 16, height: 4, background: colors.ground }} />
      <div className="flex">
        <div style={{ width: 8, height: 4, background: colors.detail }} />
        <div style={{ width: 8, height: 4, background: colors.accent }} />
      </div>
    </div>
  );
}

// ─── Background elements ────────────────────────────────────────────────────

function BGElement({ type, x }: { type: string; x: number }) {
  if (type === "dune") {
    return (
      <div className="absolute bottom-2" style={{ left: x }}>
        <div className="w-6 h-2 rounded-t-full" style={{ background: "#d4a76a44" }} />
      </div>
    );
  }
  if (type === "cactus") {
    return (
      <div className="absolute bottom-2" style={{ left: x }}>
        <div className="w-1 h-4" style={{ background: "#4ade8066" }} />
        <div className="absolute top-1 -left-1 w-1 h-2" style={{ background: "#4ade8066" }} />
      </div>
    );
  }
  if (type === "tombstone") {
    return (
      <div className="absolute bottom-2" style={{ left: x }}>
        <div className="w-2 h-3 rounded-t" style={{ background: "#6b728066" }} />
      </div>
    );
  }
  if (type === "candle") {
    return (
      <div className="absolute bottom-2" style={{ left: x }}>
        <div className="w-0.5 h-3" style={{ background: "#92400e66" }} />
        <div className="w-1 h-1 rounded-full absolute -top-1 -left-px" style={{ background: "#fbbf2488" }} />
      </div>
    );
  }
  return null;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function PixelRunner({
  playing,
  currentNodeId,
  currentNodeType,
  projectId,
  totalNodes,
  currentNodeIndex,
  onRewind,
  nodeLabels,
}: PixelRunnerProps) {
  const [frame, setFrame] = useState(0);
  const [action, setAction] = useState<"run" | "jump" | "duck" | "power">("run");
  const [yOffset, setYOffset] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; life: number }>>([]);
  const particleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevNodeRef = useRef<string | null>(null);

  const isJourney = projectId === "journey-2";
  const sprites = isJourney ? JOURNEY_SPRITES : BLOODBORNE_SPRITES;

  // Run animation cycle
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, [playing]);

  // Jump/duck/power-up on node change
  useEffect(() => {
    if (!currentNodeId || currentNodeId === prevNodeRef.current) return;
    prevNodeRef.current = currentNodeId;

    // Determine action based on node type
    if (currentNodeType === "transition") {
      setAction("jump");
      setYOffset(-12);
      setTimeout(() => { setYOffset(-6); }, 150);
      setTimeout(() => { setYOffset(0); setAction("run"); }, 300);
    } else if (currentNodeType === "stinger") {
      setAction("duck");
      setTimeout(() => setAction("run"), 500);
    } else if (currentNodeType === "event") {
      // Power-up flash!
      setAction("power");
      // Add particles
      const newParticles = Array.from({ length: 5 }, () => ({
        id: ++particleId.current,
        x: Math.random() * 20 - 10,
        y: Math.random() * -15 - 5,
        life: 600,
      }));
      setParticles((p) => [...p, ...newParticles]);
      setTimeout(() => setAction("run"), 800);
    } else if (currentNodeType === "parameter") {
      // Quick bob
      setYOffset(-6);
      setTimeout(() => setYOffset(0), 200);
    } else {
      // musicState — slight hop
      setAction("run");
      setYOffset(-4);
      setTimeout(() => setYOffset(0), 150);
    }
  }, [currentNodeId, currentNodeType]);

  // Decay particles
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((p) => p.filter((pp) => pp.life > 0).map((pp) => ({ ...pp, life: pp.life - 100, y: pp.y - 1 })));
    }, 100);
    return () => clearInterval(interval);
  }, [particles.length]);

  const getSprite = useCallback((): SpriteFrame => {
    if (action === "jump") return sprites.jump;
    if (action === "duck") return sprites.duck;
    if (action === "power") return sprites.power;
    return frame % 2 === 0 ? sprites.run1 : sprites.run2;
  }, [action, frame, sprites]);

  const addNodeChangeEffect = useCallback(() => {
    setParticles((p) => [
      ...p,
      ...Array.from({ length: 3 }, () => ({
        id: ++particleId.current,
        x: Math.random() * 16 - 8,
        y: Math.random() * -10 - 5,
        life: 400,
      })),
    ]);
  }, []);

  // Trigger effect on node change
  useEffect(() => {
    if (currentNodeId && prevNodeRef.current !== currentNodeId) {
      addNodeChangeEffect();
    }
  }, [currentNodeId, addNodeChangeEffect]);

  if (!playing) return null;

  const progress = totalNodes > 0 ? currentNodeIndex / totalNodes : 0;
  const spriteData = getSprite();
  const pixelSize = 3;

  // Background elements
  const bgElements = isJourney
    ? [
        { type: "dune", x: 30 }, { type: "cactus", x: 80 }, { type: "dune", x: 150 },
        { type: "cactus", x: 220 }, { type: "dune", x: 300 },
      ]
    : [
        { type: "tombstone", x: 40 }, { type: "candle", x: 90 }, { type: "tombstone", x: 160 },
        { type: "candle", x: 230 }, { type: "tombstone", x: 310 },
      ];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border backdrop-blur-sm"
      style={{
        height: 48,
        background: isJourney
          ? "linear-gradient(to bottom, #1a0a2e 0%, #2d1b4e 40%, #d4a76a 100%)"
          : "linear-gradient(to bottom, #0f0f23 0%, #1a1a3e 40%, #374151 100%)",
        borderColor: isJourney ? "#d4a76a44" : "#6b21a844",
      }}
    >
      {/* Stars/particles in sky */}
      {[15, 45, 78, 120, 190, 250, 310].map((x, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-px h-px"
          style={{
            left: x,
            top: 3 + (i * 3) % 12,
            background: isJourney ? "#fbbf2466" : "#c084fc44",
            boxShadow: `0 0 2px ${isJourney ? "#fbbf24" : "#c084fc"}`,
          }}
        />
      ))}

      {/* Background elements */}
      {bgElements.map((el, i) => (
        <BGElement key={i} type={el.type} x={el.x} />
      ))}

      {/* Ground tiles */}
      <div className="absolute bottom-0 left-0 right-0 flex">
        {Array.from({ length: 24 }, (_, i) => (
          <GroundTile key={i} variant={isJourney ? "desert" : "gothic"} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5" style={{
        width: `${progress * 100}%`,
        background: isJourney ? "#e94560aa" : "#c084fcaa",
        transition: "width 0.5s ease",
      }} />

      {/* Rewind node markers — clickable dots along the progress bar */}
      {onRewind && totalNodes > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-3 flex items-end">
          {Array.from({ length: totalNodes }, (_, idx) => {
            const markerX = 8 + (idx / totalNodes) * 80;
            const isCurrent = idx === currentNodeIndex;
            const isPast = idx < currentNodeIndex;
            return (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); onRewind(idx); }}
                className="absolute group"
                style={{ left: `${markerX}%`, bottom: 0, transform: "translateX(-50%)" }}
                title={nodeLabels?.[idx] ?? `Node ${idx + 1}`}
              >
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: isCurrent ? 6 : 4,
                    height: isCurrent ? 6 : 4,
                    background: isCurrent
                      ? (isJourney ? "#e94560" : "#c084fc")
                      : isPast
                        ? (isJourney ? "#e9456066" : "#c084fc66")
                        : (isJourney ? "#d4a76a33" : "#6b728033"),
                    boxShadow: isCurrent ? `0 0 4px ${isJourney ? "#e94560" : "#c084fc"}` : "none",
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap px-1.5 py-0.5 rounded text-[7px] font-mono bg-black/90 border border-white/10 text-white/80 z-50">
                  {nodeLabels?.[idx] ?? `Node ${idx + 1}`}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Character */}
      <div
        className="absolute transition-all duration-100"
        style={{
          left: `${8 + progress * 80}%`,
          bottom: 10 + yOffset,
          transform: "translateX(-50%)",
        }}
      >
        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: p.x,
              top: p.y,
              background: isJourney ? "#fbbf24" : "#c084fc",
              opacity: p.life / 600,
              transition: "opacity 0.1s",
            }}
          />
        ))}

        {/* Sprite */}
        <div style={{ imageRendering: "pixelated" }}>
          {spriteData.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((pixel, ci) => (
                <div
                  key={ci}
                  style={{
                    width: pixelSize,
                    height: pixelSize,
                    background: pixel ? COLOR_MAP[pixel] ?? "transparent" : "transparent",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Node type indicator */}
      {currentNodeType && (
        <div className="absolute top-1 right-2 text-[7px] font-mono uppercase tracking-wider"
          style={{ color: isJourney ? "#d4a76a88" : "#6b728088" }}
        >
          {currentNodeType === "musicState" ? "♪" : currentNodeType === "transition" ? "→" : currentNodeType === "stinger" ? "⚡" : currentNodeType === "event" ? "★" : "◆"}
        </div>
      )}

      {/* Game label */}
      <div className="absolute top-1 left-2 text-[7px] font-mono uppercase tracking-wider"
        style={{ color: isJourney ? "#d4a76a66" : "#6b728066" }}
      >
        {isJourney ? "JOURNEY 2" : "BB2: CiP"}
      </div>
    </div>
  );
}
