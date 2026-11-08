export const encounters = [
  {
    id: 'capivara',
    type: 'animal',

    name: 'Capivara',
    scientificName: 'Hydrochoerus hydrochaeris',

    model: 'capybara.glb',
    arModel: 'capybara.usdz',

    // Escala exagerada no mapa para facilitar visualização/clique
    mapScale: 14,

    // Escala realista no AR
    arScale: 1,

    radius: 30,

    rarity: 'common',
    spawnChance: 0.6,

    position: null,

    testOffset: {
      latitude: 0.00011,
      longitude: 0,
    },
  },

  {
    id: 'jackrabbit',
    type: 'animal',

    name: 'Lebre',

    model: 'jackrabbit.glb',
    arModel: 'jackrabbit.usdz',

    mapScale: 10,
    arScale: 1,

    radius: 30,

    rarity: 'uncommon',
    spawnChance: 0.3,

    position: null,

    testOffset: {
      latitude: -0.00009,
      longitude: 0.00009,
    },
  },

  {
    id: 'riverotter',
    type: 'animal',

    name: 'Lontra',

    model: 'riverotter.glb',
    arModel: 'riverotter.usdz',

    mapScale: 12,
    arScale: 1,

    radius: 30,

    rarity: 'rare',
    spawnChance: 0.1,

    position: null,

    testOffset: {
      latitude: 0.00004,
      longitude: -0.00012,
    },
  },
];