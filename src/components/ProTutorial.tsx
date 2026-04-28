/**
 * ProTutorial — advanced curriculum beyond GameTutorial's basics.
 *
 * Covers state-machine theory, RTPC parameters, stem layering, the
 * status workflow, conditional transitions, and the export schema.
 * Triggered explicitly from the Help dropdown — never auto-fires.
 */

import { SimpleTutorial, type SimpleStep } from "./SimpleTutorial";

const STEPS: SimpleStep[] = [
  {
    id: "intro",
    narrator: "Pro Tutorial",
    title: "The full design loop.",
    body: "Six topics, ~3 minutes. Music states & transitions, RTPCs, stems, status workflow, conditional transitions, and middleware export. Skip any time — your progress is remembered nowhere because Pro mode is meant to be re-runnable.",
    cardPosition: "center",
    actionLabel: "Begin →",
  },
  {
    id: "states",
    narrator: "Music States",
    title: "States are the cues that play.",
    body: "Every Music State node represents a cue the runtime can play — explore, combat, victory. Intensity (0-100) and looping toggle are the basic parameters. Stems are the layers within the cue; multi-stem states let you crossfade individual instruments without switching cues.",
    targetSelector: "[data-tour='canvas']",
    cardPosition: "top-left",
  },
  {
    id: "transitions",
    narrator: "Transitions",
    title: "Transitions are the *how* between states.",
    body: "Sync point (immediate / next-beat / next-bar / custom) controls when the swap happens. Fade type (crossfade / sting / cut / bridge) controls how it sounds. Beat-matched crossfades preserve the groove; stings are for hard edits with a cue layered on top.",
    targetSelector: "[data-tour='canvas']",
    cardPosition: "top-right",
  },
  {
    id: "rtpc",
    narrator: "RTPCs",
    title: "Parameter nodes drive the music from gameplay.",
    body: "An RTPC (Real-Time Parameter Control) is a runtime float — distance to enemy, player health, scarf length. Parameter nodes show what gameplay value drives a state's behavior. In Wwise/FMOD this maps to RTPCs and Game Parameters; here it's just a labeled value with a range.",
    targetSelector: "[data-tour='canvas']",
    cardPosition: "bottom-left",
  },
  {
    id: "status",
    narrator: "Status Workflow",
    title: "Every node has a review state.",
    body: "TEMP → WIP → DRAFT → REVIEW → APPROVED. Status badges turn the canvas into a review surface — your director sees what's locked, what needs eyes, what's blocking. Mirrors the way AAA productions actually track audio cues.",
    targetSelector: "[data-tour='canvas']",
    cardPosition: "top-right",
  },
  {
    id: "edges",
    narrator: "Conditional Transitions",
    title: "Edges can carry conditions.",
    body: "A dashed edge with a label like 'On low health' or 'Scarf > 60' is a conditional transition — the runtime only follows it when the gameplay condition holds. Solid edges are unconditional. Edge styles encode this so the graph reads as logic, not just geography.",
    targetSelector: "[data-tour='canvas']",
    cardPosition: "bottom-right",
  },
  {
    id: "export",
    narrator: "Export",
    title: "Ship the design.",
    body: "Export gives you four formats — Wwise schema, FMOD template, raw JSON, or a markdown handoff doc for engineering. Real Wwise round-trip (read-back into the same graph after middleware edits) is the next big lift on the roadmap.",
    targetSelector: "[data-tour='export']",
    cardPosition: "bottom-right",
    actionLabel: "Done →",
  },
];

interface Props { onDismiss: () => void; }

export function ProTutorial({ onDismiss }: Props) {
  return <SimpleTutorial steps={STEPS} onDismiss={onDismiss} curriculumLabel="Pro Tutorial" />;
}
