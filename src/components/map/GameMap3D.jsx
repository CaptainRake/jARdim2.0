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


function calcularDistancia(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371000;

  const p1 =
    (lat1 * Math.PI) / 180;

  const p2 =
    (lat2 * Math.PI) / 180;

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
  Retorna uma coordenada
  a determinada distância
  e direção do jogador.
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


export default function GameMap3D() {
  const navigate =
    useNavigate();


  /*
    ===================================
    STORES
    ===================================
  */

  const markAnimalFound =
    useProgressStore(
      (state) =>
        state.markAnimalFound
    );


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
    ===================================
    REFS
    ===================================
  */

  const mapContainer =
    useRef(null);

  const mapRef =
    useRef(null);

  const playerTransformRef =
    useRef(null);

  const encountersRef =
    useRef({});

  const encountersAnchoredRef =
    useRef(false);

  const popupRef =
    useRef(null);


  /*
    Sempre guarda o GPS
    mais recente.

    Isso permite que o GPS
    chegue antes OU depois
    do carregamento do mapa.
  */

  const latestGpsRef =
    useRef({
      latitude,
      longitude,
      hasRealPosition,
    });


  /*
    ===================================
    ANCORA OS ANIMAIS NO GPS
    ===================================
  */

  function anchorEncounters() {
    const {
      latitude:
        currentLatitude,

      longitude:
        currentLongitude,

      hasRealPosition:
        hasGPS,
    } =
      latestGpsRef.current;


    /*
      Ainda não temos GPS real.
    */

    if (!hasGPS) {
      return;
    }


    /*
      Já fizemos isso.
    */

    if (
      encountersAnchoredRef.current
    ) {
      return;
    }


    /*
      Aguarda o style.load
      criar todos os estados.
    */

    const allReady =
      encounters.every(
        (encounter) =>
          encountersRef.current[
            encounter.id
          ]
      );


    if (!allReady) {
      return;
    }


    /*
      Distribui cada animal
      ao redor do jogador.
    */

    encounters.forEach(
      (encounter) => {
        const state =
          encountersRef.current[
            encounter.id
          ];


        const position =
          calcularDestino(
            currentLatitude,
            currentLongitude,

            encounter
              .spawnDistance ??
              20,

            encounter
              .spawnBearing ??
              0
          );


        const mercator =
          maplibregl
            .MercatorCoordinate
            .fromLngLat(
              position,
              0
            );


        state.position =
          position;


        state.transform.translateX =
          mercator.x;

        state.transform.translateY =
          mercator.y;

        state.transform.translateZ =
          mercator.z;


        state.transform.scale =
          mercator
            .meterInMercatorCoordinateUnits() *
          (
            encounter.mapScale ??
            1
          );


        /*
          Como os animais estão
          próximos nesta fase,
          já podem aparecer.
        */

        state.visible =
          true;
      }
    );


    encountersAnchoredRef.current =
      true;


    console.log(
      'ANIMAIS POSICIONADOS NO GPS'
    );


    mapRef.current
      ?.triggerRepaint();
  }


  /*
    ===================================
    CRIAÇÃO DO MAPA
    ===================================
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

        canvasContextAttributes: {
          antialias: true,
        },
      });


    mapRef.current =
      map;


    /*
      ===================================
      CONTROLES
      ===================================
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
      ===================================
      PERSPECTIVA
      ===================================
    */

    function atualizarPerspectiva() {
      const zoom =
        map.getZoom();

      const minZoom =
        17;

      const maxZoom =
        21;

      const minPitch =
        35;

      const maxPitch =
        70;


      const progress =
        (
          zoom -
          minZoom
        ) /
        (
          maxZoom -
          minZoom
        );


      const pitch =
        minPitch +
        progress *
          (
            maxPitch -
            minPitch
          );


      map.setPitch(
        Math.max(
          minPitch,

          Math.min(
            maxPitch,
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
      ===================================
      STYLE LOAD
      ===================================
    */

    map.on(
      'style.load',
      () => {

        /*
          ===================================
          CORES DO MAPA
          ===================================
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
          ===================================
          PLAYER
          ===================================
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


            const hemisphere =
              new THREE
                .HemisphereLight(
                  0xffffff,

                  0x444444,

                  2
                );


            this.scene.add(
              hemisphere
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


            const loader =
              new GLTFLoader();


            loader.load(
              `${import.meta.env.BASE_URL}models/gnome.glb`,

              (gltf) => {
                this.scene.add(
                  gltf.scene
                );


                map.triggerRepaint();
              },

              undefined,

              (error) => {
                console.error(
                  'ERRO GNOME:',

                  error
                );
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
            const rx =
              new THREE
                .Matrix4()
                .makeRotationX(
                  playerTransform
                    .rotateX
                );


            const ry =
              new THREE
                .Matrix4()
                .makeRotationY(
                  playerTransform
                    .rotateY
                );


            const rz =
              new THREE
                .Matrix4()
                .makeRotationZ(
                  playerTransform
                    .rotateZ
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
                  playerTransform
                    .translateX,

                  playerTransform
                    .translateY,

                  playerTransform
                    .translateZ
                )

                .scale(
                  new THREE.Vector3(
                    playerTransform
                      .scale,

                    -playerTransform
                      .scale,

                    playerTransform
                      .scale
                  )
                )

                .multiply(
                  rx
                )

                .multiply(
                  ry
                )

                .multiply(
                  rz
                );


            this.camera
              .projectionMatrix =
              m.multiply(
                l
              );


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
          ===================================
          POPUP
          ===================================
        */

        function abrirEncontro(
          encounter
        ) {
          const state =
            encountersRef
              .current[
                encounter.id
              ];


          if (
            !state
              ?.position
          ) {
            return;
          }


          popupRef.current
            ?.remove();


          const container =
            document
              .createElement(
                'div'
              );


          container.style
            .minWidth =
            '180px';


          const title =
            document
              .createElement(
                'strong'
              );


          title.textContent =
            encounter.name;


          const text =
            document
              .createElement(
                'p'
              );


          text.textContent =
            `Você encontrou ${encounter.name}!`;


          text.style.margin =
            '8px 0';


          const button =
            document
              .createElement(
                'button'
              );


          button.textContent =
            'Observar em AR';


          button.style.padding =
            '8px 12px';


          button.style.cursor =
            'pointer';


          button.addEventListener(
            'click',

            () => {
              popupRef.current
                ?.remove();


              /*
                Passamos o animal
                diretamente na URL.

                Não dependemos do store
                para o AR saber quem é.
              */

              navigate(
                `/ar?animal=${encounter.id}`
              );
            }
          );


          container.append(
            title,
            text,
            button
          );


          popupRef.current =
            new maplibregl
              .Popup({
                offset:
                  35,

                closeButton:
                  true,
              })

              .setLngLat(
                state.position
              )

              .setDOMContent(
                container
              )

              .addTo(
                map
              );
        }


        /*
          ===================================
          ANIMAIS
          ===================================
        */

        encounters
          .filter(
            (encounter) =>
              encounter.type ===
              'animal'
          )

          .forEach(
            (encounter) => {

              /*
                Estado inicial invisível.

                Depois que GPS + mapa
                estiverem disponíveis,
                anchorEncounters()
                posiciona tudo.
              */

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
                    encounter
                      .mapScale ??
                    1
                  ),
              };


              encountersRef
                .current[
                  encounter.id
                ] = {
                  position:
                    null,

                  transform,

                  visible:
                    false,
                };


              const animalLayer = {
                id:
                  `encounter-${encounter.id}`,

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


                  const hemisphere =
                    new THREE
                      .HemisphereLight(
                        0xffffff,

                        0x444444,

                        2.5
                      );


                  this.scene.add(
                    hemisphere
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


                  const loader =
                    new GLTFLoader();


                  loader.load(
                    `${import.meta.env.BASE_URL}models/${encounter.model}`,

                    (gltf) => {
                      this.model =
                        gltf.scene;


                      this.scene.add(
                        this.model
                      );


                      console.log(
                        `${encounter.name} CARREGOU`
                      );


                      map.triggerRepaint();
                    },

                    undefined,

                    (error) => {
                      console.error(
                        `ERRO ${encounter.name}:`,

                        error
                      );
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
                    ===================================
                    CLIQUE
                    ===================================
                  */

                  this.handleClick =
                    (event) => {
                      const state =
                        encountersRef
                          .current[
                            encounter.id
                          ];


                      if (
                        !state
                          ?.visible
                      ) {
                        return;
                      }


                      if (
                        !this.model
                      ) {
                        return;
                      }


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

                          .sub(
                            near
                          )

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
                        hits.length >
                        0
                      ) {
                        console.log(
                          'ANIMAL ENCONTRADO:',

                          encounter.id
                        );


                        /*
                          Mantemos o store
                          funcionando para
                          progresso/missão.
                        */

                        markAnimalFound(
                          encounter.id
                        );


                        abrirEncontro(
                          encounter
                        );
                      }
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
                  const state =
                    encountersRef
                      .current[
                        encounter.id
                      ];


                  if (
                    !state
                      ?.visible
                  ) {
                    return;
                  }


                  const transform =
                    state.transform;


                  const rx =
                    new THREE
                      .Matrix4()
                      .makeRotationX(
                        transform
                          .rotateX
                      );


                  const ry =
                    new THREE
                      .Matrix4()
                      .makeRotationY(
                        transform
                          .rotateY
                      );


                  const rz =
                    new THREE
                      .Matrix4()
                      .makeRotationZ(
                        transform
                          .rotateZ
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
                        transform
                          .translateX,

                        transform
                          .translateY,

                        transform
                          .translateZ
                      )

                      .scale(
                        new THREE
                          .Vector3(
                            transform
                              .scale,

                            -transform
                              .scale,

                            transform
                              .scale
                          )
                      )

                      .multiply(
                        rx
                      )

                      .multiply(
                        ry
                      )

                      .multiply(
                        rz
                      );


                  this.camera
                    .projectionMatrix =
                    m.multiply(
                      l
                    );


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


                onRemove(
                  map
                ) {
                  if (
                    this
                      .handleClick
                  ) {
                    map.off(
                      'click',

                      this
                        .handleClick
                    );
                  }


                  this.renderer
                    ?.dispose();
                },
              };


              map.addLayer(
                animalLayer
              );
            }
          );


        /*
          MUITO IMPORTANTE:

          O mapa pode terminar
          depois que o GPS já chegou.

          Então tentamos ancorar aqui também.
        */

        anchorEncounters();


        map.triggerRepaint();
      }
    );


    /*
      ===================================
      CLEANUP
      ===================================
    */

    return () => {
      popupRef.current
        ?.remove();


      map.off(
        'zoom',

        atualizarPerspectiva
      );


      map.remove();


      mapRef.current =
        null;


      encountersRef.current =
        {};


      encountersAnchoredRef.current =
        false;
    };

  }, [
    navigate,
    markAnimalFound,
  ]);


  /*
    ===================================
    GPS REAL CHEGOU
    ===================================
  */

  useEffect(() => {
    latestGpsRef.current = {
      latitude,
      longitude,
      hasRealPosition,
    };


    /*
      O GPS pode terminar depois
      que o mapa já carregou.

      Então tentamos ancorar aqui.
    */

    anchorEncounters();

  }, [
    latitude,
    longitude,
    hasRealPosition,
  ]);


  /*
    ===================================
    MOVIMENTO DO PLAYER
    ===================================
  */

  useEffect(() => {
    if (
      !mapRef.current
    ) {
      return;
    }


    /*
      Centraliza mapa
      no jogador.
    */

    mapRef.current
      .easeTo({
        center: [
          longitude,
          latitude,
        ],

        duration:
          700,
      });


    /*
      Move o Gnome.
    */

    if (
      playerTransformRef
        .current
    ) {
      const position =
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
        position.x;


      playerTransformRef
        .current
        .translateY =
        position.y;


      playerTransformRef
        .current
        .translateZ =
        position.z;


      playerTransformRef
        .current
        .scale =
        position
          .meterInMercatorCoordinateUnits();


      playerTransformRef
        .current
        .rotateZ =
        0;
    }


    /*
      ===================================
      DISTÂNCIA DOS ANIMAIS
      ===================================
    */

    encounters.forEach(
      (encounter) => {
        const state =
          encountersRef
            .current[
              encounter.id
            ];


        if (
          !state ||
          !state.position
        ) {
          return;
        }


        const [
          encounterLongitude,
          encounterLatitude,
        ] =
          state.position;


        const distance =
          calcularDistancia(
            latitude,
            longitude,

            encounterLatitude,
            encounterLongitude
          );


        state.visible =
          distance <=
          (
            encounter
              .revealRadius ??
            40
          );
      }
    );


    mapRef.current
      .triggerRepaint();

  }, [
    latitude,
    longitude,
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