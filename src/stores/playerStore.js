import { create } from 'zustand';

const DEFAULT_POSITION = {
  latitude: -29.7169792,
  longitude: -53.729499,
};

export const usePlayerStore = create((set) => ({
  latitude: DEFAULT_POSITION.latitude,
  longitude: DEFAULT_POSITION.longitude,

  heading: 0,
  speed: 0,
  accuracy: null,

  hasRealPosition: false,
  isWalking: false,
  gpsError: null,

  updatePosition: ({
    latitude,
    longitude,
    heading,
    speed,
    accuracy,
  }) =>
    set((state) => ({
      latitude,
      longitude,

      // Se o GPS não informar uma nova direção,
      // mantém a última direção válida.
      heading: Number.isFinite(heading)
        ? heading
        : state.heading,

      speed: Number.isFinite(speed) ? speed : 0,

      accuracy: Number.isFinite(accuracy)
        ? accuracy
        : null,

      hasRealPosition: true,

      isWalking: Number.isFinite(speed)
        ? speed > 0.3
        : false,

      gpsError: null,
    })),

  setGpsError: (message) =>
    set({
      gpsError: message,
    }),

  resetPlayer: () =>
    set({
      latitude: DEFAULT_POSITION.latitude,
      longitude: DEFAULT_POSITION.longitude,
      heading: 0,
      speed: 0,
      accuracy: null,
      hasRealPosition: false,
      isWalking: false,
      gpsError: null,
    }),
}));