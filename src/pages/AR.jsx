import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../stores/progressStore';

export default function AR() {
  const navigate = useNavigate();

  const activeEncounterId =
    useProgressStore(
      (state) =>
        state.activeEncounterId
    );

  const registerDiscovery =
    useProgressStore(
      (state) =>
        state.registerDiscovery
    );

  return (
    <main className="ar-page">
      <model-viewer
        src={`${import.meta.env.BASE_URL}models/capybara.glb`}
        ios-src={`${import.meta.env.BASE_URL}models/capybara.usdz`}
        ar
        ar-modes="quick-look scene-viewer webxr"
        camera-controls
        auto-rotate
        style={{
          width: '100%',
          height: '100%',
          background: '#dcefcf',
        }}
      />

      <button className="ar-back" onClick={() => navigate('/home')}>←</button>

      <button className="ar-roll" onClick={() => navigate('/guide')}>🖼️</button>

      <button className="ar-shutter" onClick={() => navigate('/discovery')}>📷</button>
    </main>
  );
}