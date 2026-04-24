import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useViewMode } from "../context/ViewModeContext";
import { usePlayingNode } from "../context/PlayingNodeContext";
import { StatusBadge } from "../components/StatusBadge";
import { PlayButton } from "../components/PlayButton";

interface ParameterData {
  [key: string]: unknown;
  label: string;
  paramName: string;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  description: string;
  directorNote?: string;
  status?: string;
  jiraTicket?: string;
}

type ParameterNode = Node<ParameterData, "parameter">;

export function ParameterNode({ data, id }: NodeProps<ParameterNode>) {
  const { mode } = useViewMode();
  const simple = mode === "simple";
  const pct = ((data.defaultValue - data.minValue) / (data.maxValue - data.minValue)) * 100;
  const playingId = usePlayingNode();
  const isPlaying = playingId === id;

  return (
    <div
      className={`bg-[#1a1a3e] border-2 rounded-lg shadow-lg ${simple ? "px-3 py-2 min-w-[120px]" : "px-4 py-3 min-w-[180px]"} ${isPlaying ? "border-purple-400 ring-2 ring-purple-400/40 shadow-purple-500/30 shadow-xl" : "border-[#a855f7] shadow-purple-900/20"}`}
      style={isPlaying ? { animation: "pulse 2s ease-in-out infinite" } : undefined}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#a855f7] !w-3 !h-3" />
      <div className="flex items-center gap-1.5 mb-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#a855f7]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        <span className="text-xs font-mono text-[#a855f7] uppercase tracking-wider flex-1">RTPC</span>
        <PlayButton
          nodeId={id}
          category="ambient"
          musicalKey="Dm"
          bpm={120}
        />
      </div>
      <div className="text-sm font-semibold text-canvas-text">{data.label}</div>
      {!simple && (
        <>
          <div className="text-[10px] font-mono text-canvas-muted mt-0.5">{data.paramName}</div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-canvas-muted">
            <span>{data.minValue}</span>
            <div className="flex-1 h-1.5 bg-canvas-bg rounded-full overflow-hidden">
              <div className="h-full bg-[#a855f7] rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span>{data.maxValue}</span>
          </div>
          <div className="mt-1.5 text-[10px] text-canvas-muted leading-tight">{data.description}</div>
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
      <Handle type="source" position={Position.Right} className="!bg-[#a855f7] !w-3 !h-3" />
    </div>
  );
}
