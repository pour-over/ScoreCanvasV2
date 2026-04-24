import { useState, type DragEvent } from "react";
import type { GameLevel, MusicAsset } from "../data/projects";
import { auditionAsset, stopAudition, type AssetCategory } from "../audio/synth";

interface ProjectAssetsProps {
  levels: GameLevel[];
  projectName: string;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  intro: "#4ecdc4", loop: "#e94560", ending: "#f59e0b", transition: "#818cf8", stinger: "#f97316", layer: "#a855f7", ambient: "#a855f7",
};

const categoryIcons: Record<string, string> = {
  intro: "▶", loop: "↻", ending: "◼", transition: "→", stinger: "⚡", layer: "≡", ambient: "◎",
};

export function ProjectAssets({ levels, projectName, onClose }: ProjectAssetsProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const allAssets = levels.flatMap((lvl) =>
    lvl.assets.map((a) => ({ ...a, levelName: lvl.name, levelId: lvl.id }))
  );

  // Build reverse lookup: asset filename → nodes that reference it
  const assetToNodes = new Map<string, Array<{ label: string; levelName: string; nodeType: string }>>();
  levels.forEach((lvl) => {
    lvl.nodes.forEach((n) => {
      const d = n.data as Record<string, unknown>;
      const ref = d.asset as string | undefined;
      if (ref) {
        if (!assetToNodes.has(ref)) assetToNodes.set(ref, []);
        assetToNodes.get(ref)!.push({
          label: (d.label as string) ?? n.id,
          levelName: lvl.name,
          nodeType: n.type ?? "musicState",
        });
      }
    });
  });

  const filtered = allAssets.filter((a) => {
    const matchesText = !filter || a.filename.toLowerCase().includes(filter.toLowerCase()) || a.levelName.toLowerCase().includes(filter.toLowerCase());
    const matchesCat = categoryFilter === "all" || a.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || a.levelId === levelFilter;
    return matchesText && matchesCat && matchesLevel;
  });

  const categories = ["all", "intro", "loop", "transition", "stinger", "ending", "layer", "ambient"];

  const handlePlay = async (asset: MusicAsset & { levelName: string }) => {
    const durationMs = await auditionAsset({ id: asset.id, category: asset.category as AssetCategory, key: asset.key, bpm: asset.bpm, audioFile: asset.audioFile });
    setPlayingId(durationMs > 0 ? asset.id : null);
    if (durationMs > 0) {
      setTimeout(() => setPlayingId((curr) => curr === asset.id ? null : curr), durationMs + 200);
    }
  };

  const handleStop = () => { stopAudition(); setPlayingId(null); };

  const onDragStart = (e: DragEvent, asset: MusicAsset) => {
    e.dataTransfer.setData("application/scorecanvas-asset", JSON.stringify(asset));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Stats
  const stats = {
    total: allAssets.length,
    withAudio: allAssets.filter((a) => a.audioFile).length,
    byCategory: categories.slice(1).map((c) => ({ cat: c, count: allAssets.filter((a) => a.category === c).length })).filter((s) => s.count > 0),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d1a] border border-canvas-accent rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-canvas-accent">
          <div>
            <h2 className="text-sm font-bold text-canvas-text flex items-center gap-2">
              <span className="text-canvas-highlight">♪</span> Project Music Assets
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-canvas-muted font-mono">{projectName}</span>
              <span className="text-[9px] text-canvas-muted">•</span>
              <span className="text-[10px] text-canvas-muted font-mono">{stats.total} assets</span>
              <span className="text-[9px] text-canvas-muted">•</span>
              <span className="text-[10px] text-green-400/70 font-mono">{stats.withAudio} with audio</span>
              <span className="text-[9px] text-canvas-muted">•</span>
              {stats.byCategory.map((s) => (
                <span key={s.cat} className="text-[9px] font-mono" style={{ color: categoryColors[s.cat] }}>
                  {s.count} {s.cat}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {playingId && (
              <button onClick={handleStop} className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2.5 py-1 rounded bg-red-900/30 border border-red-500/30">
                ⏹ STOP ALL
              </button>
            )}
            <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg leading-none px-2">&times;</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-canvas-accent/50 flex-wrap">
          <input
            type="text"
            placeholder="Search assets..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-canvas-bg border border-canvas-accent rounded px-2 py-1 text-xs text-canvas-text placeholder:text-canvas-muted/50 w-48 focus:outline-none focus:border-canvas-highlight/50"
          />
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[9px] font-mono uppercase px-2 py-1 rounded transition-colors ${
                  categoryFilter === cat
                    ? "bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30"
                    : "text-canvas-muted hover:text-canvas-text border border-transparent"
                }`}
              >
                {cat !== "all" && <span className="mr-0.5">{categoryIcons[cat]}</span>}
                {cat}
              </button>
            ))}
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-canvas-bg border border-canvas-accent rounded px-2 py-1 text-[10px] text-canvas-text font-mono focus:outline-none"
          >
            <option value="all">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
            ))}
          </select>
          <div className="flex-1" />
          <span className="text-[10px] text-canvas-muted font-mono">{filtered.length} shown</span>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-[#0d0d1a] z-10">
              <tr className="text-canvas-muted font-mono uppercase text-[9px] tracking-wider border-b border-canvas-accent/50">
                <th className="text-left px-5 py-2 w-8"></th>
                <th className="text-left px-2 py-2">Asset</th>
                <th className="text-left px-2 py-2 w-24">Level</th>
                <th className="text-left px-2 py-2 w-16">Type</th>
                <th className="text-left px-2 py-2 w-12">Dur</th>
                <th className="text-left px-2 py-2 w-14">BPM/Key</th>
                <th className="text-left px-2 py-2 w-12">Stems</th>
                <th className="text-left px-2 py-2 w-16">Audio</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => {
                const isActive = playingId === asset.id;
                const isExpanded = expandedId === asset.id;
                return (
                  <><tr
                    key={asset.id}
                    className={`border-b border-canvas-accent/20 cursor-pointer transition-colors ${
                      isActive ? "bg-green-900/20" : isExpanded ? "bg-canvas-accent/10" : "hover:bg-canvas-accent/20"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : asset.id)}
                    draggable
                    onDragStart={(e) => onDragStart(e, asset)}
                  >
                    <td className="px-5 py-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); isActive ? handleStop() : handlePlay(asset); }}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          isActive ? "bg-green-500 text-white animate-pulse" : "bg-canvas-bg text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/30"
                        }`}
                      >
                        {isActive ? (
                          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" fill="currentColor"/></svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="2,0 10,5 2,10" fill="currentColor"/></svg>
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="font-mono text-canvas-text text-[11px]">{asset.filename}</div>
                    </td>
                    <td className="px-2 py-1.5 text-canvas-muted text-[10px]">{asset.levelName}</td>
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white inline-flex items-center gap-0.5" style={{ background: categoryColors[asset.category] }}>
                        {categoryIcons[asset.category]} {asset.category}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-canvas-muted font-mono">{asset.duration}</td>
                    <td className="px-2 py-1.5 text-canvas-muted font-mono text-[10px]">{asset.bpm > 0 ? `${asset.bpm}` : "—"} / {asset.key}</td>
                    <td className="px-2 py-1.5 text-canvas-muted font-mono">{asset.stems.length}</td>
                    <td className="px-2 py-1.5">
                      {asset.audioFile ? (
                        <span className="text-[9px] text-green-400 font-mono">✓ linked</span>
                      ) : (
                        <span className="text-[9px] text-red-400/60 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${asset.id}-detail`} className="bg-canvas-accent/5 border-b border-canvas-accent/20">
                      <td colSpan={8} className="px-5 py-3">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Stems */}
                          <div>
                            <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-2">Stems ({asset.stems.length})</div>
                            <div className="space-y-1">
                              {asset.stems.map((stem, si) => (
                                <div key={si} className="flex items-center gap-2 px-2 py-1 rounded bg-canvas-bg/50 border border-canvas-accent/30">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColors[asset.category] }} />
                                  <span className="text-[10px] font-mono text-canvas-text">{stem}</span>
                                  <div className="flex-1" />
                                  <div className="w-12 h-1 rounded bg-canvas-accent/30 overflow-hidden">
                                    <div className="h-full rounded" style={{ width: `${60 + Math.random() * 40}%`, background: categoryColors[asset.category] + "88" }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Audio Info */}
                          <div>
                            <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-2">Audio File</div>
                            {asset.audioFile ? (
                              <div className="space-y-2">
                                <div className="px-2 py-1.5 rounded bg-green-900/20 border border-green-500/20">
                                  <div className="text-[10px] font-mono text-green-300 break-all">{asset.audioFile}</div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handlePlay(asset); }}
                                    className="px-2.5 py-1 text-[9px] font-bold rounded bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-500/20"
                                  >
                                    ▶ Play Full
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      auditionAsset({ id: asset.id + "-trans", category: asset.category as AssetCategory, key: asset.key, bpm: asset.bpm, audioFile: asset.audioFile, playbackMode: "transition" });
                                      setPlayingId(asset.id);
                                    }}
                                    className="px-2.5 py-1 text-[9px] font-bold rounded bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
                                  >
                                    ⟷ Transition Check
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="px-2 py-1.5 rounded bg-red-900/10 border border-red-500/10 text-[10px] text-red-400/60 font-mono">
                                No audio file linked
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-canvas-muted">Duration</span>
                                <span className="text-canvas-text font-mono">{asset.duration}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-canvas-muted">Tempo</span>
                                <span className="text-canvas-text font-mono">{asset.bpm > 0 ? `${asset.bpm} BPM` : "Free time"}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-canvas-muted">Key</span>
                                <span className="text-canvas-text font-mono">{asset.key}</span>
                              </div>
                            </div>
                          </div>

                          {/* Gen Tools */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider">AI Tools</div>
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Coming v2.5</span>
                            </div>
                            <div className="space-y-1.5" title="Click any button to learn about SEGUE — AI stem generation coming in v2.5">
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-segue")); }} title="Learn about SEGUE — AI stem generation coming in v2.5" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">✦</span> Generate Variation
                                <span className="text-[8px] text-purple-400/60 ml-auto">SOON</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-segue")); }} title="Learn about SEGUE — AI stem generation coming in v2.5" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">⤴</span> Generate Intro Tag
                                <span className="text-[8px] text-purple-400/60 ml-auto">SOON</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-segue")); }} title="Learn about SEGUE — AI stem generation coming in v2.5" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">⤵</span> Generate End Tag
                                <span className="text-[8px] text-purple-400/60 ml-auto">SOON</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-segue")); }} title="Learn about SEGUE — AI stem generation coming in v2.5" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">↔</span> Generate Transition
                                <span className="text-[8px] text-purple-400/60 ml-auto">SOON</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-segue")); }} title="Learn about SEGUE — AI stem generation coming in v2.5" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-amber-900/20 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-amber-400">≡</span> Split Stems
                                <span className="text-[8px] text-amber-400/60 ml-auto">SOON</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("open-segue")); }} title="Learn about SEGUE — AI analysis coming in v2.5" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-cyan-900/20 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-cyan-400">♪</span> Analyze &amp; Tag
                                <span className="text-[8px] text-cyan-400/60 ml-auto">SOON</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Used by nodes */}
                        {(assetToNodes.get(asset.filename)?.length ?? 0) > 0 && (
                          <div className="mt-3">
                            <div className="text-[9px] font-mono text-canvas-muted uppercase tracking-wider mb-1.5">Used By</div>
                            <div className="flex flex-wrap gap-1.5">
                              {assetToNodes.get(asset.filename)!.map((ref, ri) => {
                                const icon = ref.nodeType === "transition" ? "→" : ref.nodeType === "stinger" ? "◆" : "♪";
                                const color = ref.nodeType === "transition" ? "border-red-500/30 text-red-300" : ref.nodeType === "stinger" ? "border-orange-500/30 text-orange-300" : "border-green-500/30 text-green-300";
                                return (
                                  <span key={ri} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono border bg-canvas-bg/50 ${color}`}>
                                    {icon} {ref.label}
                                    <span className="text-canvas-muted/50 text-[8px]">{ref.levelName}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Waveform placeholder */}
                        <div className="mt-3 h-10 rounded bg-canvas-bg/50 border border-canvas-accent/30 flex items-center justify-center overflow-hidden relative">
                          <div className="flex items-end gap-px h-full w-full px-1 py-1">
                            {Array.from({ length: 80 }, (_, i) => {
                              const h = 10 + Math.sin(i * 0.3) * 8 + Math.random() * 12;
                              return (
                                <div key={i} className="flex-1 rounded-t" style={{
                                  height: `${h}%`,
                                  background: isActive ? `${categoryColors[asset.category]}cc` : `${categoryColors[asset.category]}44`,
                                  transition: "background 0.3s",
                                }} />
                              );
                            })}
                          </div>
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
