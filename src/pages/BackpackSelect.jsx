import { useNavigate } from 'react-router-dom';

import { backpacks } from '../data/backpacks';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function BackpackSelect() {
  const navigate = useNavigate();

  const selectedBackpack =
    useOnboardingStore(
      (state) => state.selectedBackpack
    );

  const selectBackpack =
    useOnboardingStore(
      (state) => state.selectBackpack
    );

  function handleContinue() {
    if (!selectedBackpack) return;

    navigate('/intro');
  }

  return (
    <main className="backpack-select-screen">

      <h1>Escolha sua mochila</h1>

      <p>
        Ela vai acompanhar você durante suas explorações.
      </p>

      <div className="backpack-options">

        {backpacks.map((backpack) => (
          <button
            key={backpack.id}
            className={
              selectedBackpack === backpack.id
                ? 'backpack-option selected'
                : 'backpack-option'
            }
            onClick={() =>
              selectBackpack(backpack.id)
            }
          >
            <img
              src={`${import.meta.env.BASE_URL}ui/hud/${backpack.icon}`}
              alt={backpack.name}
            />

            <span>
              {backpack.name}
            </span>
          </button>
        ))}

      </div>

      <button
        disabled={!selectedBackpack}
        onClick={handleContinue}
      >
        Continuar
      </button>

    </main>
  );
}