import { useNavigate } from 'react-router-dom';

import { backpacks } from '../data/backpacks';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function BackpackSelect() {
  const navigate =
    useNavigate();

  const selectedBackpack =
    useOnboardingStore(
      (state) =>
        state.selectedBackpack
    );

  const selectBackpack =
    useOnboardingStore(
      (state) =>
        state.selectBackpack
    );

  const startTutorial =
    useOnboardingStore(
      (state) =>
        state.startTutorial
    );

  const hasCompletedOnboarding =
    useOnboardingStore(
      (state) =>
        state.hasCompletedOnboarding
    );

  function handleContinue() {
    if (!selectedBackpack) {
      return;
    }

    if (!hasCompletedOnboarding) {
      startTutorial();
    }

    navigate('/home');
  }

  return (
    <main className="backpack-select-page">

      <header className="backpack-select-header">
        <h1>
          Escolha sua mochila
        </h1>

        <p>
          Ela vai acompanhar você durante suas explorações.
        </p>
      </header>

      <div className="backpack-options">
        {backpacks.map(
          (backpack) => {
            const isSelected =
              selectedBackpack ===
              backpack.id;

            return (
              <button
                key={backpack.id}
                type="button"
                className={
                  `backpack-option ${
                    isSelected
                      ? 'selected'
                      : ''
                  }`
                }
                onClick={() =>
                  selectBackpack(
                    backpack.id
                  )
                }
              >
                <img
                  src={
                    `${import.meta.env.BASE_URL}ui/hud/${backpack.icon}`
                  }
                  alt={
                    backpack.name
                  }
                />

                <span>
                  {backpack.name}
                </span>
              </button>
            );
          }
        )}
      </div>

      <div className="backpack-select-actions">
        <button
          type="button"
          className="backpack-continue"
          disabled={
            !selectedBackpack
          }
          onClick={
            handleContinue
          }
        >
          Continuar
        </button>
      </div>

    </main>
  );
}