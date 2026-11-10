import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

import {
  encounters,
} from '../data/encounters';


/* =========================================================
   MISSÕES PRINCIPAIS
   ========================================================= */

export const MAIN_MISSIONS = [
  {
    id: 'first-steps',
    title: 'Primeiros passos',
    category: 'Exploração',

    description:
      'Faça sua primeira descoberta e conheça o Guia de Campo.',

    reward: {
      xp: 150,
      leaves: 15,
    },

    goal: 3,

    getValue: (state) =>
      [
        state.firstSteps.foundAnimal,
        state.firstSteps.registeredAnimal,
        state.firstSteps.readGuide,
      ].filter(Boolean).length,

    objectives: (state) => [
      {
        text:
          'Encontre um animal silvestre',

        completed:
          state.firstSteps.foundAnimal,
      },

      {
        text:
          'Registre o animal no Guia de Campo',

        completed:
          state.firstSteps.registeredAnimal,
      },

      {
        text:
          'Conheça sua descoberta no Guia',

        completed:
          state.firstSteps.readGuide,
      },
    ],
  },


  {
    id: 'eyes-open',
    title: 'Olhos atentos',
    category: 'Exploração',

    description:
      'Observe a diversidade ao seu redor.',

    reward: {
      xp: 100,
      leaves: 10,
    },

    goal: 2,

    getValue: (state) =>
      Math.min(
        state.foundAnimals.length,
        2
      ),

    objectives: (state) => [
      {
        text:
          'Encontre 2 espécies diferentes',

        completed:
          state.foundAnimals.length >= 2,
      },
    ],
  },

  
  {
    id: 'field-researcher',
    title: 'Pesquisador de campo',
    category: 'Pesquisa',

    description:
      'Amplie seus registros no Guia de Campo.',

    reward: {
      xp: 200,
      leaves: 20,
    },

    goal: 3,

    getValue: (state) =>
      Math.min(
        state.discoveries.length,
        3
      ),

    objectives: (state) => [
      {
        text:
          'Registre 3 espécies diferentes',

        completed:
          state.discoveries.length >= 3,
      },
    ],
  },


  {
    id: 'study-time',
    title: 'Hora de estudar',
    category: 'Pesquisa',

    description:
      'Conhecer também faz parte da exploração.',

    reward: {
      xp: 100,
      leaves: 10,
    },

    goal: 3,

    getValue: (state) =>
      Math.min(
        state.readAnimals.length,
        3
      ),

    objectives: (state) => [
      {
        text:
          'Leia a ficha de 3 espécies registradas',

        completed:
          state.readAnimals.length >= 3,
      },
    ],
  },


  {
    id: 'rare-encounter',
    title: 'Encontro raro',
    category: 'Descoberta',

    description:
      'Alguns encontros exigem um pouco mais de sorte.',

    reward: {
      xp: 250,
      leaves: 25,
    },

    goal: 1,

    getValue: (state) => {
      const foundRare =
        state.discoveries.some(
          (animalId) => {
            const animal =
              encounters.find(
                (item) =>
                  item.id === animalId
              );

            return (
              animal?.rarity ===
              'rare'
            );
          }
        );

      return foundRare ? 1 : 0;
    },

    objectives: (state) => {
      const foundRare =
        state.discoveries.some(
          (animalId) => {
            const animal =
              encounters.find(
                (item) =>
                  item.id === animalId
              );

            return (
              animal?.rarity ===
              'rare'
            );
          }
        );

      return [
        {
          text:
            'Registre uma espécie rara',

          completed:
            foundRare,
        },
      ];
    },
  },


  {
    id: 'collector-half',
    title:
      'Colecionador de descobertas',

    category: 'Guia',

    description:
      'Complete metade do seu Guia de Campo.',

    reward: {
      xp: 300,
      leaves: 30,
    },

    get goal() {
      return Math.ceil(
        encounters.length / 2
      );
    },

    getValue: (state) =>
      Math.min(
        state.discoveries.length,

        Math.ceil(
          encounters.length / 2
        )
      ),

    objectives: (state) => {
      const goal =
        Math.ceil(
          encounters.length / 2
        );

      return [
        {
          text:
            `Registre ${goal} espécies no Guia`,

          completed:
            state.discoveries.length >=
            goal,
        },
      ];
    },
  },


  {
    id: 'complete-guide',
    title: 'Guia completo',
    category: 'Guia',

    description:
      'Registre todas as espécies disponíveis.',

    reward: {
      xp: 500,
      leaves: 50,
    },

    get goal() {
      return encounters.length;
    },

    getValue: (state) =>
      Math.min(
        state.discoveries.length,
        encounters.length
      ),

    objectives: (state) => [
      {
        text:
          'Complete o Guia de Campo',

        completed:
          state.discoveries.length >=
          encounters.length,
      },
    ],
  },
];

export const SIDE_MISSIONS = [
  {
    id: 'trail-guardian',

    title:
      'Guardião da trilha',

    category:
      'Cuidado ambiental',

    description:
      'Ajude a manter a trilha limpa durante sua exploração.',

    reward: {
      xp: 300,
      leaves: 30,
    },

    goal: 20,

    getValue: (state) =>
      Math.min(
        state.trashCollected ?? 0,
        20
      ),

    objectives: (state) => [
      {
        text:
          'Recolha 20 resíduos encontrados pelo caminho',

        completed:
          (state.trashCollected ?? 0) >= 20,
      },
    ],
  },
];


/* =========================================================
   MISSÕES FUTURAS
   ========================================================= */

export const FUTURE_MISSIONS = [
  {
    id: 'beginner-botanist',

    title:
      'Botânica iniciante',

    description:
      'Registre 2 espécies de plantas.',
  },

  {
    id: 'leave-no-trace',

    title:
      'Sem deixar rastros',

    description:
      'Complete uma trilha cuidando do caminho durante a exploração.',
  },

  {
    id: 'waters-edge',

    title:
      'À beira d’água',

    description:
      'Encontre uma espécie associada a ambientes aquáticos.',
  },

  {
    id: 'local-diversity',

    title:
      'Diversidade local',

    description:
      'Registre um animal e uma planta durante a mesma exploração.',
  },
];


/* =========================================================
   MISSÕES DIÁRIAS
   ========================================================= */

export const DAILY_MISSIONS = [
  {
    id: 'daily-explorer',

    title:
      'Explorador do dia',

    description:
      'Registre uma espécie durante sua exploração.',

    reward: {
      xp: 50,
      leaves: 5,
    },

    goal: 1,

    getValue: (state) =>
      Math.min(
        state.daily.registered,
        1
      ),
  },


  {
    id: 'daily-walk',

    title:
      'Passeio de campo',

    description:
      'Caminhe 100 metros durante sua exploração.',

    reward: {
      xp: 50,
      leaves: 5,
    },

    goal: 100,

    getValue: (state) =>
      Math.min(
        Math.round(
          state.daily.walkedMeters
        ),
        100
      ),
  },


  {
    id: 'daily-observer',

    title:
      'Observador atento',

    description:
      'Encontre um animal durante sua exploração.',

    reward: {
      xp: 40,
      leaves: 5,
    },

    goal: 1,

    getValue: (state) =>
      Math.min(
        state.daily.found,
        1
      ),
  },


  {
    id: 'daily-study',

    title:
      'Dia de pesquisa',

    description:
      'Leia uma ficha no Guia de Campo.',

    reward: {
      xp: 40,
      leaves: 5,
    },

    goal: 1,

    getValue: (state) =>
      Math.min(
        state.daily.read,
        1
      ),
  },


  {
    id: 'daily-discovery',

    title:
      'Nova descoberta',

    description:
      'Adicione uma nova espécie ao seu Guia de Campo.',

    reward: {
      xp: 75,
      leaves: 10,
    },

    goal: 1,

    getValue: (state) =>
      Math.min(
        state.daily.newDiscoveries,
        1
      ),
  },
];


/* =========================================================
   MISSÃO DIÁRIA DO DIA
   ========================================================= */

function getDailyMissionId() {
  const today =
    new Date();

  const number =
    Math.floor(
      today.getTime() /
      86400000
    );

  const index =
    number %
    DAILY_MISSIONS.length;

  return DAILY_MISSIONS[
    index
  ].id;
}


/* =========================================================
   PRIMEIROS PASSOS
   ========================================================= */

const INITIAL_FIRST_STEPS = {
  foundAnimal: false,

  registeredAnimal: false,

  readGuide: false,

  registeredAnimalId: null,

  completed: false,
};


/* =========================================================
   AVALIA MISSÕES PRINCIPAIS
   ========================================================= */

function evaluateMainMissions(
  state
) {
  let xp =
    state.xp;

  let leaves =
    state.leaves;

  let badges = [
    ...state.badges,
  ];

  let completedMissions = [
    ...state.completedMissions,
  ];

  let currentMissionId =
    state.currentMissionId;

  let firstSteps = {
    ...state.firstSteps,
  };


  /*
    Pode completar mais de uma
    automaticamente caso o jogador
    já tenha cumprido o requisito
    antes de liberar a próxima.
  */

  while (
    currentMissionId
  ) {
    const missionIndex =
      MAIN_MISSIONS.findIndex(
        (mission) =>
          mission.id ===
          currentMissionId
      );


    if (
      missionIndex === -1
    ) {
      break;
    }


    const mission =
      MAIN_MISSIONS[
        missionIndex
      ];


    const snapshot = {
      ...state,

      xp,
      leaves,

      badges,

      completedMissions,

      currentMissionId,

      firstSteps,
    };


    const value =
      mission.getValue(
        snapshot
      );


    if (
      value <
      mission.goal
    ) {
      break;
    }


    if (
      !completedMissions.includes(
        mission.id
      )
    ) {
      completedMissions.push(
        mission.id
      );


      xp +=
        mission.reward.xp;


      leaves +=
        mission.reward.leaves;
    }


    if (
      mission.id ===
      'first-steps'
    ) {
      firstSteps.completed =
        true;


      if (
        !badges.includes(
          'first-steps'
        )
      ) {
        badges.push(
          'first-steps'
        );
      }
    }


    const nextMission =
      MAIN_MISSIONS[
        missionIndex + 1
      ];


    currentMissionId =
      nextMission
        ? nextMission.id
        : null;
  }


  return {
    xp,

    leaves,

    badges,

    completedMissions,

    currentMissionId,

    firstSteps,
  };
}


/* =========================================================
   AVALIA MISSÃO DIÁRIA
   ========================================================= */

function evaluateDailyMission(
  state
) {
  if (
    state.daily.completed
  ) {
    return {
      daily:
        state.daily,

      xp:
        state.xp,

      leaves:
        state.leaves,
    };
  }


  const mission =
    DAILY_MISSIONS.find(
      (item) =>
        item.id ===
        state.daily.missionId
    );


  if (!mission) {
    return {};
  }


  const value =
    mission.getValue(
      state
    );


  if (
    value <
    mission.goal
  ) {
    return {};
  }


  return {
    xp:
      state.xp +
      mission.reward.xp,

    leaves:
      state.leaves +
      mission.reward.leaves,

    daily: {
      ...state.daily,

      completed:
        true,
    },
  };
}


/* =========================================================
   AVALIA TUDO
   ========================================================= */

function evaluateAll(
  state
) {
  const mainResult =
    evaluateMainMissions(
      state
    );


  const afterMain = {
    ...state,
    ...mainResult,
  };


  const dailyResult =
    evaluateDailyMission(
      afterMain
    );


  return {
    ...mainResult,
    ...dailyResult,
  };
}


/* =========================================================
   STORE
   ========================================================= */

export const useProgressStore =
  create(
    persist(
      (set) => ({
        xp: 0,

        leaves: 0,

        badges: [],

        discoveries: [],

        foundAnimals: [],

        readAnimals: [],

        trashCollected: 0,

        completedSideMissions: [],

        activeEncounterId:
          null,


        firstSteps: {
          ...INITIAL_FIRST_STEPS,
        },


        currentMissionId:
          'first-steps',

        completedMissions:
          [],

        missionsUnread:
          true,


        flagMissionUpdate: () =>
          set({
            missionsUnread: true,
          }),


        markMissionsSeen: () =>
          set({
            missionsUnread: false,
          }),


        daily: {
          missionId:
            getDailyMissionId(),

          completed:
            false,

          found:
            0,

          registered:
            0,

          read:
            0,

          walkedMeters:
            0,

          newDiscoveries:
            0,
        },


        /* =====================
           ENCONTROU ANIMAL
           ===================== */

        markAnimalFound:
          (animalId) =>
            set((state) => {

              const foundAnimals =
                state.foundAnimals
                  .includes(
                    animalId
                  )
                  ? state
                      .foundAnimals

                  : [
                      ...state
                        .foundAnimals,

                      animalId,
                    ];


              const next = {
                ...state,

                activeEncounterId:
                  animalId,

                foundAnimals,

                firstSteps: {
                  ...state
                    .firstSteps,

                  foundAnimal:
                    true,
                },

                daily: {
                  ...state.daily,

                  found:
                    state.daily
                      .found + 1,
                },
              };


              return {
                activeEncounterId:
                  animalId,

                foundAnimals,

                firstSteps:
                  next.firstSteps,

                daily:
                  next.daily,

                ...evaluateAll(
                  next
                ),
              };
            }),


        /* =====================
           REGISTROU
           ===================== */

        registerDiscovery:
          (animalId) =>
            set((state) => {

              const alreadyRegistered =
                state.discoveries
                  .includes(
                    animalId
                  );


              const discoveries =
                alreadyRegistered
                  ? state
                      .discoveries

                  : [
                      ...state
                        .discoveries,

                      animalId,
                    ];


              const next = {
                ...state,

                discoveries,

                activeEncounterId:
                  animalId,

                firstSteps: {
                  ...state
                    .firstSteps,

                  registeredAnimal:
                    true,

                  registeredAnimalId:
                    state
                      .firstSteps
                      .registeredAnimalId ??
                    animalId,
                },

                daily: {
                  ...state.daily,

                  registered:
                    state.daily
                      .registered +
                    1,

                  newDiscoveries:
                    state.daily
                      .newDiscoveries +
                    (
                      alreadyRegistered
                        ? 0
                        : 1
                    ),
                },
              };


              return {
                discoveries,

                activeEncounterId:
                  animalId,

                firstSteps:
                  next.firstSteps,

                daily:
                  next.daily,

                ...evaluateAll(
                  next
                ),
              };
            }),


        /* =====================
           LEU GUIA
           ===================== */

        markGuideRead:
          (animalId) =>
            set((state) => {

              /*
                Só vale se
                estiver registrado.
              */

              if (
                !state.discoveries
                  .includes(
                    animalId
                  )
              ) {
                return {};
              }


              const readAnimals =
                state.readAnimals
                  .includes(
                    animalId
                  )
                  ? state
                      .readAnimals

                  : [
                      ...state
                        .readAnimals,

                      animalId,
                    ];


              const next = {
                ...state,

                readAnimals,

                firstSteps: {
                  ...state
                    .firstSteps,

                  readGuide:
                    true,
                },

                daily: {
                  ...state.daily,

                  read:
                    state.daily
                      .read + 1,
                },
              };


              return {
                readAnimals,

                firstSteps:
                  next.firstSteps,

                daily:
                  next.daily,

                ...evaluateAll(
                  next
                ),
              };
            }),


        /* =====================
           RECOLHEU RESÍDUO
           ===================== */

        collectTrashProgress:        
          ({ xp = 0, leaves = 0 } = {}) =>
            set((state) => {

              const trashCollected =
                (state.trashCollected ?? 0) + 1;


              const trailGuardian =
                SIDE_MISSIONS.find(
                  (mission) =>
                    mission.id ===
                    'trail-guardian'
                );


              const alreadyCompleted =
                state.completedSideMissions
                  ?.includes(
                    'trail-guardian'
                  ) ?? false;


              const justCompleted =
                !alreadyCompleted &&
                trailGuardian &&
                trashCollected >=
                  trailGuardian.goal;


              const completedSideMissions =
                justCompleted
                  ? [
                      ...(state.completedSideMissions ?? []),
                      'trail-guardian',
                    ]
                  : state.completedSideMissions ?? [];


              const next = {
                ...state,

                trashCollected,

                completedSideMissions,

                xp:
                  state.xp +
                  xp +
                  (
                    justCompleted
                      ? trailGuardian.reward.xp
                      : 0
                  ),

                leaves:
                  state.leaves +
                  leaves +
                  (
                    justCompleted
                      ? trailGuardian.reward.leaves
                      : 0
                  ),
              };


              return {
                xp:
                  next.xp,

                leaves:
                  next.leaves,

                trashCollected:
                  next.trashCollected,

                completedSideMissions:
                  next.completedSideMissions,

                missionsUnread:
                  true,

                ...evaluateAll(
                  next
                ),
              };
            }),


        /* =====================
           CAMINHOU
           ===================== */

        addWalkDistance:
          (meters) =>
            set((state) => {

              if (
                !Number.isFinite(
                  meters
                ) ||
                meters <= 0
              ) {
                return {};
              }


              const next = {
                ...state,

                daily: {
                  ...state.daily,

                  walkedMeters:
                    state.daily
                      .walkedMeters +
                    meters,
                },
              };


              return {
                daily:
                  next.daily,

                ...evaluateAll(
                  next
                ),
              };
            }),


        /* =====================
           RESET
           ===================== */

        resetProgress:
          () =>
            set({
              xp: 0,

              leaves: 0,

              badges: [],

              discoveries: [],

              foundAnimals: [],

              readAnimals: [],

              trashCollected: 0,

              activeEncounterId:
                null,

              firstSteps: {
                ...INITIAL_FIRST_STEPS,
              },

              currentMissionId:
                'first-steps',

              completedMissions:
                [],

              missionsUnread:
                true,

              daily: {
                missionId:
                  getDailyMissionId(),

                completed:
                  false,
                
                found:
                  0,

                registered:
                  0,

                read:
                  0,

                walkedMeters:
                  0,

                newDiscoveries:
                  0,
              },
            }),
      }),

      {
        name:
          'rebrota-progress',

        storage:
          createJSONStorage(
            () =>
              sessionStorage
          ),
      }
    )
  );