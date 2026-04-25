/**
 * Waveform — renders the real amplitude peaks of an MP3 file.
 *
 * Lazily loads + decodes the audio (via the shared bufferCache in synth.ts),
 * downsamples to 96 buckets, and animates bars in. Falls back to a flat
 * placeholder while loading and to a synthetic shape if the file can't load.
 *
 * Used in Project Assets — replaces the prior random-sin-wave decoration.
 */

import { useEffect, useState } from "react";
import { loadWaveformPeaks } from "../audio/synth";

interface WaveformProps {
  audioFile?: string;
  color: string;
  active?: boolean;
  buckets?: number;
  height?: number; // px
}

export function Waveform({ audioFile, color, active = false, buckets = 96, height = 40 }: WaveformProps) {
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!audioFile) { setPeaks(null); return; }
    let cancelled = false;
    setLoading(true);
    loadWaveformPeaks(audioFile, buckets).then((p) => {
      if (!cancelled) {
        setPeaks(p);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [audioFile, buckets]);

  // No audio file → render a thin static line
  if (!audioFile) {
    return (
      <div
        className="rounded bg-canvas-bg/50 border border-canvas-accent/30 flex items-center justify-center text-[9px] font-mono text-canvas-muted/60"
        style={{ height }}
      >
        no audio file linked
      </div>
    );
  }

  // Loading skeleton — gentle animated bars
  if (loading || !peaks) {
    return (
      <div className="rounded bg-canvas-bg/50 border border-canvas-accent/30 overflow-hidden flex items-end gap-px px-1 py-1" style={{ height }}>
        {Array.from({ length: buckets }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t animate-pulse"
            style={{
              height: `${20 + (i % 7) * 4}%`,
              background: `${color}33`,
              animationDelay: `${i * 12}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  // Real peaks rendered. Always show a minimum bar so quiet sections stay visible.
  return (
    <div
      className="rounded bg-canvas-bg/50 border border-canvas-accent/30 overflow-hidden relative flex items-center px-1 py-1"
      style={{ height }}
    >
      <div className="flex items-center gap-px h-full w-full">
        {peaks.map((p, i) => {
          const h = Math.max(6, p * 100);
          return (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: active ? `${color}cc` : `${color}66`,
                transition: "background 0.3s, height 0.4s",
              }}
            />
          );
        })}
      </div>
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
