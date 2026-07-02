import { useNavigate } from 'react-router-dom';

export default function Backpack() {
  const navigate = useNavigate();

  return (
    <main className="menu-page">
      <button className="menu-close" onClick={() => navigate('/home')}>×</button>

      <button onClick={() => navigate('/guide')}>📖 Guia de Campo</button>
      <button>🎒 Itens coletados</button>
      <button>🛒 Loja</button>
      <button>⚙️ Configurações</button>
    </main>
  );
}