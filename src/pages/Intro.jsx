import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { introDialog } from '../data/introDialog';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function Intro() {
  const navigate = useNavigate();

  const [dialogIndex, setDialogIndex] =
    useState(0);

  const completeIntro =
    useOnboardingStore(
      (state) => state.completeIntro
    );

  const dialog =
    introDialog[dialogIndex];

  function nextDialog() {
    const isLast =
      dialogIndex ===
      introDialog.length - 1;

    if (isLast) {
      completeIntro();

      navigate('/home');

      return;
    }

    setDialogIndex(
      (current) => current + 1
    );
  }

  return (
    <main className="intro-screen">

      <div className="guide-placeholder">
        GUIA
      </div>

      <div className="intro-dialog">

        <p>
          {dialog.text}
        </p>

        <button
          onClick={nextDialog}
        >
          {dialogIndex ===
          introDialog.length - 1
            ? 'Vamos lá!'
            : 'Continuar'}
        </button>

      </div>

    </main>
  );
}