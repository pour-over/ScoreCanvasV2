import { createContext, useContext } from "react";

interface SequenceContextValue {
  isPlaying: boolean;
  playFromNode: (nodeId: string) => void;
}

const SequenceContext = createContext<SequenceContextValue>({
  isPlaying: false,
  playFromNode: () => {},
});

export const SequenceProvider = SequenceContext.Provider;
export const useSequence = () => useContext(SequenceContext);
