import { useViewMode } from "../context/ViewModeContext";

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
}: TopBarProps) {
  const { mode } = useViewMode();
  const isSimple = mode === "simple";

  return (
    <header className="h-11 bg-[#0d0d1a] border-b border-canvas-accent flex items-center px-4 gap-4 shrink-0">
      {/* Logo + Project */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded bg-canvas-highlight flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
            <path d="M2 4h3v6H2zM6 2h2v10H6zM9 5h3v5H9z" fill="currentColor" opacity="0.9"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-canvas-text tracking-tight truncate max-w-[260px]">{projectName}</span>
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
