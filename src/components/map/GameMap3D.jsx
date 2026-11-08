import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import maplibregl from 'maplibre-gl';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { encounters } from '../../data/encounters';
import { usePlayerStore } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';


function calcularDistancia(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371000;

  const φ1 =
    (lat1 * Math.PI) / 180;

  const φ2 =
    (lat2 * Math.PI) / 180;

  const Δφ =
    ((lat2 - lat1) * Math.PI) /
    180;

  const Δλ =
    ((lon2 - lon1) * Math.PI) /
    180;

  const a =
    Math.sin(Δφ / 2) *
      Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}


function getEncounterPosition(
  encounter,
  playerLatitude,
  playerLongitude
) {
  /*
    POSIÇÃO REAL
  */

  if (encounter.position) {
    return [
      encounter.position.longitude,
      encounter.position.latitude,
    ];
  }


  /*
    POSIÇÃO DE TESTE

    Fica relativa à posição
    inicial do jogador.
  */

  return [
    playerLongitude +
      (encounter.testOffset?.longitude ?? 0),

    playerLatitude +
      (encounter.testOffset?.latitude ?? 0),
  ];
}


export default function GameMap3D() {
  const navigate =
    useNavigate();

  const mapContainer =
    useRef(null);

  const mapRef =
    useRef(null);


  /*
    PLAYER
  */

  const playerTransformRef =
    useRef(null);


  /*
    ENCONTROS

    Guardamos posição e visibilidade
    individual de cada animal.
  */

  const encountersRef =
    useRef({});


  /*
    POPUP
  */

  const popupRef =
    useRef(null);


  /*
    PROGRESSO
  */

  const markAnimalFound =
    useProgressStore(
      (state) =>
        state.markAnimalFound
    );


  /*
    GPS
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


  /*
    ===================================
    CRIAÇÃO DO MAPA
    ===================================
  */

  useEffect(() => {
    if (mapRef.current) {
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
      INTERAÇÕES
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
      PERSPECTIVA PELO ZOOM
      ===================================
    */

    function atualizarPerspectiva() {
      const zoom =
        map.getZoom();

      const minZoom = 17;
      const maxZoom = 21;

      const minPitch = 35;
      const maxPitch = 70;

      const progress =
        (zoom - minZoom) /
        (maxZoom - minZoom);

      const pitch =
        minPitch +
        progress *
          (maxPitch - minPitch);

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
          MAPA / CORES / PRÉDIOS
          ===================================
        */

        const layers =
          map.getStyle().layers;

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
          PLAYER / GNOME
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

          rotateY: 0,

          rotateZ: 0,

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


          onAdd(map, gl) {
            this.camera =
              new THREE.Camera();

            this.scene =
              new THREE.Scene();


            const hemisphereLight =
              new THREE.HemisphereLight(
                0xffffff,
                0x444444,
                2
              );

            this.scene.add(
              hemisphereLight
            );


            const directionalLight =
              new THREE.DirectionalLight(
                0xffffff,
                2
              );

            directionalLight
              .position
              .set(
                0,
                -70,
                100
              );

            this.scene.add(
              directionalLight
            );


            const loader =
              new GLTFLoader();


            loader.load(
              `${import.meta.env.BASE_URL}models/gnome.glb`,

              (gltf) => {
                console.log(
                  'GNOME CARREGOU!'
                );

                gltf.scene.scale.set(
                  1,
                  1,
                  1
                );

                this.scene.add(
                  gltf.scene
                );

                map.triggerRepaint();
              },

              undefined,

              (error) => {
                console.error(
                  'ERRO AO CARREGAR GNOME:',
                  error
                );
              }
            );


            this.renderer =
              new THREE.WebGLRenderer({
                canvas:
                  map.getCanvas(),

                context: gl,

                antialias: true,
              });


            this.renderer.autoClear =
              false;
          },


          render(gl, args) {
            const rotationX =
              new THREE.Matrix4()
                .makeRotationX(
                  playerTransform.rotateX
                );

            const rotationY =
              new THREE.Matrix4()
                .makeRotationY(
                  playerTransform.rotateY
                );

            const rotationZ =
              new THREE.Matrix4()
                .makeRotationZ(
                  playerTransform.rotateZ
                );


            const m =
              new THREE.Matrix4()
                .fromArray(
                  args
                    .defaultProjectionData
                    .mainMatrix
                );


            const l =
              new THREE.Matrix4()
                .makeTranslation(
                  playerTransform.translateX,
                  playerTransform.translateY,
                  playerTransform.translateZ
                )

                .scale(
                  new THREE.Vector3(
                    playerTransform.scale,
                    -playerTransform.scale,
                    playerTransform.scale
                  )
                )

                .multiply(
                  rotationX
                )

                .multiply(
                  rotationY
                )

                .multiply(
                  rotationZ
                );


            this.camera
              .projectionMatrix =
              m.multiply(l);


            this.renderer
              .resetState();


            this.renderer.render(
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
          FUNÇÃO GENÉRICA DO POPUP
          ===================================
        */

        function abrirEncontro(
          encounter,
          encounterPosition
        ) {
          popupRef.current
            ?.remove();


          const popupContent =
            document.createElement(
              'div'
            );


          popupContent.style.minWidth =
            '180px';


          const title =
            document.createElement(
              'strong'
            );


          title.textContent =
            encounter.name;


          const text =
            document.createElement(
              'p'
            );


          text.textContent =
            `Você encontrou: ${encounter.name}!`;


          text.style.margin =
            '8px 0';


          const button =
            document.createElement(
              'button'
            );


          button.textContent =
            'Observar em AR';


          button.style.cursor =
            'pointer';


          button.style.padding =
            '8px 12px';


          button.addEventListener(
            'click',
            () => {
              popupRef.current
                ?.remove();


              /*
                activeEncounterId já é salvo
                quando o animal é encontrado.
              */

              navigate('/ar');
            }
          );


          popupContent.appendChild(
            title
          );

          popupContent.appendChild(
            text
          );

          popupContent.appendChild(
            button
          );


          popupRef.current =
            new maplibregl.Popup({
              offset: 35,

              closeButton:
                true,
            })

              .setLngLat(
                encounterPosition
              )

              .setDOMContent(
                popupContent
              )

              .addTo(map);
        }


        /*
          ===================================
          CRIA TODOS OS ANIMAIS
          ===================================
        */

        encounters
          .filter(
            (encounter) =>
              encounter.type ===
              'animal'
          )

          .forEach(
            (
              encounter,
              index
            ) => {

              /*
                POSIÇÃO
              */

              const encounterPosition =
                getEncounterPosition(
                  encounter,
                  latitude,
                  longitude
                );


              /*
                MERCATOR
              */

              const encounterMercator =
                maplibregl
                  .MercatorCoordinate
                  .fromLngLat(
                    encounterPosition,
                    0
                  );


              /*
                TRANSFORM
              */

              const encounterTransform = {
                translateX:
                  encounterMercator.x,

                translateY:
                  encounterMercator.y,

                translateZ:
                  encounterMercator.z,

                rotateX:
                  Math.PI / 2,

                rotateY:
                  0,

                rotateZ:
                  0,

                scale:
                  encounterMercator
                    .meterInMercatorCoordinateUnits() *
                  (encounter.mapScale ?? 1),
              };


              /*
                Guarda o estado
                individual do animal.
              */

              encountersRef.current[
                encounter.id
              ] = {
                position:
                  encounterPosition,

                transform:
                  encounterTransform,

                visible:
                  false,

                model:
                  null,
              };


              /*
                ===================================
                LAYER DO ANIMAL
                ===================================
              */

              const encounterLayer = {
                id:
                  `encounter-${encounter.id}`,

                type:
                  'custom',

                renderingMode:
                  '3d',


                onAdd(map, gl) {
                  this.camera =
                    new THREE.Camera();


                  this.scene =
                    new THREE.Scene();


                  this.model =
                    null;


                  this.raycaster =
                    new THREE.Raycaster();


                  const hemisphereLight =
                    new THREE.HemisphereLight(
                      0xffffff,
                      0x444444,
                      2.5
                    );


                  this.scene.add(
                    hemisphereLight
                  );


                  const directionalLight =
                    new THREE.DirectionalLight(
                      0xffffff,
                      2
                    );


                  directionalLight
                    .position
                    .set(
                      0,
                      -70,
                      100
                    );


                  this.scene.add(
                    directionalLight
                  );


                  /*
                    CARREGA O MODELO
                  */

                  const loader =
                    new GLTFLoader();


                  loader.load(
                    `${import.meta.env.BASE_URL}models/${encounter.model}`,

                    (gltf) => {
                      console.log(
                        `${encounter.name} CARREGOU!`
                      );


                      this.model =
                        gltf.scene;


                      encountersRef.current[
                        encounter.id
                      ].model =
                        this.model;


                      this.scene.add(
                        this.model
                      );


                      map.triggerRepaint();
                    },

                    undefined,

                    (error) => {
                      console.error(
                        `ERRO AO CARREGAR ${encounter.name}:`,
                        error
                      );
                    }
                  );


                  /*
                    RENDERER
                  */

                  this.renderer =
                    new THREE.WebGLRenderer({
                      canvas:
                        map.getCanvas(),

                      context:
                        gl,

                      antialias:
                        true,
                    });


                  this.renderer.autoClear =
                    false;


                  /*
                    ===================================
                    CLIQUE
                    ===================================
                  */

                  this.handleClick =
                    (event) => {

                      const encounterState =
                        encountersRef.current[
                          encounter.id
                        ];


                      if (
                        !encounterState
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


                      const inverseProjection =
                        this.camera
                          .projectionMatrix
                          .clone()
                          .invert();


                      const nearPoint =
                        new THREE.Vector3(
                          mouseX,
                          mouseY,
                          -1
                        ).applyMatrix4(
                          inverseProjection
                        );


                      const farPoint =
                        new THREE.Vector3(
                          mouseX,
                          mouseY,
                          1
                        ).applyMatrix4(
                          inverseProjection
                        );


                      const direction =
                        farPoint
                          .clone()
                          .sub(
                            nearPoint
                          )
                          .normalize();


                      this.raycaster.set(
                        nearPoint,
                        direction
                      );


                      const intersections =
                        this.raycaster
                          .intersectObject(
                            this.model,
                            true
                          );


                      if (
                        intersections.length >
                        0
                      ) {
                        console.log(
                          'ANIMAL ENCONTRADO:',
                          encounter.id
                        );


                        markAnimalFound(
                          encounter.id
                        );


                        abrirEncontro(
                          encounter,
                          encounterPosition
                        );
                      }
                    };


                  map.on(
                    'click',
                    this.handleClick
                  );
                },


                render(gl, args) {

                  const encounterState =
                    encountersRef.current[
                      encounter.id
                    ];


                  if (
                    !encounterState
                      ?.visible
                  ) {
                    return;
                  }


                  const transform =
                    encounterState
                      .transform;


                  const rotationX =
                    new THREE.Matrix4()
                      .makeRotationX(
                        transform.rotateX
                      );


                  const rotationY =
                    new THREE.Matrix4()
                      .makeRotationY(
                        transform.rotateY
                      );


                  const rotationZ =
                    new THREE.Matrix4()
                      .makeRotationZ(
                        transform.rotateZ
                      );


                  const m =
                    new THREE.Matrix4()
                      .fromArray(
                        args
                          .defaultProjectionData
                          .mainMatrix
                      );


                  const l =
                    new THREE.Matrix4()

                      .makeTranslation(
                        transform.translateX,
                        transform.translateY,
                        transform.translateZ
                      )

                      .scale(
                        new THREE.Vector3(
                          transform.scale,
                          -transform.scale,
                          transform.scale
                        )
                      )

                      .multiply(
                        rotationX
                      )

                      .multiply(
                        rotationY
                      )

                      .multiply(
                        rotationZ
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


                  this.renderer.render(
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


              /*
                Adiciona a layer
              */

              map.addLayer(
                encounterLayer
              );


              /*
                ===================================
                VISIBILIDADE INICIAL
                ===================================
              */

              const distance =
                calcularDistancia(
                  latitude,
                  longitude,

                  encounterPosition[1],
                  encounterPosition[0]
                );


              encountersRef.current[
                encounter.id
              ].visible =
                distance <=
                (encounter.radius ?? 30);

            }
          );


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
    };
  }, [
    navigate,
    markAnimalFound,
  ]);


  /*
    ===================================
    GPS / MOVIMENTO
    ===================================
  */

  useEffect(() => {

    if (
      !mapRef.current
    ) {
      return;
    }


    /*
      CENTRALIZA NO PLAYER
    */

    mapRef.current.easeTo({
      center: [
        longitude,
        latitude,
      ],

      duration: 700,
    });


    /*
      ===================================
      PLAYER
      ===================================
    */

    if (
      playerTransformRef.current
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


      playerTransformRef.current
        .translateX =
        position.x;


      playerTransformRef.current
        .translateY =
        position.y;


      playerTransformRef.current
        .translateZ =
        position.z;


      playerTransformRef.current
        .scale =
        position
          .meterInMercatorCoordinateUnits();


      /*
        Temporariamente sem heading.
      */

      playerTransformRef.current
        .rotateZ = 0;
    }


    /*
      ===================================
      PROXIMIDADE DOS ANIMAIS
      ===================================
    */

    encounters.forEach(
      (encounter) => {

        const encounterState =
          encountersRef.current[
            encounter.id
          ];


        if (
          !encounterState
        ) {
          return;
        }


        const [
          encounterLongitude,
          encounterLatitude,
        ] =
          encounterState.position;


        const distance =
          calcularDistancia(
            latitude,
            longitude,

            encounterLatitude,
            encounterLongitude
          );


        encounterState.visible =
          distance <=
          (encounter.radius ?? 30);

      }
    );


    /*
      Se o jogador saiu do raio
      do animal cujo popup está aberto,
      por enquanto fechamos qualquer popup.
    */

    if (
      popupRef.current
    ) {

      const popupPosition =
        popupRef.current
          .getLngLat();


      const popupDistance =
        calcularDistancia(
          latitude,
          longitude,

          popupPosition.lat,
          popupPosition.lng
        );


      if (
        popupDistance >
        30
      ) {
        popupRef.current
          .remove();
      }
    }


    mapRef.current
      .triggerRepaint();

  }, [
    latitude,
    longitude,
  ]);


  return (
    <div
      ref={mapContainer}

      style={{
        width:
          '100%',

        height:
          '100%',
      }}
    />
  );
}