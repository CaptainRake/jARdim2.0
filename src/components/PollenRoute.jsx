import { CircleMarker } from 'react-leaflet';

export default function PollenRoute({ points }) {
  return (
    <>
      {points.map((position, index) => (
        <CircleMarker
          key={index}
          center={position}
          radius={8}
          pathOptions={{
            color: '#F2D35E',
            fillColor: '#F2D35E',
            fillOpacity: 0.9,
          }}
        />
      ))}
    </>
  );
}