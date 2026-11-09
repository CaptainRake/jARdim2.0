export const encounters = [
  {
    id: 'capivara',
    type: 'animal',

    name: 'Capivara',
    scientificName:
      'Hydrochoerus hydrochaeris',

    model: 'capybara.glb',
    arModel: 'capybara.usdz',

    mapScale: 14,
    arScale: 1,

    rarity: 'common',
    spawnChance: 0.6,

    // posição relativa ao jogador
    spawnDistance: 18,
    spawnBearing: 0,

    revealRadius: 40,
  },

  {
    id: 'jackrabbit',
    type: 'animal',

    name: 'Lebre',

    model: 'jackrabbit.glb',
    arModel: 'jackrabbit.usdz',

    mapScale: 12,
    arScale: 1,

    rarity: 'uncommon',
    spawnChance: 0.3,

    spawnDistance: 22,
    spawnBearing: 120,

    revealRadius: 40,
  },

  {
    id: 'riverotter',
    type: 'animal',

    name: 'Lontra',

    model: 'riverotter.glb',
    arModel: 'riverotter.usdz',

    mapScale: 13,
    arScale: 1,

    rarity: 'rare',
    spawnChance: 0.1,

    spawnDistance: 26,
    spawnBearing: 240,

    revealRadius: 40,
  },
];