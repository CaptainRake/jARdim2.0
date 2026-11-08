export const missions = [
  {
    id: 'first-steps',

    title: 'Primeiros passos',

    description:
      'Comece sua jornada explorando, registrando e conhecendo a fauna ao seu redor.',

    objectives: [
      {
        id: 'find-wild-animal',
        label: 'Encontre um animal silvestre',
      },
      {
        id: 'register-wild-animal',
        label: 'Registre um animal silvestre',
      },
      {
        id: 'read-field-guide',
        label:
          'Conheça sua descoberta no Guia de Campo',
      },
    ],

    rewards: {
      xp: 150,
      leaves: 15,
      badge: 'first-steps',
    },
  },
];