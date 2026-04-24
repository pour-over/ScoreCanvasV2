import type { Node, Edge } from "@xyflow/react";
import type { MusicAsset } from "../data/projects";
import { StatusBadge } from "./StatusBadge";

interface NodeDetailPanelProps {
  node: Node;
  edges: Edge[];
  nodes: Node[];
  assets: MusicAsset[];
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  musicState: "Music State",
  transition: "Transition",
  stinger: "Stinger",
  parameter: "Parameter (RTPC)",
  event: "Event",
};

const typeColors: Record<string, string> = {
  musicState: "#4ecdc4",
  transition: "#e94560",
  stinger: "#f97316",
  parameter: "#a855f7",
  event: "#06b6d4",
};

export function NodeDetailPanel({ node, edges, nodes, assets, onClose }: NodeDetailPanelProps) {
  const d = node.data as Record<string, unknown>;
  const nodeType = node.type ?? "musicState";
  const label = d.label as string ?? node.id;
  const color = typeColors[nodeType] ?? "#4ecdc4";

  // Find connected edges
  const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
  const connectedNodes = connectedEdges.map((e) => {
    const otherId = e.source === node.id ? e.target : e.source;
    const other = nodes.find((n) => n.id === otherId);
    const direction = e.source === node.id ? "→" : "←";
    return { edge: e, node: other, direction };
  });

  // Find matching asset
  const assetRef = d.asset as string | undefined;
  const matchedAsset = assetRef ? assets.find((a) => a.filename === assetRef || a.id === assetRef) : undefined;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[380px] z-50 bg-[#0d0d1a]/98 border-l border-canvas-accent shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-canvas-accent flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-canvas-muted">{typeLabels[nodeType] ?? nodeType}</div>
          <div className="text-sm font-bold text-canvas-text truncate">{label}</div>
        </div>
        <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg px-2">&times;</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Status */}
        {!!(d.status || d.jiraTicket) && (
          <div>
            <StatusBadge status={d.status as string} jiraTicket={d.jiraTicket as string} />
          </div>
        )}

        {/* Music State specifics */}
        {nodeType === "musicState" && (
          <>
            <div>
              <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-1">Intensity</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-canvas-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${d.intensity as number}%`,
                    background: (d.intensity as number) > 75 ? "#e94560" : (d.intensity as number) > 45 ? "#f59e0b" : "#4ecdc4",
                  }} />
                </div>
                <span className="text-xs font-mono text-canvas-text">{String(d.intensity)}</span>
              </div>
            </div>
            <div className="text-[10px] font-mono">
              <span className={d.looping ? "text-canvas-highlight font-bold" : "text-[#4ecdc4] font-bold"}>
                {d.looping ? "LOOP" : "ONE-SHOT"}
              </span>
            </div>
          </>
        )}

        {/* Transition specifics */}
        {nodeType === "transition" && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Duration</span>
              <span className="text-canvas-text font-mono">{String(d.duration)}ms</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Sync Point</span>
              <span className="text-canvas-text font-mono">{String(d.syncPoint)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Fade Type</span>
              <span className="text-canvas-text font-mono">{String(d.fadeType)}</span>
            </div>
          </div>
        )}

        {/* Stinger specifics */}
        {nodeType === "stinger" && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Trigger</span>
              <span className="text-canvas-text font-mono">{String(d.trigger)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Priority</span>
              <span className={`font-mono font-bold text-[10px] ${
                d.priority === "critical" ? "text-red-400" : d.priority === "high" ? "text-orange-400" : d.priority === "medium" ? "text-yellow-400" : "text-canvas-muted"
              }`}>{String(d.priority ?? "").toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Parameter specifics */}
        {nodeType === "parameter" && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">RTPC Name</span>
              <span className="text-canvas-text font-mono">{String(d.paramName)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Range</span>
              <span className="text-canvas-text font-mono">{String(d.minValue)} — {String(d.maxValue)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Default</span>
              <span className="text-canvas-text font-mono">{String(d.defaultValue)}</span>
            </div>
            {!!d.description && (
              <div className="text-[10px] text-canvas-muted leading-tight mt-1">{String(d.description)}</div>
            )}
          </div>
        )}

        {/* Event specifics */}
        {nodeType === "event" && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-canvas-muted">Type</span>
              <span className="text-canvas-text font-mono">{String(d.eventType)}</span>
            </div>
            {!!d.blueprintRef && (
              <div>
                <div className="text-[9px] text-canvas-muted">Blueprint</div>
                <div className="text-[10px] font-mono text-cyan-300 break-all">{String(d.blueprintRef)}</div>
              </div>
            )}
            {!!d.description && (
              <div className="text-[10px] text-canvas-muted leading-tight mt-1">{String(d.description)}</div>
            )}
          </div>
        )}

        {/* Asset */}
        {assetRef && (
          <div>
            <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-1">Asset</div>
            <div className="px-3 py-2 rounded bg-canvas-bg/50 border border-canvas-accent/30">
              <div className="text-[11px] font-mono text-canvas-text">{assetRef}</div>
              {matchedAsset && (
                <div className="mt-1.5 space-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-canvas-muted">Category</span><span className="text-canvas-text font-mono">{matchedAsset.category}</span></div>
                  <div className="flex justify-between"><span className="text-canvas-muted">Duration</span><span className="text-canvas-text font-mono">{matchedAsset.duration}</span></div>
                  <div className="flex justify-between"><span className="text-canvas-muted">BPM / Key</span><span className="text-canvas-text font-mono">{matchedAsset.bpm} / {matchedAsset.key}</span></div>
                  {matchedAsset.audioFile && (
                    <div className="text-[9px] font-mono text-green-400 mt-1">✓ {matchedAsset.audioFile}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stems */}
        {(d.stems as string[])?.length > 0 && (
          <div>
            <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-1">Stems ({(d.stems as string[]).length})</div>
            <div className="space-y-1">
              {(d.stems as string[]).map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-canvas-bg/50 border border-canvas-accent/30">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] font-mono text-canvas-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Director Note */}
        {!!d.directorNote && (
          <div>
            <div className="text-[9px] font-mono text-amber-400/70 uppercase tracking-wider mb-1">Director Note</div>
            <div className="text-[10px] text-amber-200/80 leading-relaxed italic bg-amber-900/10 border border-amber-500/10 rounded px-3 py-2">
              {String(d.directorNote)}
            </div>
          </div>
        )}

        {/* Connections */}
        {connectedNodes.length > 0 && (
          <div>
            <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-1">Connections ({connectedNodes.length})</div>
            <div className="space-y-1">
              {connectedNodes.map((cn, i) => {
                const otherData = cn.node?.data as Record<string, unknown>;
                const otherLabel = otherData?.label as string ?? cn.node?.id ?? "?";
                const edgeLabel = (cn.edge as Edge & { label?: string }).label;
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-canvas-bg/50 border border-canvas-accent/30 text-[10px]">
                    <span className="text-canvas-highlight font-mono">{cn.direction}</span>
                    <span className="text-canvas-text font-mono flex-1 truncate">{otherLabel}</span>
                    {edgeLabel && <span className="text-canvas-muted text-[9px] italic truncate max-w-[120px]">{String(edgeLabel)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-2 border-t border-canvas-accent/50 text-[9px] text-canvas-muted/50 text-center">
        Double-click a node to inspect • Press Delete to remove selected edges
      </div>
    </div>
  );
}
