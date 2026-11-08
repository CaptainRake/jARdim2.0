import { tutorialSteps } from '../../data/tutorialSteps';

import { useOnboardingStore } from '../../stores/onboardingStore';

export default function TutorialOverlay() {
  const tutorialStep =
    useOnboardingStore(
      (state) => state.tutorialStep
    );

  const nextTutorialStep =
    useOnboardingStore(
      (state) => state.nextTutorialStep
    );

  const completeTutorial =
    useOnboardingStore(
      (state) => state.completeTutorial
    );

  const step =
    tutorialSteps[tutorialStep];

  if (!step) {
    return null;
  }

  const isLast =
    tutorialStep ===
    tutorialSteps.length - 1;

  function continueTutorial() {
    if (isLast) {
      completeTutorial();
      return;
    }

    nextTutorialStep();
  }

  return (
    <div className="tutorial-overlay">

      <div className="tutorial-card">

        <p>
          {step.text}
        </p>

        <button
          onClick={continueTutorial}
        >
          {isLast
            ? 'Começar a explorar'
            : 'Próximo'}
        </button>

      </div>

    </div>
  );
}