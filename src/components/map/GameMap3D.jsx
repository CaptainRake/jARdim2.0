import {
  useEffect,
  useRef,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import maplibregl
  from 'maplibre-gl';

import * as THREE
  from 'three';

import {
  GLTFLoader,
} from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
  encounters,
} from '../../data/encounters';

import {
  usePlayerStore,
} from '../../stores/playerStore';

import {
  useProgressStore,
} from '../../stores/progressStore';

import {
  useEncounterStore,
} from '../../stores/encounterStore';

import {
  trashItems,
} from '../../data/trash';

import {
  useTrashStore,
} from '../../stores/trashStore';


/*
  =========================================================
  CONFIGURAÇÃO DO SPAWN
  =========================================================

  VALORES DO JOGO:
*/

const MIN_DISTANCE_FOR_SPAWN = 10;

/*
  2 minutos
*/

const IDLE_SPAWN_INTERVAL =
  20 * 1000;

const SPAWN_COOLDOWN =
  10 * 1000;


/*
  Depois que estiver elegível,
  faz uma nova tentativa a cada
  20 metros.
*/

const ENCOUNTER_DURATION =
  20 * 1000;

const DISTANCE_BETWEEN_ROLLS = 5;


/*
  Chance de realmente surgir
  um encontro quando houver
  uma tentativa.
*/

const ENCOUNTER_CHANCE = 1;

/*
  Entre os spawns que realmente acontecem:
  70% animal / 30% resíduo.
*/
const ANIMAL_SPAWN_WEIGHT = 70;
const TRASH_SPAWN_WEIGHT = 30;


/*
  Animal nasce entre
  20 e 30 metros do player.
*/

const MIN_SPAWN_DISTANCE = 20;
const MAX_SPAWN_DISTANCE = 30;


/*
  Distâncias de gameplay.
*/

const REVEAL_RADIUS = 40;

const INTERACTION_RADIUS = 30;

const DESPAWN_RADIUS = 80;


/*
  Ignora pequenas oscilações
  do GPS.
*/

const MIN_VALID_GPS_MOVEMENT = 3;

const MAX_VALID_GPS_MOVEMENT = 100;


/*
  =========================================================
  DISTÂNCIA
  =========================================================
*/

function calcularDistancia(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371000;

  const p1 =
    (lat1 * Math.PI) /
    180;

  const p2 =
    (lat2 * Math.PI) /
    180;

  const deltaLat =
    ((lat2 - lat1) *
      Math.PI) /
    180;

  const deltaLon =
    ((lon2 - lon1) *
      Math.PI) /
    180;

  const a =
    Math.sin(
      deltaLat / 2
    ) ** 2 +

    Math.cos(p1) *
      Math.cos(p2) *

      Math.sin(
        deltaLon / 2
      ) ** 2;


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),

      Math.sqrt(
        1 - a
      )
    );


  return R * c;
}


/*
  =========================================================
  COORDENADA A X METROS DO PLAYER
  =========================================================
*/

function calcularDestino(
  latitude,
  longitude,
  distance,
  bearing
) {
  const R = 6371000;

  const delta =
    distance / R;

  const theta =
    (
      bearing *
      Math.PI
    ) / 180;

  const phi1 =
    (
      latitude *
      Math.PI
    ) / 180;

  const lambda1 =
    (
      longitude *
      Math.PI
    ) / 180;


  const phi2 =
    Math.asin(
      Math.sin(phi1) *
        Math.cos(delta) +

      Math.cos(phi1) *
        Math.sin(delta) *
        Math.cos(theta)
    );


  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) *
        Math.sin(delta) *
        Math.cos(phi1),

      Math.cos(delta) -
        Math.sin(phi1) *
          Math.sin(phi2)
    );


  return [
    (
      lambda2 *
      180
    ) / Math.PI,

    (
      phi2 *
      180
    ) / Math.PI,
  ];
}


/*
  =========================================================
  SORTEIO PONDERADO
  =========================================================
*/

function escolherAnimal(
  lastAnimalId,
  speciesCooldowns
) {
  const now =
    Date.now();


  /*
    Remove:
    - último animal
    - espécies ainda em cooldown
  */

  let available =
    encounters.filter(
      (animal) => {
        const cooldownUntil =
          speciesCooldowns[
            animal.id
          ] ?? 0;

        return (
          animal.id !==
            lastAnimalId &&

          cooldownUntil <= now
        );
      }
    );


  /*
    Se todas estiverem bloqueadas,
    ignoramos o cooldown individual,
    mas ainda evitamos repetir
    a última.
  */

  if (
    available.length === 0
  ) {
    available =
      encounters.filter(
        (animal) =>
          animal.id !==
          lastAnimalId
      );
  }


  /*
    Segurança para catálogo
    com apenas 1 espécie.
  */

  if (
    available.length === 0
  ) {
    available =
      [...encounters];
  }


  const totalWeight =
    available.reduce(
      (total, animal) =>
        total +
        (animal.weight ?? 1),

      0
    );


  let random =
    Math.random() *
    totalWeight;


  for (
    const animal of
    available
  ) {
    random -=
      animal.weight ?? 1;


    if (random <= 0) {
      return animal;
    }
  }


  return available[0];
}


function escolherResiduo() {
  const totalWeight =
    trashItems.reduce(
      (total, item) =>
        total +
        (item.weight ?? 1),
      0
    );


  let random =
    Math.random() *
    totalWeight;


  for (
    const item of
    trashItems
  ) {
    random -=
      item.weight ?? 1;


    if (random <= 0) {
      return item;
    }
  }


  return trashItems[0];
}


/*
  =========================================================
  COMPONENTE
  =========================================================
*/

export default function GameMap3D() {
  const navigate =
    useNavigate();

  
  const trashOnMap =
    useTrashStore(
      (state) =>
        state.trashOnMap
    );


  const setTrashOnMap =
    useTrashStore(
      (state) =>
        state.setTrashOnMap
    );


  /*
    PLAYER
  */

  const latitude =
    usePlayerStore(
      (state) =>
        state.latitude
    );


  const longitude =
    usePlayerStore(
      (state) =>
        state.longitude
    );


  const hasRealPosition =
    usePlayerStore(
      (state) =>
        state.hasRealPosition
    );


  /*
    PROGRESSO
  */

  const markAnimalFound =
    useProgressStore(
      (state) =>
        state.markAnimalFound
    );


  /*
    ENCONTROS
  */

  const activeEncounter =
    useEncounterStore(
      (state) =>
        state.activeEncounter
    );


  const lastEncounterAt =
    useEncounterStore(
      (state) =>
        state.lastEncounterAt
    );


  const lastAnimalId =
    useEncounterStore(
      (state) =>
        state.lastAnimalId
    );


  const speciesCooldowns =
    useEncounterStore(
      (state) =>
        state.speciesCooldowns
    );


  const startEncounter =
    useEncounterStore(
      (state) =>
        state.startEncounter
    );


  const endEncounter =
    useEncounterStore(
      (state) =>
        state.endEncounter
    );

  const expireEncounter =
    useEncounterStore(
      (state) =>
        state.expireEncounter
    );


  /*
    REFS DO MAPA
  */

  const trashLayersRef =
    useRef({});


  const mapContainer =
    useRef(null);

  const mapRef =
    useRef(null);
  
  const latestPositionRef =
    useRef({
      latitude,
      longitude,
    });

  const playerTransformRef =
    useRef(null);

  const encounterLayersRef =
    useRef({});

  const popupRef =
    useRef(null);


  /*
    MOVIMENTO
  */

  const lastPositionRef =
    useRef(null);


  const distanceTravelledRef =
    useRef(0);


  const distanceAtLastRollRef =
    useRef(0);


  /*
    Evita várias rolagens
    no mesmo update.
  */

  const spawnLockRef =
    useRef(false);


  /*
    Guarda estado atualizado,
    evitando closures antigas
    dentro do MapLibre.
  */

  const activeEncounterRef =
    useRef(
      activeEncounter
    );


  useEffect(() => {
    activeEncounterRef.current =
      activeEncounter;

  }, [
    activeEncounter,
  ]);

  useEffect(() => {
    latestPositionRef.current = {
      latitude,
      longitude,
    };
  }, [
    latitude,
    longitude,
  ]);

  useEffect(() => {
    const trash =
      trashOnMap[0];


    if (!trash) {
      return;
    }


    const elapsed =
      Date.now() -
      (trash.createdAt ?? Date.now());


    const remaining =
      Math.max(
        ENCOUNTER_DURATION -
          elapsed,
        0
      );


    const timer =
      setTimeout(() => {
        console.log(
          'O resíduo saiu do encontro.'
        );


        setTrashOnMap([]);

        expireEncounter();

        distanceTravelledRef.current =
          0;

        distanceAtLastRollRef.current =
          0;

        mapRef.current
          ?.triggerRepaint();
      }, remaining);


    return () =>
      clearTimeout(timer);

  }, [
    trashOnMap,
    setTrashOnMap,
    expireEncounter,
  ]);


  useEffect(() => {
    if (!activeEncounter) {
      return;
    }

    const elapsed =
      Date.now() -
      activeEncounter.createdAt;

    const remaining =
      Math.max(
        ENCOUNTER_DURATION -
          elapsed,
        0
      );

    const timer =
      setTimeout(() => {
        console.log(
          'O encontro expirou.'
        );

        expireEncounter();

        activeEncounterRef.current =
          null;

        distanceTravelledRef.current =
          0;

        distanceAtLastRollRef.current =
          0;

        popupRef.current
          ?.remove();

        mapRef.current
          ?.triggerRepaint();
      }, remaining);

    return () =>
      clearTimeout(timer);

  }, [
    activeEncounter,
    expireEncounter,
  ]);


  /*
    =========================================================
    ATUALIZA POSIÇÃO DO MODELO DO ENCONTRO
    =========================================================
  */

  function updateEncounterTransform(
    encounter
  ) {
    if (
      !encounter
    ) {
      return;
    }


    const animal =
      encounters.find(
        (item) =>
          item.id ===
          encounter.animalId
      );


    if (!animal) {
      return;
    }


    const layerState =
      encounterLayersRef
        .current[
          animal.id
        ];


    if (!layerState) {
      return;
    }


    const mercator =
      maplibregl
        .MercatorCoordinate
        .fromLngLat(
          encounter.position,
          0
        );


    layerState.position =
      encounter.position;


    layerState.transform
      .translateX =
      mercator.x;


    layerState.transform
      .translateY =
      mercator.y;


    layerState.transform
      .translateZ =
      mercator.z;


    layerState.transform
      .scale =
      mercator
        .meterInMercatorCoordinateUnits() *
      (
        animal.mapScale ??
        1
      );


    mapRef.current
      ?.triggerRepaint();
  }


  /*
    =========================================================
    SPAWN
    =========================================================
  */

  function tentarSpawn(forceSpawn = false) {
    if (
      spawnLockRef.current
    ) {
      return;
    }


    if (
      !hasRealPosition
    ) {
      return;
    }


    /*
      Já existe encontro.
    */

    if (
      activeEncounterRef.current ||
      useTrashStore
        .getState()
        .trashOnMap
        .length > 0
    ) {
      return;
    }


    /*
      Distância mínima.
    */

    if (
      !forceSpawn &&
      distanceTravelledRef.current <
        MIN_DISTANCE_FOR_SPAWN
    ) {
      return;
    }


    /*
      Cooldown global.
    */

    if (
      !forceSpawn &&
      lastEncounterAt > 0
    ) {
      const elapsed =
        Date.now() -
        lastEncounterAt;

      if (
        elapsed <
        SPAWN_COOLDOWN
      ) {
        return;
      }
    }


    /*
      Primeira tentativa ocorre
      ao chegar nos 50m.

      Depois, só tenta novamente
      a cada +20m.
    */

    if (
      !forceSpawn &&
      distanceAtLastRollRef.current !== 0
    ) {
      const sinceLastRoll =
        distanceTravelledRef
          .current -
        distanceAtLastRollRef
          .current;


      if (
        sinceLastRoll <
        DISTANCE_BETWEEN_ROLLS
      ) {
        return;
      }
    }


    spawnLockRef.current =
      true;


    distanceAtLastRollRef
      .current =
      distanceTravelledRef.current;


    /*
      ROLAGEM PARA SABER
      SE EXISTE ENCONTRO.
    */

    const spawnRoll =
      forceSpawn
        ? 0
        : Math.random();


    console.log(
      'Rolagem de encontro:',
      spawnRoll
    );


    if (
      spawnRoll >
      ENCOUNTER_CHANCE
    ) {
      console.log(
        'Nenhum animal apareceu.'
      );


      spawnLockRef.current =
        false;


      return;
    }


    /*
      ESCOLHE O TIPO DE ENCONTRO.
    */

    const typeRoll =
      Math.random() *
      (
        ANIMAL_SPAWN_WEIGHT +
        TRASH_SPAWN_WEIGHT
      );


    const encounterType =
      typeRoll <
        ANIMAL_SPAWN_WEIGHT
        ? 'animal'
        : 'trash';


    /*
      POSIÇÃO ALEATÓRIA
      AO REDOR DO PLAYER.
    */

    const distance =
      MIN_SPAWN_DISTANCE +
      Math.random() *
        (
          MAX_SPAWN_DISTANCE -
          MIN_SPAWN_DISTANCE
        );


    const bearing =
      Math.random() *
      360;


    const currentPosition =
      latestPositionRef.current;


    const position =
      calcularDestino(
        currentPosition.latitude,
        currentPosition.longitude,
        distance,
        bearing
      );


    if (
      encounterType ===
      'trash'
    ) {
      const trash =
        escolherResiduo();


      const instance = {
        instanceId:
          `${trash.id}-${Date.now()}`,

        trashId:
          trash.id,

        position,

        createdAt:
          Date.now(),
      };


      console.log(
        'NOVO RESÍDUO:',
        trash.name
      );


      setTrashOnMap([
        instance,
      ]);


      mapRef.current
        ?.triggerRepaint();
    }

    else {
      const animal =
        escolherAnimal(
          lastAnimalId,
          speciesCooldowns
        );


      const newEncounter = {
        animalId:
          animal.id,

        position,

        createdAt:
          Date.now(),
      };


      console.log(
        'NOVO ENCONTRO:',
        animal.name
      );


      startEncounter(
        animal.id,
        position
      );


      activeEncounterRef.current =
        newEncounter;


      updateEncounterTransform(
        newEncounter
      );
    }


    /*
      Zera distância para
      o próximo ciclo.
    */

    distanceTravelledRef
      .current =
      0;


    distanceAtLastRollRef
      .current =
      0;


    spawnLockRef.current =
      false;
  }


  /*
    =========================================================
    CRIA MAPA
    =========================================================
  */

  useEffect(() => {
  if (
    mapRef.current
  ) {
    return;
  }

    const map =
      new maplibregl.Map({
        container:
          mapContainer.current,

        style:
          'https://tiles.openfreemap.org/styles/liberty',

        center: [
          longitude,
          latitude,
        ],

        zoom: 19,

        minZoom: 17,
        maxZoom: 21,

        pitch: 60,

        bearing: 0,

        attributionControl: false,

        canvasContextAttributes: {
          antialias: true,
        },
      });


    mapRef.current =
      map;


    /*
      =========================================================
      CLIQUE NOS RESÍDUOS
      =========================================================
    */

    function handleTrashClick(
      event
    ) {
      const currentTrash =
        useTrashStore
          .getState()
          .trashOnMap;


      if (
        currentTrash.length === 0
      ) {
        return;
      }


      let closest =
        null;

      let closestScreenDistance =
        Infinity;


      currentTrash.forEach(
        (instance) => {
          const point =
            map.project(
              instance.position
            );


          const dx =
            event.point.x -
            point.x;

          const dy =
            event.point.y -
            point.y;


          const screenDistance =
            Math.sqrt(
              dx * dx +
              dy * dy
            );


          if (
            screenDistance <= 60 &&
            screenDistance <
              closestScreenDistance
          ) {
            closest =
              instance;

            closestScreenDistance =
              screenDistance;
          }
        }
      );


      if (!closest) {
        return;
      }


      const currentPosition =
        latestPositionRef.current;


      const playerDistance =
        calcularDistancia(
          currentPosition.latitude,
          currentPosition.longitude,
          closest.position[1],
          closest.position[0]
        );


      /*
        Para a demo deixamos um raio
        confortável para tocar no resíduo.
      */

      if (
        playerDistance > 50
      ) {
        return;
      }


      const trashData =
        trashItems.find(
          (item) =>
            item.id ===
            closest.trashId
        );


      if (!trashData) {
        return;
      }


      window.dispatchEvent(
        new CustomEvent(
          'rebrota-trash-selected',
          {
            detail: {
              ...closest,
              ...trashData,
            },
          }
        )
      );
    }


    map.on(
      'click',
      handleTrashClick
    );


    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
      }),
      'bottom-right'
    );


    /*
      O MapLibre 5.24 inicia
      a atribuição compacta aberta.

      Forçamos o estado inicial
      fechado depois que o DOM
      do controle é criado.
    */

    requestAnimationFrame(() => {
      const attribution =
        map
          .getContainer()
          .querySelector(
            'details.maplibregl-ctrl-attrib'
          );


      if (attribution) {
        attribution.removeAttribute(
          'open'
        );

        attribution.classList.remove(
          'maplibregl-compact-show'
        );
      }
    });


    /*
      CONTROLES
    */

    map.dragPan.disable();

    map.dragRotate.enable();

    map.scrollZoom.enable({
      around: 'center',
    });

    map.touchZoomRotate.enable({
      around: 'center',
    });

    map.touchZoomRotate
      .enableRotation();

    map.touchPitch.disable();


    /*
      PITCH
    */

    function atualizarPerspectiva() {
      const zoom =
        map.getZoom();


      const progress =
        (
          zoom - 17
        ) /
        4;


      const pitch =
        35 +
        progress *
          35;


      map.setPitch(
        Math.max(
          35,

          Math.min(
            70,
            pitch
          )
        )
      );
    }


    map.on(
      'zoom',
      atualizarPerspectiva
    );


    atualizarPerspectiva();


    /*
      =========================================================
      STYLE
      =========================================================
    */

    map.on(
      'style.load',
      () => {

        /*
          MAPA
        */

        const layers =
          map.getStyle()
            .layers;


        layers.forEach(
          (layer) => {

            if (
              layer.type ===
              'background'
            ) {
              map.setPaintProperty(
                layer.id,
                'background-color',
                '#dfe8c8'
              );
            }


            if (
              layer.type ===
              'fill'
            ) {
              map.setPaintProperty(
                layer.id,
                'fill-color',
                '#cfd9b6'
              );
            }


            if (
              layer.type ===
              'line'
            ) {
              map.setPaintProperty(
                layer.id,
                'line-color',
                '#a8b28f'
              );
            }


            if (
              layer.type ===
              'fill-extrusion'
            ) {
              map.setPaintProperty(
                layer.id,
                'fill-extrusion-color',
                '#c8c3ae'
              );

              map.setPaintProperty(
                layer.id,
                'fill-extrusion-height',
                1
              );

              map.setPaintProperty(
                layer.id,
                'fill-extrusion-base',
                0
              );
            }
          }
        );


        /*
          =========================================================
          PLAYER
          =========================================================
        */

        const playerMercator =
          maplibregl
            .MercatorCoordinate
            .fromLngLat(
              [
                longitude,
                latitude,
              ],
              0
            );


        const playerTransform = {
          translateX:
            playerMercator.x,

          translateY:
            playerMercator.y,

          translateZ:
            playerMercator.z,

          rotateX:
            Math.PI / 2,

          rotateY:
            0,

          rotateZ:
            0,

          scale:
            playerMercator
              .meterInMercatorCoordinateUnits(),
        };


        playerTransformRef.current =
          playerTransform;


        const playerLayer = {
          id:
            'player-model',

          type:
            'custom',

          renderingMode:
            '3d',


          onAdd(
            map,
            gl
          ) {
            this.camera =
              new THREE.Camera();


            this.scene =
              new THREE.Scene();


            this.scene.add(
              new THREE
                .HemisphereLight(
                  0xffffff,
                  0x444444,
                  2
                )
            );


            const directional =
              new THREE
                .DirectionalLight(
                  0xffffff,
                  2
                );


            directional
              .position
              .set(
                0,
                -70,
                100
              );


            this.scene.add(
              directional
            );


            new GLTFLoader()
              .load(
                `${import.meta.env.BASE_URL}models/gnome.glb`,

                (gltf) => {
                  this.scene.add(
                    gltf.scene
                  );

                  map.triggerRepaint();
                }
              );


            this.renderer =
              new THREE
                .WebGLRenderer({
                  canvas:
                    map.getCanvas(),

                  context:
                    gl,

                  antialias:
                    true,
                });


            this.renderer
              .autoClear =
              false;
          },


          render(
            gl,
            args
          ) {
            const transform =
              playerTransform;


            const m =
              new THREE
                .Matrix4()
                .fromArray(
                  args
                    .defaultProjectionData
                    .mainMatrix
                );


            const l =
              new THREE
                .Matrix4()

                .makeTranslation(
                  transform.translateX,
                  transform.translateY,
                  transform.translateZ
                )

                .scale(
                  new THREE
                    .Vector3(
                      transform.scale,

                      -transform.scale,

                      transform.scale
                    )
                )

                .multiply(
                  new THREE
                    .Matrix4()
                    .makeRotationX(
                      transform.rotateX
                    )
                );


            this.camera
              .projectionMatrix =
              m.multiply(l);


            this.renderer
              .resetState();


            this.renderer
              .render(
                this.scene,
                this.camera
              );


            map.triggerRepaint();
          },


          onRemove() {
            this.renderer
              ?.dispose();
          },
        };


        map.addLayer(
          playerLayer
        );


        /*
          =========================================================
          CRIA LAYERS DOS ANIMAIS
          =========================================================
        */

        encounters.forEach(
          (animal) => {

            const mercator =
              maplibregl
                .MercatorCoordinate
                .fromLngLat(
                  [
                    longitude,
                    latitude,
                  ],
                  0
                );


            const transform = {
              translateX:
                mercator.x,

              translateY:
                mercator.y,

              translateZ:
                mercator.z,

              rotateX:
                Math.PI / 2,

              rotateY:
                0,

              rotateZ:
                0,

              scale:
                mercator
                  .meterInMercatorCoordinateUnits() *
                (
                  animal.mapScale ??
                  1
                ),
            };


            encounterLayersRef
              .current[
                animal.id
              ] = {
                transform,
                position: null,
              };


            const layer = {
              id:
                `encounter-${animal.id}`,

              type:
                'custom',

              renderingMode:
                '3d',


              onAdd(
                map,
                gl
              ) {
                this.camera =
                  new THREE
                    .Camera();


                this.scene =
                  new THREE
                    .Scene();


                this.model =
                  null;


                this.raycaster =
                  new THREE
                    .Raycaster();


                this.scene.add(
                  new THREE
                    .HemisphereLight(
                      0xffffff,
                      0x444444,
                      2.5
                    )
                );


                const directional =
                  new THREE
                    .DirectionalLight(
                      0xffffff,
                      2
                    );


                directional
                  .position
                  .set(
                    0,
                    -70,
                    100
                  );


                this.scene.add(
                  directional
                );


                new GLTFLoader()
                  .load(
                    `${import.meta.env.BASE_URL}models/${animal.model}`,

                    (gltf) => {
                      this.model =
                        gltf.scene;


                      this.scene.add(
                        this.model
                      );


                      map.triggerRepaint();
                    }
                  );


                this.renderer =
                  new THREE
                    .WebGLRenderer({
                      canvas:
                        map.getCanvas(),

                      context:
                        gl,

                      antialias:
                        true,
                    });


                this.renderer
                  .autoClear =
                  false;


                /*
                  CLIQUE
                */

                this.handleClick =
                  (event) => {
                    const encounter =
                      activeEncounterRef
                        .current;


                    if (
                      !encounter ||
                      encounter.animalId !==
                        animal.id
                    ) {
                      return;
                    }


                    if (
                      !this.model
                    ) {
                      return;
                    }


                    /*
                      Precisa estar perto.
                    */

                    const currentPosition =
                      latestPositionRef.current;

                    const distance =
                      calcularDistancia(
                        currentPosition.latitude,
                        currentPosition.longitude,

                        encounter.position[1],
                        encounter.position[0]
                      );


                    if (
                      distance >
                      INTERACTION_RADIUS
                    ) {
                      popupRef.current
                        ?.remove();


                      popupRef.current =
                        new maplibregl
                          .Popup({
                            offset:
                              35,
                          })

                          .setLngLat(
                            encounter.position
                          )

                          .setHTML(
                            `
                              <strong>${animal.name}</strong>
                              <p>Aproxime-se mais para observar.</p>
                            `
                          )

                          .addTo(
                            map
                          );


                      return;
                    }


                    /*
                      RAYCAST
                    */

                    const canvas =
                      map.getCanvas();


                    const mouseX =
                      (
                        event.point.x /
                        canvas.clientWidth
                      ) *
                        2 -
                      1;


                    const mouseY =
                      -(
                        event.point.y /
                        canvas.clientHeight
                      ) *
                        2 +
                      1;


                    const inverse =
                      this.camera
                        .projectionMatrix
                        .clone()
                        .invert();


                    const near =
                      new THREE
                        .Vector3(
                          mouseX,
                          mouseY,
                          -1
                        )

                        .applyMatrix4(
                          inverse
                        );


                    const far =
                      new THREE
                        .Vector3(
                          mouseX,
                          mouseY,
                          1
                        )

                        .applyMatrix4(
                          inverse
                        );


                    const direction =
                      far
                        .clone()

                        .sub(near)

                        .normalize();


                    this.raycaster
                      .set(
                        near,
                        direction
                      );


                    const hits =
                      this.raycaster
                        .intersectObject(
                          this.model,
                          true
                        );


                    if (
                      hits.length === 0
                    ) {
                      return;
                    }


                    markAnimalFound(
                      animal.id
                    );


                    popupRef.current
                      ?.remove();


                    const content =
                      document
                        .createElement(
                          'div'
                        );


                    const title =
                      document
                        .createElement(
                          'strong'
                        );


                    title.textContent =
                      animal.name;


                    const text =
                      document
                        .createElement(
                          'p'
                        );


                    text.textContent =
                      `Você encontrou ${animal.name}!`;


                    const button =
                      document
                        .createElement(
                          'button'
                        );


                    button.textContent =
                      'Observar em AR';


                    button.addEventListener(
                      'click',
                      () => {
                        navigate(
                          `/ar?animal=${animal.id}`
                        );
                      }
                    );


                    content.append(
                      title,
                      text,
                      button
                    );


                    popupRef.current =
                      new maplibregl
                        .Popup({
                          offset: 35,
                        })

                        .setLngLat(
                          encounter
                            .position
                        )

                        .setDOMContent(
                          content
                        )

                        .addTo(
                          map
                        );
                  };


                map.on(
                  'click',
                  this.handleClick
                );
              },


              render(
                gl,
                args
              ) {
                const encounter =
                  activeEncounterRef
                    .current;


                /*
                  Só renderiza
                  a espécie ativa.
                */

                if (
                  !encounter ||
                  encounter.animalId !==
                    animal.id
                ) {
                  return;
                }


                const state =
                  encounterLayersRef
                    .current[
                      animal.id
                    ];


                if (
                  !state
                    ?.position
                ) {
                  return;
                }


                /*
                  Só aparece
                  dentro do raio.
                */

                const currentPosition =
                  latestPositionRef.current;

                const playerDistance =
                  calcularDistancia(
                    currentPosition.latitude,
                    currentPosition.longitude,

                    state.position[1],
                    state.position[0]
                  );


                if (
                  playerDistance >
                  REVEAL_RADIUS
                ) {
                  return;
                }


                const t =
                  state.transform;


                const m =
                  new THREE
                    .Matrix4()
                    .fromArray(
                      args
                        .defaultProjectionData
                        .mainMatrix
                    );


                const l =
                  new THREE
                    .Matrix4()

                    .makeTranslation(
                      t.translateX,
                      t.translateY,
                      t.translateZ
                    )

                    .scale(
                      new THREE
                        .Vector3(
                          t.scale,
                          -t.scale,
                          t.scale
                        )
                    )

                    .multiply(
                      new THREE
                        .Matrix4()
                        .makeRotationX(
                          t.rotateX
                        )
                    );


                this.camera
                  .projectionMatrix =
                  m.multiply(l);


                this.camera
                  .projectionMatrixInverse
                  .copy(
                    this.camera
                      .projectionMatrix
                  )
                  .invert();


                this.renderer
                  .resetState();


                this.renderer
                  .render(
                    this.scene,
                    this.camera
                  );


                map.triggerRepaint();
              },


              onRemove(map) {
                if (
                  this.handleClick
                ) {
                  map.off(
                    'click',
                    this.handleClick
                  );
                }


                this.renderer
                  ?.dispose();
              },
            };


            map.addLayer(
              layer
            );

          }
        );

        trashItems.forEach(
          (trash) => {

            const mercator =
              maplibregl
                .MercatorCoordinate
                .fromLngLat(
                  [
                    longitude,
                    latitude,
                  ],
                  0
                );


            const transform = {
              translateX:
                mercator.x,

              translateY:
                mercator.y,

              translateZ:
                mercator.z,

              rotateX:
                Math.PI / 2,

              rotateY:
                0,

              rotateZ:
                0,

              scale:
                mercator
                  .meterInMercatorCoordinateUnits() *
                  (
                    trash.mapScale ??
                    1
                  ),
            };


            trashLayersRef.current[
              trash.id
            ] = {
              transform,
              instance: null,
            };


            const layer = {
              id:
                `trash-${trash.id}`,

              type:
                'custom',

              renderingMode:
                '3d',


              onAdd(
                map,
                gl
              ) {
                this.camera =
                  new THREE.Camera();


                this.scene =
                  new THREE.Scene();


                this.model =
                  null;


                this.raycaster =
                  new THREE.Raycaster();


                this.scene.add(
                  new THREE
                    .HemisphereLight(
                      0xffffff,
                      0x444444,
                      2.5
                    )
                );


                const directional =
                  new THREE
                    .DirectionalLight(
                      0xffffff,
                      2
                    );


                directional
                  .position
                  .set(
                    0,
                    -70,
                    100
                  );


                this.scene.add(
                  directional
                );


                new GLTFLoader()
                  .load(
                    `${import.meta.env.BASE_URL}models/${trash.model}`,

                    (gltf) => {
                      this.model =
                        gltf.scene;


                      this.scene.add(
                        this.model
                      );


                      map.triggerRepaint();
                    }
                  );


                this.renderer =
                  new THREE
                    .WebGLRenderer({
                      canvas:
                        map.getCanvas(),

                      context:
                        gl,

                      antialias:
                        true,
                    });


                this.renderer
                  .autoClear =
                  false;
              },


              render(
                gl,
                args
              ) {
                const instance =
                  useTrashStore
                    .getState()
                    .trashOnMap
                    .find(
                      (item) =>
                        item.trashId ===
                        trash.id
                    );


                if (!instance) {
                  return;
                }


                const mercator =
                  maplibregl
                    .MercatorCoordinate
                    .fromLngLat(
                      instance.position,
                      0
                    );


                const scale =
                  mercator
                    .meterInMercatorCoordinateUnits() *
                  (
                    trash.mapScale ??
                    1
                  );


                const m =
                  new THREE
                    .Matrix4()
                    .fromArray(
                      args
                        .defaultProjectionData
                        .mainMatrix
                    );


                const l =
                  new THREE
                    .Matrix4()

                    .makeTranslation(
                      mercator.x,
                      mercator.y,
                      mercator.z
                    )

                    .scale(
                      new THREE
                        .Vector3(
                          scale,
                          -scale,
                          scale
                        )
                    )

                    .multiply(
                      new THREE
                        .Matrix4()
                        .makeRotationX(
                          Math.PI / 2
                        )
                    );


                this.camera
                  .projectionMatrix =
                  m.multiply(l);


                this.renderer
                  .resetState();


                this.renderer
                  .render(
                    this.scene,
                    this.camera
                  );


                map.triggerRepaint();
              },


              onRemove() {
                this.renderer
                  ?.dispose();
              },
            };


            map.addLayer(
              layer
            );
          }
        );



        /*
          Se voltou do AR,
          restaura o encontro existente.
        */

        if (
          activeEncounterRef
            .current
        ) {
          updateEncounterTransform(
            activeEncounterRef.current
          );
        }


        map.triggerRepaint();
      }
    );


    return () => {
      popupRef.current
        ?.remove();


      map.off(
        'click',
        handleTrashClick
      );


      map.remove();


      mapRef.current =
        null;


      encounterLayersRef
        .current =
        {};


      trashLayersRef
        .current =
        {};
    };

  }, [
    navigate,
    markAnimalFound,
  ]);

  useEffect(() => {
    if (!hasRealPosition) {
      return;
    }

    /*
      Se já existe um encontro,
      não inicia contador.
    */
    if (
      activeEncounter ||
      trashOnMap.length > 0
    ) {
      return;
    }

    console.log(
      'Contagem para spawn parado iniciada.'
    );

    const timer =
      setTimeout(() => {
        console.log(
          'Tentando spawn parado.'
        );

        tentarSpawn(true);

      }, IDLE_SPAWN_INTERVAL);

    return () =>
      clearTimeout(timer);

  }, [
    hasRealPosition,
    activeEncounter,
    trashOnMap,
  ]);

  /*
    =========================================================
    ENCONTRO MUDOU
    =========================================================
  */

  useEffect(() => {
    if (
      activeEncounter
    ) {
      updateEncounterTransform(
        activeEncounter
      );
    }

  }, [
    activeEncounter,
  ]);


  /*
    =========================================================
    GPS / MOVIMENTO / SPAWN
    =========================================================
  */

  useEffect(() => {
    if (
      !hasRealPosition
    ) {
      return;
    }


    /*
      Move o mapa.
    */

    mapRef.current
      ?.easeTo({
        center: [
          longitude,
          latitude,
        ],

        duration:
          700,
      });


    /*
      Move personagem.
    */

    if (
      playerTransformRef
        .current
    ) {
      const mercator =
        maplibregl
          .MercatorCoordinate
          .fromLngLat(
            [
              longitude,
              latitude,
            ],
            0
          );


      playerTransformRef
        .current
        .translateX =
        mercator.x;


      playerTransformRef
        .current
        .translateY =
        mercator.y;


      playerTransformRef
        .current
        .translateZ =
        mercator.z;


      playerTransformRef
        .current
        .scale =
        mercator
          .meterInMercatorCoordinateUnits();
    }


    /*
      Conta quanto o jogador
      realmente caminhou.
    */

    if (
      lastPositionRef.current
    ) {
      const previous =
        lastPositionRef.current;


      const movement =
        calcularDistancia(
          previous.latitude,
          previous.longitude,

          latitude,
          longitude
        );


      /*
        Evita jitter e saltos
        absurdos de GPS.
      */

      if (
        movement >=
          MIN_VALID_GPS_MOVEMENT &&

        movement <=
          MAX_VALID_GPS_MOVEMENT
      ) {
        distanceTravelledRef
          .current +=
          movement;

        useProgressStore
          .getState()
          .addWalkDistance(
            movement
          );


        console.log(
          'Distância:',
          Math.round(
            distanceTravelledRef
              .current
          ),
          'm'
        );
      }
    }


    lastPositionRef.current = {
      latitude,
      longitude,
    };


    /*
      Se há resíduo ativo,
      verifica se o jogador
      se afastou demais.
    */

    const activeTrash =
      useTrashStore
        .getState()
        .trashOnMap[0];


    if (activeTrash) {
      const trashDistance =
        calcularDistancia(
          latitude,
          longitude,

          activeTrash.position[1],
          activeTrash.position[0]
        );


      if (
        trashDistance >
        DESPAWN_RADIUS
      ) {
        console.log(
          'Resíduo perdido.'
        );


        setTrashOnMap([]);

        expireEncounter();

        distanceTravelledRef.current =
          0;

        distanceAtLastRollRef.current =
          0;
      }


      mapRef.current
        ?.triggerRepaint();


      return;
    }


    /*
      Se há encontro,
      verifica se jogador
      abandonou.
    */

    const encounter =
      activeEncounterRef
        .current;


    if (
      encounter
    ) {
      const distance =
        calcularDistancia(
          latitude,
          longitude,

          encounter.position[1],
          encounter.position[0]
        );


      if (
        distance >
        DESPAWN_RADIUS
      ) {
        console.log(
          'Encontro perdido.'
        );


        expireEncounter();


        activeEncounterRef
          .current =
          null;


        distanceTravelledRef
          .current =
          0;


        distanceAtLastRollRef
          .current =
          0;


        popupRef.current
          ?.remove();
      }


      mapRef.current
        ?.triggerRepaint();


      return;
    }


    /*
      Não existe encontro:
      tenta gerar um.
    */

    tentarSpawn();


    mapRef.current
      ?.triggerRepaint();

  }, [
    latitude,
    longitude,
    hasRealPosition,
    endEncounter,
    expireEncounter,
    setTrashOnMap,
  ]);


  return (
    <div
      ref={
        mapContainer
      }

      style={{
        width:
          '100%',

        height:
          '100%',
      }}
    />
  );
}