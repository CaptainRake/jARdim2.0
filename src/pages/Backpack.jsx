import { useNavigate } from 'react-router-dom';

export default function Backpack() {
  const navigate = useNavigate();

  const asset = (name) =>
    `${import.meta.env.BASE_URL}ui/backpack/${name}`;

  return (
    <main className="backpack-screen">

      {/* FUNDO DA MOCHILA */}

      <img
        src={asset('Backpack_BG_OrangeYellow.svg')}
        className="backpack-background"
        alt=""
      />


      {/* MAPA */}

      <button
        className="backpack-item backpack-map"
        onClick={() => navigate('/home')}
        aria-label="Mapa"
      >
        <img
          src={asset('Map.svg')}
          alt=""
        />
      </button>


      {/* GUIA DE CAMPO */}

      <button
        className="backpack-item backpack-guide"
        onClick={() => navigate('/guide')}
        aria-label="Guia de Campo"
      >
        <img
          src={asset('FieldGuide.svg')}
          alt=""
        />
      </button>


      {/* DISTINTIVOS */}

      <button
        className="backpack-item backpack-badges"
        onClick={() => navigate('/challenges')}
        aria-label="Distintivos"
      >
        <img
          src={asset('BadgesButton.svg')}
          alt=""
        />
      </button>


      {/* ID */}

      <button
        className="backpack-item backpack-id"
        onClick={() => navigate('/profile')}
        aria-label="Identificação"
      >
        <img
          src={asset('ID.svg')}
          alt=""
        />
      </button>


      {/* FECHAR */}

      <button
        className="backpack-close"
        onClick={() => navigate('/home')}
        aria-label="Fechar mochila"
      >
        <img
          src={asset('CloseBackpack.svg')}
          alt=""
        />
      </button>

    </main>
  );
}