import GameMap3D from '../components/map/GameMap3D';
import GameHUD from '../components/ui/GameHUD';
import TutorialOverlay from '../components/ui/TutorialOverlay';

import { useGPS } from '../hooks/useGPS';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function Game() {
  useGPS();

  const hasCompletedTutorial =
    useOnboardingStore(
      (state) => state.hasCompletedTutorial
    );

  return (
    <main className="game-screen">
      <GameMap3D />

      <div
        className="tutorial-map-anchor"
        data-tutorial="map-center"
      />

      <GameHUD />

      {!hasCompletedTutorial && (
        <TutorialOverlay />
      )}
    </main>
  );
}