import { useState, useEffect, useCallback } from "react";
import { stopAudition, getPlayingAssetId, type AssetCategory } from "../audio/synth";
import { useSequence } from "../context/SequenceContext";

interface PlayButtonProps {
  nodeId: string;
  category?: AssetCategory;
  musicalKey?: string;
  bpm?: number;
  audioFile?: string;
  playbackMode?: "full" | "transition";
  preRoll?: { category: AssetCategory; durationMs: number };
  postRoll?: { category: AssetCategory; durationMs: number };
  size?: "sm" | "md";
}

export function PlayButton({
  nodeId,
  size = "sm",
}: PlayButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<"idle" | "pre" | "main" | "post">("idle");
  const { isPlaying: sequencePlaying, playFromNode } = useSequence();

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      const current = getPlayingAssetId();
      if (current !== nodeId && current !== `${nodeId}-pre` && current !== `${nodeId}-post`) {
        setPlaying(false);
        setPhase("idle");
      }
    }, 200);
    return () => clearInterval(interval);
  }, [playing, nodeId]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      // If sequence is running, rewind to this node
      if (sequencePlaying) {
        playFromNode(nodeId);
        return;
      }

      // If already playing from a previous click, stop
      if (playing) {
        stopAudition();
        setPlaying(false);
        setPhase("idle");
        return;
      }

      // Start sequence from this node ("play from here")
      playFromNode(nodeId);
    },
    [playing, nodeId, sequencePlaying, playFromNode],
  );

  const dim = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const iconSize = size === "sm" ? 10 : 12;

  const phaseLabel = phase === "pre" ? "PRE" : phase === "post" ? "POST" : "";

  return (
    <button
      data-tour="node-play"
      onClick={handleClick}
      className={`${dim} rounded-full flex items-center justify-center transition-all duration-150 relative ${
        playing
          ? "bg-red-500/30 text-red-400 ring-2 ring-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
          : "bg-canvas-bg/60 text-canvas-muted hover:text-green-400 hover:bg-green-500/20 hover:ring-1 hover:ring-green-500/40"
      }`}
      title={playing ? `Stop (${phase})` : "Audition"}
    >
      {playing ? (
        <>
          <svg width={iconSize} height={iconSize} viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="8" height="8" rx="1" />
          </svg>
          {phaseLabel && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-mono font-bold text-red-400 whitespace-nowrap">
              {phaseLabel}
            </span>
          )}
        </>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 10 10" fill="currentColor">
          <polygon points="2,0.5 9.5,5 2,9.5" />
        </svg>
      )}
    </button>
  );
}
