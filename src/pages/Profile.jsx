import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <main className="screen profile-page">
      <div className="profile-avatar">🧍</div>

      <h1>Jogador123</h1>
      <p>Nível 1 • 35 XP</p>

      <button>Editar Avatar</button>
      <button>Conquistas</button>
      <button>Distintivos</button>

      <button onClick={() => navigate('/home')}>Voltar</button>
    </main>
  );
}