/**
 * Web Audio engine for Score Canvas.
 * Plays real MP3 files. Transition mode plays first 10s + last 10s with crossfades.
 * Default volume: 60%.
 */

import { supabase, AUDIO_BUCKET } from "../lib/supabase";

// ─── Audio context singleton ────────────────────────────────────────────────

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterLimiter: DynamicsCompressorNode | null = null;
let activeSources: AudioBufferSourceNode[] = [];
let activeFileGains: GainNode[] = [];
const activeFileGainCategories = new WeakMap<GainNode, AssetCategory>();
let activeTimeouts: number[] = [];
let isPlaying = false;
let currentAssetId: string | null = null;
let volumeLevel = 0.6; // default 60%

// Audio buffer cache to avoid re-fetching
const bufferCache = new Map<string, AudioBuffer>();

// Per-category shelf EQ — lazily created once per category and reused.
// Loops get a soft de-mud, stingers get presence/clarity, intros high-pass
// out subsonic rumble. Transparent for transitions and ambient layers.
const categoryEQs = new Map<AssetCategory, AudioNode>();

function makeCategoryEQ(ac: AudioContext, master: GainNode, category: AssetCategory): AudioNode {
  // The "input" node is the first filter in the chain. We connect into it,
  // route through the chain, terminate at master. For transparent categories
  // we just return a passthrough GainNode at unity.
  const input = ac.createGain();
  input.gain.value = 1;

  if (category === "loop" || category === "ambient" || category === "layer") {
    const demud = ac.createBiquadFilter();
    demud.type = "peaking";
    demud.frequency.value = 320;
    demud.Q.value = 0.9;
    demud.gain.value = -2.5;
    input.connect(demud);
    demud.connect(master);
  } else if (category === "stinger") {
    const presence = ac.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.value = 5000;
    presence.Q.value = 0.8;
    presence.gain.value = 4;
    const air = ac.createBiquadFilter();
    air.type = "highshelf";
    air.frequency.value = 12000;
    air.gain.value = 3;
    input.connect(presence);
    presence.connect(air);
    air.connect(master);
  } else if (category === "intro" || category === "ending") {
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 50;
    hp.Q.value = 0.7;
    input.connect(hp);
    hp.connect(master);
  } else {
    // transition — transparent
    input.connect(master);
  }
  return input;
}

function getCategoryEQ(category: AssetCategory): AudioNode {
  const ac = getCtx();
  const master = getMaster();
  let eq = categoryEQs.get(category);
  if (!eq) {
    eq = makeCategoryEQ(ac, master, category);
    categoryEQs.set(category, eq);
  }
  return eq;
}

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = volumeLevel;
    // Master safety limiter — catches the rare hot-stack moment without
    // coloring the mix at typical levels. Knee + ratio chosen for
    // transparent-until-needed behavior.
    masterLimiter = ctx.createDynamicsCompressor();
    masterLimiter.threshold.value = -6;
    masterLimiter.ratio.value = 8;
    masterLimiter.knee.value = 12;
    masterLimiter.attack.value = 0.003;
    masterLimiter.release.value = 0.12;
    masterGain.connect(masterLimiter);
    masterLimiter.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

/**
 * Briefly duck every currently-playing non-stinger track when a stinger fires,
 * so the punctuation reads against the bed instead of stacking on top of it.
 * Sidechain feel without an actual sidechain bus.
 */
function duckForStinger(stingerGain: GainNode) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const duckTo = 0.45;     // ~ -7 dB
  const attack = 0.06;
  const hold = 0.25;
  const release = 0.35;
  for (const g of activeFileGains) {
    if (g === stingerGain) continue;
    const cat = activeFileGainCategories.get(g);
    if (cat === "stinger") continue;
    try {
      // Snapshot the current envelope value so the dip doesn't fight any
      // ongoing fade — the duck reads as a layer over whatever's scheduled.
      const v = g.gain.value;
      g.gain.cancelAndHoldAtTime?.(now);
      g.gain.setValueAtTime(v, now);
      g.gain.linearRampToValueAtTime(v * duckTo, now + attack);
      g.gain.setValueAtTime(v * duckTo, now + attack + hold);
      g.gain.linearRampToValueAtTime(v, now + attack + hold + release);
    } catch { /* node was already disconnected */ }
  }
}

// ─── Volume control ─────────────────────────────────────────────────────────

export function setVolume(v: number) {
  volumeLevel = Math.max(0, Math.min(1, v));
  if (masterGain) {
    masterGain.gain.value = volumeLevel;
  }
}

export function getVolume(): number {
  return volumeLevel;
}

// ─── Audio URL resolver ─────────────────────────────────────────────────────

/**
 * Single source of truth for resolving a `MusicAsset.audioFile` field to a
 * fetchable URL. Handles three forms:
 *
 *   "supabase://{user_id}/{project_id}/{file}" → public URL from the
 *     user-audio bucket (Supabase Storage). Public bucket: no signing.
 *   "/audio/..."                                → returned as-is
 *   "journey2/mus_sands_combat.mp3"             → "/audio/" prefix added
 *
 * Used by every fetch site in this file (loadWaveformPeaks, findFirstSoundSec,
 * playAudioFile) and by GenerationModal. Keeping resolution centralised means
 * adding new storage backends later is a one-file change.
 */
export function resolveAudioUrl(audioFile: string): string {
  if (audioFile.startsWith("supabase://")) {
    const path = audioFile.slice("supabase://".length);
    return supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
  }
  if (audioFile.startsWith("/")) return audioFile;
  return `/audio/${audioFile}`;
}

// ─── MP3 file playback ──────────────────────────────────────────────────────

async function loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;
  try {
    const ac = getCtx();
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const arrayBuf = await resp.arrayBuffer();
    const audioBuf = await ac.decodeAudioData(arrayBuf);
    bufferCache.set(url, audioBuf);
    return audioBuf;
  } catch {
    return null;
  }
}

// ─── Waveform peaks (for visualization) ─────────────────────────────────────

const peaksCache = new Map<string, number[]>();

/**
 * Load + decode an audio file and return a downsampled array of peak amplitudes
 * suitable for waveform visualization. Each peak is the max absolute sample
 * value within its bucket, normalized to 0–1. Cached after first computation.
 */
export async function loadWaveformPeaks(audioFile: string, buckets = 96): Promise<number[] | null> {
  const url = resolveAudioUrl(audioFile);
  const cacheKey = `${url}:${buckets}`;
  if (peaksCache.has(cacheKey)) return peaksCache.get(cacheKey)!;
  const buf = await loadAudioBuffer(url);
  if (!buf) return null;
  // Mix down to mono by averaging the channels (handles mono and stereo).
  const channelData: Float32Array[] = [];
  for (let c = 0; c < buf.numberOfChannels; c++) channelData.push(buf.getChannelData(c));
  const totalSamples = buf.length;
  const samplesPerBucket = Math.floor(totalSamples / buckets) || 1;
  const peaks: number[] = new Array(buckets).fill(0);
  let globalMax = 0;
  for (let b = 0; b < buckets; b++) {
    const start = b * samplesPerBucket;
    const end = Math.min(start + samplesPerBucket, totalSamples);
    let max = 0;
    for (let i = start; i < end; i++) {
      let s = 0;
      for (let c = 0; c < channelData.length; c++) s += channelData[c][i];
      const v = Math.abs(s / channelData.length);
      if (v > max) max = v;
    }
    peaks[b] = max;
    if (max > globalMax) globalMax = max;
  }
  // Normalize so the loudest peak is 1.0 (purely visual; doesn't affect playback).
  if (globalMax > 0) {
    for (let i = 0; i < buckets; i++) peaks[i] /= globalMax;
  }
  peaksCache.set(cacheKey, peaks);
  return peaks;
}

// ─── First-sound detection (skip dead air at file start) ────────────────────
// Many of the demo MP3s start with 3–10s of silence or sub-audible fade-in.
// findFirstSoundSec scans the file and returns the timestamp where real audio
// begins, so playback can start there instead of through the silence.

const firstSoundCache = new Map<string, number>();

/**
 * Locate the first window of "real" audio in a file (window peak ≥ 5% of the
 * file's max peak), back off by 50ms padding to preserve attack transients,
 * and return the timestamp in seconds. Cached per file. Returns 0 if the file
 * can't load or starts at full volume.
 */
export async function findFirstSoundSec(audioFile: string, opts?: {
  thresholdRel?: number;
  windowMs?: number;
  paddingMs?: number;
}): Promise<number> {
  if (firstSoundCache.has(audioFile)) return firstSoundCache.get(audioFile)!;
  const url = resolveAudioUrl(audioFile);
  const buf = await loadAudioBuffer(url);
  if (!buf) return 0;

  const sampleRate = buf.sampleRate;
  const totalSamples = buf.length;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < buf.numberOfChannels; c++) channelData.push(buf.getChannelData(c));
  const channelCount = channelData.length;

  // Pass 1: find the global max peak (mono-mixed) so the threshold is relative.
  let globalMax = 0;
  for (let i = 0; i < totalSamples; i++) {
    let s = 0;
    for (let c = 0; c < channelCount; c++) s += channelData[c][i];
    const v = Math.abs(s / channelCount);
    if (v > globalMax) globalMax = v;
  }
  if (globalMax === 0) {
    firstSoundCache.set(audioFile, 0);
    return 0;
  }

  const thresholdRel = opts?.thresholdRel ?? 0.05;          // 5% of peak (~–26 dB)
  const windowMs = opts?.windowMs ?? 50;
  const paddingMs = opts?.paddingMs ?? 50;
  const threshold = globalMax * thresholdRel;
  const windowSamples = Math.max(1, Math.floor((sampleRate * windowMs) / 1000));

  // Pass 2: walk windows, find first whose peak crosses threshold.
  for (let i = 0; i + windowSamples <= totalSamples; i += windowSamples) {
    let windowPeak = 0;
    for (let j = i; j < i + windowSamples; j++) {
      let s = 0;
      for (let c = 0; c < channelCount; c++) s += channelData[c][j];
      const v = Math.abs(s / channelCount);
      if (v > windowPeak) {
        windowPeak = v;
        if (windowPeak >= threshold) break; // early-exit window
      }
    }
    if (windowPeak >= threshold) {
      const sec = i / sampleRate;
      const padded = Math.max(0, sec - paddingMs / 1000);
      firstSoundCache.set(audioFile, padded);
      return padded;
    }
  }

  firstSoundCache.set(audioFile, 0);
  return 0;
}

interface FilePlaybackOptions {
  /** "full" plays entire file; "transition" plays first 10s + last 10s with fades */
  mode?: "full" | "transition";
  /** Semitones to pitch-shift (uses playbackRate) */
  pitchShift?: number;
  /**
   * Skip into the file by this many seconds before starting playback.
   * Used to skip dead air at file start. Only applies in "full" mode —
   * Transition Check ignores this so the start-of-file is always audible.
   */
  startOffsetSec?: number;
  /** Fade-in duration (seconds). Default ~1s. */
  fadeInSec?: number;
  /** Fade-out duration (seconds). Default 3.5s. Match crossfadeSec for sequence playback. */
  fadeOutSec?: number;
  /** Asset category — drives per-category shelf EQ + stinger ducking. */
  category?: AssetCategory;
}

async function playAudioFile(
  audioFile: string,
  opts: FilePlaybackOptions = {},
): Promise<number | null> {
  const url = resolveAudioUrl(audioFile);
  const buffer = await loadAudioBuffer(url);
  if (!buffer) return null;

  const ac = getCtx();
  const master = getMaster();
  const mode = opts.mode ?? "full";
  const pitchRate = opts.pitchShift ? Math.pow(2, opts.pitchShift / 12) : 1;
  const now = ac.currentTime;
  const source = ac.createBufferSource();
  source.buffer = buffer;
  if (pitchRate !== 1) source.playbackRate.value = pitchRate;
  const fileGain = ac.createGain();
  source.connect(fileGain);
  // Route through per-category shelf EQ if known; otherwise straight to master.
  if (opts.category) {
    fileGain.connect(getCategoryEQ(opts.category));
    activeFileGainCategories.set(fileGain, opts.category);
  } else {
    fileGain.connect(master);
  }

  activeSources.push(source);
  activeFileGains.push(fileGain);

  // When a stinger fires, briefly duck every currently-playing bed track so
  // the stinger lands as a punctuation rather than a stack.
  if (opts.category === "stinger") {
    duckForStinger(fileGain);
  }

  // Fade durations are configurable so sequence playback can request a
  // longer cross-fade window. Defaults match the legacy 1.0s in / 3.5s out.
  const fadeOut = opts.fadeOutSec ?? 3.5;
  const fadeIn = opts.fadeInSec ?? 1.0;

  if (mode === "transition" && buffer.duration > 22) {
    // Transition Check: first 10s (fade in 1s, fade out 3.5s), gap, then last 10s (fade in 1s, fade out 3.5s)
    const firstDur = 10;
    const lastDur = 10;
    const gapDur = 0.5;

    // First segment
    fileGain.gain.setValueAtTime(0, now);
    fileGain.gain.linearRampToValueAtTime(1, now + fadeIn);
    fileGain.gain.setValueAtTime(1, now + firstDur - fadeOut);
    fileGain.gain.linearRampToValueAtTime(0, now + firstDur);
    source.start(now, 0, firstDur);

    // Second segment (last 10 seconds)
    const source2 = ac.createBufferSource();
    source2.buffer = buffer;
    if (pitchRate !== 1) source2.playbackRate.value = pitchRate;
    const fileGain2 = ac.createGain();
    source2.connect(fileGain2);
    fileGain2.connect(master);
    activeSources.push(source2);
    activeFileGains.push(fileGain2);

    const seg2Start = now + firstDur + gapDur;
    const offset2 = Math.max(0, buffer.duration - lastDur);
    fileGain2.gain.setValueAtTime(0, seg2Start);
    fileGain2.gain.linearRampToValueAtTime(1, seg2Start + fadeIn);
    fileGain2.gain.setValueAtTime(1, seg2Start + lastDur - fadeOut);
    fileGain2.gain.linearRampToValueAtTime(0, seg2Start + lastDur);
    source2.start(seg2Start, offset2, lastDur);

    return (firstDur + gapDur + lastDur) * 1000;
  } else {
    // Full playback with matching fade in/out — honor startOffsetSec to
    // skip dead air at file start. Reported duration is the *audible*
    // duration, so polling code knows when audio actually ends.
    const rawOffset = Math.max(0, opts.startOffsetSec ?? 0);
    // Don't skip past the end. If offset is too large, fall back to 0.
    const offsetSec = rawOffset < buffer.duration - 1 ? rawOffset : 0;
    const playableDur = buffer.duration - offsetSec;

    const fadeInDur = Math.min(fadeIn, playableDur * 0.1);
    if (opts.category === "stinger") {
      // Exponential fade-in avoids the click that linear-from-zero produces
      // on the stinger transient. Start from a small non-zero floor since
      // exponentialRamp can't start at 0.
      fileGain.gain.setValueAtTime(0.001, now);
      fileGain.gain.exponentialRampToValueAtTime(1, now + Math.max(0.005, fadeInDur));
    } else {
      fileGain.gain.setValueAtTime(0, now);
      fileGain.gain.linearRampToValueAtTime(1, now + fadeInDur);
    }
    if (playableDur > fadeOut) {
      fileGain.gain.setValueAtTime(1, now + playableDur - fadeOut);
      fileGain.gain.linearRampToValueAtTime(0, now + playableDur);
    }
    source.start(now, offsetSec);
    return playableDur * 1000;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export type AssetCategory = "intro" | "loop" | "ending" | "transition" | "stinger" | "layer" | "ambient";

export interface AuditionParams {
  id: string;
  category: AssetCategory;
  key: string;
  bpm: number;
  audioFile?: string;
  /** "full" plays entire file; "transition" plays first/last 10s with fades */
  playbackMode?: "full" | "transition";
  /** Semitones to pitch-shift (positive = up, negative = down) */
  pitchShift?: number;
  /**
   * Skip into the file by this many seconds before playback starts.
   * Default: auto-detect via findFirstSoundSec to skip dead air.
   * Pass 0 to force playback from the very beginning.
   * Ignored when playbackMode is "transition".
   */
  startOffsetSec?: number;
  /**
   * If true, don't fade out / kill any currently-playing audio when this
   * one starts. The new track layers on top and takes over `currentAssetId`,
   * but the previous source continues until its own fade-out envelope ends.
   * Used for sequence crossfades: track A fades out while track B fades in.
   */
  noStopPrevious?: boolean;
  /** Override fade-in duration (seconds). */
  fadeInSec?: number;
  /** Override fade-out duration (seconds). */
  fadeOutSec?: number;
}

/** Stop with a smooth 3.5s fadeout */
export function stopAudition() {
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];

  if (ctx && activeFileGains.length > 0) {
    const now = ctx.currentTime;
    const fadeDuration = 3.5;
    activeFileGains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + fadeDuration);
      } catch { /* already disconnected */ }
    });
    // Schedule actual stop after fade completes
    const sources = [...activeSources];
    const gains = [...activeFileGains];
    setTimeout(() => {
      sources.forEach((src) => { try { src.stop(); } catch { /* done */ } });
      gains.forEach((g) => { try { g.disconnect(); } catch { /* done */ } });
    }, fadeDuration * 1000 + 100);
  } else {
    activeSources.forEach((src) => { try { src.stop(); } catch { /* done */ } });
  }

  activeSources = [];
  activeFileGains = [];
  isPlaying = false;
  currentAssetId = null;
}

/** Quick stop with short fade — used internally when switching tracks */
function stopImmediate() {
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];

  if (ctx && activeFileGains.length > 0) {
    const now = ctx.currentTime;
    const quickFade = 0.5;
    activeFileGains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + quickFade);
      } catch { /* already disconnected */ }
    });
    const sources = [...activeSources];
    const gains = [...activeFileGains];
    setTimeout(() => {
      sources.forEach((src) => { try { src.stop(); } catch { /* done */ } });
      gains.forEach((g) => { try { g.disconnect(); } catch { /* done */ } });
    }, quickFade * 1000 + 50);
  } else {
    activeSources.forEach((src) => { try { src.stop(); } catch { /* done */ } });
  }

  activeSources = [];
  activeFileGains = [];
  isPlaying = false;
  currentAssetId = null;
}

/** Returns actual playback duration in ms, or 0 if nothing played */
export async function auditionAsset(params: AuditionParams): Promise<number> {
  getCtx();

  // Toggle off if same asset
  if (isPlaying && currentAssetId === params.id) {
    stopAudition(); // fade out
    return 0;
  }

  // For solo audition / user clicks: stop the previous track immediately so
  // the new one is audible without fighting the old. For sequence crossfades:
  // leave the previous track playing — it'll fade out on its own envelope
  // while this new one fades in.
  if (!params.noStopPrevious) {
    stopImmediate();
  }

  isPlaying = true;
  currentAssetId = params.id;

  if (!params.audioFile) {
    isPlaying = false;
    currentAssetId = null;
    return 0;
  }

  // Stingers get +3 semitones pitch shift by default (shakuhachi flute)
  const pitchShift = params.pitchShift ?? (params.category === "stinger" ? 3 : 0);

  // Auto-skip dead air at file start when playing in "full" mode.
  // Caller can pass startOffsetSec: 0 explicitly to force from-beginning.
  // Transition mode ignores this — it always wants the literal start.
  const playbackMode = params.playbackMode ?? "full";
  let startOffsetSec = params.startOffsetSec;
  if (startOffsetSec === undefined && playbackMode === "full") {
    startOffsetSec = await findFirstSoundSec(params.audioFile);
  }

  const durationMs = await playAudioFile(params.audioFile, {
    mode: playbackMode,
    pitchShift,
    startOffsetSec,
    fadeInSec: params.fadeInSec,
    fadeOutSec: params.fadeOutSec,
    category: params.category,
  });

  if (durationMs !== null) {
    const timeout = window.setTimeout(() => {
      isPlaying = false;
      currentAssetId = null;
    }, durationMs + 200);
    activeTimeouts.push(timeout);
    return durationMs;
  }

  isPlaying = false;
  currentAssetId = null;
  return 0;
}

export function getPlayingAssetId(): string | null {
  return currentAssetId;
}

/**
 * Pick a musically-meaningful crossfade duration around `targetSec` by snapping
 * to the nearest whole bar at the given BPM (assuming 4/4 time).
 *
 * BPM = 120 → bar = 2s   → 4.5s targeted snaps to 4s (2 bars)
 * BPM = 92  → bar = 2.6s → 4.5s snaps to ~5.2s (2 bars)
 * BPM = 140 → bar = 1.7s → 4.5s snaps to ~5.1s (3 bars)
 *
 * Falls back to targetSec if BPM is missing/zero. Clamps to [2s, 8s] so a
 * weird BPM can't produce an unusable crossfade window.
 */
export function snapCrossfadeSec(targetSec: number, bpm: number | undefined): number {
  if (!bpm || bpm <= 0) return targetSec;
  const barSec = 240 / bpm; // 4 beats per bar
  const bars = Math.max(1, Math.round(targetSec / barSec));
  const snapped = bars * barSec;
  return Math.max(2, Math.min(8, snapped));
}
