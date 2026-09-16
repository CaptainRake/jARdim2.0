import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const splashRef = useRef(null);

  const [phase, setPhase] = useState('game');

  useEffect(() => {
    const institutionalTimer = setTimeout(() => {
      setPhase('institutional');
    }, 2500);

    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 5000);

    const navigateTimer = setTimeout(() => {
      navigate('/enter');
    }, 5600);

    return () => {
      clearTimeout(institutionalTimer);
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  useEffect(() => {
    const splash = splashRef.current;

    if (!splash) return;

    let animationFrame;

    function handlePointerMove(event) {
      const rect = splash.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        rect.width;

      const y =
        (event.clientY - rect.top) /
        rect.height;

      const offsetX =
        (x - 0.5) * 2;

      const offsetY =
        (y - 0.5) * 2;

      splash.style.setProperty(
        '--parallax-x',
        offsetX
      );

      splash.style.setProperty(
        '--parallax-y',
        offsetY
      );
    }

    function handlePointerLeave() {
      splash.style.setProperty(
        '--parallax-x',
        0
      );

      splash.style.setProperty(
        '--parallax-y',
        0
      );
    }

    const startTime =
      performance.now();

    function animate(time) {
      const elapsed =
        (time - startTime) / 1000;

      const autoX =
        Math.sin(elapsed * 0.45) *
        0.25;

      const autoY =
        Math.cos(elapsed * 0.35) *
        0.18;

      if (
        window.matchMedia(
          '(pointer: coarse)'
        ).matches
      ) {
        splash.style.setProperty(
          '--parallax-x',
          autoX
        );

        splash.style.setProperty(
          '--parallax-y',
          autoY
        );
      }

      animationFrame =
        requestAnimationFrame(
          animate
        );
    }

    splash.addEventListener(
      'pointermove',
      handlePointerMove
    );

    splash.addEventListener(
      'pointerleave',
      handlePointerLeave
    );

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      splash.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      splash.removeEventListener(
        'pointerleave',
        handlePointerLeave
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return (
    <main
      ref={splashRef}
      className="splash-screen"
    >
      <img
        src={`${import.meta.env.BASE_URL}splash/splash_bg.png`}
        className="splash-bg"
        alt=""
      />

      <img
        src={`${import.meta.env.BASE_URL}splash/splash_25.png`}
        className="splash-layer splash-layer-25"
        alt=""
      />

      <img
        src={`${import.meta.env.BASE_URL}splash/splash_50.png`}
        className="splash-layer splash-layer-50"
        alt=""
      />

      <img
        src={`${import.meta.env.BASE_URL}splash/splash_75.png`}
        className="splash-layer splash-layer-75"
        alt=""
      />

      <img
        src={`${import.meta.env.BASE_URL}splash/splash_100.png`}
        className="splash-layer splash-layer-100"
        alt=""
      />

      <div
        className={`splash-phase ${
          phase === 'game'
            ? 'splash-visible'
            : 'splash-hidden'
        }`}
      >
        <img
          src={`${import.meta.env.BASE_URL}splash/Logo_White.png`}
          className="splash-layer splash-logo-layer"
          alt="RE:brota"
        />
      </div>

      <div
        className={`splash-phase ${
          phase === 'institutional'
            ? 'splash-visible'
            : 'splash-hidden'
        }`}
      >
        <img
          src={`${import.meta.env.BASE_URL}splash/Logos_UFSM.png`}
          className="splash-layer splash-institutional-image"
          alt="UFSM, Jardim Botânico da UFSM e Desenho Industrial UFSM"
        />
      </div>
    </main>
  );
}