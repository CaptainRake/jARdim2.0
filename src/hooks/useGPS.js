import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';

export function useGPS() {
  const updatePosition = usePlayerStore(
    (state) => state.updatePosition
  );

  const setGpsError = usePlayerStore(
    (state) => state.setGpsError
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Este dispositivo não possui suporte a GPS.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          heading,
          speed,
          accuracy,
        } = position.coords;

        updatePosition({
          latitude,
          longitude,
          heading,
          speed,
          accuracy,
        });
      },

      (error) => {
        const errorMessages = {
          1: 'Permissão de localização negada.',
          2: 'Não foi possível encontrar sua localização.',
          3: 'O GPS demorou demais para responder.',
        };

        setGpsError(
          errorMessages[error.code] ||
            'Ocorreu um erro ao acessar o GPS.'
        );
      },

      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setGpsError, updatePosition]);
}