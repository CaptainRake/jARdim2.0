import L from 'leaflet';
import { Marker } from 'react-leaflet';

const avatarIcon = L.divIcon({
  className: 'map-avatar-icon',
  html: '<div class="map-avatar">🧍</div>',
  iconSize: [54, 54],
  iconAnchor: [27, 27],
});

export default function MapAvatar({ position }) {
  return <Marker position={position} icon={avatarIcon} />;
}