import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useProgressStore,
  MAIN_MISSIONS,
  SIDE_MISSIONS,
  DAILY_MISSIONS,
  FUTURE_MISSIONS,
} from '../stores/progressStore';


export default function Challenges() {
  const navigate =
    useNavigate();


  const [
    showCompleted,
    setShowCompleted,
  ] =
    useState(false);

    
  const progressState =
    useProgressStore();
    
  const markMissionsSeen =
    useProgressStore(
      (state) =>
        state.markMissionsSeen
    );


  useEffect(() => {
    markMissionsSeen();
  }, [
    markMissionsSeen,
  ]);

  const {
    currentMissionId,
    completedMissions,
    completedSideMissions = [],
    daily,
  } =
    progressState;


  const currentMission =
    MAIN_MISSIONS.find(
      (mission) =>
        mission.id ===
        currentMissionId
    );


  const currentMissionIndex =
    MAIN_MISSIONS.findIndex(
      (mission) =>
        mission.id ===
        currentMissionId
    );


  const dailyMission =
    DAILY_MISSIONS.find(
      (mission) =>
        mission.id ===
        daily.missionId
    );


  const completedMissionObjects =
    MAIN_MISSIONS.filter(
      (mission) =>
        completedMissions.includes(
          mission.id
        )
    );


  return (
    <main className="missions-page">

      {/* HEADER */}

      <header className="missions-header">

        <button
          className="missions-back"
          onClick={() =>
            navigate('/home')
          }
          aria-label="Voltar"
        >
          ←
        </button>


        <div>

          <h1>
            Desafios
          </h1>

          <p>
            Complete missões durante suas explorações.
          </p>

        </div>

      </header>


      {/* DIÁRIA */}

      {dailyMission && (
        <section className="mission-section">

          <h2>
            Missão diária
          </h2>


          <MissionCard
            mission={
              dailyMission
            }

            value={
              dailyMission
                .getValue(
                  progressState
                )
            }

            completed={
              daily.completed
            }

            daily
          />

        </section>
      )}


      {/* MISSÃO PRINCIPAL */}

      {currentMission && (
        <section className="mission-section">

          <h2>
            Missão atual
          </h2>


          <MissionCard
            mission={
              currentMission
            }

            value={
              currentMission
                .getValue(
                  progressState
                )
            }

            objectives={
              currentMission
                .objectives?.(
                  progressState
                )
            }
          />

        </section>
      )}

      {/* MISSÕES DE CAMPO */}

      {SIDE_MISSIONS.length > 0 && (
        <section className="mission-section">

          <h2>
            Missões de campo
          </h2>


          {SIDE_MISSIONS.map(
            (mission) => {

              const completed =
                completedSideMissions.includes(
                  mission.id
                );


              return (
                <MissionCard
                  key={
                    mission.id
                  }

                  mission={
                    mission
                  }

                  value={
                    mission.getValue(
                      progressState
                    )
                  }

                  objectives={
                    mission.objectives?.(
                      progressState
                    )
                  }

                  completed={
                    completed
                  }
                />
              );
            }
          )}

        </section>
      )}


      {/* PRÓXIMAS */}

      {currentMission &&
        currentMissionIndex >= 0 &&
        currentMissionIndex <
          MAIN_MISSIONS.length -
            1 && (

          <section className="mission-section">

            <h2>
              Próximas missões
            </h2>


            {MAIN_MISSIONS
              .slice(
                currentMissionIndex +
                  1
              )

              .map(
                (
                  mission,
                  index
                ) => (

                  <article
                    key={
                      mission.id
                    }

                    className="mission-card mission-card-locked"
                  >

                    <div className="mission-card-top">

                      <span className="mission-tag">
                        🔒 Bloqueada
                      </span>

                    </div>


                    <h3>
                      {mission.title}
                    </h3>


                    <p>
                      {index === 0
                        ? `Complete "${currentMission.title}" para liberar esta missão.`
                        : 'Continue avançando nas missões para desbloquear.'}
                    </p>

                  </article>
                )
              )}

          </section>
        )}


      {/* FUTURAS */}

      <section className="mission-section">

        <h2>
          Novas expedições
        </h2>


        {FUTURE_MISSIONS.map(
          (mission) => (

            <article
              key={
                mission.id
              }

              className="mission-card mission-card-locked mission-card-future"
            >

              <div className="mission-card-top">

                <span className="mission-tag">
                  Em breve
                </span>

              </div>


              <h3>
                {mission.title}
              </h3>


              <p>
                {mission.description}
              </p>

            </article>

          )
        )}

      </section>


      {/* CONCLUÍDAS */}

      {completedMissionObjects.length >
        0 && (

        <section className="mission-section missions-completed-section">

          <button
            type="button"

            className="missions-completed-toggle"

            onClick={() =>
              setShowCompleted(
                (value) =>
                  !value
              )
            }
          >

            <span>
              Missões concluídas
            </span>


            <strong>
              {
                completedMissionObjects.length
              }
            </strong>


            <span
              className={`missions-toggle-arrow ${
                showCompleted
                  ? 'open'
                  : ''
              }`}
            >
              ▾
            </span>

          </button>


          {showCompleted && (

            <div className="missions-completed-list">

              {completedMissionObjects.map(
                (mission) => (

                  <MissionCard
                    key={
                      mission.id
                    }

                    mission={
                      mission
                    }

                    value={
                      mission.goal
                    }

                    completed
                  />

                )
              )}

            </div>

          )}

        </section>

      )}

    </main>
  );
}


/* =========================================================
   CARD
   ========================================================= */

function MissionCard({
  mission,
  value,
  objectives = null,
  completed = false,
  daily = false,
}) {

  const progress =
    Math.min(
      (
        value /
        mission.goal
      ) *
        100,

      100
    );


  return (
    <article
      className={`mission-card ${
        daily
          ? 'mission-card-daily'
          : ''
      } ${
        completed
          ? 'mission-card-completed'
          : ''
      }`}
    >

      <div className="mission-card-top">

        <span className="mission-tag">

          {daily
            ? 'Diária'
            : mission.category ??
              'Exploração'}

        </span>


        {completed && (
          <span className="mission-completed-label">
            Concluída ✓
          </span>
        )}

      </div>


      <h3>
        {mission.title}
      </h3>


      <p>
        {mission.description}
      </p>


      {objectives &&
        objectives.length > 0 && (

        <div className="mission-objectives">

          {objectives.map(
            (
              objective,
              index
            ) => (

              <div
                key={
                  index
                }

                className={`mission-objective ${
                  objective.completed
                    ? 'completed'
                    : ''
                }`}
              >

                <span>
                  {objective.completed
                    ? '✓'
                    : '○'}
                </span>


                <p>
                  {
                    objective.text
                  }
                </p>

              </div>

            )
          )}

        </div>

      )}


      {!completed && (

        <>
          <div className="mission-progress-info">

            <span>
              Progresso
            </span>


            <strong>
              {Math.min(
                Math.round(
                  value
                ),
                mission.goal
              )}
              /
              {mission.goal}
            </strong>

          </div>


          <div className="mission-progress">

            <div
              className="mission-progress-fill"

              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>
        </>

      )}


      <div className="mission-rewards">

        <span>
          {completed
            ? 'Recompensa recebida'
            : 'Recompensa'}
        </span>


        <div className="mission-reward-items">

          <strong>
            +{mission.reward.xp} XP
          </strong>


          <strong>
            🍃 +{mission.reward.leaves}
          </strong>

        </div>

      </div>

    </article>
  );
}