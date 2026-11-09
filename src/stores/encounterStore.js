import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEncounterStore = create(
  persist(
    (set) => ({
      /*
        Encontro atualmente ativo:

        {
          animalId,
          position: [longitude, latitude],
          createdAt
        }
      */

      activeEncounter: null,

      /*
        Último encontro encerrado.
        Serve para o cooldown global.
      */

      lastEncounterAt: 0,

      /*
        Evita repetir imediatamente
        a mesma espécie.
      */

      lastAnimalId: null,

      /*
        Cooldown individual de espécies.
      */

      speciesCooldowns: {},


      startEncounter: (
        animalId,
        position
      ) =>
        set({
          activeEncounter: {
            animalId,
            position,
            createdAt: Date.now(),
          },
        }),


      endEncounter: (animalId) =>
        set((state) => ({
          activeEncounter: null,

          lastEncounterAt:
            Date.now(),

          lastAnimalId:
            animalId,

          speciesCooldowns: {
            ...state.speciesCooldowns,

            /*
              Essa espécie fica fora
              do sorteio por 10 minutos.
            */

            [animalId]:
              Date.now() +
              10 * 60 * 1000,
          },
        })),


      clearActiveEncounter: () =>
        set({
          activeEncounter: null,
          lastEncounterAt: Date.now(),
        }),


      resetEncounters: () =>
        set({
          activeEncounter: null,
          lastEncounterAt: 0,
          lastAnimalId: null,
          speciesCooldowns: {},
        }),
    }),

    {
      name: 'rebrota-encounters',
    }
  )
);