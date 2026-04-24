import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useViewMode } from "../context/ViewModeContext";
import { usePlayingNode } from "../context/PlayingNodeContext";
import { StatusBadge } from "../components/StatusBadge";
import { PlayButton } from "../components/PlayButton";

interface MusicStateData {
  [key: string]: unknown;
  label: string;
  intensity: number;
  looping: boolean;
  stems: string[];
  asset?: string;
  directorNote?: string;
  status?: string;
  jiraTicket?: string;
}

type MusicStateNode = Node<MusicStateData, "musicState">;

export function MusicStateNode({ data, id }: NodeProps<MusicStateNode>) {
  const { mode } = useViewMode();
  const simple = mode === "simple";
  const playingId = usePlayingNode();
  const isPlaying = playingId === id;

  return (
    <div
      className={`bg-canvas-surface border-2 rounded-lg shadow-lg ${simple ? "px-3 py-2 min-w-[120px]" : "px-4 py-3 min-w-[180px]"} ${isPlaying ? "border-green-400 ring-2 ring-green-400/40 shadow-green-500/30 shadow-xl" : "border-canvas-accent shadow-blue-900/10"}`}
      style={isPlaying ? { animation: "pulse 2s ease-in-out infinite" } : undefined}
    >
      <Handle type="target" position={Position.Left} className="!bg-canvas-highlight !w-3 !h-3" />
      <div className="flex items-center gap-1.5 mb-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-canvas-highlight" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <span className="text-xs font-mono text-canvas-muted uppercase tracking-wider flex-1">Music State</span>
        <PlayButton
          nodeId={id}
          category={data.looping ? "loop" : "intro"}
          musicalKey="Dm"
          bpm={120}
        />
      </div>
      <div className="text-sm font-semibold text-canvas-text">{data.label}</div>
      {/* Intensity bar — always visible, compact in simple mode */}
      {simple && (
        <div className="mt-1 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-canvas-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${data.intensity}%`,
                background: data.intensity > 75 ? "#e94560" : data.intensity > 45 ? "#f59e0b" : "#4ecdc4",
              }}
            />
          </div>
          <div className="text-[9px] text-canvas-muted w-4 text-right">{data.intensity}</div>
        </div>
      )}
      {!simple && (
        <>
          {data.asset && (
            <div className="text-[10px] font-mono text-canvas-muted mt-0.5 truncate max-w-[200px]">{data.asset}</div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <div className="text-[10px] text-canvas-muted">INT</div>
            <div className="flex-1 h-1.5 bg-canvas-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${data.intensity}%`,
                  background: data.intensity > 75 ? "#e94560" : data.intensity > 45 ? "#f59e0b" : "#4ecdc4",
                }}
              />
            </div>
            <div className="text-[10px] text-canvas-muted w-5 text-right">{data.intensity}</div>
          </div>
          {data.stems.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {data.stems.slice(0, 4).map((s) => (
                <span key={s} className="text-[9px] font-mono bg-canvas-bg text-canvas-muted px-1.5 py-0.5 rounded">{s}</span>
              ))}
              {data.stems.length > 4 && (
                <span className="text-[9px] font-mono text-canvas-muted px-1 py-0.5">+{data.stems.length - 4}</span>
              )}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            {data.looping && (
              <span className="text-[10px] text-canvas-highlight font-mono font-bold">LOOP</span>
            )}
            {!data.looping && (
              <span className="text-[10px] text-[#4ecdc4] font-mono font-bold">ONE-SHOT</span>
            )}
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
      <Handle type="source" position={Position.Right} className="!bg-canvas-highlight !w-3 !h-3" />
    </div>
  );
}
