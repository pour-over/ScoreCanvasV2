import { createContext, useContext } from "react";

/** Broadcasts the ID of the currently playing node during sequence playback */
const PlayingNodeContext = createContext<string | null>(null);

export const PlayingNodeProvider = PlayingNodeContext.Provider;

export function usePlayingNode(): string | null {
  return useContext(PlayingNodeContext);
}
