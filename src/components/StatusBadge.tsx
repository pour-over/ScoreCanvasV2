const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  temp:     { bg: "bg-slate-500/20 border-slate-500/40",   text: "text-slate-300",   label: "TEMP" },
  wip:      { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-300",  label: "WIP" },
  review:   { bg: "bg-blue-500/20 border-blue-500/40",     text: "text-blue-300",    label: "REVIEW" },
  blocked:  { bg: "bg-red-500/20 border-red-500/40",       text: "text-red-300",     label: "BLOCKED" },
  approved: { bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-300", label: "APPROVED" },
  final:    { bg: "bg-amber-500/20 border-amber-500/40",   text: "text-amber-300",   label: "FINAL" },
  jira:     { bg: "bg-blue-600/20 border-blue-500/40",     text: "text-blue-300",    label: "JIRA" },
  needs_revision: { bg: "bg-orange-500/20 border-orange-500/40", text: "text-orange-300", label: "NEEDS REVISION" },
  placeholder:    { bg: "bg-purple-500/20 border-purple-500/40", text: "text-purple-300", label: "PLACEHOLDER" },
};

interface StatusBadgeProps {
  status?: string;
  jiraTicket?: string;
}

export function StatusBadge({ status, jiraTicket }: StatusBadgeProps) {
  if (!status && !jiraTicket) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {status && statusConfig[status] && (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${statusConfig[status].bg} ${statusConfig[status].text}`}>
          {status === "blocked" && <span className="text-[8px]">&#x26D4;</span>}
          {status === "approved" && <span className="text-[8px]">&#x2714;</span>}
          {status === "final" && <span className="text-[8px]">&#x2605;</span>}
          {statusConfig[status].label}
        </span>
      )}
      {jiraTicket && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border bg-blue-600/20 border-blue-500/40 text-blue-300">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12.005 2c-5.52 0-9.995 4.48-9.995 10s4.475 10 9.995 10c5.525 0 10.005-4.48 10.005-10S17.525 2 12.005 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.245 3.15.755-1.23-4.5-2.67V7z"/></svg>
          {jiraTicket}
        </span>
      )}
    </div>
  );
}
