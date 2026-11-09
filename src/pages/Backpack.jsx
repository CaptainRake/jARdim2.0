import { useNavigate } from 'react-router-dom';

import { backpacks } from '../data/backpacks';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function Backpack() {
  const navigate = useNavigate();

  const selectedBackpack =
    useOnboardingStore(
      (state) =>
        state.selectedBackpack
    );

  const backpack =
    backpacks.find(
      (item) =>
        item.id === selectedBackpack
    ) ?? backpacks[0];

  return (
    <main className="backpack-page">

      {/* FUNDO DA MOCHILA SELECIONADA */}
      <img
        className="backpack-background"
        src={
          `${import.meta.env.BASE_URL}ui/backpack/${backpack.background}`
        }
        alt={`Mochila ${backpack.name}`}
      />


      {/* FECHAR */}
      <button
        type="button"
        className="backpack-close"
        onClick={() =>
          navigate('/home')
        }
        aria-label="Fechar mochila"
      >
        <img
          src={
            `${import.meta.env.BASE_URL}ui/backpack/CloseBackpack.svg`
          }
          alt=""
        />
      </button>


      {/* MAPA */}
      <button
        type="button"
        className="backpack-map backpack-item"
        onClick={() =>
          navigate('/home')
        }
        aria-label="Abrir mapa"
      >
        <img
          src={
            `${import.meta.env.BASE_URL}ui/backpack/Map.svg`
          }
          alt="Mapa"
        />
      </button>


      {/* GUIA DE CAMPO */}
      <button
        type="button"
        className="backpack-guide backpack-item"
        onClick={() =>
          navigate('/guide')
        }
        aria-label="Abrir Guia de Campo"
      >
        <img
          src={
            `${import.meta.env.BASE_URL}ui/backpack/FieldGuide.svg`
          }
          alt="Guia de Campo"
        />
      </button>


      {/* DISTINTIVOS */}
      <button
        type="button"
        className="backpack-badges backpack-item"
        onClick={() =>
          navigate('/challenges')
        }
        aria-label="Abrir distintivos"
      >
        <img
          src={
            `${import.meta.env.BASE_URL}ui/backpack/BadgesButton.svg`
          }
          alt="Distintivos"
        />
      </button>


      {/* IDENTIFICAÇÃO */}
      <button
        type="button"
        className="backpack-id backpack-item"
        onClick={() =>
          navigate('/profile')
        }
        aria-label="Abrir identificação"
      >
        <img
          src={
            `${import.meta.env.BASE_URL}ui/backpack/ID.svg`
          }
          alt="Identificação"
        />
      </button>

    </main>
  );
}