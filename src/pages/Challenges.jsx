import { useNavigate } from 'react-router-dom';

export default function Challenges() {
  const navigate = useNavigate();

  return (
    <main className="screen challenge-page">
      <h1>Desafios</h1>

      <article className="field-card">
        <h2>Missão diária</h2>
        <p>Registre uma espécie durante sua visita ao Jardim.</p>
        <span className="badge">+15 XP</span>
      </article>

      <article className="field-card">
        <h2>Em andamento</h2>
        <p>Complete a Trilha do Lago.</p>
        <span className="badge">0/3 descobertas</span>
      </article>

      <button onClick={() => navigate('/home')}>Voltar</button>
    </main>
  );
}