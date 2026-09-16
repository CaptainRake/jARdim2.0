import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { usePlayerStore } from '../../stores/playerStore';

const ENCOUNTER_RADIUS = 30;
const CAPYBARA_SCALE = 6;

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
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

export default function GameMap3D() {
  const navigate = useNavigate();

  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const modelTransformRef = useRef(null);

  const encounterPositionRef = useRef(null);
  const encounterVisibleRef = useRef(false);

  const popupRef = useRef(null);

  const latitude = usePlayerStore(
    (state) => state.latitude
  );

  const longitude = usePlayerStore(
    (state) => state.longitude
  );

  const hasRealPosition = usePlayerStore(
    (state) => state.hasRealPosition
  );

  const heading = usePlayerStore(
    (state) => state.heading
  );

  useEffect(() => {
    if (mapRef.current) return;
    if (!hasRealPosition) return;

    /*
      CAPIVARA DE TESTE

      Aproximadamente 12 m ao norte
      da posição inicial.
    */
    const encounterPosition = [
      longitude,
      latitude + 0.00011,
    ];

    encounterPositionRef.current =
      encounterPosition;

    const map = new maplibregl.Map({
      container: mapContainer.current,

      style:
        'https://tiles.openfreemap.org/styles/liberty',

      center: [longitude, latitude],

      zoom: 19,
      minZoom: 17,
      maxZoom: 21,

      pitch: 60,
      bearing: 0,

      canvasContextAttributes: {
        antialias: true,
      },
    });

    mapRef.current = map;

    map.on('style.load', () => {
      /*
        ===================================
        PRÉDIOS
        ===================================
      */

      const layers = map.getStyle().layers;

      layers.forEach((layer) => {
        if (layer.type === 'fill-extrusion') {
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
      });

      /*
        ===================================
        PLAYER / GNOME
        ===================================
      */

      const modelOrigin = [
        longitude,
        latitude,
      ];

      const modelMercator =
        maplibregl.MercatorCoordinate.fromLngLat(
          modelOrigin,
          0
        );

      const modelTransform = {
        translateX:
          modelMercator.x,

        translateY:
          modelMercator.y,

        translateZ:
          modelMercator.z,

        rotateX:
          Math.PI / 2,

        rotateY: 0,

        rotateZ: 0,

        scale:
          modelMercator.meterInMercatorCoordinateUnits(),
      };

      modelTransformRef.current =
        modelTransform;

      const playerLayer = {
        id: 'player-model',

        type: 'custom',

        renderingMode: '3d',

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

          directionalLight.position.set(
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
                modelTransform.rotateX
              );

          const rotationY =
            new THREE.Matrix4()
              .makeRotationY(
                modelTransform.rotateY
              );

          const rotationZ =
            new THREE.Matrix4()
              .makeRotationZ(
                modelTransform.rotateZ
              );

          const m =
            new THREE.Matrix4().fromArray(
              args
                .defaultProjectionData
                .mainMatrix
            );

          const l =
            new THREE.Matrix4()
              .makeTranslation(
                modelTransform.translateX,
                modelTransform.translateY,
                modelTransform.translateZ
              )

              .scale(
                new THREE.Vector3(
                  modelTransform.scale,
                  -modelTransform.scale,
                  modelTransform.scale
                )
              )

              .multiply(rotationX)
              .multiply(rotationY)
              .multiply(rotationZ);

          this.camera.projectionMatrix =
            m.multiply(l);

          this.renderer.resetState();

          this.renderer.render(
            this.scene,
            this.camera
          );

          map.triggerRepaint();
        },

        onRemove() {
          this.renderer?.dispose();
        },
      };

      map.addLayer(playerLayer);

      /*
        ===================================
        CAPIVARA
        ===================================
      */

      const capybaraMercator =
        maplibregl.MercatorCoordinate.fromLngLat(
          encounterPosition,
          0
        );

      const capybaraTransform = {
        translateX:
          capybaraMercator.x,

        translateY:
          capybaraMercator.y,

        translateZ:
          capybaraMercator.z,

        rotateX:
          Math.PI / 2,

        rotateY: 0,

        rotateZ: 0,

        scale:
          capybaraMercator.meterInMercatorCoordinateUnits() *
          CAPYBARA_SCALE,
      };

      /*
        ===================================
        FUNÇÃO DO POPUP
        ===================================
      */

      function abrirEncontro() {
        popupRef.current?.remove();

        const popupContent =
          document.createElement('div');

        popupContent.style.minWidth =
          '180px';

        const title =
          document.createElement(
            'strong'
          );

        title.textContent =
          'Capivara';

        const text =
          document.createElement('p');

        text.textContent =
          'Você encontrou uma capivara!';

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
            popupRef.current?.remove();

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
            closeButton: true,
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
        LAYER DA CAPIVARA
        ===================================
      */

      const capybaraLayer = {
        id: 'capybara-model',

        type: 'custom',

        renderingMode: '3d',

        onAdd(map, gl) {
          this.camera =
            new THREE.Camera();

          this.scene =
            new THREE.Scene();

          this.model = null;

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

          directionalLight.position.set(
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
            `${import.meta.env.BASE_URL}models/capybara.glb`,

            (gltf) => {
              console.log(
                'CAPIVARA CARREGOU!'
              );

              this.model =
                gltf.scene;

              this.scene.add(
                this.model
              );

              map.triggerRepaint();
            },

            undefined,

            (error) => {
              console.error(
                'ERRO AO CARREGAR CAPIVARA:',
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

          /*
            ===================================
            CLIQUE REAL NO MODELO 3D
            ===================================
          */

          this.handleClick = (event) => {
            if (!encounterVisibleRef.current) {
              return;
            }

            if (!this.model) {
              return;
            }

            const canvas = map.getCanvas();

            const mouseX =
              (event.point.x / canvas.clientWidth) * 2 - 1;

            const mouseY =
              -(event.point.y / canvas.clientHeight) * 2 + 1;
              /*
                A câmera do custom layer
                contém toda a matriz do
                MapLibre + posição do modelo.

                Então usamos a inversa dela
                para transformar o clique
                em um raio no espaço local
                da capivara.
              */

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
                  .sub(nearPoint)
                  .normalize();

              this.raycaster.set(
                nearPoint,
                direction
              );

              /*
                true = procura também
                nos filhos do GLB.
              */
              const intersections =
                this.raycaster.intersectObject(
                  this.model,
                  true
                );

              if (
                intersections.length > 0
              ) {
                console.log(
                  'CAPIVARA CLICADA!'
                );

                abrirEncontro();
              }
            };

          map.on(
            'click',
            this.handleClick
          );
        },

        render(gl, args) {
          if (
            !encounterVisibleRef.current
          ) {
            return;
          }

          const rotationX =
            new THREE.Matrix4()
              .makeRotationX(
                capybaraTransform.rotateX
              );

          const rotationY =
            new THREE.Matrix4()
              .makeRotationY(
                capybaraTransform.rotateY
              );

          const rotationZ =
            new THREE.Matrix4()
              .makeRotationZ(
                capybaraTransform.rotateZ
              );

          const m =
            new THREE.Matrix4().fromArray(
              args
                .defaultProjectionData
                .mainMatrix
            );

          const l =
            new THREE.Matrix4()
              .makeTranslation(
                capybaraTransform.translateX,
                capybaraTransform.translateY,
                capybaraTransform.translateZ
              )

              .scale(
                new THREE.Vector3(
                  capybaraTransform.scale,
                  -capybaraTransform.scale,
                  capybaraTransform.scale
                )
              )

              .multiply(rotationX)
              .multiply(rotationY)
              .multiply(rotationZ);

          this.camera.projectionMatrix =
            m.multiply(l);

          /*
            Precisamos da matriz atualizada
            para detectar o clique.
          */
          this.camera
            .projectionMatrixInverse
            .copy(
              this.camera
                .projectionMatrix
            )
            .invert();

          this.renderer.resetState();

          this.renderer.render(
            this.scene,
            this.camera
          );

          map.triggerRepaint();
        },

        onRemove(map) {
          if (this.handleClick) {
            map.off(
              'click',
              this.handleClick
            );
          }

          this.renderer?.dispose();
        },
      };

      map.addLayer(
        capybaraLayer
      );

      /*
        ===================================
        PROXIMIDADE INICIAL
        ===================================
      */

      const distanciaInicial =
        calcularDistancia(
          latitude,
          longitude,

          encounterPosition[1],
          encounterPosition[0]
        );

      encounterVisibleRef.current =
        distanciaInicial <=
        ENCOUNTER_RADIUS;

      map.triggerRepaint();
    });

    return () => {
      popupRef.current?.remove();

      map.remove();

      mapRef.current = null;
    };
  }, [
    hasRealPosition,
    navigate,
  ]);

  /*
    ===================================
    GPS / MOVIMENTO
    ===================================
  */

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.easeTo({
      center: [
        longitude,
        latitude,
      ],

      zoom: 19,

      pitch: 60,

      padding: {
        top: 180,
        bottom: 40,
        left: 0,
        right: 0,
      },

      duration: 700,
    });

    /*
      PLAYER
    */

    if (
      modelTransformRef.current
    ) {
      const position =
        maplibregl.MercatorCoordinate.fromLngLat(
          [
            longitude,
            latitude,
          ],

          0
        );

      modelTransformRef.current.translateX =
        position.x;

      modelTransformRef.current.translateY =
        position.y;

      modelTransformRef.current.translateZ =
        position.z;

      modelTransformRef.current.scale =
        position.meterInMercatorCoordinateUnits();

      const headingRadians =
        THREE.MathUtils.degToRad(
          heading
        );

      modelTransformRef.current.rotateZ =
        -headingRadians;
    }

    /*
      ===================================
      PROXIMIDADE DA CAPIVARA
      ===================================
    */

    if (
      encounterPositionRef.current
    ) {
      const [
        encounterLongitude,
        encounterLatitude,
      ] =
        encounterPositionRef.current;

      const distance =
        calcularDistancia(
          latitude,
          longitude,

          encounterLatitude,
          encounterLongitude
        );

      const visible =
        distance <=
        ENCOUNTER_RADIUS;

      encounterVisibleRef.current =
        visible;

      /*
        Saiu do raio:
        fecha o popup.
      */
      if (
        !visible &&
        popupRef.current
      ) {
        popupRef.current.remove();
      }
    }

    mapRef.current.triggerRepaint();
  }, [
    latitude,
    longitude,
    heading,
  ]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
}