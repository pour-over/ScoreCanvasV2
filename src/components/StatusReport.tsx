import type { GameLevel } from "../data/projects";

const statusLabels: Record<string, { label: string; color: string; order: number }> = {
  blocked:        { label: "Blocked",        color: "bg-red-500",     order: 0 },
  needs_revision: { label: "Needs Revision", color: "bg-orange-500",  order: 1 },
  placeholder:    { label: "Placeholder",    color: "bg-purple-500",  order: 2 },
  temp:           { label: "Temp",           color: "bg-slate-400",   order: 3 },
  wip:            { label: "WIP",            color: "bg-yellow-500",  order: 4 },
  review:         { label: "Review",         color: "bg-blue-500",    order: 5 },
  approved:       { label: "Approved",       color: "bg-emerald-500", order: 6 },
  final:          { label: "Final",          color: "bg-amber-400",   order: 7 },
};

interface StatusReportProps {
  levels: GameLevel[];
  onClose: () => void;
}

interface NodeInfo {
  levelName: string;
  nodeLabel: string;
  nodeType: string;
  status: string;
  jiraTicket?: string;
}

export function StatusReport({ levels, onClose }: StatusReportProps) {
  // Gather all nodes with statuses
  const allNodes: NodeInfo[] = [];
  const statusCounts: Record<string, number> = {};
  let totalNodes = 0;

  for (const level of levels) {
    for (const node of level.nodes) {
      totalNodes++;
      const status = (node.data as Record<string, unknown>).status as string | undefined;
      const jiraTicket = (node.data as Record<string, unknown>).jiraTicket as string | undefined;
      if (status) {
        statusCounts[status] = (statusCounts[status] ?? 0) + 1;
        allNodes.push({
          levelName: level.name,
          nodeLabel: (node.data as Record<string, unknown>).label as string,
          nodeType: node.type ?? "unknown",
          status,
          jiraTicket,
        });
      }
    }
  }

  const noStatus = totalNodes - allNodes.length;
  const approvedOrFinal = (statusCounts["approved"] ?? 0) + (statusCounts["final"] ?? 0);
  const completionPct = totalNodes > 0 ? Math.round((approvedOrFinal / totalNodes) * 100) : 0;

  // Items needing work: blocked first, then needs_revision, placeholder, temp, wip
  const needsWork = allNodes
    .filter((n) => ["blocked", "needs_revision", "placeholder", "temp", "wip"].includes(n.status))
    .sort((a, b) => (statusLabels[a.status]?.order ?? 99) - (statusLabels[b.status]?.order ?? 99));

  // Status bar segments
  const sortedStatuses = Object.entries(statusCounts).sort(
    (a, b) => (statusLabels[a[0]]?.order ?? 99) - (statusLabels[b[0]]?.order ?? 99)
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-8" onClick={onClose}>
      <div
        className="bg-[#0d0d1a] border border-canvas-accent rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-accent">
          <div>
            <h2 className="text-lg font-bold text-canvas-text">Status Report</h2>
            <p className="text-xs text-canvas-muted mt-0.5">{totalNodes} total nodes across {levels.length} levels</p>
          </div>
          <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Completion */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-canvas-text">Overall Completion</span>
              <span className="text-2xl font-bold text-canvas-text">{completionPct}%</span>
            </div>
            <div className="h-3 bg-canvas-accent rounded-full overflow-hidden flex">
              {sortedStatuses.map(([status, count]) => (
                <div
                  key={status}
                  className={`h-full ${statusLabels[status]?.color ?? "bg-gray-500"}`}
                  style={{ width: `${(count / totalNodes) * 100}%` }}
                  title={`${statusLabels[status]?.label ?? status}: ${count}`}
                />
              ))}
              {noStatus > 0 && (
                <div
                  className="h-full bg-gray-700"
                  style={{ width: `${(noStatus / totalNodes) * 100}%` }}
                  title={`No status: ${noStatus}`}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {sortedStatuses.map(([status, count]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${statusLabels[status]?.color ?? "bg-gray-500"}`} />
                  <span className="text-[10px] text-canvas-muted font-mono">
                    {statusLabels[status]?.label ?? status} ({count})
                  </span>
                </div>
              ))}
              {noStatus > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-gray-700" />
                  <span className="text-[10px] text-canvas-muted font-mono">No status ({noStatus})</span>
                </div>
              )}
            </div>
          </div>

          {/* Per-level breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-canvas-text mb-2">By Level</h3>
            <div className="space-y-2">
              {levels.map((level) => {
                const levelTotal = level.nodes.length;
                const levelApproved = level.nodes.filter((n) => {
                  const s = (n.data as Record<string, unknown>).status as string | undefined;
                  return s === "approved" || s === "final";
                }).length;
                const pct = levelTotal > 0 ? Math.round((levelApproved / levelTotal) * 100) : 0;
                return (
                  <div key={level.id} className="flex items-center gap-3">
                    <span className="text-xs text-canvas-text w-48 truncate font-medium">{level.name}</span>
                    <div className="flex-1 h-2 bg-canvas-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-canvas-muted w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Needs Work list */}
          <div>
            <h3 className="text-sm font-semibold text-canvas-text mb-2">
              Needs Work ({needsWork.length})
            </h3>
            {needsWork.length === 0 ? (
              <p className="text-xs text-canvas-muted italic">All nodes are approved or finalized.</p>
            ) : (
              <div className="space-y-1">
                {needsWork.map((item, i) => {
                  const cfg = statusLabels[item.status];
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-canvas-surface/50 rounded text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white ${cfg?.color ?? "bg-gray-500"}`}>
                        {cfg?.label ?? item.status}
                      </span>
                      <span className="text-canvas-text font-medium">{item.nodeLabel}</span>
                      <span className="text-canvas-muted text-[10px]">{item.nodeType}</span>
                      <span className="text-canvas-muted text-[10px] italic">{item.levelName}</span>
                      <div className="flex-1" />
                      {item.jiraTicket && (
                        <span className="text-blue-400 text-[10px] font-mono">{item.jiraTicket}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
