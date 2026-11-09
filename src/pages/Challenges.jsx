import { useNavigate } from 'react-router-dom';

export default function Challenges() {
  const navigate = useNavigate();

  const discoveries = 0;
  const goal = 3;

  const progress =
    Math.min(
      (discoveries / goal) * 100,
      100
    );

  return (
    <main className="missions-page">

      <header className="missions-header">
        <button
          className="missions-back"
          onClick={() =>
            navigate('/backpack')
          }
          aria-label="Voltar"
        >
          ←
        </button>

        <div>
          <h1>Desafios</h1>
          <p>
            Complete missões durante suas explorações.
          </p>
        </div>
      </header>


      <section className="mission-section">

        <h2>Missão diária</h2>

        <article className="mission-card mission-card-daily">

          <div className="mission-card-top">
            <span className="mission-tag">
              Diário
            </span>

            <span className="mission-reward">
              +15 XP
            </span>
          </div>

          <h3>
            Explorador do dia
          </h3>

          <p>
            Registre uma espécie durante sua visita ao Jardim.
          </p>

          <div className="mission-status">
            Disponível hoje
          </div>

        </article>

      </section>


      <section className="mission-section">

        <h2>Em andamento</h2>

        <article className="mission-card">

          <div className="mission-card-top">
            <span className="mission-tag">
              Exploração
            </span>
          </div>

          <h3>
            Trilha do Lago
          </h3>

          <p>
            Complete a Trilha do Lago.
          </p>

          <div className="mission-progress-info">
            <span>
              Descobertas
            </span>

            <strong>
              {discoveries}/{goal}
            </strong>
          </div>

          <div className="mission-progress">
            <div
              className="mission-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </article>

      </section>

    </main>
  );
}