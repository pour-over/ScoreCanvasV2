/**
 * Web Audio engine for Score Canvas.
 * Plays real MP3 files. Transition mode plays first 10s + last 10s with crossfades.
 * Default volume: 60%.
 */

// ─── Audio context singleton ────────────────────────────────────────────────

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeSources: AudioBufferSourceNode[] = [];
let activeFileGains: GainNode[] = [];
let activeTimeouts: number[] = [];
let isPlaying = false;
let currentAssetId: string | null = null;
let volumeLevel = 0.6; // default 60%

// Audio buffer cache to avoid re-fetching
const bufferCache = new Map<string, AudioBuffer>();

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = volumeLevel;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
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
  const url = `/audio/${audioFile}`;
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

interface FilePlaybackOptions {
  /** "full" plays entire file; "transition" plays first 10s + last 10s with fades */
  mode?: "full" | "transition";
  /** Semitones to pitch-shift (uses playbackRate) */
  pitchShift?: number;
}

async function playAudioFile(
  audioFile: string,
  opts: FilePlaybackOptions = {},
): Promise<number | null> {
  const url = `/audio/${audioFile}`;
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
  fileGain.connect(master);

  activeSources.push(source);
  activeFileGains.push(fileGain);

  // Consistent fade duration: 3.5s everywhere (matches stopAudition)
  const fadeOut = 3.5;
  const fadeIn = 1.0;

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
    // Full playback with matching fade in/out
    fileGain.gain.setValueAtTime(0, now);
    fileGain.gain.linearRampToValueAtTime(1, now + Math.min(fadeIn, buffer.duration * 0.1));
    if (buffer.duration > fadeOut) {
      fileGain.gain.setValueAtTime(1, now + buffer.duration - fadeOut);
      fileGain.gain.linearRampToValueAtTime(0, now + buffer.duration);
    }
    source.start(now);
    return buffer.duration * 1000;
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

  // Stop previous immediately (no fade) to switch tracks cleanly
  stopImmediate();

  isPlaying = true;
  currentAssetId = params.id;

  if (!params.audioFile) {
    isPlaying = false;
    currentAssetId = null;
    return 0;
  }

  // Stingers get +3 semitones pitch shift by default (shakuhachi flute)
  const pitchShift = params.pitchShift ?? (params.category === "stinger" ? 3 : 0);

  const durationMs = await playAudioFile(params.audioFile, {
    mode: params.playbackMode ?? "full",
    pitchShift,
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
