import { useState, useRef, useEffect, type DragEvent } from "react";
import type { GameLevel, GameProject } from "../data/projects";
import { LevelBrowser } from "./LevelBrowser";
import { AssetBrowser } from "./AssetBrowser";

const nodeTemplates = [
  { type: "musicState", label: "Music State", description: "Playback state (Explore, Combat…)" },
  { type: "transition", label: "Transition", description: "Rule for moving between states" },
  { type: "parameter", label: "Parameter", description: "RTPC / game-driven value" },
  { type: "stinger", label: "Stinger", description: "One-shot triggered event" },
  { type: "event", label: "Game Event", description: "Cinematic, IGC, Button Press…" },
];

interface SidebarProps {
  projects: GameProject[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  levels: GameLevel[];
  selectedLevelId: string;
  onSelectLevel: (id: string) => void;
  currentLevel: GameLevel;
}

function CollapsibleSection({ title, defaultOpen = true, count, children }: {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-canvas-accent/20 transition-colors"
      >
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="currentColor"
          className={`text-canvas-muted/60 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <polygon points="1,0 7,4 1,8" />
        </svg>
        <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted flex-1 text-left">{title}</span>
        {count !== undefined && (
          <span className="text-[9px] font-mono text-canvas-muted/40">{count}</span>
        )}
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}

/** Short display name for sidebar */
function shortName(project: GameProject): string {
  const map: Record<string, string> = {
    "journey-2": "Journey 2",
    "bloodborne-2": "Bloodborne 2",
    "cod-warfare": "COD: ZoneOps",
    "meditation": "Meditation",
    "custodial-arts": "Custodial Arts",
    "spreadsheet-quest": "Spreadsheet Quest",
  };
  return map[project.id] ?? project.name;
}

export function Sidebar({ projects, selectedProjectId, onSelectProject, levels, selectedLevelId, onSelectLevel, currentLevel }: SidebarProps) {
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? projects[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/scorecanvas-node", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  // Collect all assets across levels for "All Assets" mode
  const allAssets = showAllAssets
    ? levels.flatMap((l) => l.assets.map((a) => ({ ...a, id: `${l.id}-${a.id}` })))
    : currentLevel.assets;

  return (
    <aside data-tour="sidebar" className="w-60 bg-[#0d0d1a] border-r border-canvas-accent flex flex-col shrink-0 overflow-hidden">
      {/* Project Dropdown */}
      <div className="px-2 pt-2 pb-1" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => { if (!locked) setDropdownOpen(!dropdownOpen); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-colors text-left ${
              locked
                ? "bg-canvas-accent/10 border-canvas-accent/50 cursor-default"
                : "bg-canvas-bg border-canvas-accent hover:border-canvas-highlight/40"
            }`}
            title={locked ? "Project locked — click the lock icon to unlock" : "Switch project"}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-canvas-text truncate">{shortName(selectedProject)}</div>
              <div className="text-[8px] text-canvas-muted/60 truncate italic">{selectedProject.subtitle}</div>
            </div>
            {!locked && (
              <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className={`text-canvas-muted/50 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                <polygon points="0,0 8,0 4,5" />
              </svg>
            )}
          </button>

          {/* Lock button */}
          <button
            onClick={() => { setLocked(!locked); setDropdownOpen(false); }}
            className={`absolute -right-0.5 -top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px] border transition-all ${
              locked
                ? "bg-amber-600/30 border-amber-500/50 text-amber-400"
                : "bg-canvas-bg border-canvas-accent/50 text-canvas-muted/40 hover:text-canvas-muted hover:border-canvas-accent"
            }`}
            title={locked ? "Unlock project switching" : "Lock to this project (for single-game teams)"}
          >
            {locked ? "🔒" : "🔓"}
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && !locked && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d1a] border border-canvas-accent rounded-md shadow-xl z-50 max-h-64 overflow-y-auto">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => { onSelectProject(proj.id); setDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 transition-colors ${
                    proj.id === selectedProjectId
                      ? "bg-canvas-highlight/15 border-l-2 border-l-canvas-highlight"
                      : "hover:bg-canvas-accent/30 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className={`text-[10px] font-bold truncate ${proj.id === selectedProjectId ? "text-canvas-highlight" : "text-canvas-text"}`}>
                    {shortName(proj)}
                  </div>
                  <div className="text-[8px] text-canvas-muted/50 truncate italic">{proj.subtitle}</div>
                  <div className="text-[8px] text-canvas-muted/30 font-mono">{proj.levels.length} level{proj.levels.length !== 1 ? "s" : ""}</div>
                </button>
              ))}
              <div className="border-t border-canvas-accent/50 px-2.5 py-1.5">
                <div className="text-[8px] text-canvas-muted/30 italic">Tip: Lock the project selector for single-game teams working on one title.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-3 border-t border-canvas-accent" />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Levels */}
        <CollapsibleSection title="Levels" count={levels.length}>
          <LevelBrowser levels={levels} selectedId={selectedLevelId} onSelect={onSelectLevel} />
        </CollapsibleSection>

        <div className="mx-3 border-t border-canvas-accent" />

        {/* Node Palette */}
        <CollapsibleSection title="Add Nodes" defaultOpen={false} count={nodeTemplates.length}>
          <div className="grid grid-cols-2 gap-1.5">
            {nodeTemplates.map((tpl) => (
              <div
                key={tpl.type}
                className="bg-canvas-bg border border-canvas-accent rounded px-2 py-1.5 cursor-grab active:cursor-grabbing hover:border-canvas-highlight/50 transition-colors"
                draggable
                onDragStart={(e) => onDragStart(e, tpl.type)}
              >
                <div className="text-[10px] font-medium text-canvas-text">{tpl.label}</div>
                <div className="text-[9px] text-canvas-muted leading-tight">{tpl.description}</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <div className="mx-3 border-t border-canvas-accent" />

        {/* Level Assets */}
        <CollapsibleSection title="Level Assets" count={allAssets.length}>
          {/* Toggle: This Level / All Levels */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setShowAllAssets(false)}
              className={`flex-1 px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                !showAllAssets
                  ? "bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30"
                  : "text-canvas-muted border border-canvas-accent hover:text-canvas-text"
              }`}
            >
              This Level
            </button>
            <button
              onClick={() => setShowAllAssets(true)}
              className={`flex-1 px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                showAllAssets
                  ? "bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30"
                  : "text-canvas-muted border border-canvas-accent hover:text-canvas-text"
              }`}
            >
              All Levels
            </button>
          </div>
          <AssetBrowser assets={allAssets} />
        </CollapsibleSection>
      </div>
    </aside>
  );
}
