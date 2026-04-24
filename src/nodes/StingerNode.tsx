import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useViewMode } from "../context/ViewModeContext";
import { usePlayingNode } from "../context/PlayingNodeContext";
import { StatusBadge } from "../components/StatusBadge";
import { PlayButton } from "../components/PlayButton";

interface StingerData {
  [key: string]: unknown;
  label: string;
  trigger: string;
  asset: string;
  priority: "low" | "medium" | "high" | "critical";
  directorNote?: string;
  status?: string;
  jiraTicket?: string;
}

type StingerNode = Node<StingerData, "stinger">;

const priorityColors: Record<string, string> = {
  low: "#6b7280",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export function StingerNode({ data, id }: NodeProps<StingerNode>) {
  const { mode } = useViewMode();
  const simple = mode === "simple";
  const color = priorityColors[data.priority] ?? "#6b7280";
  const playingId = usePlayingNode();
  const isPlaying = playingId === id;

  return (
    <div
      className={`bg-[#2a1a1e] border-2 rounded-lg shadow-lg ${simple ? "px-3 py-2 min-w-[120px]" : "px-4 py-3 min-w-[160px]"} ${isPlaying ? "ring-2 ring-orange-400/40 shadow-orange-500/30 shadow-xl" : ""}`}
      style={{ borderColor: isPlaying ? "#fb923c" : color, animation: isPlaying ? "pulse 2s ease-in-out infinite" : undefined }}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3" style={{ background: color }} />
      <div className="flex items-center gap-1.5 mb-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="text-xs font-mono uppercase tracking-wider flex-1" style={{ color }}>Stinger</span>
        <PlayButton
          nodeId={id}
          category="stinger"
          musicalKey="Dm"
          bpm={120}
        />
      </div>
      <div className="text-sm font-semibold text-canvas-text">{data.label}</div>
      {!simple && (
        <>
          <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[10px]">
            <span className="text-canvas-muted">Trigger:</span>
            <span className="text-canvas-text font-mono">{data.trigger}</span>
            <span className="text-canvas-muted">Asset:</span>
            <span className="text-canvas-text font-mono truncate">{data.asset}</span>
            <span className="text-canvas-muted">Priority:</span>
            <span className="font-mono font-bold uppercase" style={{ color }}>{data.priority}</span>
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
      <Handle type="source" position={Position.Right} className="!w-3 !h-3" style={{ background: color }} />
    </div>
  );
}
