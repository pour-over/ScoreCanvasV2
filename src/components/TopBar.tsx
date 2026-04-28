import { useEffect, useRef, useState } from "react";
import { useViewMode } from "../context/ViewModeContext";
import { ThemePicker } from "./ThemePicker";
import { AccountChip } from "./AccountChip";

interface TopBarProps {
  projectName: string;
  levelName: string;
  levelSubtitle: string;
  nodeCount: number;
  edgeCount: number;
  assetCount: number;
  onOpenProjectAssets: () => void;
  onOpenExport: () => void;
  onOpenStatusReport: () => void;
  onStartTour?: () => void;
  onOpenWwiseSync?: () => void;
  onOpenSegue?: () => void;
  // Auth + persistence
  userEmail: string | null;
  userName?: string | null;
  userCreatedAt?: string | null;
  onSignIn: () => void;
  onSignOut: () => Promise<void> | void;
  onSave: () => Promise<void> | void;
  onFork: () => Promise<void> | void;
  onShare: () => void;
  savingState: "idle" | "saving" | "error";
  savedAt: Date | null;
  isUserProject: boolean;
  /** True when viewing a shared link — hide Save / Share / Fork affordances */
  readOnly?: boolean;
  configured: boolean;
}

/** Tiny relative-time helper: "12s ago", "3m ago", "2h ago". */
function useRelativeTime(date: Date | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!date) return;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [date]);
  if (!date) return "";
  const diff = Math.max(0, now - date.getTime());
  if (diff < 5000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export function TopBar({
  projectName,
  levelName,
  levelSubtitle,
  nodeCount,
  edgeCount,
  assetCount,
  onOpenProjectAssets,
  onOpenExport,
  onOpenStatusReport,
  onStartTour,
  onOpenWwiseSync,
  onOpenSegue,
  userEmail,
  userName,
  userCreatedAt,
  onSignIn,
  onSignOut,
  onSave,
  onFork,
  onShare,
  savingState,
  savedAt,
  isUserProject,
  readOnly = false,
  configured,
}: TopBarProps) {
  const { mode } = useViewMode();
  const isSimple = mode === "simple";
  const savedRelative = useRelativeTime(savedAt);

  const [projectInfoOpen, setProjectInfoOpen] = useState(false);
  const projectInfoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!projectInfoOpen) return;
    const onMouse = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (projectInfoRef.current && t && !projectInfoRef.current.contains(t)) {
        // Allow clicks on the project-name button itself to toggle, not close.
        const btn = projectInfoRef.current.parentElement?.querySelector("button");
        if (btn && t && btn.contains(t)) return;
        setProjectInfoOpen(false);
      }
    };
    window.addEventListener("mousedown", onMouse);
    return () => window.removeEventListener("mousedown", onMouse);
  }, [projectInfoOpen]);

  return (
    <header className="h-11 bg-[#0d0d1a] border-b border-canvas-accent flex items-center px-4 gap-4 shrink-0">
      {/* Logo + Project (clickable for project info popover) */}
      <div className="flex items-center gap-2 min-w-0 relative">
        <div className="w-6 h-6 rounded bg-canvas-highlight flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
            <path d="M2 4h3v6H2zM6 2h2v10H6zM9 5h3v5H9z" fill="currentColor" opacity="0.9"/>
          </svg>
        </div>
        <button
          onClick={() => setProjectInfoOpen((o) => !o)}
          title="Project info"
          className="text-sm font-bold text-canvas-text tracking-tight truncate max-w-[260px] hover:text-canvas-highlight transition-colors"
        >
          {projectName}
        </button>
        {!isUserProject && (
          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-accent/40 text-canvas-muted border border-canvas-accent flex-shrink-0">demo</span>
        )}
        {projectInfoOpen && (
          <div ref={projectInfoRef} className="absolute top-full left-0 mt-1 w-72 bg-canvas-surface border border-canvas-accent rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-canvas-accent/50">
              <div className="text-[9px] font-mono uppercase tracking-wider text-canvas-muted">Project</div>
              <div className="text-[13px] font-bold text-canvas-text mt-0.5 truncate">{projectName}</div>
            </div>
            <div className="px-4 py-2 border-b border-canvas-accent/40">
              <div className="text-[9px] font-mono uppercase tracking-wider text-canvas-muted">Current level</div>
              <div className="text-[12px] text-canvas-text mt-0.5 truncate">{levelName}</div>
              {levelSubtitle && <div className="text-[10px] text-canvas-muted italic truncate mt-0.5">{levelSubtitle}</div>}
            </div>
            <div className="px-4 py-2 border-b border-canvas-accent/40 grid grid-cols-3 gap-2">
              <div>
                <div className="text-[9px] font-mono uppercase text-canvas-muted">Nodes</div>
                <div className="text-[12px] font-bold text-canvas-text">{nodeCount}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-canvas-muted">Edges</div>
                <div className="text-[12px] font-bold text-canvas-text">{edgeCount}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-canvas-muted">Assets</div>
                <div className="text-[12px] font-bold text-canvas-text">{assetCount}</div>
              </div>
            </div>
            {!readOnly && (
              <div className="px-3 py-2">
                {isUserProject ? (
                  <div className="text-[10px] text-canvas-muted">
                    {savedAt
                      ? <>Last saved {savedRelative}</>
                      : <>Unsaved — use Save in the toolbar</>}
                  </div>
                ) : (
                  <div className="text-[10px] text-canvas-muted">
                    Read-only demo. Fork to start editing your own copy.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />

      {/* Level */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-canvas-text truncate max-w-[200px]">{levelName}</span>
        {!isSimple && <span className="text-xs text-canvas-muted italic truncate max-w-[220px]">{levelSubtitle}</span>}
      </div>

      <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />

      {/* Core actions — always visible */}
      <div className="flex items-center gap-2">
        <button
          data-tour="project-assets"
          onClick={onOpenProjectAssets}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-canvas-accent/60 text-canvas-text border border-canvas-accent hover:bg-canvas-accent transition-colors"
        >
          Project Assets
        </button>
        <button
          onClick={onOpenStatusReport}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600/80 text-white border border-emerald-500 hover:bg-emerald-600 transition-colors"
        >
          Status
        </button>

        {/* Save / Share / Fork — hidden when viewing a read-only shared link */}
        {!readOnly && isUserProject && (
          <>
            <button
              onClick={onSave}
              disabled={savingState === "saving"}
              title="Save this project"
              className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors flex items-center gap-1.5 ${
                savingState === "error"
                  ? "bg-red-900/40 text-red-300 border-red-500/50"
                  : "bg-canvas-highlight/80 text-white border-canvas-highlight hover:bg-canvas-highlight disabled:opacity-60"
              }`}
            >
              {savingState === "saving" && <span className="inline-block w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
              {savingState === "saving" ? "Saving..." : savingState === "error" ? "Retry save" : "Save"}
            </button>
            <button
              onClick={onShare}
              title="Share a read-only link to this project"
              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-canvas-accent/60 text-canvas-text border border-canvas-accent hover:bg-canvas-accent transition-colors flex items-center gap-1.5"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h6M11 8l-3-3M11 8l-3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Share
            </button>
          </>
        )}
        {!readOnly && !isUserProject && (
          <button
            onClick={onFork}
            title="Fork this demo into your own editable project"
            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-purple-900/30 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
          >
            <span className="text-[10px]">⑂</span> Fork to my projects
          </button>
        )}
        {readOnly && (
          <button
            onClick={onFork}
            title="Fork this shared project into your own editable copy"
            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-purple-900/30 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
          >
            <span className="text-[10px]">⑂</span> Fork this
          </button>
        )}

        {!readOnly && savedAt && savingState === "idle" && (
          <span className="text-[10px] text-canvas-muted/70 font-mono">saved {savedRelative}</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Integrations — SEGUE and Wwise always shown (the two roadmap heroes); rest only in detailed mode */}
      <div data-tour="integrations" className="flex items-center gap-1.5">
        <button
          onClick={onOpenSegue}
          title="SEGUE — AI Stem Generation — Coming Soon"
          className="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors cursor-pointer bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/40 hover:text-purple-200 flex items-center gap-1.5"
        >
          <span className="font-mono">✦</span>
          <span className="font-normal opacity-80">SEGUE</span>
          <span className="ml-0.5 px-1 rounded bg-purple-500/20 text-purple-200 text-[8px] font-mono">SOON</span>
        </button>
        <button
          onClick={onOpenWwiseSync}
          title="Wwise Live Sync — Coming Soon"
          className="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors cursor-pointer bg-orange-600/20 text-orange-400 border-orange-500/30 hover:bg-orange-600/40 hover:text-orange-300 flex items-center gap-1.5"
        >
          <span className="font-mono">Ww</span>
          <span className="font-normal opacity-70">Wwise</span>
          <span className="ml-0.5 px-1 rounded bg-orange-500/20 text-orange-300 text-[8px] font-mono">SOON</span>
        </button>
        {!isSimple && (
          <>
            <button title="Unreal Engine integration — coming soon" className="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors bg-slate-600/20 text-slate-300 border-slate-500/30 opacity-70">
              <span className="font-mono">UE</span>
              <span className="ml-1 font-normal opacity-70">Unreal</span>
            </button>
            <button title="Perforce integration — coming soon" className="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors bg-teal-600/20 text-teal-400 border-teal-500/30 opacity-70">
              <span className="font-mono">P4</span>
              <span className="ml-1 font-normal opacity-70">Perforce</span>
            </button>
            <button title="Jira integration — coming soon" className="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors bg-blue-600/20 text-blue-400 border-blue-500/30 opacity-70">
              <span className="font-mono">Jira</span>
              <span className="ml-1 font-normal opacity-70">JIRA</span>
            </button>
          </>
        )}
      </div>

      {/* Stats — only in detailed mode */}
      {!isSimple && (
        <>
          <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />
          <div className="flex items-center gap-4 text-[11px] font-mono text-canvas-muted">
            <span><span className="text-canvas-text font-bold">{nodeCount}</span> nodes</span>
            <span><span className="text-canvas-text font-bold">{edgeCount}</span> edges</span>
            <span><span className="text-canvas-text font-bold">{assetCount}</span> assets</span>
          </div>
        </>
      )}

      <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-canvas-muted">Live</span>
      </div>

      <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />

      {/* Export */}
      <button
        data-tour="export"
        onClick={onOpenExport}
        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-canvas-highlight/80 text-white border border-canvas-highlight hover:bg-canvas-highlight transition-colors"
      >
        Export
      </button>

      <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />

      {/* Theme picker */}
      <ThemePicker />

      <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />

      {/* Auth: signed-in account chip OR Sign In button */}
      {userEmail ? (
        <AccountChip
          email={userEmail}
          name={userName ?? null}
          createdAt={userCreatedAt ?? null}
          onSignOut={onSignOut}
        />
      ) : (
        <button
          onClick={onSignIn}
          title={configured ? "Sign in to save your projects" : "Backend not configured on this deploy"}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-canvas-accent/60 text-canvas-text border border-canvas-accent hover:bg-canvas-accent transition-colors"
        >
          Sign in
        </button>
      )}

      {onStartTour && (
        <>
          <div className="w-px h-5 bg-canvas-accent flex-shrink-0" />
          <button
            onClick={onStartTour}
            className="w-6 h-6 flex items-center justify-center rounded-full border border-canvas-accent text-canvas-muted hover:text-canvas-highlight hover:border-canvas-highlight/50 transition-colors text-xs font-bold"
            title="Restart tutorial"
          >
            ?
          </button>
        </>
      )}
    </header>
  );
}
