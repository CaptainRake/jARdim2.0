import { useEffect, useMemo, useState } from 'react';
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

  const step = tutorialSteps[tutorialStep];

  const [targetRect, setTargetRect] =
    useState(null);

  useEffect(() => {
    if (!step?.target) return;

    function updateTarget() {
      const element =
        document.querySelector(
          `[data-tutorial="${step.target}"]`
        );

      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect =
        element.getBoundingClientRect();

      setTargetRect(rect);
    }

    updateTarget();

    window.addEventListener(
      'resize',
      updateTarget
    );

    return () => {
      window.removeEventListener(
        'resize',
        updateTarget
      );
    };
  }, [step]);

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

  const overlayParts = useMemo(() => {
    if (!targetRect) return null;

    const padding = 12;

    const top =
      Math.max(targetRect.top - padding, 0);

    const left =
      Math.max(targetRect.left - padding, 0);

    const right =
      Math.min(
        targetRect.right + padding,
        window.innerWidth
      );

    const bottom =
      Math.min(
        targetRect.bottom + padding,
        window.innerHeight
      );

    return {
      top,
      left,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }, [targetRect]);

  if (!step) return null;

  return (
    <div className="tutorial-overlay">
      {overlayParts && (
        <>
          <div
            className="tutorial-shade tutorial-shade-top"
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: overlayParts.top,
            }}
          />

          <div
            className="tutorial-shade tutorial-shade-left"
            style={{
              top: overlayParts.top,
              left: 0,
              width: overlayParts.left,
              height: overlayParts.height,
            }}
          />

          <div
            className="tutorial-shade tutorial-shade-right"
            style={{
              top: overlayParts.top,
              left: overlayParts.right,
              width:
                window.innerWidth -
                overlayParts.right,
              height: overlayParts.height,
            }}
          />

          <div
            className="tutorial-shade tutorial-shade-bottom"
            style={{
              top: overlayParts.bottom,
              left: 0,
              width: '100%',
              height:
                window.innerHeight -
                overlayParts.bottom,
            }}
          />

          <div
            className="tutorial-highlight"
            style={{
              top: overlayParts.top,
              left: overlayParts.left,
              width: overlayParts.width,
              height: overlayParts.height,
            }}
          />
        </>
      )}

      {!overlayParts && (
        <div className="tutorial-shade tutorial-fullshade" />
      )}

      <div
        className={`tutorial-card tutorial-card-${step.cardPosition || 'bottom'}`}
      >
        <p>{step.text}</p>

        <button onClick={continueTutorial}>
          {isLast
            ? 'Começar a explorar'
            : 'Próximo'}
        </button>
      </div>
    </div>
  );
}