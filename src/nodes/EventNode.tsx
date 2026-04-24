import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useViewMode } from "../context/ViewModeContext";
import { usePlayingNode } from "../context/PlayingNodeContext";
import { StatusBadge } from "../components/StatusBadge";
import { PlayButton } from "../components/PlayButton";

interface EventData {
  [key: string]: unknown;
  label: string;
  eventType: "cinematic" | "igc" | "button_press" | "checkpoint" | "scripted_sequence" | "qte";
  blueprintRef: string;
  description: string;
  directorNote?: string;
  status?: string;
  jiraTicket?: string;
}

type EventNode = Node<EventData, "event">;

const eventTypeConfig: Record<string, { color: string; label: string }> = {
  cinematic: { color: "#e94560", label: "CINEMATIC" },
  igc: { color: "#f59e0b", label: "IGC" },
  button_press: { color: "#22d3ee", label: "BUTTON PRESS" },
  checkpoint: { color: "#4ade80", label: "CHECKPOINT" },
  scripted_sequence: { color: "#c084fc", label: "SCRIPTED SEQ" },
  qte: { color: "#fb923c", label: "QTE" },
};

export function EventNode({ data, id }: NodeProps<EventNode>) {
  const { mode } = useViewMode();
  const simple = mode === "simple";
  const config = eventTypeConfig[data.eventType] ?? eventTypeConfig.cinematic;
  const playingId = usePlayingNode();
  const isPlaying = playingId === id;

  return (
    <div
      className={`bg-[#1a1520] border-2 rounded-lg shadow-lg ${simple ? "px-3 py-2 min-w-[120px]" : "px-4 py-3 min-w-[180px]"} ${isPlaying ? "ring-2 ring-cyan-400/40 shadow-cyan-500/30 shadow-xl" : ""}`}
      style={{ borderColor: isPlaying ? "#22d3ee" : config.color, animation: isPlaying ? "pulse 2s ease-in-out infinite" : undefined }}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3" style={{ background: config.color }} />
      <div className="flex items-center gap-1.5 mb-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: config.color }}>
          <rect x="2" y="2" width="20" height="20" rx="2.18" /><path d="M10 8l6 4-6 4V8z" />
        </svg>
        <span className="text-[10px] font-mono uppercase tracking-wider flex-1" style={{ color: config.color }}>{config.label}</span>
        <PlayButton
          nodeId={id}
          category={data.eventType === "cinematic" || data.eventType === "igc" ? "intro" : "stinger"}
          musicalKey="Dm"
          bpm={120}
        />
      </div>
      <div className="text-sm font-semibold text-canvas-text">{data.label}</div>
      {!simple && (
        <>
          {data.blueprintRef && (
            <div className="text-[10px] font-mono text-canvas-muted mt-0.5 truncate max-w-[200px]">
              BP: {data.blueprintRef}
            </div>
          )}
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
      <Handle type="source" position={Position.Right} className="!w-3 !h-3" style={{ background: config.color }} />
    </div>
  );
}
