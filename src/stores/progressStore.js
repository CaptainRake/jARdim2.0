import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_FIRST_STEPS = {
  foundAnimal: false,

  registeredAnimal: false,

  readGuide: false,

  registeredAnimalId: null,

  completed: false,
};

export const useProgressStore = create(
  persist(
    (set) => ({
      /* =========================
         JOGADOR
         ========================= */

      xp: 0,

      leaves: 0,

      badges: [],

      discoveries: [],

      activeEncounterId: null,


      /* =========================
         MISSÃO: PRIMEIROS PASSOS
         ========================= */

      firstSteps: {
        ...INITIAL_FIRST_STEPS,
      },


      /* =========================
         ENCONTROU UM ANIMAL
         ========================= */

      markAnimalFound: (animalId) =>
        set((state) => ({
          activeEncounterId:
            animalId,

          firstSteps: {
            ...state.firstSteps,

            foundAnimal:
              true,
          },
        })),


      /* =========================
         REGISTROU O ANIMAL
         ========================= */

      registerDiscovery: (animalId) =>
        set((state) => {
          const alreadyRegistered =
            state.discoveries.includes(
              animalId
            );

          return {
            discoveries:
              alreadyRegistered
                ? state.discoveries
                : [
                    ...state.discoveries,
                    animalId,
                  ],

            activeEncounterId: animalId,

            firstSteps: {
              ...state.firstSteps,

              registeredAnimal: true,

              registeredAnimalId:
                animalId,
            },
          };
        }),


      /* =========================
         ABRIU A FICHA NO GUIA
         ========================= */

      markGuideRead: (animalId) =>
        set((state) => {
          /*
            O objetivo só vale se
            for o animal registrado.
          */
          if (
            animalId !==
            state.firstSteps
              .registeredAnimalId
          ) {
            return state;
          }

          /*
            Evita dar recompensa
            novamente.
          */
          if (
            state.firstSteps.completed
          ) {
            return state;
          }

          const updatedFirstSteps = {
            ...state.firstSteps,

            readGuide: true,
          };

          const missionComplete =
            updatedFirstSteps.foundAnimal &&
            updatedFirstSteps.registeredAnimal &&
            updatedFirstSteps.readGuide;

          if (!missionComplete) {
            return {
              firstSteps:
                updatedFirstSteps,
            };
          }

          return {
            firstSteps: {
              ...updatedFirstSteps,

              completed: true,
            },

            xp:
              state.xp + 150,

            leaves:
              state.leaves + 15,

            badges:
              state.badges.includes(
                'first-steps'
              )
                ? state.badges
                : [
                    ...state.badges,
                    'first-steps',
                  ],
          };
        }),


      /* =========================
         RESET PARA TESTES
         ========================= */

      resetProgress: () =>
        set({
          xp: 0,

          leaves: 0,

          badges: [],

          discoveries: [],

          activeEncounterId: null,

          firstSteps: {
            ...INITIAL_FIRST_STEPS,
          },
        }),
    }),

    {
      name: 'rebrota-progress',
    }
  )
);