import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

import { encounters } from '../data/encounters';
import { pollenRoute } from '../data/pollen';

import MapAvatar from '../components/MapAvatar';
import PollenRoute from '../components/PollenRoute';
import GuideDialog from '../components/GuideDialog';

const fallbackPosition = [-29.7169792, -53.7294990];

function FollowUser({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.setView(position, 18);
  }, [position, map]);

  return null;
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function Home() {
  const navigate = useNavigate();

  const [userPosition, setUserPosition] = useState(fallbackPosition);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animalIconVisible, setAnimalIconVisible] = useState(false);

  const animalIcon = L.divIcon({
    className: 'animal-map-icon',
    html: `
        <div class="encounter-marker">
        <div class="encounter-pulse"></div>
        <div class="encounter-symbol">🐾</div>
        </div>
    `,
    iconSize: [70, 70],
    iconAnchor: [35, 35],
    });

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => console.error(error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const pollenVisivel = pollenRoute.filter((point) => {
    const distance = calcularDistancia(
      userPosition[0],
      userPosition[1],
      point[0],
      point[1]
    );

    return distance > 8;
  });

  const encontroProximo = encounters.find((encounter) => {
    const distance = calcularDistancia(
      userPosition[0],
      userPosition[1],
      encounter.position[0],
      encounter.position[1]
    );

    return distance <= encounter.radius;
  });

  useEffect(() => {
    if (encontroProximo && !animalIconVisible) {
      setDialogOpen(true);
    }
  }, [encontroProximo, animalIconVisible]);

  return (
    <main className="map-screen">
      <MapContainer center={userPosition} zoom={18} className="map">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FollowUser position={userPosition} />
        <PollenRoute points={pollenVisivel} />
        <MapAvatar position={userPosition} />
        
        {animalIconVisible && encontroProximo && (
          <Marker
            position={encontroProximo.position}
            icon={animalIcon}
            eventHandlers={{
              click: () => navigate('/ar'),
            }}
          />
        )}
      </MapContainer>

      <button className="bag-button" onClick={() => navigate('/backpack')}>
        🎒
      </button>

        <button className="challenge-button" onClick={() => navigate('/challenges')}>
        ⭐
        </button>
        
      <button className="player-card" onClick={() => navigate('/profile')}>
        <div className="avatar-dot" />
        <div>
          <strong>Jogador123</strong>
          <span>Nível 1</span>
        </div>
      </button>

      <GuideDialog
        visible={dialogOpen}
        onContinue={() => {
          setDialogOpen(false);
          setAnimalIconVisible(true);
        }}
        onClose={() => setDialogOpen(false)}
      />
    </main>
  );
}