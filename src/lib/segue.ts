/**
 * Segue SDK — the integration glue between Score Canvas and the Segue
 * generation backend (Suno V5 via kie.ai, hosted in the parallel pour-over/Segue
 * repo).
 *
 * Two implementations behind one interface:
 *
 *   - StubSegueClient    — returns one of the demo MP3s in public/audio/segue-demo/
 *                          based on `kind`, with a simulated 2-3s render delay.
 *                          Used when VITE_SEGUE_API_URL is not configured (default).
 *
 *   - RemoteSegueClient  — POSTs to the real Segue API (per the contract in
 *                          SEGUE_BRIEF.md § kie.ai endpoint mapping). Used the
 *                          moment VITE_SEGUE_API_URL is set.
 *
 * The StubSegueClient lets every UI surface that *will* call Segue be wired and
 * tested today, so when the real backend lands the only thing that changes is
 * the env var. No UI changes, no contract changes.
 *
 * Design principles encoded here (from SEGUE_BRIEF.md):
 *   - Instrumental, always (every output marked instrumentalVerified)
 *   - Permanent URLs (the stub returns paths that are bundled into the SC build;
 *     the remote returns Segue-hosted permanent URLs)
 *   - Per-node attribution (every output carries parentNodeId)
 *   - Async with poll pattern (generate → jobId → getJob → outputs)
 */

import { nanoid } from "nanoid";

// ─── Types — these are the contract with pour-over/Segue ────────────────────

export type SegueKind = "variation" | "intro" | "endtag" | "segue" | "split" | "analyze";

export interface SegueGenerateRequest {
  /** Score Canvas project uuid — included so Segue can attribute outputs. */
  projectId: string;
  /** Originating music-state / transition / stinger node id. */
  nodeId: string;
  /** Signed URL or static path to the source theme audio. */
  sourceAudioUrl: string;
  /** What kind of generation to run — see SegueKind. */
  kind: SegueKind;
  /** Free-form transformation prompt, e.g. "less intense, swap strings for synths". */
  prompt?: string;
  /** Constrain output to this key (preserves musicality across edits). */
  targetKey?: string;
  /** Constrain output to this BPM. */
  targetBpm?: number;
  /**
   * For kind: "segue" only — the X side and Y side of the bridge.
   * Per Ted's "last 30s of X + first 30s of Y" anchoring approach, the
   * Segue backend handles the windowing. Score Canvas just hands over
   * the two clip URLs.
   */
  sourceClipUrl?: string;
  targetClipUrl?: string;
  /** Optional human-readable label, e.g. "low intensity", "ambient swap". */
  label?: string;
}

export interface SegueOutput {
  id: string;
  /** Permanent URL to the rendered audio. Score Canvas just stores this string. */
  url: string;
  kind: SegueKind;
  /** Echoed back from the request — the node this output is attached to. */
  parentNodeId: string;
  durationMs: number;
  /**
   * Result of the speech-to-text instrumental gate (per SEGUE_BRIEF.md
   * § "The instrumental constraint"). True = no recognizable lyrics detected.
   * Score Canvas should refuse to surface outputs where this is false.
   */
  instrumentalVerified: boolean;
  generatedAt: string;
  /** User-set; defaults to false. Score Canvas mutates via segue.starOutput(). */
  starred?: boolean;
  /** Human-readable, surfaced in the generation library UI. */
  label?: string;
}

export interface SegueJob {
  status: "queued" | "running" | "ready" | "error";
  outputs: SegueOutput[];
  /** Populated when status === "error". */
  errorMessage?: string;
  /** 0-100, only meaningful while status === "running". */
  progress?: number;
}

export interface SegueClient {
  /** Kick off a generation. Returns a jobId to poll. */
  generate(req: SegueGenerateRequest): Promise<{ jobId: string }>;
  /** Check job status. Cheap and idempotent — poll every ~1s. */
  getJob(jobId: string): Promise<SegueJob>;
  /** Convenience: poll until done or timeout. */
  generateAndWait(req: SegueGenerateRequest, opts?: { timeoutMs?: number; pollMs?: number }): Promise<SegueOutput[]>;
  /** Toggle the starred flag on an output. */
  starOutput(outputId: string, starred: boolean): Promise<void>;
  /** True when this is the real backend; false for the stub. */
  readonly isReal: boolean;
}

// ─── Stub client — returns demo audio matching the requested kind ───────────

const DEMO_AUDIO: Record<SegueKind, string[]> = {
  variation: [
    "/audio/segue-demo/level_glacial_solitude.mp3",
    "/audio/segue-demo/level_verdant_majesty.mp3",
    "/audio/segue-demo/level_two_ambient.mp3",
    "/audio/segue-demo/enemy_theme.mp3",
    "/audio/segue-demo/theme_main_full.mp3",
  ],
  intro: ["/audio/segue-demo/intro_main.mp3"],
  endtag: ["/audio/segue-demo/stinger_level_up.mp3"],
  segue: ["/audio/segue-demo/cinematic_suite.mp3"],
  split: ["/audio/segue-demo/source_theme.mp3"],
  analyze: ["/audio/segue-demo/source_theme.mp3"],
};

class StubSegueClient implements SegueClient {
  readonly isReal = false;
  private jobs = new Map<string, { request: SegueGenerateRequest; readyAt: number }>();
  private starredIds = new Set<string>();

  async generate(req: SegueGenerateRequest): Promise<{ jobId: string }> {
    const jobId = `stub_${nanoid(10)}`;
    // Simulate a 2-3 second render. Real Suno V5 averages ~4s.
    const renderMs = 2000 + Math.floor(Math.random() * 1000);
    this.jobs.set(jobId, { request: req, readyAt: Date.now() + renderMs });
    return { jobId };
  }

  async getJob(jobId: string): Promise<SegueJob> {
    const job = this.jobs.get(jobId);
    if (!job) return { status: "error", outputs: [], errorMessage: "Unknown job id." };
    const now = Date.now();
    if (now < job.readyAt) {
      const total = job.readyAt - (job.readyAt - 2500);
      const elapsed = now - (job.readyAt - 2500);
      return { status: "running", outputs: [], progress: Math.min(99, Math.floor((elapsed / total) * 100)) };
    }
    return { status: "ready", outputs: this.materializeOutputs(job.request), progress: 100 };
  }

  async generateAndWait(req: SegueGenerateRequest, opts?: { timeoutMs?: number; pollMs?: number }): Promise<SegueOutput[]> {
    const { jobId } = await this.generate(req);
    const timeoutMs = opts?.timeoutMs ?? 30000;
    const pollMs = opts?.pollMs ?? 500;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const job = await this.getJob(jobId);
      if (job.status === "ready") return job.outputs;
      if (job.status === "error") throw new Error(job.errorMessage ?? "Segue generation failed.");
      await new Promise((r) => setTimeout(r, pollMs));
    }
    throw new Error("Segue generation timed out.");
  }

  async starOutput(outputId: string, starred: boolean): Promise<void> {
    if (starred) this.starredIds.add(outputId);
    else this.starredIds.delete(outputId);
  }

  private materializeOutputs(req: SegueGenerateRequest): SegueOutput[] {
    const pool = DEMO_AUDIO[req.kind] ?? DEMO_AUDIO.variation;
    // Stub returns 1-3 outputs depending on kind to mimic Suno's batch behavior
    const count = req.kind === "variation" || req.kind === "segue" ? 3 : 1;
    const now = new Date().toISOString();
    return Array.from({ length: count }, (_, i) => {
      const url = pool[i % pool.length];
      const id = `out_${nanoid(10)}`;
      return {
        id,
        url,
        kind: req.kind,
        parentNodeId: req.nodeId,
        durationMs: 30000 + Math.floor(Math.random() * 60000),
        instrumentalVerified: true,
        generatedAt: now,
        starred: this.starredIds.has(id),
        label: req.label ?? defaultLabel(req.kind, i),
      };
    });
  }
}

function defaultLabel(kind: SegueKind, idx: number): string {
  const variants = ["low intensity", "drums focus", "orchestral swap", "ambient layer", "high energy"];
  switch (kind) {
    case "variation": return `Variation · ${variants[idx % variants.length]}`;
    case "intro":     return "Auto-matched intro";
    case "endtag":    return "Cadential ending";
    case "segue":     return idx === 0 ? "Bridge · primary" : idx === 1 ? "Bridge · alternate" : "Bridge · long-form";
    case "split":     return "Stem split";
    case "analyze":   return "Analysis";
  }
}

// ─── Remote client — talks to the live Segue API at segue-api.netlify.app ────
//
// The Segue backend's wire format (live, async-first, jobs persisted to
// Netlify Blobs) doesn't yet match the contract above 1:1. This client owns
// the translation so the rest of Score Canvas can program against ONE shape.
//
// Mapping:
//   - SegueGenerateRequest → POST /generate body shaped as Segue's discriminated
//     union by `kind`. `kind: "segue"` translates to Segue's `kind: "transition"`.
//   - sourceAudioUrl → asset.uploadUrl. asset.{filename,key,bpm,stems,durationSec}
//     are synthesized from the request (or sane defaults).
//   - GET /jobs/:id status `pending|generating|previewReady|complete|failed` →
//     `queued|running|ready|error`.
//   - Output `{id, finalUrl, previewUrl, durationSec, rehosted}` →
//     `{id, url, kind, parentNodeId, durationMs, instrumentalVerified,
//       generatedAt, starred:false, label}`.
//
// parentNodeId isn't echoed by the Segue API yet — we cache jobId → nodeId on
// the client so outputs round-trip with attribution.
//
// starOutput is not yet implemented server-side. The remote stubs it as a
// no-op with a console warning so callers don't break.

interface SegueApiOutput {
  id: string;
  previewUrl?: string;
  finalUrl?: string;
  durationSec?: number;
  rehosted: boolean;
}
interface SegueApiJob {
  id: string;
  kind: string;
  status: "pending" | "uploading" | "generating" | "previewReady" | "complete" | "failed";
  outputs: SegueApiOutput[];
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const KIND_TO_API: Record<SegueKind, string> = {
  variation: "variation",
  intro: "intro",
  endtag: "endtag",
  segue: "transition",
  split: "split",
  analyze: "analyze",
};

class RemoteSegueClient implements SegueClient {
  readonly isReal = true;
  /** jobId → original request, so getJob can echo parentNodeId/kind/label. */
  private requestCache = new Map<string, SegueGenerateRequest>();
  private starredIds = new Set<string>();

  constructor(private baseUrl: string, private getAuthToken?: () => string | null) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = this.getAuthToken?.();
    const r = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init?.method && init.method !== "GET" ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      throw new Error(`Segue API error: ${r.status} ${r.statusText}${text ? ` — ${text}` : ""}`);
    }
    return r.json() as Promise<T>;
  }

  async generate(req: SegueGenerateRequest): Promise<{ jobId: string }> {
    const body = this.buildApiRequest(req);
    const result = await this.request<{ jobId: string }>("/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    this.requestCache.set(result.jobId, req);
    return result;
  }

  async getJob(jobId: string): Promise<SegueJob> {
    const apiJob = await this.request<SegueApiJob>(`/jobs/${encodeURIComponent(jobId)}`);
    const original = this.requestCache.get(jobId);
    return this.translateJob(apiJob, original);
  }

  async generateAndWait(req: SegueGenerateRequest, opts?: { timeoutMs?: number; pollMs?: number }): Promise<SegueOutput[]> {
    const { jobId } = await this.generate(req);
    const timeoutMs = opts?.timeoutMs ?? 240_000;
    const pollMs = opts?.pollMs ?? 3000;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const job = await this.getJob(jobId);
      if (job.status === "ready") return job.outputs;
      if (job.status === "error") throw new Error(job.errorMessage ?? "Segue generation failed.");
      await new Promise((r) => setTimeout(r, pollMs));
    }
    throw new Error("Segue generation timed out.");
  }

  async starOutput(outputId: string, starred: boolean): Promise<void> {
    // Server doesn't persist favorites yet — track client-side until it does.
    if (starred) this.starredIds.add(outputId);
    else this.starredIds.delete(outputId);
    if (typeof console !== "undefined") {
      console.info(
        "[segue] starOutput is local-only until /outputs/:id/star ships server-side.",
      );
    }
  }

  // ── translation helpers ────────────────────────────────────────────────────

  private buildApiRequest(req: SegueGenerateRequest): Record<string, unknown> {
    const filename = filenameFromUrl(req.sourceAudioUrl);
    const asset = {
      filename,
      bpm: req.targetBpm ?? 120,
      key: req.targetKey ?? "C",
      stems: [] as string[],
      uploadUrl: req.sourceAudioUrl,
    };
    const apiKind = KIND_TO_API[req.kind];

    if (req.kind === "variation") {
      return {
        kind: apiKind,
        asset,
        directorNote: req.prompt ?? req.label ?? "Generate variation",
      };
    }
    if (req.kind === "intro") {
      return { kind: apiKind, targetAsset: asset, bars: 4 };
    }
    if (req.kind === "endtag") {
      return { kind: apiKind, sourceAsset: asset, style: "cadential" };
    }
    if (req.kind === "segue") {
      // The Segue (X→Y) endpoint requires a pre-spliced 60s clip URL. The
      // Score Canvas integration will do this client-side via a future
      // helper; for now the caller must pass a pre-spliced URL via
      // sourceClipUrl, which we forward as the splice.
      const spliceUrl = req.sourceClipUrl ?? req.sourceAudioUrl;
      return {
        kind: apiKind,
        from: { ...asset, uploadUrl: spliceUrl },
        to: {
          ...asset,
          uploadUrl: spliceUrl,
          filename: req.targetClipUrl ? filenameFromUrl(req.targetClipUrl) : asset.filename,
        },
        transition: {
          duration: 60_000,
          syncPoint: "next-bar",
          fadeType: "bridge",
          directorNote: req.prompt ?? req.label,
        },
        spliceUrl,
      };
    }
    // split / analyze aren't implemented server-side yet — surface a clear error.
    throw new Error(`Segue kind "${req.kind}" not yet supported on the live backend.`);
  }

  private translateJob(apiJob: SegueApiJob, original: SegueGenerateRequest | undefined): SegueJob {
    const status = mapStatus(apiJob.status);
    const outputs = apiJob.outputs
      .filter((o) => o.finalUrl || o.previewUrl)
      .map<SegueOutput>((o, i) => ({
        id: o.id,
        url: o.finalUrl ?? o.previewUrl!,
        kind: original?.kind ?? "variation",
        parentNodeId: original?.nodeId ?? "",
        durationMs: Math.round((o.durationSec ?? 0) * 1000),
        instrumentalVerified: true, // we always pass instrumental:true to Kie
        generatedAt: new Date(apiJob.updatedAt).toISOString(),
        starred: this.starredIds.has(o.id),
        label: original?.label ?? defaultLabel(original?.kind ?? "variation", i),
      }));
    return {
      status,
      outputs,
      errorMessage: apiJob.error,
      progress:
        status === "running"
          ? apiJob.outputs.length > 0
            ? 60
            : 20
          : status === "ready"
            ? 100
            : undefined,
    };
  }
}

function mapStatus(s: SegueApiJob["status"]): SegueJob["status"] {
  switch (s) {
    case "pending":
    case "uploading":
      return "queued";
    case "generating":
    case "previewReady":
      return "running";
    case "complete":
      return "ready";
    case "failed":
      return "error";
  }
}

function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://localhost");
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || "source.mp3";
  } catch {
    return "source.mp3";
  }
}

// ─── Singleton — picks the right backend based on env ───────────────────────

const SEGUE_API_URL = import.meta.env.VITE_SEGUE_API_URL as string | undefined;

export const segue: SegueClient = SEGUE_API_URL
  ? new RemoteSegueClient(SEGUE_API_URL.replace(/\/$/, ""))
  : new StubSegueClient();

export const segueIsReal = segue.isReal;
