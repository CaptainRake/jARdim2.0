import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';


function createResearcherCode() {
  const now =
    new Date();

  const year =
    String(
      now.getFullYear()
    ).slice(-2);

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const hour =
    String(
      now.getHours()
    ).padStart(
      2,
      '0'
    );

  const seconds =
    String(
      now.getSeconds()
    ).padStart(
      2,
      '0'
    );

  return (
    year +
    month +
    hour +
    seconds
  );
}


export const useOnboardingStore = create(
  persist(
    (set) => ({
      /* IDENTIDADE */

      playerName: '',

      researcherCode: null,

      joinedAt: null,


      /* MOCHILA */

      selectedBackpack: null,

      hasChosenBackpack: false,


      /* ONBOARDING */

      hasSeenIntro: false,

      hasCompletedTutorial: false,

      hasCompletedOnboarding: false,

      tutorialStep: 0,


      setPlayerName:
        (name) =>
          set((state) => ({
            playerName:
              name.trim(),

            researcherCode:
              state.researcherCode ??
              createResearcherCode(),

            joinedAt:
              state.joinedAt ??
              Date.now(),
          })),


      selectBackpack:
        (backpackId) =>
          set({
            selectedBackpack:
              backpackId,

            hasChosenBackpack:
              true,
          }),


      completeIntro:
        () =>
          set({
            hasSeenIntro: true,
          }),


      startTutorial:
        () =>
          set({
            tutorialStep: 0,

            hasCompletedTutorial:
              false,
          }),


      nextTutorialStep:
        () =>
          set((state) => ({
            tutorialStep:
              state.tutorialStep + 1,
          })),


      completeTutorial:
        () =>
          set({
            hasCompletedTutorial:
              true,

            hasCompletedOnboarding:
              true,

            tutorialStep: 0,
          }),


      resetOnboarding:
        () =>
          set({
            playerName: '',

            researcherCode: null,

            joinedAt: null,

            selectedBackpack: null,

            hasChosenBackpack: false,

            hasSeenIntro: false,

            hasCompletedTutorial:
              false,

            hasCompletedOnboarding:
              false,

            tutorialStep: 0,
          }),
    }),

    {
      name:
        'rebrota-onboarding',

      storage:
        createJSONStorage(
          () =>
            sessionStorage
        ),
    }
  )
);