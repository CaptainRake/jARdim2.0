import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import '@google/model-viewer';

import {
  encounters,
} from '../data/encounters';

import {
  useProgressStore,
} from '../stores/progressStore';


export default function AR() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();


  /*
    ===================================
    ANIMAL SELECIONADO
    ===================================
  */

  const animalId =
    searchParams.get(
      'animal'
    );


  const encounter =
    encounters.find(
      (item) =>
        item.id ===
        animalId
    );


  const registerDiscovery =
    useProgressStore(
      (state) =>
        state.registerDiscovery
    );


  /*
    ===================================
    SEGURANÇA
    ===================================
  */

  if (!encounter) {
    return (
      <main
        className="ar-page"
        style={{
          display: 'flex',
          flexDirection:
            'column',
          alignItems:
            'center',
          justifyContent:
            'center',
          gap: '16px',
          padding: '24px',
        }}
      >
        <p>
          Nenhum animal selecionado.
        </p>

        <button
          onClick={() =>
            navigate('/home')
          }
        >
          Voltar ao mapa
        </button>
      </main>
    );
  }


  /*
    ===================================
    REGISTRAR DESCOBERTA
    ===================================
  */

  function handleRegister() {
    registerDiscovery(
      encounter.id
    );

    navigate(
      `/discovery?animal=${encounter.id}`
    );
  }


  return (
    <main
      className="ar-page"
      style={{
        position:
          'relative',

        width:
          '100%',

        height:
          '100dvh',

        overflow:
          'hidden',

        background:
          '#dcefcf',
      }}
    >

      {/*
        ===================================
        MODEL VIEWER
        ===================================
      */}

      <model-viewer
        key={
          encounter.id
        }

        src={
          `${import.meta.env.BASE_URL}models/${encounter.model}`
        }

        ios-src={
          `${import.meta.env.BASE_URL}models/${encounter.arModel}`
        }

        alt={
          `Modelo 3D de ${encounter.name}`
        }

        ar

        ar-modes="quick-look webxr scene-viewer"

        ar-placement="floor"

        ar-scale="fixed"

        camera-controls

        shadow-intensity="1"

        exposure="1"

        touch-action="pan-y"

        style={{
          width:
            '100%',

          height:
            '100%',

          background:
            '#dcefcf',
        }}
      >

        {/*
          ===================================
          BOTÃO AR
          ===================================
        */}

        <button
          slot="ar-button"

          style={{
            position:
              'absolute',

            left:
              '50%',

            bottom:
              '115px',

            transform:
              'translateX(-50%)',

            zIndex:
              50,

            minWidth:
              '150px',

            minHeight:
              '48px',

            padding:
              '12px 20px',

            border:
              'none',

            borderRadius:
              '999px',

            background:
              '#ffffff',

            color:
              '#222222',

            fontSize:
              '16px',

            fontWeight:
              '700',

            cursor:
              'pointer',
          }}
        >
          Ver em AR
        </button>

      </model-viewer>


      {/*
        ===================================
        VOLTAR
        ===================================
      */}

      <button
        className="ar-back"

        onClick={() =>
          navigate('/home')
        }

        style={{
          zIndex:
            100,
        }}
      >
        ←
      </button>


      {/*
        ===================================
        GUIA
        ===================================
      */}

      <button
        className="ar-roll"

        onClick={() =>
          navigate('/guide')
        }

        style={{
          zIndex:
            100,
        }}
      >
        🖼️
      </button>


      {/*
        ===================================
        REGISTRAR
        ===================================
      */}

      <button
        className="ar-shutter"

        onClick={
          handleRegister
        }

        aria-label={
          `Registrar ${encounter.name}`
        }

        style={{
          zIndex:
            100,
        }}
      >
        📷
      </button>

    </main>
  );
}