/**
 * DataImportPanel — covers the "+ New Level" / "+ New Game" / bulk import flow.
 *
 * v2.x ships as a roadmap teaser: it explains what's coming and lets users see
 * a JSON schema preview. The actual import paths (CSV / JSON / Wwise project
 * file) are v2.5+. The button affordances exist today so the workflow surface
 * is visible to demo audiences (VPs, producers, audio leads).
 */

interface DataImportPanelProps {
  mode: "level" | "project";
  onClose: () => void;
}

const SCHEMA_PREVIEW = `{
  "id": "new-game",
  "name": "GAME TITLE",
  "subtitle": "Optional Tagline",
  "levels": [
    {
      "id": "level-01",
      "name": "Level Name",
      "subtitle": "Where the music goes",
      "region": "Act I",
      "nodes": [
        {
          "id": "intro",
          "type": "musicState",
          "position": { "x": 100, "y": 200 },
          "data": {
            "label": "Opening Theme",
            "intensity": 30,
            "looping": true,
            "asset": "mus_intro_theme",
            "directorNote": "..."
          }
        }
      ],
      "edges": [
        { "id": "e1", "source": "intro", "target": "explore" }
      ],
      "assets": [
        {
          "id": "a-01",
          "filename": "mus_intro_theme",
          "category": "intro",
          "duration": "0:30",
          "bpm": 92,
          "key": "Dm",
          "stems": ["strings", "percussion"],
          "audioFile": "yourgame/intro_theme.mp3"
        }
      ]
    }
  ]
}`;

export function DataImportPanel({ mode, onClose }: DataImportPanelProps) {
  const isLevel = mode === "level";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d0d1a] border border-amber-500/40 rounded-xl shadow-2xl w-[680px] max-w-[94vw] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-canvas-accent/50 flex items-center gap-3 bg-gradient-to-r from-amber-900/20 via-transparent to-transparent">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-300">
              <path d="M8 2v12M2 8h12" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-canvas-text tracking-tight">
              Add {isLevel ? "Level" : "Game / Project"}
            </h2>
            <div className="text-[10px] font-mono text-amber-300/80 uppercase tracking-wider">
              Manual scaffold today · bulk import coming v2.5
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">Coming v2.5</span>
          </div>
          <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg px-2">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* What's coming */}
          <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-300/80 mb-2">Roadmap · v2.5</div>
            <p className="text-[13px] text-canvas-text leading-relaxed mb-3">
              Adding a {isLevel ? "level" : "game"} with hundreds of music states, transitions, RTPCs, and assets shouldn't mean editing TypeScript files. v2.5 ships four import paths:
            </p>
            <ul className="space-y-2 text-[12px] text-canvas-muted">
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-0.5">⤓</span>
                <span><strong className="text-canvas-text">CSV import.</strong> Paste a spreadsheet — one row per node, columns for type / label / asset / connections. The fastest path for music designers who already track systems in Excel.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-0.5">⤓</span>
                <span><strong className="text-canvas-text">JSON import.</strong> Drop a structured project file (schema below). Programmatic, version-controllable, friendly to studio tooling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-0.5">⤓</span>
                <span><strong className="text-canvas-text">Wwise project ingestion.</strong> Drag a .wproj or .bnk and Score Canvas reverse-engineers the node graph from the existing music hierarchy. The fastest path for studios with mature Wwise projects.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-0.5">⤓</span>
                <span><strong className="text-canvas-text">Markdown table paste.</strong> For audio leads who design in docs first.</span>
              </li>
            </ul>
          </div>

          {/* JSON schema preview */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-canvas-muted mb-2">v2.5 JSON Schema (preview)</div>
            <pre className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-4 text-[10px] font-mono text-canvas-text leading-relaxed overflow-x-auto">
{SCHEMA_PREVIEW}
            </pre>
            <div className="text-[10px] text-canvas-muted/70 mt-2 italic">
              Stable schema lands with v2.5. Today's tool is one of the source-of-truth implementations — see the projects in <code className="text-canvas-highlight">src/data/</code> in the GitHub repo for working examples.
            </div>
          </div>

          {/* Today's path */}
          <div className="bg-canvas-highlight/5 border border-canvas-highlight/30 rounded-lg p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-canvas-highlight/80 mb-2">Today (v2.x)</div>
            <p className="text-[12px] text-canvas-muted leading-relaxed mb-3">
              Until bulk import lands, new {isLevel ? "levels" : "projects"} are added by editing the data files directly:
            </p>
            <ul className="space-y-1.5 text-[11px] text-canvas-muted font-mono">
              <li>• Add a {isLevel ? "level" : "project"} object to <span className="text-canvas-highlight">src/data/projects.ts</span></li>
              <li>• Define <span className="text-canvas-highlight">nodes</span>, <span className="text-canvas-highlight">edges</span>, and <span className="text-canvas-highlight">assets</span> arrays</li>
              <li>• Drop matching audio files into <span className="text-canvas-highlight">public/audio/</span></li>
              <li>• Hot reload — your project shows up in the sidebar dropdown</li>
            </ul>
            <p className="text-[10px] text-canvas-muted/70 mt-3 italic">
              Open the GitHub repo (<a href="https://github.com/pour-over/ScoreCanvasV2" target="_blank" rel="noopener" className="text-canvas-highlight hover:underline">pour-over/ScoreCanvasV2</a>) and follow the existing 6-project pattern.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
            <div className="text-[12px] text-canvas-text mb-2">
              Get notified when bulk import ships.
            </div>
            <a
              href="/#waitlist"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                window.open("/#waitlist", "_blank");
              }}
              className="inline-block px-5 py-2 text-xs font-bold rounded-lg bg-amber-500/80 text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20"
            >
              Join the Waitlist →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
