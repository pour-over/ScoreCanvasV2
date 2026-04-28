/**
 * Hello, Score Canvas — the default demo project.
 *
 * Six nodes, one level. Same audio assets and musical order as the original
 * Whispering Sands demo (intro → explore → combat → stinger → ending), but
 * stripped to the minimum so first-time visitors see a graph they can read
 * in 5 seconds. Friendlier labels too — no in-jokes blocking the lesson.
 */

import type { Node, Edge } from "@xyflow/react";
import type { MusicAsset, GameLevel, GameProject } from "./projects";

const helloAssets: MusicAsset[] = [
  { id: "a-hi-01", filename: "mus_intro_welcome", category: "intro", duration: "0:28", bpm: 88, key: "Dm", stems: ["pad_warm", "choir_distant", "wind_calm"], audioFile: "journey2/mus_sands_gentle_hugs_combat_hi.mp3" },
  { id: "a-hi-02", filename: "mus_explore_loop",  category: "loop",  duration: "2:12", bpm: 88, key: "Dm", stems: ["harp", "flute", "strings", "perc_soft"],   audioFile: "journey2/mus_sands_gentle_hugs_explore.mp3" },
  { id: "a-hi-03", filename: "mus_combat_loop",   category: "loop",  duration: "1:08", bpm: 132, key: "Dm", stems: ["perc_drive", "brass", "strings_tense", "synth"], audioFile: "journey2/mus_sands_gentle_hugs_combat_hi.mp3" },
  { id: "a-hi-04", filename: "mus_transition_explore_to_combat", category: "transition", duration: "0:04", bpm: 132, key: "Dm", stems: ["sweep", "perc_hit"], audioFile: "transition_sweep.mp3" },
  { id: "a-hi-05", filename: "mus_stinger_enemy_spotted",        category: "stinger",    duration: "0:02", bpm: 132, key: "Dm", stems: ["brass_hit", "perc_tremor"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-hi-06", filename: "mus_outro_resolve",                category: "ending",     duration: "0:14", bpm: 88, key: "Dm", stems: ["strings_resolve", "choir_settle", "wind_final"], audioFile: "journey2/stinger_chapter_complete.mp3" },
];

const helloNodes: Node[] = [
  { id: "hi-intro", type: "musicState", position: { x: 96, y: 320 }, data: {
    label: "Welcome Cue",
    intensity: 20,
    looping: false,
    stems: ["pad_warm", "choir_distant", "wind_calm"],
    asset: "mus_intro_welcome",
    directorNote: "Plays once when the level loads. A short, calm establishing cue.",
    status: "approved",
  } },
  { id: "hi-explore", type: "musicState", position: { x: 544, y: 320 }, data: {
    label: "Explore",
    intensity: 35,
    looping: true,
    stems: ["harp", "flute", "strings", "perc_soft"],
    asset: "mus_explore_loop",
    directorNote: "The default mood. Loops while the player wanders.",
    status: "approved",
  } },
  { id: "hi-trans", type: "transition", position: { x: 992, y: 320 }, data: {
    label: "→ Combat",
    duration: 4000,
    syncPoint: "next-bar",
    fadeType: "crossfade",
    status: "approved",
  } },
  { id: "hi-combat", type: "musicState", position: { x: 1408, y: 320 }, data: {
    label: "Combat",
    intensity: 80,
    looping: true,
    stems: ["perc_drive", "brass", "strings_tense", "synth"],
    asset: "mus_combat_loop",
    directorNote: "Fires when an enemy aggros. Higher intensity, faster tempo.",
    status: "approved",
  } },
  { id: "hi-stinger", type: "stinger", position: { x: 1408, y: 600 }, data: {
    label: "Enemy Spotted",
    trigger: "OnEnemyAggro",
    asset: "mus_stinger_enemy_spotted",
    priority: "high",
    status: "approved",
  } },
  { id: "hi-outro", type: "musicState", position: { x: 1824, y: 320 }, data: {
    label: "Resolve",
    intensity: 25,
    looping: false,
    stems: ["strings_resolve", "choir_settle", "wind_final"],
    asset: "mus_outro_resolve",
    directorNote: "On victory. Resolves the combat loop back to calm.",
    status: "approved",
  } },
];

const helloEdges: Edge[] = [
  { id: "e-hi-1", source: "hi-intro",   target: "hi-explore", animated: true, label: "Auto" },
  { id: "e-hi-2", source: "hi-explore", target: "hi-trans",   animated: true, label: "On combat" },
  { id: "e-hi-3", source: "hi-trans",   target: "hi-combat",  animated: true },
  { id: "e-hi-4", source: "hi-combat",  target: "hi-stinger", animated: true, label: "On hit",  style: { strokeDasharray: "5 5" } },
  { id: "e-hi-5", source: "hi-combat",  target: "hi-outro",   animated: true, label: "On victory" },
];

const helloLevel: GameLevel = {
  id: "hi-level-1",
  name: "First Encounter",
  subtitle: "A 60-second tour of states, transitions, and stingers",
  region: "Tutorial",
  nodes: helloNodes,
  edges: helloEdges,
  assets: helloAssets,
};

export const helloProject: GameProject = {
  id: "hello",
  name: "Hello, Score Canvas",
  subtitle: "Your first interactive music graph",
  levels: [helloLevel],
};
