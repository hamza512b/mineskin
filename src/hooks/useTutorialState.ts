import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TutorialState {
  hasCompletedTutorial: boolean;
  setHasCompletedTutorial: (hasCompleted: boolean) => void;
}

export const useTutorialState = create<TutorialState>()(
  persist(
    (set) => ({
      hasCompletedTutorial: false,
      setHasCompletedTutorial: (hasCompleted) =>
        set({ hasCompletedTutorial: hasCompleted }),
    }),
    {
      name: "tutorial-state",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
