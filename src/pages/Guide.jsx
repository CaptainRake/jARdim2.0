import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../stores/progressStore';

export default function Guide() {
  const navigate = useNavigate();

  const markGuideRead =
    useProgressStore(
      (state) =>
        state.markGuideRead
    );

  return (
    <main className="screen guide-page">
      <h1>Guia de Campo</h1>

      <article className="field-card">
        <h2>Capivara</h2>
        <em>Hydrochoerus hydrochaeris</em>

        <p>
          Maior roedor do mundo, vive próxima a ambientes aquáticos e deve ser observada à distância.
        </p>
      </article>

      <button onClick={() => navigate('/home')}>
        Voltar ao mapa
      </button>
    </main>
  );
}