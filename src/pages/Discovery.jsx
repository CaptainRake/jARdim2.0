import { useNavigate } from 'react-router-dom';

export default function Discovery() {
  const navigate = useNavigate();

  return (
    <main className="screen discovery-page">
      <span className="badge">Nova descoberta registrada</span>

      <div className="discovery-emoji">🐾</div>

      <h1>Capivara</h1>
      <em>Hydrochoerus hydrochaeris</em>

      <p>
        A capivara é o maior roedor do mundo e vive próxima a ambientes aquáticos.
      </p>

      <div className="reward-box">
        <strong>Recompensa</strong>
        <span>+25 XP</span>
        <span>+10 🍃 folhas</span>
      </div>

      <button onClick={() => navigate('/guide')}>
        Ver no Guia de Campo
      </button>
    </main>
  );
}