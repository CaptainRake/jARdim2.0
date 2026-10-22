import { useNavigate } from 'react-router-dom';

export default function GameHUD() {
  const navigate = useNavigate();

  // Depois isso vem do playerStore
  const username = 'username';
  const level = 1;

  const currentXP = 35;
  const maxXP = 100;

  const xpPercent = Math.min(
    (currentXP / maxXP) * 100,
    100
  );

  return (
    <div className="game-hud">

      {/* CONFIGURAÇÕES */}

      <button
        className="hud-settings"
        aria-label="Configurações"
        onClick={() =>
          console.log('Configurações')
        }
      >
        <img
          src={`${import.meta.env.BASE_URL}ui/hud/Settings.svg`}
          alt=""
        />
      </button>


      {/* PERFIL */}

      <button
        className="hud-profile"
        onClick={() =>
          navigate('/profile')
        }
        aria-label="Perfil"
      >
        <div className="hud-profile-top">

          <img
            src={`${import.meta.env.BASE_URL}ui/hud/Profile+Level.svg`}
            className="hud-profile-avatar"
            alt=""
          />

          <div className="hud-level">
            {level}
          </div>

        </div>

        <div className="hud-username">
          {username}
        </div>

        <div className="hud-xp-bar">
          <div
            className="hud-xp-fill"
            style={{
              width: `${xpPercent}%`,
            }}
          />
        </div>
      </button>


      {/* MENU LATERAL */}

      <div className="hud-actions">

        {/* BASE / EXPEDIÇÃO */}

        <button
          className="hud-action-button"
          aria-label="Expedição"
          onClick={() =>
            console.log('Expedição')
          }
        >
          <img
            src={`${import.meta.env.BASE_URL}ui/hud/Expedition_Tent.svg`}
            alt=""
          />
        </button>


        {/* MISSÕES */}

        <button
          className="hud-action-button"
          aria-label="Missões"
          onClick={() =>
            navigate('/challenges')
          }
        >
          <img
            src={`${import.meta.env.BASE_URL}ui/hud/Missions_Binocular.svg`}
            alt=""
          />
        </button>


        {/* MOCHILA */}

        <button
          className="hud-action-button hud-backpack"
          aria-label="Mochila"
          onClick={() =>
            navigate('/backpack')
          }
        >
          <img
            src={`${import.meta.env.BASE_URL}ui/hud/Backpack_OrangeYellow.svg`}
            alt=""
          />
        </button>

      </div>

    </div>
  );
}