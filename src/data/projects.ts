import type { Node, Edge } from "@xyflow/react";

// ─── Shared interfaces ─────────────────────────────────────────────────────

export interface MusicAsset {
  id: string;
  filename: string;
  category: "intro" | "loop" | "ending" | "transition" | "stinger" | "layer" | "ambient";
  duration: string;
  bpm: number;
  key: string;
  stems: string[];
  audioFile?: string; // path relative to /audio/ e.g. "journey2/mus_sands_explore.mp3"
}

export interface GameLevel {
  id: string;
  name: string;
  subtitle: string;
  region: string;
  nodes: Node[];
  edges: Edge[];
  assets: MusicAsset[];
}

export interface GameProject {
  id: string;
  name: string;
  subtitle: string;
  levels: GameLevel[];
}

// ─── Import project data ────────────────────────────────────────────────────

import { journey2Levels } from "./levels";
import { bloodborne2Levels } from "./bloodborne2";
import { codProject, meditationProject, custodialProject, spreadsheetProject } from "./moreProjects";

// ─── Project registry ───────────────────────────────────────────────────────

export const projects: GameProject[] = [
  {
    id: "journey-2",
    name: "JOURNEY 2: THE RECKONING",
    subtitle: "Where Scarves Go to Die",
    levels: journey2Levels,
  },
  {
    id: "bloodborne-2",
    name: "BLOODBORNE 2: CATS IN PAJAMAS",
    subtitle: "A Hoonter Must Nap",
    levels: bloodborne2Levels,
  },
  codProject,
  meditationProject,
  custodialProject,
  spreadsheetProject,
];
