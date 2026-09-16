import { Marker } from 'react-leaflet';
import { usePlayerStore } from '../../stores/playerStore';

export default function PlayerMarker() {
  const latitude = usePlayerStore((state) => state.latitude);
  const longitude = usePlayerStore((state) => state.longitude);

  return (
    <Marker
      position={[latitude, longitude]}
    />
  );
}