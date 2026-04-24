import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useViewMode } from "../context/ViewModeContext";
import { usePlayingNode } from "../context/PlayingNodeContext";
import { StatusBadge } from "../components/StatusBadge";
import { PlayButton } from "../components/PlayButton";
import type { TransitionData } from "../types";

type TransitionNode = Node<TransitionData, "transition">;

export function TransitionNode({ data, id }: NodeProps<TransitionNode>) {
  const { mode } = useViewMode();
  const simple = mode === "simple";
  const playingId = usePlayingNode();
  const isPlaying = playingId === id;

  return (
    <div
      className={`bg-canvas-accent border-2 rounded-md shadow-lg ${simple ? "px-2 py-1.5 min-w-[100px]" : "px-3 py-2 min-w-[140px]"} ${isPlaying ? "border-red-400 ring-2 ring-red-400/40 shadow-red-500/30 shadow-xl" : "border-canvas-highlight"}`}
      style={isPlaying ? { animation: "pulse 2s ease-in-out infinite" } : undefined}
    >
      <Handle type="target" position={Position.Left} className="!bg-canvas-text !w-2.5 !h-2.5" />
      <div className="flex items-center gap-1.5 mb-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-canvas-highlight" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-mono text-canvas-muted uppercase tracking-wider flex-1">Transition</span>
        <PlayButton
          nodeId={id}
          category="transition"
          musicalKey="Dm"
          bpm={120}
          preRoll={{ category: "loop", durationMs: 3000 }}
          postRoll={{ category: "loop", durationMs: 3000 }}
        />
      </div>
      <div className="text-sm font-semibold text-canvas-text">{data.label}</div>
      {!simple && (
        <>
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-canvas-muted">
            <span>Sync:</span>
            <span className="text-canvas-text">{data.syncPoint}</span>
            <span>Fade:</span>
            <span className="text-canvas-text">{data.fadeType}</span>
            <span>Duration:</span>
            <span className="text-canvas-text">{data.duration}ms</span>
          </div>
          {data.directorNote && (
            <div className="mt-2 border-t border-canvas-accent/50 pt-1.5">
              <div className="text-[9px] font-mono text-amber-400/70 uppercase tracking-wider mb-0.5">Director Note</div>
              <div className="text-[10px] text-amber-200/80 leading-tight italic">{data.directorNote}</div>
            </div>
          )}
          <StatusBadge status={data.status} jiraTicket={data.jiraTicket} />
        </>
      )}
      {simple && (data.status || data.jiraTicket) && <StatusBadge status={data.status} jiraTicket={data.jiraTicket} />}
      <Handle type="source" position={Position.Right} className="!bg-canvas-text !w-2.5 !h-2.5" />
    </div>
  );
}
