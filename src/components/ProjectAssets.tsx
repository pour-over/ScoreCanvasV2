import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { nanoid } from "nanoid";
import type { GameLevel, MusicAsset } from "../data/projects";
import { stopAudition, type AssetCategory } from "../audio/synth";
import { priorityAuditionAsset } from "../audio/coordinator";
import { supabase, AUDIO_BUCKET, isConfigured } from "../lib/supabase";
import { Waveform } from "./Waveform";

interface ProjectAssetsProps {
  levels: GameLevel[];
  projectName: string;
  onClose: () => void;
  /** True when viewing a shared read-only link or a demo project — hide upload affordance */
  readOnly?: boolean;
  /** True when this is a user-owned project (forked or saved) — uploads only land here */
  isUserProject?: boolean;
  /** Auth user id; required to build the storage path */
  userId?: string | null;
  /** Project UUID once saved; required so the upload path namespaces under the project */
  projectId?: string | null;
  /** Push a freshly-uploaded asset onto a level. App owns the project state. */
  onAddAsset?: (levelId: string, asset: MusicAsset) => void;
  /** Default level to receive new uploads when the user hasn't chosen one. */
  defaultUploadLevelId?: string;
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB — Supabase free-tier per-file cap
const SAFE_FILENAME_RE = /[^a-zA-Z0-9._-]+/g;

function sanitizeFilename(name: string): string {
  return name.replace(SAFE_FILENAME_RE, "_").slice(0, 80);
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Probe an audio file's duration via a hidden HTMLAudioElement. */
function probeDurationSec(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const cleanup = () => URL.revokeObjectURL(url);
    audio.addEventListener("loadedmetadata", () => {
      const sec = isFinite(audio.duration) ? audio.duration : 0;
      cleanup();
      resolve(sec);
    });
    audio.addEventListener("error", () => { cleanup(); resolve(0); });
    audio.src = url;
  });
}

const categoryColors: Record<string, string> = {
  intro: "#4ecdc4", loop: "#e94560", ending: "#f59e0b", transition: "#818cf8", stinger: "#f97316", layer: "#a855f7", ambient: "#a855f7",
};

const categoryIcons: Record<string, string> = {
  intro: "▶", loop: "↻", ending: "◼", transition: "→", stinger: "⚡", layer: "≡", ambient: "◎",
};

export function ProjectAssets({
  levels,
  projectName,
  onClose,
  readOnly = false,
  isUserProject = false,
  userId = null,
  projectId = null,
  onAddAsset,
  defaultUploadLevelId,
}: ProjectAssetsProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // ─── Upload state ────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<
    | { kind: "idle" }
    | { kind: "uploading"; filename: string }
    | { kind: "success"; filename: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const canUpload = !readOnly && isUserProject && isConfigured && !!userId && !!projectId && !!onAddAsset;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so picking the same file again still fires
    if (!file) return;
    if (!canUpload || !userId || !projectId || !onAddAsset) {
      setUploadState({ kind: "error", message: "Upload isn't available right now." });
      return;
    }
    if (!file.type.startsWith("audio/")) {
      setUploadState({ kind: "error", message: `Not an audio file (${file.type || "unknown"}).` });
      setTimeout(() => setUploadState({ kind: "idle" }), 4000);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setUploadState({ kind: "error", message: `File is ${mb} MB — limit is 25 MB.` });
      setTimeout(() => setUploadState({ kind: "idle" }), 5000);
      return;
    }

    setUploadState({ kind: "uploading", filename: file.name });
    try {
      const safe = sanitizeFilename(file.name);
      const path = `${userId}/${projectId}/${nanoid(6)}-${safe}`;
      const [{ error: uploadErr }, durationSec] = await Promise.all([
        supabase.storage.from(AUDIO_BUCKET).upload(path, file, { upsert: false, contentType: file.type }),
        probeDurationSec(file),
      ]);
      if (uploadErr) throw uploadErr;
      const targetLevelId = defaultUploadLevelId ?? levels[0]?.id;
      if (!targetLevelId) throw new Error("No level to attach the asset to.");
      const asset: MusicAsset = {
        id: `up-${nanoid(8)}`,
        filename: file.name.replace(/\.[^.]+$/, ""),
        category: "loop",       // sensible default; user can re-edit
        duration: formatDuration(durationSec),
        bpm: 120,               // default; SEGUE Analyze & Tag fills these in later
        key: "C",
        stems: [],
        audioFile: `supabase://${path}`,
      };
      onAddAsset(targetLevelId, asset);
      setUploadState({ kind: "success", filename: file.name });
      setTimeout(() => setUploadState({ kind: "idle" }), 3500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setUploadState({ kind: "error", message: msg });
      setTimeout(() => setUploadState({ kind: "idle" }), 6000);
    }
  };

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
    const durationMs = await priorityAuditionAsset({ id: asset.id, category: asset.category as AssetCategory, key: asset.key, bpm: asset.bpm, audioFile: asset.audioFile }, "project-assets");
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
            {canUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChosen}
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  disabled={uploadState.kind === "uploading"}
                  title="Upload an MP3 / WAV from your machine (max 25 MB)"
                  className="text-[10px] font-bold text-canvas-highlight hover:text-white px-2.5 py-1 rounded bg-canvas-highlight/20 border border-canvas-highlight/40 hover:bg-canvas-highlight/40 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {uploadState.kind === "uploading" ? (
                    <>
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>+ Upload Asset</>
                  )}
                </button>
              </>
            )}
            {playingId && (
              <button onClick={handleStop} className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2.5 py-1 rounded bg-red-900/30 border border-red-500/30">
                ⏹ STOP ALL
              </button>
            )}
            <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg leading-none px-2">&times;</button>
          </div>
        </div>

        {/* Upload toast strip */}
        {uploadState.kind === "success" && (
          <div className="px-5 py-2 border-b border-green-500/30 bg-green-900/20 text-[11px] text-green-300 flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Uploaded <span className="font-mono">{uploadState.filename}</span> — added to {levels.find((l) => l.id === defaultUploadLevelId)?.name ?? levels[0]?.name ?? "the project"}.</span>
          </div>
        )}
        {uploadState.kind === "error" && (
          <div className="px-5 py-2 border-b border-red-500/30 bg-red-900/20 text-[11px] text-red-300 flex items-center gap-2">
            <span className="text-red-400">✕</span>
            <span>{uploadState.message}</span>
          </div>
        )}

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
                                      priorityAuditionAsset({ id: asset.id + "-trans", category: asset.category as AssetCategory, key: asset.key, bpm: asset.bpm, audioFile: asset.audioFile, playbackMode: "transition" }, "project-assets");
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
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">SEGUE</span>
                            </div>
                            <div className="space-y-1.5">
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("segue-generate", { detail: { asset, kind: "variation" } })); }} title="Generate a stem variation via SEGUE" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">✦</span> Generate Variation
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("segue-generate", { detail: { asset, kind: "intro" } })); }} title="Generate an intro tag via SEGUE" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">⤴</span> Generate Intro Tag
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("segue-generate", { detail: { asset, kind: "endtag" } })); }} title="Generate an end tag via SEGUE" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">⤵</span> Generate End Tag
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("segue-generate", { detail: { asset, kind: "segue" } })); }} title="Generate a transition via SEGUE (X→Y bridge)" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-purple-900/20 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-purple-400">↔</span> Generate Transition
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("segue-generate", { detail: { asset, kind: "split" } })); }} title="Split this mix into stems (SEGUE)" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-amber-900/20 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-amber-400">≡</span> Split Stems
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("segue-generate", { detail: { asset, kind: "analyze" } })); }} title="Analyze this asset (SEGUE)" className="w-full px-2.5 py-1.5 text-[10px] font-semibold rounded bg-cyan-900/20 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-left flex items-center gap-2 transition-colors">
                                <span className="text-cyan-400">♪</span> Analyze &amp; Tag
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

                        {/* Real waveform — decoded from the actual MP3 lazily */}
                        <div className="mt-3">
                          <Waveform
                            audioFile={asset.audioFile}
                            color={categoryColors[asset.category]}
                            active={isActive}
                          />
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
