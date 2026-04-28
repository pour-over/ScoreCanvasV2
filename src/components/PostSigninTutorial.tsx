/**
 * PostSigninTutorial — fires once after a user goes from null → signed-in.
 *
 * Distinct from GameTutorial (which is the demo-centric onboarding for
 * unauthenticated visitors). This walks a freshly-authed user through
 * the surfaces they couldn't see before sign-in: the account chip,
 * Save, the My Projects list in the sidebar, Share, and Fork.
 */

import { SimpleTutorial, type SimpleStep } from "./SimpleTutorial";

const STORAGE_KEY = "score-canvas-v2-post-signin-tutorial-seen";

export function hasPostSigninTutorialBeenSeen(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
}

export function markPostSigninTutorialSeen() {
  try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
}

const STEPS: SimpleStep[] = [
  {
    id: "welcome",
    narrator: "Welcome back",
    title: "You're signed in.",
    body: "Quick 30-second tour of what changes for you now that you're authed. Save, share, fork, and your own project list — all yours.",
    cardPosition: "center",
    actionLabel: "Show me →",
  },
  {
    id: "account",
    narrator: "Your account",
    title: "Your account chip — top right.",
    body: "Click your initials to see your email, member-since, and rename your display name. Sign out lives here too.",
    targetSelector: "[data-tour='account-chip']",
    cardPosition: "bottom-right",
  },
  {
    id: "save",
    narrator: "Save",
    title: "Save snapshots your work.",
    body: "Every Save writes a new project snapshot to your account. Older versions stay accessible (full version history is on the roadmap). Auto-save will arrive once we add it without making it surprising.",
    targetSelector: "[data-tour='save-btn']",
    cardPosition: "bottom-right",
  },
  {
    id: "my-projects",
    narrator: "My Projects",
    title: "Your projects live in the sidebar.",
    body: "Anything you've forked or saved shows up under My Projects. Switch between them like the demo projects above.",
    targetSelector: "[data-tour='my-projects']",
    cardPosition: "top-right",
  },
  {
    id: "fork",
    narrator: "Fork to remix",
    title: "Fork demo projects to start your own.",
    body: "Demo projects are read-only. Hit Fork to clone the current one into your projects — then it's yours to edit.",
    targetSelector: "[data-tour='fork-btn']",
    cardPosition: "bottom-right",
  },
  {
    id: "share",
    narrator: "Share",
    title: "Share a read-only link.",
    body: "Send a Share link to anyone — they walk the graph in their browser, no install. Comment threads on nodes are coming; for now every node has director notes attached.",
    targetSelector: "[data-tour='share-btn']",
    cardPosition: "bottom-right",
    actionLabel: "Done →",
  },
];

interface Props { onDismiss: () => void; }

export function PostSigninTutorial({ onDismiss }: Props) {
  return (
    <SimpleTutorial
      steps={STEPS}
      onDismiss={() => { markPostSigninTutorialSeen(); onDismiss(); }}
      curriculumLabel="Welcome back"
    />
  );
}
