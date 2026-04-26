/**
 * SegueDemoGallery — real audio demo of what Segue is being designed to produce.
 *
 * Plays one source theme + a curated set of variations / level themes / stingers /
 * cinematics / segues. Each row has a play/stop button, real waveform, and a
 * label describing what kind of generation it represents.
 *
 * Source music is by Ted Kocher. Released under the BackPocketMusic.com label.
 * Used here to demonstrate the *kind* of variety Segue is being designed to
 * generate from a single source theme — not as literal Segue output (Segue
 * isn't built yet).
 */

import { useEffect, useState } from "react";
import { auditionAsset, stopAudition, getPlayingAssetId } from "../audio/synth";
import { Waveform } from "./Waveform";

interface DemoTrack {
  id: string;
  file: string;       // path under /audio/
  label: string;
  desc: string;
  kind: "source" | "variation" | "level" | "stinger" | "cinematic" | "segue";
}

const TRACKS: DemoTrack[] = [
  {
    id: "src",
    file: "segue-demo/source_theme.mp3",
    label: "Source Theme",
    desc: "The clean theme. Single composition. Everything below is what Segue is being designed to do with it.",
    kind: "source",
  },
  {
    id: "main-full",
    file: "segue-demo/theme_main_full.mp3",
    label: "Main Theme · Full Arrangement",
    desc: "The same core idea, fully orchestrated. Same key, same melody, fuller stems.",
    kind: "variation",
  },
  {
    id: "glacial",
    file: "segue-demo/level_glacial_solitude.mp3",
    label: "Level Variation · Glacial Solitude",
    desc: "Sparse, ambient, low-intensity. Same theme reimagined for an icy environment.",
    kind: "level",
  },
  {
    id: "verdant",
    file: "segue-demo/level_verdant_majesty.mp3",
    label: "Level Variation · Verdant Majesty",
    desc: "Lush, melodic, mid-intensity. Same theme reimagined for a forested environment.",
    kind: "level",
  },
  {
    id: "ambient",
    file: "segue-demo/level_two_ambient.mp3",
    label: "Ambient Variation",
    desc: "Atmospheric layer for exploration / downtime moments.",
    kind: "level",
  },
  {
    id: "enemy",
    file: "segue-demo/enemy_theme.mp3",
    label: "Combat / Antagonist Theme",
    desc: "Same melodic DNA reworked into a high-intensity combat cue.",
    kind: "variation",
  },
  {
    id: "intro",
    file: "segue-demo/intro_main.mp3",
    label: "Intro · Auto-Matched",
    desc: "A short lead-in that ramps into the source theme — key, BPM, vibe aligned.",
    kind: "segue",
  },
  {
    id: "cine",
    file: "segue-demo/cinematic_suite.mp3",
    label: "Cinematic Suite",
    desc: "Linear, score-style arrangement of the same theme for cutscenes.",
    kind: "cinematic",
  },
  {
    id: "lvlup",
    file: "segue-demo/stinger_level_up.mp3",
    label: "Stinger · Level Up",
    desc: "Short, triumphant cadence. Cue / fanfare type.",
    kind: "stinger",
  },
  {
    id: "menu",
    file: "segue-demo/stinger_menu_select.mp3",
    label: "Stinger · Menu Select",
    desc: "Tiny UI sting derived from the theme's harmonic palette.",
    kind: "stinger",
  },
];

const kindStyles: Record<DemoTrack["kind"], { color: string; label: string }> = {
  source:    { color: "#4ecdc4", label: "SOURCE" },
  variation: { color: "#a855f7", label: "VARIATION" },
  level:     { color: "#818cf8", label: "LEVEL" },
  segue:     { color: "#f59e0b", label: "SEGUE" },
  stinger:   { color: "#f97316", label: "STINGER" },
  cinematic: { color: "#e94560", label: "CINEMATIC" },
};

interface SegueDemoGalleryProps {
  compact?: boolean;
}

export function SegueDemoGallery({ compact = false }: SegueDemoGalleryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Poll the audio engine so the play button stays in sync if playback ends naturally.
  useEffect(() => {
    if (!playingId) return;
    const id = setInterval(() => {
      if (getPlayingAssetId() !== playingId) setPlayingId(null);
    }, 250);
    return () => clearInterval(id);
  }, [playingId]);

  const togglePlay = async (track: DemoTrack) => {
    if (playingId === track.id) {
      stopAudition();
      setPlayingId(null);
      return;
    }
    stopAudition();
    setPlayingId(track.id);
    const dur = await auditionAsset({
      id: track.id,
      category: track.kind === "stinger" ? "stinger" : track.kind === "cinematic" ? "intro" : "loop",
      key: "Dm",
      bpm: 120,
      audioFile: track.file,
      playbackMode: "full",
    });
    if (dur > 0) {
      setTimeout(() => setPlayingId((c) => (c === track.id ? null : c)), dur + 200);
    } else {
      setPlayingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {TRACKS.map((track) => {
        const isPlaying = playingId === track.id;
        const style = kindStyles[track.kind];
        const isSource = track.kind === "source";
        return (
          <div
            key={track.id}
            className={`rounded-lg border transition-all ${
              isSource
                ? "bg-gradient-to-r from-canvas-highlight/10 to-transparent border-canvas-highlight/40"
                : isPlaying
                  ? "border-purple-500/50 bg-purple-500/5"
                  : "border-canvas-accent/30 bg-[#0a0a18]/60 hover:border-canvas-accent"
            }`}
          >
            <div className="flex items-center gap-3 p-3">
              {/* Play button */}
              <button
                onClick={() => togglePlay(track)}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isPlaying
                    ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
                    : "bg-canvas-bg text-canvas-text hover:bg-canvas-highlight/20 hover:text-canvas-highlight"
                }`}
                title={isPlaying ? "Stop" : "Play"}
              >
                {isPlaying ? (
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="8" height="8" rx="1" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor"><polygon points="2,0.5 9.5,5 2,9.5" /></svg>
                )}
              </button>

              {/* Label + kind tag */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
                    style={{ color: style.color, background: `${style.color}1a`, border: `1px solid ${style.color}40` }}
                  >
                    {style.label}
                  </span>
                  <span className={`text-[12px] font-bold truncate ${isSource ? "text-canvas-highlight" : "text-canvas-text"}`}>
                    {track.label}
                  </span>
                </div>
                {!compact && (
                  <div className="text-[10px] text-canvas-muted leading-snug truncate">{track.desc}</div>
                )}
              </div>

              {/* Waveform — wider on full size */}
              <div className={compact ? "w-28 flex-shrink-0" : "w-48 flex-shrink-0"}>
                <Waveform audioFile={track.file} color={style.color} active={isPlaying} buckets={48} height={26} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Attribution */}
      <div className="pt-3 mt-2 border-t border-canvas-accent/30 text-center">
        <div className="text-[10px] text-canvas-muted/70">
          Source music by Ted Kocher · <a href="https://backpocketmusic.com" target="_blank" rel="noopener" className="text-canvas-highlight hover:underline">BackPocketMusic.com</a>
        </div>
        <div className="text-[9px] text-canvas-muted/50 mt-0.5 italic">
          These tracks demonstrate the variety Segue is being designed to generate from a single source theme. Segue itself ships in v2.5.
        </div>
      </div>
    </div>
  );
}
