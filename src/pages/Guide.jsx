import { useNavigate } from 'react-router-dom';

export default function Guide() {
  const navigate = useNavigate();

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