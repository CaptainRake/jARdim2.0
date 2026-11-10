import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  encounters,
} from '../data/encounters';

import {
  useProgressStore,
} from '../stores/progressStore';


export default function Guide() {
  const navigate =
    useNavigate();


  const [
    selectedAnimal,
    setSelectedAnimal,
  ] =
    useState(null);


  const discoveries =
    useProgressStore(
      (state) =>
        state.discoveries
    );


  const readAnimals =
    useProgressStore(
      (state) =>
        state.readAnimals
    );


  const markGuideRead =
    useProgressStore(
      (state) =>
        state.markGuideRead
    );


  const registeredCount =
    discoveries.length;


  const totalCount =
    encounters.length;


  const progress =
    totalCount > 0
      ? (
          registeredCount /
          totalCount
        ) * 100
      : 0;


  function openAnimal(
    animal
  ) {
    const registered =
      discoveries.includes(
        animal.id
      );


    if (!registered) {
      return;
    }


    markGuideRead(
      animal.id
    );


    setSelectedAnimal(
      animal
    );
  }


  return (
    <main className="field-guide-page">

      {/* HEADER */}

      <header className="field-guide-header">

        <button
          type="button"
          className="field-guide-back"
          onClick={() =>
            navigate('/backpack')
          }
          aria-label="Voltar"
        >
          ←
        </button>


        <div>

          <span className="field-guide-kicker">
            CADERNO DE CAMPO
          </span>


          <h1>
            Guia de Campo
          </h1>

        </div>

      </header>


      {/* PROGRESSO */}

      <section className="field-guide-progress-card">

        <div className="field-guide-progress-top">

          <div>

            <span>
              Espécies registradas
            </span>


            <strong>

              {registeredCount}

              <small>
                /{totalCount}
              </small>

            </strong>

          </div>


          <div className="field-guide-progress-icon">
            ◉
          </div>

        </div>


        <div className="field-guide-progress-bar">

          <div
            className="field-guide-progress-fill"

            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        <p>
          Explore o Jardim Botânico
          e registre as espécies
          encontradas durante o caminho.
        </p>

      </section>


      {/* GRADE */}

      <section className="field-guide-section">

        <div className="field-guide-section-title">

          <h2>
            Fauna observada
          </h2>


          <span>
            {registeredCount} descobertas
          </span>

        </div>


        <div className="field-guide-grid">

          {encounters.map(
            (animal) => {

              const registered =
                discoveries.includes(
                  animal.id
                );


              const read =
                readAnimals.includes(
                  animal.id
                );


              const index =
                encounters.findIndex(
                  (item) =>
                    item.id ===
                    animal.id
                ) + 1;


              return (
                <button
                  type="button"

                  key={
                    animal.id
                  }

                  className={`field-guide-animal-card ${
                    registered
                      ? 'registered'
                      : 'locked'
                  }`}

                  onClick={() =>
                    openAnimal(
                      animal
                    )
                  }
                >

                  <div className="field-guide-animal-visual">

                    {registered ? (

                      <model-viewer
                        src={
                          `${import.meta.env.BASE_URL}models/${animal.model}`
                        }

                        camera-orbit="0deg 75deg 105%"

                        interaction-prompt="none"

                        disable-zoom

                        class="field-guide-card-model"
                      />

                    ) : (

                      <div className="field-guide-unknown">
                        ?
                      </div>

                    )}


                    {registered &&
                      !read && (

                      <span className="field-guide-new-dot" />

                    )}

                  </div>


                  <div className="field-guide-animal-info">

                    <span className="field-guide-number">

                      #
                      {
                        String(
                          index
                        ).padStart(
                          2,
                          '0'
                        )
                      }

                    </span>


                    <strong>

                      {registered
                        ? animal.name
                        : 'Não identificado'}

                    </strong>


                    <span className="field-guide-card-status">

                      {registered
                        ? read
                          ? 'Ficha consultada'
                          : 'Novo registro'
                        : 'Ainda não encontrado'}

                    </span>

                  </div>

                </button>
              );
            }
          )}

        </div>

      </section>


      {/* FICHA */}

      {selectedAnimal && (

        <div
          className="field-guide-detail-overlay"

          onClick={() =>
            setSelectedAnimal(
              null
            )
          }
        >

          <article
            className="field-guide-detail"

            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"

              className="field-guide-detail-close"

              onClick={() =>
                setSelectedAnimal(
                  null
                )
              }
            >
              ×
            </button>


            <div className="field-guide-detail-model-wrap">

              <span className="field-guide-detail-number">

                #
                {
                  String(
                    encounters.findIndex(
                      (item) =>
                        item.id ===
                        selectedAnimal.id
                    ) + 1
                  ).padStart(
                    2,
                    '0'
                  )
                }

              </span>


              <model-viewer
                src={
                  `${import.meta.env.BASE_URL}models/${selectedAnimal.model}`
                }

                camera-controls

                auto-rotate

                interaction-prompt="none"

                class="field-guide-detail-model"
              />

            </div>


            <div className="field-guide-detail-content">

              <div className="field-guide-detail-tags">

                <span>
                  FAUNA
                </span>


                {selectedAnimal.rarity && (

                  <span>
                    {
                      getRarityLabel(
                        selectedAnimal.rarity
                      )
                    }
                  </span>

                )}

              </div>


              <h2>
                {
                  selectedAnimal.name
                }
              </h2>


              {selectedAnimal.scientificName && (

                <em>
                  {
                    selectedAnimal.scientificName
                  }
                </em>

              )}


              <div className="field-guide-detail-divider" />


              <h3>
                Sobre
              </h3>


              <p>
                {
                  selectedAnimal.description
                }
              </p>


              {/* DADOS DO ANIMAL */}

              {selectedAnimal.facts &&
                selectedAnimal.facts.length > 0 && (

                <div className="field-guide-facts">

                  {selectedAnimal.facts.map(
                    (
                      fact,
                      index
                    ) => (

                      <div
                        className="field-guide-fact"
                        key={
                          index
                        }
                      >

                        <span>
                          {
                            fact.label
                          }
                        </span>


                        <strong>
                          {
                            fact.value
                          }
                        </strong>

                      </div>

                    )
                  )}

                </div>
              )}


              <div className="field-guide-observed">

                <span>
                  ✓
                </span>


                <div>

                  <strong>
                    Registro confirmado
                  </strong>


                  <small>
                    Espécie adicionada ao
                    seu Guia de Campo
                  </small>

                </div>

              </div>

            </div>

          </article>

        </div>

      )}

    </main>
  );
}


function getRarityLabel(
  rarity
) {
  const labels = {
    common:
      'Comum',

    uncommon:
      'Incomum',

    rare:
      'Rara',

    legendary:
      'Muito rara',
  };


  return (
    labels[rarity] ??
    rarity
  );
}