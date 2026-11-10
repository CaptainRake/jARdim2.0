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

import {
  useEncounterStore,
} from '../stores/encounterStore';

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

  
  const endEncounter =
    useEncounterStore(
      (state) =>
        state.endEncounter
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
    registerDiscovery(encounter.id);

    endEncounter(encounter.id);

    navigate(`/guide?animal=${encounter.id}`);
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

        <button
          onClick={handleRegister}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '55px',
            transform: 'translateX(-50%)',

            zIndex: 50,

            minWidth: '180px',
            minHeight: '46px',

            padding: '12px 20px',

            border: 'none',
            borderRadius: '999px',

            background: '#ffffff',
            color: '#222222',

            fontSize: '15px',
            fontWeight: '700',

            cursor: 'pointer',
          }}
        >
          Registrar no guia
        </button>

      </model-viewer>

      <button
        className="ar-back"
        onClick={() =>
          navigate('/home')
        }
        aria-label="Voltar ao mapa"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',

          width: '48px',
          height: '48px',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          border: 'none',
          borderRadius: '50%',

          background: 'rgba(255,255,255,0.92)',
          color: '#222',

          fontSize: '26px',
          lineHeight: 1,

          zIndex: 1000,

          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        ←
      </button>

    </main>
  );
}