import { useEffect, useRef, useState } from "react";
import { segue, type SegueGenerateRequest, type SegueJob, type SegueKind, type SegueOutput } from "../lib/segue";
import type { MusicAsset } from "../data/projects";
import { resolveAudioUrl as resolveSynthUrl } from "../audio/synth";

export interface GenerationRequestEvent {
  asset: MusicAsset & { levelName?: string; levelId?: string };
  kind: SegueKind;
  /** Optional initial prompt — defaults to a kind-specific scaffold. */
  prompt?: string;
}

declare global {
  interface WindowEventMap {
    "segue-generate": CustomEvent<GenerationRequestEvent>;
  }
}

export interface GenerationModalProps {
  request: GenerationRequestEvent;
  onClose: () => void;
}

const KIND_LABEL: Record<SegueKind, string> = {
  variation: "Generate Variation",
  intro: "Generate Intro",
  endtag: "Generate Endtag",
  segue: "Generate Transition",
  split: "Split Stems",
  analyze: "Analyze & Tag",
};

const KIND_DEFAULT_PROMPT: Record<SegueKind, string> = {
  variation: "Less intense. Swap strings for synths. Same key and tempo.",
  intro: "4-bar instrumental intro that lands on the theme's downbeat.",
  endtag: "Cadential resolution, clean release.",
  segue: "Cinematic dissolve. Sustained pad through the midpoint. No hard edits.",
  split: "Separate this mix into stems.",
  analyze: "Extract key, tempo, mood, and dominant instruments.",
};

function isPublicAudioUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function resolveAudioUrl(asset: MusicAsset): string {
  if (!asset.audioFile) throw new Error(`Asset "${asset.filename}" has no audioFile.`);
  if (isPublicAudioUrl(asset.audioFile)) return asset.audioFile;
  // Supabase-stored uploads — already absolute public URLs, no CDN swap needed.
  if (asset.audioFile.startsWith("supabase://")) {
    return resolveSynthUrl(asset.audioFile);
  }
  const path = asset.audioFile.startsWith("/") ? asset.audioFile : `/audio/${asset.audioFile}`;
  // Prefer an explicit audio-CDN base in dev so Kie can actually fetch the
  // asset (localhost is unreachable from Kie's servers).
  const cdn = (import.meta.env["VITE_AUDIO_CDN_URL"] as string | undefined)?.replace(/\/$/, "");
  const base = cdn ?? window.location.origin;
  return new URL(path, base).toString();
}

const KIND_ICON: Record<SegueKind, string> = {
  variation: "✦",
  intro: "⤴",
  endtag: "⤵",
  segue: "↔",
  split: "≡",
  analyze: "♪",
};

export function GenerationModal({ request, onClose }: GenerationModalProps) {
  const { asset } = request;
  const [kind, setKind] = useState<SegueKind>(request.kind);
  const [prompt, setPrompt] = useState(request.prompt ?? KIND_DEFAULT_PROMPT[request.kind]);
  const [job, setJob] = useState<SegueJob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When user switches kind via the picker, swap the default prompt unless
  // they've already typed a custom one.
  const onPickKind = (k: SegueKind) => {
    setKind(k);
    setPrompt((prev) =>
      prev === KIND_DEFAULT_PROMPT[kind] || prev === "" ? KIND_DEFAULT_PROMPT[k] : prev,
    );
  };

  const sourceUrl = (() => {
    try {
      return resolveAudioUrl(asset);
    } catch (e) {
      return null;
    }
  })();

  const localOnly = sourceUrl ? sourceUrl.startsWith("http://localhost") || sourceUrl.startsWith("http://127.") : false;

  const onGenerate = async () => {
    if (!sourceUrl) {
      setError("This asset has no audioFile path.");
      return;
    }
    setError(null);
    setBusy(true);
    setJob(null);
    setJobId(null);
    try {
      const req: SegueGenerateRequest = {
        projectId: window.location.hash.match(/p\/([0-9a-f-]{36})/)?.[1] ?? "demo",
        nodeId: asset.id,
        sourceAudioUrl: sourceUrl,
        kind,
        prompt,
        targetKey: asset.key,
        targetBpm: asset.bpm,
        label: prompt.slice(0, 60),
      };
      const { jobId: id } = await segue.generate(req);
      setJobId(id);
      // Poll loop
      const deadline = Date.now() + 240_000;
      while (Date.now() < deadline) {
        const j = await segue.getJob(id);
        setJob(j);
        if (j.status === "ready" || j.status === "error") break;
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-purple-400">SEGUE</div>
            <div className="text-base font-semibold text-zinc-100">
              {KIND_LABEL[kind]} · {asset.filename}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="text-xs text-zinc-400">
            Source: <code className="text-zinc-200">{asset.filename}</code> · {asset.key} · {asset.bpm} BPM
            {asset.duration ? ` · ${asset.duration}` : ""}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["variation", "intro", "endtag", "segue", "split", "analyze"] as SegueKind[]).map((k) => (
              <button
                key={k}
                onClick={() => onPickKind(k)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded border transition-colors ${
                  kind === k
                    ? "bg-purple-500/30 border-purple-500/60 text-purple-100"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span className="mr-1">{KIND_ICON[k]}</span>
                {KIND_LABEL[k].replace(/^Generate /, "")}
              </button>
            ))}
          </div>

          {localOnly && (
            <div className="text-xs px-3 py-2 rounded bg-amber-900/30 border border-amber-700/40 text-amber-200">
              Heads-up: this asset URL points at <code>localhost</code>, which the SEGUE backend can't reach.
              Either deploy Score Canvas or proxy the asset via a public URL.
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Director note
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGenerate}
              disabled={busy || !sourceUrl}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold text-sm"
            >
              {busy ? "Generating…" : KIND_LABEL[kind]}
            </button>
            {jobId && (
              <code className="text-xs text-zinc-500">job {jobId.slice(0, 8)}</code>
            )}
            {job && <StatusPill status={job.status} progress={job.progress} />}
            {!segue.isReal && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 ml-auto">
                stub mode
              </span>
            )}
          </div>

          {error && <pre className="text-xs text-red-400 whitespace-pre-wrap">{error}</pre>}

          {job?.outputs && job.outputs.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Outputs ({job.outputs.length})
              </div>
              {job.outputs.map((o) => (
                <OutputRow key={o.id} output={o} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, progress }: { status: SegueJob["status"]; progress?: number }) {
  const color = {
    queued: "bg-zinc-700 text-zinc-300",
    running: "bg-amber-900/50 text-amber-300",
    ready: "bg-emerald-900/50 text-emerald-300",
    error: "bg-red-900/50 text-red-300",
  }[status];
  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${color}`}>
      {status}
      {status === "running" && progress != null ? ` · ${progress}%` : ""}
    </span>
  );
}

function OutputRow({ output }: { output: SegueOutput }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="text-zinc-300">{output.label ?? output.id.slice(0, 8)}</div>
        <div className="text-zinc-500 font-mono">
          {output.durationMs ? `${Math.round(output.durationMs / 1000)}s` : ""}
          {output.instrumentalVerified ? " · instrumental ✓" : ""}
        </div>
      </div>
      <audio ref={audioRef} controls src={output.url} className="w-full" />
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <a href={output.url} download className="hover:text-zinc-300">Download</a>
        <code className="text-zinc-600">{output.id.slice(0, 8)}</code>
      </div>
    </div>
  );
}

// ─── Convenience: hook into the window event from anywhere ──────────────────

export function useGenerationRequests(): GenerationRequestEvent | null {
  const [pending, setPending] = useState<GenerationRequestEvent | null>(null);
  useEffect(() => {
    const handler = (e: CustomEvent<GenerationRequestEvent>) => {
      if (e.detail) setPending(e.detail);
    };
    window.addEventListener("segue-generate", handler as EventListener);
    return () => window.removeEventListener("segue-generate", handler as EventListener);
  }, []);
  return pending;
}
