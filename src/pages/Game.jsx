import GameMap3D from '../components/map/GameMap3D';
import GameHUD from '../components/ui/GameHUD';
import { useGPS } from '../hooks/useGPS';

export default function Game() {
  useGPS();

  return (
    <main className="game-screen">
      <GameMap3D />
      <GameHUD />
    </main>
  );
}