import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOnboardingStore = create(
  persist(
    (set) => ({
      selectedBackpack: null,

      hasChosenBackpack: false,
      hasSeenIntro: false,
      hasCompletedTutorial: false,

      tutorialStep: 0,

      selectBackpack: (backpackId) =>
        set({
          selectedBackpack: backpackId,
          hasChosenBackpack: true,
        }),

      completeIntro: () =>
        set({
          hasSeenIntro: true,
        }),

      nextTutorialStep: () =>
        set((state) => ({
          tutorialStep:
            state.tutorialStep + 1,
        })),

      completeTutorial: () =>
        set({
          hasCompletedTutorial: true,
          tutorialStep: 0,
        }),

      resetOnboarding: () =>
        set({
          selectedBackpack: null,
          hasChosenBackpack: false,
          hasSeenIntro: false,
          hasCompletedTutorial: false,
          tutorialStep: 0,
        }),
    }),
    {
      name: 'rebrota-onboarding',
    }
  )
);