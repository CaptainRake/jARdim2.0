import { useNavigate } from 'react-router-dom';
import { backpacks } from '../../data/backpacks';
import { useOnboardingStore } from '../../stores/onboardingStore';

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

  const selectedBackpack =
    useOnboardingStore(
      (state) =>
        state.selectedBackpack
    );

  const backpack =
    backpacks.find(
      (item) =>
        item.id === selectedBackpack
    ) ?? backpacks[0];

  return (
    <div className="game-hud">

      {/* CONFIGURAÇÕES */}

      <button
        className="hud-settings"
        data-tutorial="settings"
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
        data-tutorial="profile"
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
          data-tutorial="expedition"
          aria-label="Loja de Campo"
          onClick={() =>
            navigate('/shop')
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
          data-tutorial="missions"
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
          data-tutorial="backpack"
          aria-label="Mochila"
          onClick={() =>
            navigate('/backpack')
          }
        >
          <img
            src={
              `${import.meta.env.BASE_URL}ui/hud/${backpack.icon}`
            }
            alt={`Mochila ${backpack.name}`}
          />
        </button>

      </div>

    </div>
  );
}