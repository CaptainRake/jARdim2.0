import GameMap3D from '../components/map/GameMap3D';
import { useGPS } from '../hooks/useGPS';

export default function MapTest() {
  useGPS();

  return (
    <main
      style={{
        width: '100vw',
        height: '100dvh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <GameMap3D />
    </main>
  );
}