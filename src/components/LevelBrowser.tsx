import type { GameLevel } from "../data/projects";

interface LevelBrowserProps {
  levels: GameLevel[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function LevelBrowser({ levels, selectedId, onSelect }: LevelBrowserProps) {
  const grouped = levels.reduce<Record<string, GameLevel[]>>((acc, lvl) => {
    (acc[lvl.region] ??= []).push(lvl);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(grouped).map(([region, regionLevels]) => (
        <div key={region}>
          <div className="text-[9px] font-mono uppercase tracking-wider text-canvas-muted/60 px-2 pt-2 pb-1">{region}</div>
          {regionLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onSelect(lvl.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                lvl.id === selectedId
                  ? "bg-canvas-highlight/20 border border-canvas-highlight/40"
                  : "hover:bg-canvas-accent/50 border border-transparent"
              }`}
            >
              <div className={`text-xs font-medium ${lvl.id === selectedId ? "text-canvas-highlight" : "text-canvas-text"}`}>
                {lvl.name}
              </div>
              <div className="text-[10px] text-canvas-muted truncate">{lvl.subtitle}</div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
