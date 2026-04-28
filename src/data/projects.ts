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

import { helloProject } from "./helloProject";
import { journey2Levels } from "./levels";
import { bloodborne2Levels } from "./bloodborne2";
import { codProject, meditationProject, custodialProject, spreadsheetProject } from "./moreProjects";

// ─── Project registry ───────────────────────────────────────────────────────
//
// helloProject is the default first-load demo. The fuller examples follow,
// re-tagged as "Examples" in the sidebar so first-time visitors see Hello
// instead of a 14-node graph.

export const projects: GameProject[] = [
  helloProject,
  {
    id: "journey-2",
    name: "WOVEN: SCARVES OF DESTINY",
    subtitle: "Where Scarves Go to Die",
    levels: journey2Levels,
  },
  {
    id: "bloodborne-2",
    name: "DARK MEOWLS II: A HOONTER MUST NAP",
    subtitle: "Prepare to Cry Yourself to Sleep",
    levels: bloodborne2Levels,
  },
  codProject,
  meditationProject,
  custodialProject,
  spreadsheetProject,
];
