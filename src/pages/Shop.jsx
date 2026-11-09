import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../stores/progressStore';

export default function Shop() {
  const navigate = useNavigate();

  const leaves =
    useProgressStore(
      (state) =>
        state.leaves
    );

  return (
    <main className="shop-page">

      <header className="shop-header">
        <button
          type="button"
          className="shop-back"
          onClick={() =>
            navigate('/home')
          }
          aria-label="Voltar"
        >
          ←
        </button>

        <div className="shop-balance">
          <span className="shop-leaf-icon">
            🍃
          </span>

          <strong>
            {leaves ?? 0}
          </strong>
        </div>
      </header>


      <section className="shop-content">

        <h1>
          Barraca de Expedição
        </h1>

        <p>
          Novos itens para suas explorações estarão disponíveis em breve.
        </p>

        <img
          className="shop-construction-image"
          src={`${import.meta.env.BASE_URL}ui/shop/Shop_Construction.png`}
          alt="Exploradores montando a barraca da loja"
        />
        
        <p className="shop-save-message">
            A barraca ainda está sendo armada. Enquanto isso, continue juntando folhas — elas ficarão guardadas para você.
        </p>

        <span className="shop-development-tag">
          Em desenvolvimento
        </span>

      </section>

    </main>
  );
}