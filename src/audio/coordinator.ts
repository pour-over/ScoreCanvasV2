/**
 * Audio coordinator — single rule: a user-initiated asset audition takes
 * priority over any timeline playback.
 *
 * UI panels (AssetBrowser, ProjectAssets, SegueDemoGallery, etc.) call
 * `priorityAuditionAsset(...)` instead of `auditionAsset(...)` directly.
 * That fires a `audition-priority-play` window event before starting the
 * audition. Canvas.tsx listens for that event and stops any active sequence
 * playback (sets sequencePlaying=false, calls handleStopAll).
 *
 * The timeline itself (Canvas's per-node calls) keeps using `auditionAsset`
 * directly so it doesn't pause itself.
 */

import { auditionAsset, type AuditionParams } from "./synth";

export const PRIORITY_AUDITION_EVENT = "audition-priority-play";

export interface PriorityAuditionDetail {
  assetId: string;
  source?: "asset-browser" | "project-assets" | "segue-demo" | "modal" | "other";
}

declare global {
  interface WindowEventMap {
    "audition-priority-play": CustomEvent<PriorityAuditionDetail>;
  }
}

export async function priorityAuditionAsset(
  params: AuditionParams,
  source?: PriorityAuditionDetail["source"],
): Promise<number> {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(PRIORITY_AUDITION_EVENT, {
        detail: { assetId: params.id, source: source ?? "other" },
      }),
    );
  }
  return auditionAsset(params);
}
